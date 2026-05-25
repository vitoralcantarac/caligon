import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Brain, Lightbulb, Send, ArrowLeft, SkipForward, CheckCircle2, Sparkles } from "lucide-react";
import { runDiagnosis } from "@/lib/supabase-helpers";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  reasoning?: string;
  questionType?: string;
  options?: string[];
  category?: string;
}

// Self-serve thresholds: total ~35 questions
const PHASE_THRESHOLDS_SELFSERVE = {
  triage: 7,
  deep: 15,
  loss_measurement: 25,
  specific: 32,
  risk_analysis: 35,
};
const TOTAL_QUESTIONS = PHASE_THRESHOLDS_SELFSERVE.risk_analysis;

type Phase = "triage" | "deep" | "loss_measurement" | "specific" | "risk_analysis";

const getPhase = (count: number): Phase => {
  if (count < PHASE_THRESHOLDS_SELFSERVE.triage) return "triage";
  if (count < PHASE_THRESHOLDS_SELFSERVE.deep) return "deep";
  if (count < PHASE_THRESHOLDS_SELFSERVE.loss_measurement) return "loss_measurement";
  if (count < PHASE_THRESHOLDS_SELFSERVE.specific) return "specific";
  return "risk_analysis";
};

const getProgressMessage = (questionsAsked: number, total: number) => {
  const pct = Math.round((questionsAsked / total) * 100);
  if (pct < 15) return "Começando o diagnóstico...";
  if (pct < 30) return `${pct}% — Entendendo seu negócio...`;
  if (pct < 50) return `${pct}% — Identificando padrões interessantes...`;
  if (pct < 65) return `${pct}% — Calculando o impacto financeiro...`;
  if (pct < 80) return `${pct}% — Você está perto de ver os números reais...`;
  if (pct < 95) return `${pct}% — Finalizando a análise...`;
  return "Gerando seu diagnóstico personalizado... 🎯";
};

