import { NICHES_CONFIG, PROCESS_CATEGORIES, getNicheLabel, getSubniches, searchNiches, getAllNicheKeys } from "@/lib/niches-config";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Upload, Loader2, Search, X, AlertTriangle, Check, FileText, Trash2, ChevronDown, ChevronUp, Info, Shield, CheckCircle2, Download } from "lucide-react";
import { createAnalysis } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MetricsForm, { MetricState } from "@/components/metrics/MetricsForm";
import { generateQualificationReport } from "@/lib/pdf-generator";

const steps = ['Empresa', 'Qualificação', 'Métricas', 'Contexto', 'Documentos', 'Confirmar'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const QUALIFICATION_QUESTIONS = [
  {
    id: 1,
    question: "Você sabe o faturamento médio mensal da empresa com precisão?",
    category: "maturidade_financeira",
    options: [
      { label: "Sim, sei exatamente o valor", score: 3 },
      { label: "Sei aproximadamente (margem de 20%)", score: 2 },
      { label: "Tenho uma ideia vaga", score: 1 },
      { label: "Não sei ou nunca calculei", score: 0 },
    ]
  },
  {
    id: 2,
    question: "Você sabe qual é a margem de lucro da empresa — quanto sobra após pagar todos os custos?",
    category: "maturidade_financeira",
    options: [
      { label: "Sim, sei exatamente", score: 3 },
      { label: "Tenho uma estimativa aproximada", score: 2 },
      { label: "Nunca calculei formalmente", score: 0 },
    ]
  },
  {
    id: 3,
    question: "Você tem clareza de quanto custa cada hora de trabalho da sua equipe, incluindo todos os encargos?",
    category: "maturidade_financeira",
    options: [
      { label: "Sim, calculo isso regularmente", score: 3 },
      { label: "Tenho uma ideia parcial", score: 1 },
      { label: "Nunca calculei isso", score: 0 },
    ]
  },
  {
    id: 4,
    question: "Você consegue descrever com clareza o principal processo que está causando perda de dinheiro ou energia na empresa?",
    category: "dor_operacional",
    options: [
      { label: "Sim, sei exatamente onde está o problema", score: 3 },
      { label: "Tenho uma ideia mas não localizo com precisão", score: 2 },
      { label: "Sinto que há problema mas não consigo identificar", score: 1 },
      { label: "Não percebo problemas claros no momento", score: 0 },
    ]
  },
  {
    id: 5,
    question: "Se o diagnóstico indicar mudanças profundas em processos que você sempre usou, você está disposto a implementar?",
    category: "abertura_mudanca",
    options: [
      { label: "Sim, estou totalmente aberto — é exatamente para isso que estou aqui", score: 3 },
      { label: "Sim, dependendo da complexidade e do custo", score: 2 },
      { label: "Tenho algumas restrições mas estou aberto", score: 1 },
      { label: "Prefiro ajustes pequenos sem mudar o que já funciona", score: 0 },
    ]
  },
  {
    id: 6,
    question: "Você tem alguém na equipe com capacidade de liderar a implementação das mudanças recomendadas?",
    category: "porte_empresa",
    options: [
      { label: "Sim, tenho uma pessoa ou equipe dedicada a isso", score: 3 },
      { label: "Eu e mais uma ou duas pessoas conseguimos tocar", score: 2 },
      { label: "Basicamente sou eu quem precisaria fazer", score: 1 },
      { label: "Não tenho equipe disponível para isso agora", score: 0 },
    ]
  },
  {
    id: 7,
    question: "Há quanto tempo a empresa opera neste formato?",
    category: "porte_empresa",
    options: [
      { label: "Mais de 3 anos", score: 3 },
      { label: "Entre 1 e 3 anos", score: 2 },
      { label: "Entre 6 meses e 1 ano", score: 1 },
      { label: "Menos de 6 meses", score: 0 },
    ]
  },
  {
    id: 8,
    question: "Você tem documentos, planilhas, relatórios ou registros dos processos que serão analisados?",
    category: "dados_disponiveis",
    options: [
      { label: "Sim, tenho documentação razoável para compartilhar", score: 3 },
      { label: "Tenho algumas coisas dispersas mas posso reunir", score: 2 },
      { label: "Praticamente nada está registrado formalmente", score: 0 },
    ]
  },
  {
    id: 9,
    question: "Você sabe quantos clientes atende ou quantas transações realiza por mês em média?",
    category: "maturidade_financeira",
    options: [
      { label: "Sim, tenho controle preciso disso", score: 3 },
      { label: "Tenho uma estimativa razoável", score: 2 },
      { label: "Não tenho controle formal sobre isso", score: 0 },
    ]
  },
  {
    id: 10,
    question: "Você tem disponibilidade para participar ativamente do diagnóstico (reuniões, questionários, envio de documentos) nas próximas 2 semanas?",
    category: "comprometimento",
    options: [
      { label: "Sim, estou totalmente disponível", score: 3 },
      { label: "Tenho disponibilidade limitada mas consigo participar", score: 2 },
      { label: "Minha agenda está muito cheia no momento", score: 0 },
    ]
  },
];

// Phone mask (BR)
function maskPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Currency mask (BRL)
function maskCurrency(v: string): string {
  const d = v.replace(/\D/g, '');
  if (!d) return '';
  const num = parseInt(d, 10) / 100;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function currencyToNumber(v: string): number {
  const d = v.replace(/\D/g, '');
  return d ? parseInt(d, 10) / 100 : 0;
}

export default function NewAnalysis() {
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [metrics, setMetrics] = useState<Record<string, MetricState>>({});
  const [nicheSearch, setNicheSearch] = useState('');
  const [nicheDropdownOpen, setNicheDropdownOpen] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState<'mensal' | 'anual'>('mensal');
  const [showDocTips, setShowDocTips] = useState(false);
  const nicheRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    companyName: '', niche: '', subniche: '', contact: '', email: '', phone: '',
    employees: '', revenue: '', process: '', context: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Qualification state
  const [qualAnswers, setQualAnswers] = useState<Record<number, {answer: string; score: number}>>({});
  const [qualScore, setQualScore] = useState<number>(0);
  const [qualLevel, setQualLevel] = useState<'baixa' | 'media' | 'alta' | null>(null);
  const [qualGenerating, setQualGenerating] = useState(false);
  const [qualReport, setQualReport] = useState<{strengths: string[]; risks: string[]; summary: string; recommendation: string} | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nicheRef.current && !nicheRef.current.contains(e.target as Node)) setNicheDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePhoneChange = (v: string) => update('phone', maskPhone(v));
  const handleRevenueChange = (v: string) => update('revenue', maskCurrency(v));
  const handleEmployeesChange = (v: string) => {
    const d = v.replace(/\D/g, '');
    update('employees', d);
  };

  const selectNiche = (key: string) => {
    update('niche', key);
    update('subniche', '');
    setNicheSearch('');
    setNicheDropdownOpen(false);
  };

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.companyName.trim()) e.companyName = 'Nome obrigatório';
      if (!form.niche) e.niche = 'Nicho obrigatório';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
      if (form.phone && form.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido';
      if (form.contact && /^\d+$/.test(form.contact.trim())) e.contact = 'Nome do contato, não número';
    }
    if (s === 3) {
      if (!form.process) e.process = 'Selecione um processo';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep = (target: number) => {
    if (target > step) {
      if (!validateStep(step)) return;
      setMaxStep(Math.max(maxStep, target));
    }
    setStep(target);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files!);
      const validFiles: File[] = [];
      for (const f of newFiles) {
        if (f.size > MAX_FILE_SIZE) {
          toast.error(`Arquivo "${f.name}" excede o limite de 20MB`);
        } else {
          validFiles.push(f);
        }
      }
      setFiles(prev => [...prev, ...validFiles]);
    }
    e.target.value = '';
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSelectQualOption = (qIdx: number, label: string, score: number) => {
    setQualAnswers(prev => ({ ...prev, [qIdx]: { answer: label, score } }));
  };

  const allQualAnswered = Object.keys(qualAnswers).length === QUALIFICATION_QUESTIONS.length;

  const computeQualScore = () => {
    const total = Object.values(qualAnswers).reduce((sum, a) => sum + a.score, 0);
    const level = total <= 10 ? 'baixa' : total <= 20 ? 'media' : 'alta';
    setQualScore(total);
    setQualLevel(level as any);
    return { total, level };
  };

  const handleGenerateQualification = async () => {
    const { total, level } = computeQualScore();
    setQualGenerating(true);
    try {
      const res = await supabase.functions.invoke("questionnaire-ai", {
        body: {
          action: "run_qualification",
          context: {
            companyName: form.companyName,
            niche: getNicheLabel(form.niche),
            qualAnswers: Object.entries(qualAnswers).map(([idx, a]) => ({
              question: QUALIFICATION_QUESTIONS[Number(idx)].question,
              answer: a.answer,
              score: a.score,
              category: QUALIFICATION_QUESTIONS[Number(idx)].category,
            })),
            totalScore: total,
            level,
          },
        },
      });
      if (res.error) throw new Error(res.error.message);
      setQualReport(res.data);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar qualificação");
    }
    setQualGenerating(false);
  };

  const handleDownloadQualPdf = () => {
    if (!qualReport) return;
    const answers = Object.entries(qualAnswers).map(([idx, a]) => ({
      question: QUALIFICATION_QUESTIONS[Number(idx)].question,
      answer: a.answer,
      score: a.score,
    }));
    const doc = generateQualificationReport(
      form.companyName, getNicheLabel(form.niche), qualScore, qualLevel || 'baixa', answers, qualReport
    );
    doc.save(`Qualificação - ${form.companyName}.pdf`);
  };

  const handleCreate = async () => {
    if (!form.companyName || !form.niche || !form.process) {
      toast.error("Preencha nome da empresa, nicho e processo");
      return;
    }
    setSubmitting(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const revenueNum = currencyToNumber(form.revenue);
      const revenueStr = revenueNum > 0
        ? `R$ ${revenueNum.toLocaleString('pt-BR')}/${revenuePeriod === 'mensal' ? 'mês' : 'ano'}`
        : '';

      const nicheLabel = getNicheLabel(form.niche);
      const subnicheStr = form.subniche || '';

      const analysisId = await createAnalysis(
        {
          name: form.companyName,
          niche: `${nicheLabel}${subnicheStr ? ` > ${subnicheStr}` : ''}`,
          contact: form.contact,
          email: form.email,
          phone: form.phone,
          employees: form.employees ? parseInt(form.employees) : undefined,
          revenue: revenueStr,
          context: form.context,
        },
        form.process
      );

      // Save qualification data
      if (qualLevel && qualScore > 0) {
        await supabase.from("analyses").update({
          qualification_score: qualScore,
          qualification_level: qualLevel,
          qualification_answers: Object.entries(qualAnswers).map(([idx, a]) => ({
            question: QUALIFICATION_QUESTIONS[Number(idx)].question,
            answer: a.answer,
            score: a.score,
            category: QUALIFICATION_QUESTIONS[Number(idx)].category,
          })),
          qualification_report: qualReport,
        } as any).eq("id", analysisId);
      }

      // Save metrics
      const { data: analysisRow } = await supabase.from("analyses").select("client_id").eq("id", analysisId).single();
      if (analysisRow) {
        const { METRICS: allMetrics } = await import("@/lib/metrics-config");
        const inserts = Object.entries(metrics)
          .filter(([_, v]) => v.status !== 'absent')
          .map(([key, v]) => {
            const def = allMetrics.find(m => m.key === key);
            return {
              client_id: analysisRow.client_id,
              metric_key: key,
              metric_group: def?.group || 'receita',
              metric_level: def?.level || 'recommended',
              value: v.value,
              unit: def?.unit || '',
              status: v.status,
              origin: v.origin,
              formula_used: v.formulaUsed || null,
              calculation_inputs: v.calculationInputs || {},
              updated_by: userId,
            };
          });
        if (inserts.length > 0) {
          await supabase.from("client_metrics" as any).upsert(inserts as any, { onConflict: 'client_id,metric_key' });
        }
      }

      // Upload files
      for (const file of files) {
        try {
          if (file.size > MAX_FILE_SIZE) {
            toast.warning(`Arquivo "${file.name}" excede o limite de 20MB`);
            continue;
          }
          const path = `${analysisId}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
          if (uploadError) {
            toast.warning(`Arquivo "${file.name}" não pôde ser enviado: ${uploadError.message}`);
            continue;
          }
          await supabase.from("documents").insert({
            analysis_id: analysisId,
            file_name: file.name,
            file_path: path,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: userId,
          });
        } catch (err: any) {
          toast.warning(`Erro ao enviar "${file.name}": ${err.message}`);
        }
      }

      // Extract document text
      if (files.length > 0) {
        try {
          await supabase.functions.invoke('extract-documents', { body: { analysisId } });
        } catch {
          console.warn("Document extraction failed — will retry later");
        }
      }

      await supabase.from("analyses").update({ status: "questionario", progress: 10 }).eq("id", analysisId);
      toast.success("Análise criada! Iniciando questionário...");
      navigate(`/analyses/${analysisId}/questionnaire`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar análise");
    }
    setSubmitting(false);
  };

  const filledMetricsCount = Object.values(metrics).filter(m => m.status === 'filled' || m.status === 'calculated').length;
  const declinedMetricsCount = Object.values(metrics).filter(m => m.status === 'declined').length;
  const filteredNiches = nicheSearch ? searchNiches(nicheSearch) : getAllNicheKeys().map(k => ({ key: k, label: getNicheLabel(k) }));
  const subniches = form.niche ? getSubniches(form.niche) : [];
  const processLabel = PROCESS_CATEGORIES.find(p => p.value === form.process)?.label || form.process;

  const FieldError = ({ field }: { field: string }) => errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/analyses" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-display text-foreground">Nova Análise</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Configure o diagnóstico para uma nova empresa</p>

      {/* Steps navigation */}
      <div className="flex items-center gap-1.5 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 flex-1">
            <button
              onClick={() => i <= maxStep && goToStep(i)}
              disabled={i > maxStep && i > step}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[11px] font-medium flex-1 justify-center transition-all ${
                i === step ? 'bg-accent/15 text-accent-foreground border border-accent' :
                i < step || i <= maxStep ? 'bg-success/10 text-success cursor-pointer hover:bg-success/20' :
                'bg-muted text-muted-foreground cursor-not-allowed'
              }`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : <span className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold border border-current">{i + 1}</span>}
              {s}
            </button>
          </div>
        ))}
      </div>

      <div className="card-premium p-6">
        {/* STEP 0: Empresa */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nome da Empresa *</label>
              <input value={form.companyName} onChange={e => update('companyName', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent transition-colors" placeholder="Ex: Restaurante Bella Tavola" />
              <FieldError field="companyName" />
            </div>

            {/* Searchable niche select */}
            <div ref={nicheRef} className="relative">
              <label className="text-sm font-medium text-foreground">Nicho *</label>
              <div className="mt-1 relative">
                <div
                  onClick={() => setNicheDropdownOpen(!nicheDropdownOpen)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground cursor-pointer flex items-center justify-between"
                >
                  <span className={form.niche ? 'text-foreground' : 'text-muted-foreground'}>
                    {form.niche ? getNicheLabel(form.niche) : 'Selecione o nicho'}
                  </span>
                  <Search className="w-4 h-4 text-muted-foreground" />
                </div>
                {nicheDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
                    <div className="p-2 border-b border-border">
                      <input
                        autoFocus
                        value={nicheSearch}
                        onChange={e => setNicheSearch(e.target.value)}
                        placeholder="Buscar nicho..."
                        className="w-full px-2 py-1.5 text-sm bg-muted rounded border-none outline-none"
                      />
                    </div>
                    <div className="overflow-y-auto max-h-48">
                      {filteredNiches.map(n => (
                        <button key={n.key} onClick={() => selectNiche(n.key)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${form.niche === n.key ? 'bg-accent/10 text-accent-foreground font-medium' : 'text-foreground'}`}>
                          {n.label}
                        </button>
                      ))}
                      {filteredNiches.length === 0 && <p className="text-xs text-muted-foreground p-3">Nenhum nicho encontrado</p>}
                    </div>
                  </div>
                )}
              </div>
              <FieldError field="niche" />
            </div>

            {/* Sub-niche */}
            {form.niche && subniches.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground">Subnicho <span className="text-xs text-muted-foreground">(opcional)</span></label>
                <select value={form.subniche} onChange={e => update('subniche', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent">
                  <option value="">Selecione o subnicho</option>
                  {subniches.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Contato</label>
                <input value={form.contact} onChange={e => update('contact', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent" placeholder="Nome do contato" />
                <FieldError field="contact" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <input value={form.email} onChange={e => update('email', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent" placeholder="email@empresa.com" />
                <FieldError field="email" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Telefone</label>
                <input value={form.phone} onChange={e => handlePhoneChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent" placeholder="(00) 00000-0000" />
                <FieldError field="phone" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Funcionários</label>
                <input value={form.employees} onChange={e => handleEmployeesChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent" placeholder="Ex: 25" inputMode="numeric" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Faturamento</label>
                <div className="flex gap-1 mt-1">
                  <input value={form.revenue} onChange={e => handleRevenueChange(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent" placeholder="R$ 0,00" inputMode="numeric" />
                  <select value={revenuePeriod} onChange={e => setRevenuePeriod(e.target.value as any)} className="px-2 py-2.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none">
                    <option value="mensal">/mês</option>
                    <option value="anual">/ano</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Qualificação */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-display text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" /> Qualificação Diagnóstica
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Responda as 10 perguntas abaixo para avaliar a prontidão da empresa para o diagnóstico.</p>
            </div>

            {!qualReport && (
              <div className="space-y-5">
                {QUALIFICATION_QUESTIONS.map((q, qIdx) => (
                  <div key={q.id} className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-muted-foreground mr-1.5">{qIdx + 1}.</span>
                      {q.question}
                    </p>
                    <div className="grid gap-1.5">
                      {q.options.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => handleSelectQualOption(qIdx, opt.label, opt.score)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                            qualAnswers[qIdx]?.answer === opt.label
                              ? "border-accent bg-accent/10 text-foreground font-medium"
                              : "border-border hover:border-accent/50 text-muted-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {allQualAnswered && !qualReport && (
                  <button
                    onClick={handleGenerateQualification}
                    disabled={qualGenerating}
                    className="btn-gold w-full"
                  >
                    {qualGenerating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Gerando análise...</>
                    ) : (
                      <><Shield className="w-4 h-4" /> Gerar Análise de Qualificação</>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Qualification Result */}
            {qualReport && qualLevel && (
              <div className="space-y-4">
                <div className="card-premium p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                        qualLevel === 'alta' ? 'bg-success/10 text-success' :
                        qualLevel === 'media' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {qualLevel === 'alta' ? 'ALTA' : qualLevel === 'media' ? 'MÉDIA' : 'BAIXA'}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{qualScore}/30 pontos</p>
                        <p className="text-xs text-muted-foreground">Prontidão diagnóstica</p>
                      </div>
                    </div>
                    <button onClick={handleDownloadQualPdf} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        qualLevel === 'alta' ? 'bg-success' : qualLevel === 'media' ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${Math.round((qualScore / 30) * 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-foreground">{qualReport.summary}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">Pontos Fortes</p>
                      {qualReport.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-foreground">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">Pontos de Atenção</p>
                      {qualReport.risks.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-foreground">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {qualReport.recommendation && (
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="text-xs font-medium text-accent-foreground">{qualReport.recommendation}</p>
                    </div>
                  )}
                </div>

                {qualLevel === 'baixa' && (
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-destructive">
                      ⚠️ Este cliente pode não estar pronto para um diagnóstico completo. Você pode continuar, mas os resultados terão menor precisão financeira.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Métricas */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-display text-foreground">Métricas Financeiras e Operacionais</h3>
              <p className="text-xs text-muted-foreground mt-1">Preencha o que souber — use "Como calcular" se precisar de ajuda. Você pode voltar e completar depois.</p>
            </div>
            <MetricsForm metrics={metrics} onChange={setMetrics} />
          </div>
        )}

        {/* STEP 3: Contexto */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Processo a Analisar *</label>
              <select value={form.process} onChange={e => update('process', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent">
                <option value="">Selecione o processo</option>
                {PROCESS_CATEGORIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <FieldError field="process" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Contexto Inicial</label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-1">Descreva a situação atual, principais dores, o que motivou a busca por otimização. A IA usará este texto como base para o questionário.</p>
              <textarea value={form.context} onChange={e => update('context', e.target.value)} rows={6} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent resize-none" placeholder="Ex: A empresa tem crescido 30% ao ano mas os processos não acompanharam. O dono ainda centraliza decisões de compras e aprovações..." />
            </div>
          </div>
        )}

        {/* STEP 4: Documentos */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border overflow-hidden">
              <button onClick={() => setShowDocTips(!showDocTips)} className="w-full flex items-center justify-between p-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                <span className="flex items-center gap-2"><Info className="w-4 h-4 text-accent" /> Quais documentos enviar?</span>
                {showDocTips ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showDocTips && (
                <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground space-y-1.5 border-t border-border">
                  <p className="font-medium text-foreground">Para um diagnóstico mais preciso, recomendamos enviar:</p>
                  <p>📊 <strong>Financeiro:</strong> DRE, balanço, planilhas de faturamento e custos, relatórios de margem</p>
                  <p>📋 <strong>Operacional:</strong> Fluxogramas existentes, SOPs, manuais de processo, checklists</p>
                  <p>👥 <strong>Equipe:</strong> Organograma, descrições de cargos, planilhas de produtividade</p>
                  <p>💻 <strong>Tecnologia:</strong> Prints de sistemas usados, exports de ERP/CRM, relatórios de ferramentas</p>
                  <p>📈 <strong>Comercial:</strong> Relatórios de vendas, funil de conversão, análises de churn</p>
                  <p className="pt-1 text-[11px]">Formatos aceitos: PDF, Excel, Word, PowerPoint, CSV, imagens • Limite: 20MB por arquivo</p>
                </div>
              )}
            </div>

            <label className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-accent transition-colors cursor-pointer block">
              <input type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.xlsx,.xls,.jpg,.jpeg,.png,.txt,.csv,.pptx,.ppt" />
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Arraste arquivos ou clique para enviar</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, CSV, PPT, imagens • Máximo 20MB por arquivo</p>
            </label>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{f.name}</span>
                      {f.size > MAX_FILE_SIZE && <span className="text-[10px] text-destructive font-medium">Excede 20MB</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => removeFile(i)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Os documentos são opcionais. A IA analisará automaticamente o conteúdo relevante.</p>
          </div>
        )}

        {/* STEP 5: Confirmar */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Confirme os dados</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Empresa", value: form.companyName },
                { label: "Nicho", value: `${getNicheLabel(form.niche)}${form.subniche ? ` > ${form.subniche}` : ''}` },
                { label: "Qualificação", value: qualLevel ? `${qualLevel === 'alta' ? 'Alta' : qualLevel === 'media' ? 'Média' : 'Baixa'} (${qualScore}/30)` : 'Não realizada' },
                { label: "Processo", value: processLabel },
                { label: "Funcionários", value: form.employees },
                { label: "Faturamento", value: form.revenue ? `${form.revenue} /${revenuePeriod === 'mensal' ? 'mês' : 'ano'}` : '' },
                { label: "Métricas", value: `${filledMetricsCount} preenchida(s), ${declinedMetricsCount} recusada(s)` },
                { label: "Documentos", value: `${files.length} arquivo(s)` },
                { label: "Contexto", value: form.context ? `${form.context.slice(0, 80)}...` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => {
                  const stepMap: Record<string, number> = { Empresa: 0, Nicho: 0, Qualificação: 1, Processo: 3, Funcionários: 0, Faturamento: 0, Métricas: 2, Documentos: 4, Contexto: 3 };
                  if (stepMap[label] !== undefined) goToStep(stepMap[label]);
                }}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-xs text-accent-foreground font-medium">Fluxo após criação:</p>
              <p className="text-xs text-muted-foreground mt-1">1. Questionário inteligente por IA → 2. Diagnóstico automático → 3. Fluxogramas AS-IS/TO-BE → 4. Relatório → 5. Revisão e Aprovação → 6. Entrega</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <button onClick={() => goToStep(Math.max(0, step - 1))} disabled={step === 0} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">Voltar</button>
          {step < 5 ? (
            <button onClick={() => goToStep(step + 1)} className="btn-gold">Próximo <ArrowRight className="w-4 h-4" /></button>
          ) : (
            <button onClick={handleCreate} disabled={submitting} className="btn-gold">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {submitting ? "Criando..." : "Criar Análise e Iniciar Questionário"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}