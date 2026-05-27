import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  ArrowLeft, Send, Loader2, Brain, Lightbulb, MessageCircle, SkipForward, ChevronDown, ChevronUp, ArrowUp
} from "lucide-react";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  reasoning?: string;
  questionType?: string;
  options?: string[];
  category?: string;
}

const PHASE_THRESHOLDS = { triage: 13, deep: 28, loss_measurement: 40, specific: 50, risk_analysis: 57 };
const TOTAL_QUESTIONS = PHASE_THRESHOLDS.risk_analysis;

type Phase = "triage" | "deep" | "loss_measurement" | "specific" | "risk_analysis";

const getPhase = (count: number): Phase => {
  if (count < PHASE_THRESHOLDS.triage) return 'triage';
  if (count < PHASE_THRESHOLDS.deep) return 'deep';
  if (count < PHASE_THRESHOLDS.loss_measurement) return 'loss_measurement';
  if (count < PHASE_THRESHOLDS.specific) return 'specific';
  return 'risk_analysis';
};

export default function Questionnaire() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [showContext, setShowContext] = useState(true);
  const [documentsSummary, setDocumentsSummary] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { loadAnalysisAndStart(); }, [analysisId]);

  const loadAnalysisAndStart = async () => {
    if (!analysisId) return;
    const { data: analysis } = await supabase.from("analyses").select("*, clients(*)").eq("id", analysisId).single();
    if (!analysis) { toast.error("Análise não encontrada"); navigate("/analyses"); return; }
    setAnalysisData(analysis);

    // Load documents
    const { data: docs } = await supabase.from("documents").select("file_name, parsed_content, classification").eq("analysis_id", analysisId);
    if (docs && docs.length > 0) {
      setDocumentsSummary(docs.map(d => `${d.file_name}${d.classification ? ` (${d.classification})` : ''}`));
    }

    const { data: existingSessions } = await supabase
      .from("questionnaire_sessions").select("*").eq("analysis_id", analysisId)
      .order("created_at", { ascending: false }).limit(1);

    if (existingSessions && existingSessions.length > 0) {
      const session = existingSessions[0];
      setSessionId(session.id);
      setPhase(session.phase as Phase);
      setProgress(session.progress);

      const { data: questions } = await supabase
        .from("questionnaire_questions").select("*, questionnaire_responses(*)")
        .eq("session_id", session.id).order("order_index");

      if (questions) {
        const restored: Message[] = [];
        for (const q of questions) {
          restored.push({
            id: q.id, role: "ai", content: q.question_text,
            reasoning: q.ai_reasoning || undefined, questionType: q.question_type,
            options: Array.isArray(q.options) ? q.options.map((o: any) => typeof o === 'string' ? o : String(o)) : [],
            category: q.category,
          });
          if (q.questionnaire_responses && q.questionnaire_responses.length > 0) {
            restored.push({ id: `resp-${q.id}`, role: "user", content: q.questionnaire_responses[0].response_text || JSON.stringify(q.questionnaire_responses[0].response_data) });
          }
        }
        setMessages(restored);
        if (!session.completed) generateNextQuestion(session.id, analysis);
        return;
      }
    }

    const { data: newSession } = await supabase
      .from("questionnaire_sessions").insert({ analysis_id: analysisId, phase: "triage" }).select().single();
    if (newSession) { setSessionId(newSession.id); generateNextQuestion(newSession.id, analysis); }
  };

  const generateNextQuestion = async (sid: string, analysis: any, retryCount = 0) => {
    setLoading(true);
    try {
      const { data: prevQuestions } = await supabase
        .from("questionnaire_questions").select("question_text, category, questionnaire_responses(response_text, response_data)")
        .eq("session_id", sid).order("order_index");

      const previousQA = (prevQuestions || []).map(q => ({
        question: q.question_text, category: q.category,
        answer: q.questionnaire_responses?.[0]?.response_text || "",
      }));

      const clientData = analysis.clients || {};

      // Load client metrics
      const { data: metricsRows } = await supabase
        .from("client_metrics" as any).select("*").eq("client_id", clientData.id);

      const metricsMap: Record<string, any> = {};
      if (metricsRows) {
        for (const m of metricsRows as any[]) {
          if (m.status === 'filled' || m.status === 'calculated') {
            metricsMap[m.metric_key] = { value: m.value, unit: m.unit };
          } else if (m.status === 'declined') {
            metricsMap[m.metric_key] = { value: null, status: 'declined' };
          }
        }
      }

      // Load documents for AI context
      const documentsContext = analysis.documents_extracted_text || '';

      const res = await supabase.functions.invoke("questionnaire-ai", {
        body: {
          action: "generate_question",
          context: {
            niche: clientData.niche || "", companyName: clientData.name || "",
            process: analysis.process || "", employees: clientData.employees || 0,
            revenue: clientData.revenue || "", phase,
            previousQA, questionsAsked: previousQA.length,
            metrics: metricsMap,
            initialContext: clientData.context || "",
            documents: documentsContext,
          },
        },
      });

      if (res.error) throw new Error(res.error.message);
      const questionData = res.data;

      const { data: savedQ } = await supabase.from("questionnaire_questions").insert({
        session_id: sid, question_text: questionData.question,
        question_type: questionData.type || "open", options: questionData.options || [],
        category: questionData.category || "geral", order_index: previousQA.length,
        is_adaptive: questionData.isAdaptive || false, ai_reasoning: questionData.reasoning || null,
      }).select().single();

      if (savedQ) {
        setMessages(prev => [...prev, {
          id: savedQ.id, role: "ai", content: questionData.question,
          reasoning: questionData.reasoning, questionType: questionData.type || "open",
          options: questionData.options || [], category: questionData.category || "geral",
        }]);
        const newProgress = Math.min(95, Math.round((previousQA.length / TOTAL_QUESTIONS) * 100));
        setProgress(newProgress);
        await supabase.from("questionnaire_sessions").update({ progress: newProgress }).eq("id", sid);
      }
    } catch (err: any) {
      if (retryCount === 0) {
        toast.warning("Não foi possível gerar a próxima pergunta. Tentando novamente...");
        setLoading(false);
        return generateNextQuestion(sid, analysis, 1);
      }
      toast.error("A IA encontrou um problema. Você pode continuar o diagnóstico com as respostas já coletadas.");
    }
    setLoading(false);
  };

  const handleGoBack = () => {
    const lastUserIdx = messages.map((m, i) => m.role === 'user' ? i : -1).filter(i => i >= 0).pop();
    if (lastUserIdx !== undefined && lastUserIdx >= 0) {
      setMessages(prev => prev.slice(0, lastUserIdx));
      setSelectedOptions([]);
      setOtherText("");
    }
  };

  const handleSubmitAnswer = async (skipAnswer?: boolean) => {
    if (!sessionId || !analysisData) return;
    const lastAiMessage = [...messages].reverse().find(m => m.role === "ai");
    if (!lastAiMessage) return;

    let answerText = skipAnswer ? "(Pulada)" : input;
    let answerData: any = {};

    if (!skipAnswer) {
      if (lastAiMessage.questionType === "multiple_choice") {
        if (selectedOptions.includes("__outro__")) {
          if (!otherText.trim()) return toast.error("Por favor, descreva sua situação");
          const filtered = selectedOptions.filter(o => o !== "__outro__");
          const parts = [...filtered, `Outro: ${otherText.trim()}`];
          answerText = parts.join(", ");
          answerData = { selected: filtered, other: otherText.trim() };
        } else {
          answerText = selectedOptions.join(", ");
          answerData = { selected: selectedOptions };
        }
        if (!answerText.trim()) return toast.error("Selecione ao menos uma opção");
      } else if (lastAiMessage.questionType === "scale") {
        answerText = String(scaleValue);
        answerData = { value: scaleValue };
      }
      if (!answerText.trim()) return toast.error("Por favor, responda a pergunta");
    }

    await supabase.from("questionnaire_responses").insert({
      question_id: lastAiMessage.id, session_id: sessionId,
      response_text: answerText, response_data: answerData,
    });

    setMessages(prev => [...prev, { id: `resp-${Date.now()}`, role: "user", content: answerText }]);
    setInput(""); setSelectedOptions([]); setOtherText(""); setScaleValue(5);

    const answeredCount = messages.filter(m => m.role === "user").length + 1;
    const newPhase = getPhase(answeredCount);

    if (newPhase !== phase) {
      setPhase(newPhase);
      await supabase.from("questionnaire_sessions").update({ phase: newPhase }).eq("id", sessionId);
    }

    if (answeredCount >= TOTAL_QUESTIONS) {
      await supabase.from("questionnaire_sessions").update({ completed: true, progress: 100 }).eq("id", sessionId);
      await supabase.from("analyses").update({ status: "diagnostico", progress: 40 }).eq("id", analysisId);
      setProgress(100);
      setMessages(prev => [...prev, {
        id: "complete", role: "ai",
        content: "✅ Questionário concluído! Todas as informações foram coletadas. O sistema irá agora processar o diagnóstico completo.",
        reasoning: "Dados suficientes coletados: triagem + aprofundamento + mensuração de perdas + perguntas específicas do nicho + análise de riscos.",
      }]);
      return;
    }

    generateNextQuestion(sessionId, analysisData);
  };

  const phaseLabels: Record<string, string> = {
    triage: "Triagem Rápida", deep: "Aprofundamento Operacional", loss_measurement: "Mensuração de Perdas", specific: "Específico por Nicho", risk_analysis: "Análise de Riscos"
  };
  const phaseColors: Record<string, string> = {
    triage: "badge-info", deep: "badge-warning", loss_measurement: "badge-destructive", specific: "badge-success", risk_analysis: "badge-info"
  };

  const clientData = analysisData?.clients || {};
  const isLastAiMultipleChoice = (() => {
    const last = [...messages].reverse().find(m => m.role === "ai");
    return last?.questionType === "multiple_choice" && last?.id === [...messages].reverse().find(m => m.role === "ai")?.id;
  })();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link to={`/analyses/${analysisId}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
            <ArrowLeft className="w-4 h-4" /> Voltar à análise
          </Link>
          <h1 className="text-xl font-display text-foreground">Questionário Inteligente</h1>
          <p className="text-xs text-muted-foreground">{clientData.name} • {analysisData?.process}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={phaseColors[phase] || "badge-info"}>{phaseLabels[phase]}</span>
            <p className="text-xs text-muted-foreground mt-1">{progress}% concluído</p>
          </div>
          <div className="w-24">
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Context block */}
      {analysisData && (
        <div className="mb-4">
          <button onClick={() => setShowContext(!showContext)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <Brain className="w-3.5 h-3.5 text-accent" />
            <span className="font-medium">Contexto da Análise</span>
            {showContext ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
          </button>
          {showContext && (
            <div className="mt-2 p-3 rounded-lg bg-muted/30 border border-border space-y-1.5 text-xs">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <p><span className="text-muted-foreground">Nicho:</span> <span className="font-medium text-foreground">{clientData.niche || '—'}</span></p>
                <p><span className="text-muted-foreground">Processo:</span> <span className="font-medium text-foreground">{analysisData.process || '—'}</span></p>
                <p><span className="text-muted-foreground">Funcionários:</span> <span className="font-medium text-foreground">{clientData.employees || '—'}</span></p>
                <p><span className="text-muted-foreground">Faturamento:</span> <span className="font-medium text-foreground">{clientData.revenue || '—'}</span></p>
              </div>
              {clientData.context && (
                <div className="pt-1.5 border-t border-border">
                  <p className="text-muted-foreground">Contexto informado:</p>
                  <p className="text-foreground mt-0.5">{clientData.context}</p>
                </div>
              )}
              {documentsSummary.length > 0 && (
                <div className="pt-1.5 border-t border-border">
                  <p className="text-muted-foreground">Documentos ({documentsSummary.length}):</p>
                  <p className="text-foreground mt-0.5">{documentsSummary.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3" : ""}`}>
              {msg.role === "ai" && (
                <div className="space-y-2">
                  <div className="card-premium p-4">
                    <div className="flex items-start gap-2">
                      <Brain className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        {msg.category && <span className={`text-[10px] mb-2 inline-block ${msg.category === 'mensuração' ? 'badge-destructive' : 'badge-info'}`}>{msg.category}</span>}
                        <p className="text-sm text-foreground">{msg.content}</p>

                        {msg.questionType === "multiple_choice" && msg.options && msg.id === [...messages].reverse().find(m => m.role === "ai")?.id && (
                          <div className="mt-3 space-y-2">
                            {msg.options.map((opt, i) => (
                              <button key={i} onClick={() => setSelectedOptions(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt])}
                                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${selectedOptions.includes(opt) ? "border-accent bg-accent/10 text-foreground" : "border-border hover:border-accent/50 text-muted-foreground"}`}>
                                {opt}
                              </button>
                            ))}
                            {/* Outro option */}
                            <button onClick={() => setSelectedOptions(prev => prev.includes("__outro__") ? prev.filter(o => o !== "__outro__") : [...prev, "__outro__"])}
                              className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${selectedOptions.includes("__outro__") ? "border-accent bg-accent/10 text-foreground" : "border-border hover:border-accent/50 text-muted-foreground"}`}>
                              Outro
                            </button>
                            {selectedOptions.includes("__outro__") && (
                              <textarea
                                value={otherText}
                                onChange={e => setOtherText(e.target.value)}
                                placeholder="Descreva sua situação específica..."
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent resize-none"
                              />
                            )}
                          </div>
                        )}

                        {msg.questionType === "scale" && msg.id === [...messages].reverse().find(m => m.role === "ai")?.id && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">1</span>
                              <input type="range" min="1" max="10" value={scaleValue} onChange={e => setScaleValue(Number(e.target.value))} className="flex-1 accent-accent" />
                              <span className="text-xs text-muted-foreground">10</span>
                            </div>
                            <p className="text-center text-sm font-semibold text-accent mt-1">{scaleValue}/10</p>
                          </div>
                        )}

                        {msg.reasoning && (
                          <details className="mt-3">
                            <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" /> Raciocínio da IA
                            </summary>
                            <p className="text-[10px] text-muted-foreground mt-1 pl-4">{msg.reasoning}</p>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {msg.role === "user" && <p className="text-sm">{msg.content}</p>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="card-premium p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">Gerando próxima pergunta...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!loading && messages.length > 0 && messages[messages.length - 1].role === "ai" && messages[messages.length - 1].id !== "complete" && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <button onClick={handleGoBack} disabled={messages.filter(m => m.role === "user").length === 0}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30" title="Voltar" aria-label="Voltar">
              <ArrowLeft className="w-4 h-4" />
            </button>
            {!isLastAiMultipleChoice && (
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSubmitAnswer()}
                placeholder="Sua resposta..." className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent" />
            )}
            <button onClick={() => handleSubmitAnswer(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Pular pergunta" aria-label="Pular pergunta">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={() => handleSubmitAnswer()} className="btn-gold px-4 py-2.5">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Completion action */}
      {messages.length > 0 && messages[messages.length - 1].id === "complete" && (
        <div className="border-t border-border pt-4 flex justify-center">
          <button onClick={() => navigate(`/analyses/${analysisId}`)} className="btn-gold">
            <ArrowUp className="w-4 h-4" /> Ver Análise
          </button>
        </div>
      )}
    </div>
  );
}