export default function ClientQuestionnaire() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("triage");
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [scaleValue, setScaleValue] = useState(5);
  const [completed, setCompleted] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadAnalysisAndStart();
  }, [analysisId]);

  const answeredCount = messages.filter((m) => m.role === "user").length;

  const loadAnalysisAndStart = async () => {
    if (!analysisId) return;
    const { data: analysis } = await supabase
      .from("analyses")
      .select("*, clients(*)")
      .eq("id", analysisId)
      .single();
    if (!analysis) {
      toast.error("Análise não encontrada");
      navigate("/dashboard");
      return;
    }
    setAnalysisData(analysis);

    const { data: existingSessions } = await supabase
      .from("questionnaire_sessions")
      .select("*")
      .eq("analysis_id", analysisId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingSessions && existingSessions.length > 0) {
      const session = existingSessions[0];
      setSessionId(session.id);
      setPhase(session.phase as Phase);
      setProgress(session.progress);

      const { data: questions } = await supabase
        .from("questionnaire_questions")
        .select("*, questionnaire_responses(*)")
        .eq("session_id", session.id)
        .order("order_index");

      if (questions) {
        const restored: Message[] = [];
        for (const q of questions) {
          restored.push({
            id: q.id,
            role: "ai",
            content: q.question_text,
            reasoning: q.ai_reasoning || undefined,
            questionType: q.question_type,
            options: Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : [],
            category: q.category,
          });
          if (q.questionnaire_responses && q.questionnaire_responses.length > 0) {
            restored.push({
              id: `resp-${q.id}`,
              role: "user",
              content: q.questionnaire_responses[0].response_text || "",
            });
          }
        }
        setMessages(restored);
        if (session.completed) {
          setCompleted(true);
          startDiagnosis();
        } else {
          generateNextQuestion(session.id, analysis);
        }
        return;
      }
    }

    const { data: newSession } = await supabase
      .from("questionnaire_sessions")
      .insert({ analysis_id: analysisId, phase: "triage" })
      .select()
      .single();
    if (newSession) {
      setSessionId(newSession.id);
      generateNextQuestion(newSession.id, analysis);
    }
  };

  const generateNextQuestion = async (sid: string, analysis: any, retryCount = 0) => {
    setLoading(true);
    try {
      const { data: prevQuestions } = await supabase
        .from("questionnaire_questions")
        .select("question_text, category, questionnaire_responses(response_text)")
        .eq("session_id", sid)
        .order("order_index");

      const previousQA = (prevQuestions || []).map((q) => ({
        question: q.question_text,
        category: q.category,
        answer: q.questionnaire_responses?.[0]?.response_text || "",
      }));

      const clientData = analysis.clients || {};

      const { data: metricsRows } = await supabase
        .from("client_metrics" as any)
        .select("*")
        .eq("client_id", clientData.id);

      const metricsMap: Record<string, any> = {};
      if (metricsRows) {
        for (const m of metricsRows as any[]) {
          if (m.status === "filled" || m.status === "calculated") {
            metricsMap[m.metric_key] = { value: m.value, unit: m.unit };
          } else if (m.status === "declined") {
            metricsMap[m.metric_key] = { value: null, status: "declined" };
          }
        }
      }

      const res = await supabase.functions.invoke("questionnaire-ai", {
        body: {
          action: "generate_question",
          context: {
            niche: clientData.niche || "",
            companyName: clientData.name || "",
            process: analysis.process || "",
            employees: clientData.employees || 0,
            revenue: clientData.revenue || "",
            phase,
            previousQA,
            questionsAsked: previousQA.length,
            metrics: metricsMap,
            initialContext: clientData.context || "",
            documents: analysis.documents_extracted_text || "",
            userMode: "selfserve",
          },
        },
      });

      if (res.error) throw new Error(res.error.message);
      const questionData = res.data;

      const { data: savedQ } = await supabase
        .from("questionnaire_questions")
        .insert({
          session_id: sid,
          question_text: questionData.question,
          question_type: questionData.type || "open",
          options: questionData.options || [],
          category: questionData.category || "geral",
          order_index: previousQA.length,
          is_adaptive: questionData.isAdaptive || false,
          ai_reasoning: questionData.reasoning || null,
        })
        .select()
        .single();

      if (savedQ) {
        setMessages((prev) => [
          ...prev,
          {
            id: savedQ.id,
            role: "ai",
            content: questionData.question,
            reasoning: questionData.reasoning,
            questionType: questionData.type || "open",
            options: questionData.options || [],
            category: questionData.category || "geral",
          },
        ]);
        const newProgress = Math.min(95, Math.round((previousQA.length / TOTAL_QUESTIONS) * 100));
        setProgress(newProgress);
        await supabase.from("questionnaire_sessions").update({ progress: newProgress }).eq("id", sid);
      }
    } catch (err: any) {
      if (retryCount === 0) {
        toast.warning("Tentando novamente...");
        setLoading(false);
        return generateNextQuestion(sid, analysis, 1);
      }
      toast.error("A IA encontrou um problema. Você pode continuar.");
    }
    setLoading(false);
  };

  const startDiagnosis = async () => {
    if (!analysisId || diagnosing) return;
    setDiagnosing(true);
    try {
      await runDiagnosis(analysisId);
      navigate(`/resultado/${analysisId}`);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar diagnóstico");
      setDiagnosing(false);
    }
  };

  const handleSubmitAnswer = async (skipAnswer?: boolean) => {
    if (!sessionId || !analysisData) return;
    const lastAi = [...messages].reverse().find((m) => m.role === "ai");
    if (!lastAi) return;

    // Phase 'loss_measurement' is mandatory — block skip
    if (skipAnswer && phase === "loss_measurement") {
      return toast.error("Esta pergunta sobre números é importante para calcular suas perdas.");
    }

    let answerText = skipAnswer ? "PULADO" : input;
    let answerData: any = {};

    if (!skipAnswer) {
      if (lastAi.questionType === "multiple_choice") {
        if (selectedOptions.includes("__outro__")) {
          if (!otherText.trim()) return toast.error("Por favor, descreva sua situação");
          const filtered = selectedOptions.filter((o) => o !== "__outro__");
          answerText = [...filtered, `Outro: ${otherText.trim()}`].join(", ");
          answerData = { selected: filtered, other: otherText.trim() };
        } else {
          answerText = selectedOptions.join(", ");
          answerData = { selected: selectedOptions };
        }
        if (!answerText.trim()) return toast.error("Selecione ao menos uma opção");
      } else if (lastAi.questionType === "scale") {
        answerText = String(scaleValue);
        answerData = { value: scaleValue };
      }
      if (!answerText.trim()) return toast.error("Por favor, responda a pergunta");
    }

    await supabase.from("questionnaire_responses").insert({
      question_id: lastAi.id,
      session_id: sessionId,
      response_text: answerText,
      response_data: answerData,
    });

    setMessages((prev) => [...prev, { id: `resp-${Date.now()}`, role: "user", content: answerText }]);
    setInput("");
    setSelectedOptions([]);
    setOtherText("");
    setScaleValue(5);

    const newCount = answeredCount + 1;
    const newPhase = getPhase(newCount);
    if (newPhase !== phase) {
      setPhase(newPhase);
      await supabase.from("questionnaire_sessions").update({ phase: newPhase }).eq("id", sessionId);
    }

    if (newCount >= TOTAL_QUESTIONS) {
      await supabase
        .from("questionnaire_sessions")
        .update({ completed: true, progress: 100 })
        .eq("id", sessionId);
      await supabase
        .from("analyses")
        .update({ status: "diagnostico", progress: 40 })
        .eq("id", analysisId);
      setProgress(100);
      setCompleted(true);
      startDiagnosis();
      return;
    }

    generateNextQuestion(sessionId, analysisData);
  };

  const lastAi = [...messages].reverse().find((m) => m.role === "ai");
  const isMultipleChoice = lastAi?.questionType === "multiple_choice";
  const isScale = lastAi?.questionType === "scale";
  const canSkip = phase !== "loss_measurement";

  // Completion screen
  if (completed) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 border-2 border-success">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <div>
            <h1 className="text-3xl font-display text-foreground mb-2">Questionário concluído!</h1>
            <p className="text-muted-foreground">
              Recebemos todas as informações necessárias para o seu diagnóstico.
            </p>
          </div>

          <div className="card-premium p-8 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
              <p className="font-semibold text-foreground">Nossa IA está analisando suas respostas</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span>Calculando perdas financeiras...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span>Identificando gargalos operacionais...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span>Gerando recomendações personalizadas...</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-3 border-t border-border">
              Isso pode levar de 30 a 90 segundos. Não feche esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      {/* Emotional progress header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">{getProgressMessage(answeredCount, TOTAL_QUESTIONS)}</p>
          <p className="text-xs text-muted-foreground">
            {answeredCount} / {TOTAL_QUESTIONS}
          </p>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, idx) => (
          <div key={msg.id}>
            <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3"
                    : ""
                }`}
              >
                {msg.role === "ai" && (
                  <div className="card-premium p-4">
                    <div className="flex items-start gap-2">
                      <Brain className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{msg.content}</p>

                        {msg.questionType === "multiple_choice" &&
                          msg.options &&
                          msg.id === lastAi?.id && (
                            <div className="mt-3 space-y-2">
                              {msg.options.map((opt, i) => (
                                <button
                                  key={i}
                                  onClick={() =>
                                    setSelectedOptions((prev) =>
                                      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
                                    )
                                  }
                                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                                    selectedOptions.includes(opt)
                                      ? "border-accent bg-accent/10 text-foreground"
                                      : "border-border hover:border-accent/50 text-muted-foreground"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                              <button
                                onClick={() =>
                                  setSelectedOptions((prev) =>
                                    prev.includes("__outro__")
                                      ? prev.filter((o) => o !== "__outro__")
                                      : [...prev, "__outro__"]
                                  )
                                }
                                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                                  selectedOptions.includes("__outro__")
                                    ? "border-accent bg-accent/10 text-foreground"
                                    : "border-border hover:border-accent/50 text-muted-foreground"
                                }`}
                              >
                                Outro (descreva)
                              </button>
                              {selectedOptions.includes("__outro__") && (
                                <textarea
                                  value={otherText}
                                  onChange={(e) => setOtherText(e.target.value)}
                                  placeholder="Descreva sua situação..."
                                  rows={3}
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent resize-none"
                                />
                              )}
                            </div>
                          )}

                        {msg.questionType === "scale" && msg.id === lastAi?.id && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">1</span>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={scaleValue}
                                onChange={(e) => setScaleValue(Number(e.target.value))}
                                className="flex-1 accent-accent"
                              />
                              <span className="text-xs text-muted-foreground">10</span>
                            </div>
                            <p className="text-center text-sm font-semibold text-accent mt-1">{scaleValue}/10</p>
                          </div>
                        )}

                        {msg.reasoning && (
                          <details className="mt-3">
                            <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" /> Por que pergunto isso?
                            </summary>
                            <p className="text-[10px] text-muted-foreground mt-1 pl-4">{msg.reasoning}</p>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {msg.role === "user" && <p className="text-sm">{msg.content}</p>}
              </div>
            </div>

            {/* Engagement banner at midpoint */}
            {msg.role === "user" && answeredCount === 12 && idx === messages.length - 1 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 my-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      Já identificamos alguns sinais importantes
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Continue respondendo para calcular o impacto financeiro real na sua empresa.
                      Estamos quase chegando nos números.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="card-premium p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">Preparando próxima pergunta...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!loading && lastAi && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2">
            {!isMultipleChoice && !isScale && (
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitAnswer()}
                placeholder="Sua resposta..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent"
              />
            )}
            {(isMultipleChoice || isScale) && <div className="flex-1" />}
            <button onClick={() => handleSubmitAnswer()} className="btn-gold px-4 py-2.5 flex items-center gap-2">
              <Send className="w-4 h-4" />
              Enviar
            </button>
          </div>
          {canSkip && (
            <div className="mt-2 text-center">
              <button
                onClick={() => handleSubmitAnswer(true)}
                className="text-xs text-muted-foreground hover:text-foreground underline inline-flex items-center gap-1"
              >
                <SkipForward className="w-3 h-3" /> Pular esta pergunta
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
