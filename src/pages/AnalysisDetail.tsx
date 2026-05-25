import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { runDiagnosis } from "@/lib/supabase-helpers";
import { generateTechnicalReport, generateExecutiveSummary, generateCommercialPresentation, generateClientReport } from "@/lib/pdf-generator";
import { toast } from "sonner";
import {
  ArrowLeft, CheckCircle2, ChevronRight, Loader2, Brain,
  MessageCircle, Play, Trash2, AlertTriangle,
} from "lucide-react";
import JSZip from "jszip";
import { STATUS_LABELS, STATUS_STEPS, formatLossValue } from "@/lib/constants";
import OverviewTab from "@/components/analysis/tabs/OverviewTab";
import ScoresTab from "@/components/analysis/tabs/ScoresTab";
import BottlenecksTab from "@/components/analysis/tabs/BottlenecksTab";
import RecommendationsTab from "@/components/analysis/tabs/RecommendationsTab";
import FlowchartsTab from "@/components/analysis/tabs/FlowchartsTab";
import ReportTab from "@/components/analysis/tabs/ReportTab";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const tabs = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'scores', label: 'Scoring' },
  { id: 'bottlenecks', label: 'Gargalos' },
  { id: 'recommendations', label: 'Recomendações' },
  { id: 'flowcharts', label: 'Fluxogramas' },
  { id: 'report', label: 'Relatório' },
];

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [diagnosing, setDiagnosing] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: analysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => {
      const { data, error } = await supabase.from("analyses").select("*, clients(*)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: scores = [] } = useQuery({
    queryKey: ['analysis-scores', id],
    queryFn: async () => {
      const { data } = await supabase.from("analysis_scores").select("*").eq("analysis_id", id!);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: bottlenecks = [] } = useQuery({
    queryKey: ['analysis-bottlenecks', id],
    queryFn: async () => {
      const { data } = await supabase.from("bottlenecks").select("*").eq("analysis_id", id!).order("estimated_loss", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['analysis-recommendations', id],
    queryFn: async () => {
      const { data } = await supabase.from("recommendations").select("*").eq("analysis_id", id!).order("estimated_saving", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: flowcharts = [] } = useQuery({
    queryKey: ['analysis-flowcharts', id],
    queryFn: async () => {
      const { data } = await supabase.from("flowcharts").select("*").eq("analysis_id", id!);
      return data || [];
    },
    enabled: !!id,
  });

  const loading = loadingAnalysis;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['analysis', id] });
    queryClient.invalidateQueries({ queryKey: ['analysis-scores', id] });
    queryClient.invalidateQueries({ queryKey: ['analysis-bottlenecks', id] });
    queryClient.invalidateQueries({ queryKey: ['analysis-recommendations', id] });
    queryClient.invalidateQueries({ queryKey: ['analysis-flowcharts', id] });
  };

  const handleRunDiagnosis = async () => {
    if (!id) return;
    setDiagnosing(true);
    try {
      await runDiagnosis(id);
      toast.success("Diagnóstico concluído!");
      invalidateAll();
    } catch (err: any) {
      toast.error(err.message || "Erro no diagnóstico");
    }
    setDiagnosing(false);
  };

  const handleApprove = async () => {
    if (!id) return;
    await supabase.from("analyses").update({ approved: true, status: "aprovado", progress: 100 }).eq("id", id);
    toast.success("Análise aprovada!");
    invalidateAll();
  };

  const handleAdvanceStatus = async (newStatus: string, progress: number) => {
    if (!id) return;
    await supabase.from("analyses").update({ status: newStatus as any, progress }).eq("id", id);
    toast.success(`Status avançado para ${STATUS_LABELS[newStatus]}`);
    invalidateAll();
  };

  const handleSaveFlowchart = async (fcId: string, nodes: any[], edges: any[]) => {
    await supabase.from("flowcharts").update({ nodes: nodes as any, edges: edges as any }).eq("id", fcId);
    toast.success("Fluxograma salvo!");
  };

  const canNavigateToStep = (stepIndex: number) => {
    const currentIndex = STATUS_STEPS.indexOf(analysis?.status || 'cadastro');
    return stepIndex <= currentIndex || stepIndex === 0;
  };

  const handleStepClick = (step: string, index: number) => {
    if (!canNavigateToStep(index)) return;
    if (step === 'cadastro') navigate(`/analyses/new`);
    else if (step === 'questionario') navigate(`/analyses/${id}/questionnaire`);
    else {
      const tabMap: Record<string, string> = {
        diagnostico: 'overview', fluxogramas: 'flowcharts',
        relatorio: 'report', revisao: 'report', aprovado: 'report', entregue: 'report',
      };
      setActiveTab(tabMap[step] || 'overview');
    }
  };

  const handleDelete = async (deleteClient: boolean) => {
    if (!id || !analysis) return;
    setDeleting(true);
    try {
      // Remove storage documents
      const { data: docs } = await supabase
        .from("documents")
        .select("file_path")
        .eq("analysis_id", id);

      if (docs && docs.length > 0) {
        const paths = docs.map(d => d.file_path).filter(Boolean);
        if (paths.length > 0) {
          await supabase.storage.from("documents").remove(paths);
        }
      }

      // Delete related data
      await supabase.from("bottlenecks").delete().eq("analysis_id", id);
      await supabase.from("recommendations").delete().eq("analysis_id", id);
      await supabase.from("analysis_scores").delete().eq("analysis_id", id);
      await supabase.from("flowcharts").delete().eq("analysis_id", id);
      await supabase.from("documents").delete().eq("analysis_id", id);
      await supabase.from("deliverables").delete().eq("analysis_id", id);

      // Delete questionnaire sessions and related
      const { data: sessions } = await supabase
        .from("questionnaire_sessions")
        .select("id")
        .eq("analysis_id", id);
      if (sessions && sessions.length > 0) {
        for (const s of sessions) {
          await supabase.from("questionnaire_responses").delete().eq("session_id", s.id);
          await supabase.from("questionnaire_questions").delete().eq("session_id", s.id);
        }
        await supabase.from("questionnaire_sessions").delete().eq("analysis_id", id);
      }

      // Delete the analysis
      await supabase.from("analyses").delete().eq("id", id);

      // Optionally delete client
      if (deleteClient && analysis.client_id) {
        const { data: otherAnalyses } = await supabase
          .from("analyses")
          .select("id")
          .eq("client_id", analysis.client_id);

        if (!otherAnalyses || otherAnalyses.length === 0) {
          await supabase.from("client_metrics").delete().eq("client_id", analysis.client_id);
          await supabase.from("clients").delete().eq("id", analysis.client_id);
        } else {
          toast.info("Cliente mantido pois possui outras análises vinculadas.");
        }
      }

      toast.success("Análise apagada com sucesso.");
      navigate("/analyses");
    } catch (err: any) {
      toast.error(err.message || "Erro ao apagar análise.");
      setDeleting(false);
    }
  };

  const handleDownloadPdf = async (type: string) => {
    setDownloadingPdf(type);
    try {
      let doc;
      let filename;
      if (type === 'technical') {
        doc = generateTechnicalReport(analysis, scores, bottlenecks, recommendations, flowcharts);
        filename = `relatorio-tecnico-${analysis.clients?.name?.replace(/\s/g, '-')}.pdf`;
      } else if (type === 'client_report') {
        doc = await generateClientReport(analysis, scores, bottlenecks, recommendations, flowcharts);
        filename = `diagnostico-cliente-${analysis.clients?.name?.replace(/\s/g, '-')}.pdf`;
      } else if (type === 'executive') {
        doc = generateExecutiveSummary(analysis, bottlenecks, recommendations);
        filename = `resumo-executivo-${analysis.clients?.name?.replace(/\s/g, '-')}.pdf`;
      } else if (type === 'commercial') {
        doc = generateCommercialPresentation(analysis, scores, bottlenecks, recommendations);
        filename = `apresentacao-comercial-${analysis.clients?.name?.replace(/\s/g, '-')}.pdf`;
      } else if (type === 'flowcharts') {
        doc = generateTechnicalReport(analysis, [], [], [], flowcharts);
        filename = `fluxogramas-${analysis.clients?.name?.replace(/\s/g, '-')}.pdf`;
      } else if (type === 'zip') {
        const zip = new JSZip();
        const clientPdf = await generateClientReport(analysis, scores, bottlenecks, recommendations, flowcharts);
        zip.file("diagnostico-cliente.pdf", clientPdf.output("blob"));
        zip.file("relatorio-tecnico.pdf", generateTechnicalReport(analysis, scores, bottlenecks, recommendations, flowcharts).output("blob"));
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `caligon-entregaveis-${analysis.clients?.name?.replace(/\s/g, '-')}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("ZIP baixado com sucesso!");
        setDownloadingPdf(null);
        return;
      }
      if (doc && filename) { doc.save(filename); toast.success("PDF baixado com sucesso!"); }
    } catch (err: any) {
      toast.error("Erro ao gerar PDF: " + (err.message || ""));
    }
    setDownloadingPdf(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (!analysis) return <div className="text-center py-12"><p className="text-muted-foreground">Análise não encontrada</p></div>;

  const client = analysis.clients;
  const currentStepIndex = STATUS_STEPS.indexOf(analysis.status);
  const totalLoss = Number(analysis.estimated_loss) || 0;
  const totalSaving = recommendations.reduce((s, r) => s + Number(r.estimated_saving || 0), 0);
  const totalCost = recommendations.reduce((s, r) => s + Number(r.estimated_cost || 0), 0);
  const roi = totalCost > 0 ? Math.round(totalSaving / totalCost * 100) : 0;
  const financialGate = (analysis as any).financial_gate || 'parcial';
  const validationResult = (analysis as any).validation_result || {};
  const lossDisplayMode = (analysis as any).loss_display_mode || 'exact';

  const asIs = flowcharts.find(f => f.type === 'as_is');
  const toBe = flowcharts.find(f => f.type === 'to_be');
  const canAdvanceToReport = asIs && toBe;

  const rootBottlenecks = bottlenecks.filter(b => (b as any).causal_layer === 'causa_raiz' || !(b as any).causal_layer);
  const symptomBottlenecks = bottlenecks.filter(b => (b as any).causal_layer === 'sintoma_operacional');
  const impactBottlenecks = bottlenecks.filter(b => (b as any).causal_layer === 'impacto_financeiro');

  const recsByPhase: Record<string, any[]> = { estabilizacao: [], padronizacao: [], automacao: [], otimizacao: [] };
  recommendations.forEach(r => {
    const phase = (r as any).roadmap_phase || 'estabilizacao';
    if (recsByPhase[phase]) recsByPhase[phase].push(r);
    else recsByPhase.estabilizacao.push(r);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/analyses" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-2xl font-display text-foreground">{client?.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{analysis.process} • {client?.niche} • v{analysis.version}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors border border-destructive/30"
          >
            <Trash2 className="w-4 h-4" />
            Apagar
          </button>
          {analysis.status === 'questionario' && (
            <Link to={`/analyses/${id}/questionnaire`} className="btn-gold">
              <MessageCircle className="w-4 h-4" /> Continuar Questionário
            </Link>
          )}
          {analysis.status === 'diagnostico' && (
            <button onClick={handleRunDiagnosis} disabled={diagnosing} className="btn-gold">
              {diagnosing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {diagnosing ? "Diagnosticando..." : "Executar Diagnóstico IA"}
            </button>
          )}
          {analysis.status === 'fluxogramas' && (
            <>
              <button onClick={() => handleAdvanceStatus('diagnostico', 40)} className="btn-navy text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar Diagnóstico
              </button>
              <button onClick={() => canAdvanceToReport && handleAdvanceStatus('relatorio', 80)} disabled={!canAdvanceToReport} className={`btn-gold ${!canAdvanceToReport ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Avançar para Relatório <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          {analysis.status === 'relatorio' && (
            <button onClick={() => handleAdvanceStatus('revisao', 90)} className="btn-gold">
              Enviar para Revisão <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {analysis.status === 'revisao' && role === 'socio' && (
            <button onClick={handleApprove} className="btn-gold">
              <CheckCircle2 className="w-4 h-4" /> Aprovar
            </button>
          )}
          {analysis.status === 'aprovado' && (
            <button onClick={() => handleAdvanceStatus('entregue', 100)} className="btn-gold">
              Marcar como Entregue <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card-premium p-4">
        <div className="flex items-center gap-1">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <button onClick={() => handleStepClick(step, i)} disabled={!canNavigateToStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all w-full justify-center ${
                  i < currentStepIndex ? 'bg-success/10 text-success cursor-pointer hover:bg-success/20' :
                  i === currentStepIndex ? 'bg-accent/15 text-accent-foreground border border-accent' :
                  'bg-muted text-muted-foreground cursor-not-allowed'
                }`}>
                {i < currentStepIndex && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{STATUS_LABELS[step]}</span>
              </button>
              {i < STATUS_STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-border mx-1 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <OverviewTab analysis={analysis} scores={scores} bottlenecks={bottlenecks} recommendations={recommendations}
          rootBottlenecks={rootBottlenecks} symptomBottlenecks={symptomBottlenecks}
          totalLoss={totalLoss} totalSaving={totalSaving} roi={roi}
          financialGate={financialGate} lossDisplayMode={lossDisplayMode} validationResult={validationResult} />
      )}
      {activeTab === 'scores' && <ScoresTab scores={scores} />}
      {activeTab === 'bottlenecks' && <BottlenecksTab bottlenecks={bottlenecks} rootBottlenecks={rootBottlenecks} symptomBottlenecks={symptomBottlenecks} impactBottlenecks={impactBottlenecks} />}
      {activeTab === 'recommendations' && <RecommendationsTab recommendations={recommendations} recsByPhase={recsByPhase} />}
      {activeTab === 'flowcharts' && <FlowchartsTab flowcharts={flowcharts} canAdvanceToReport={!!canAdvanceToReport} onSaveFlowchart={handleSaveFlowchart} onAdvanceStatus={handleAdvanceStatus} />}
      {activeTab === 'report' && <ReportTab analysis={analysis} scores={scores} flowcharts={flowcharts} downloadingPdf={downloadingPdf} onDownloadPdf={handleDownloadPdf} onAdvanceStatus={handleAdvanceStatus} />}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => !deleting && setShowDeleteModal(false)} />
          <div className="relative card-premium p-6 w-full max-w-md z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-full bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-display text-foreground">Apagar análise</h3>
                <p className="text-sm text-muted-foreground">{client?.name}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              Esta ação não pode ser desfeita. Todos os dados da análise serão removidos
              permanentemente, incluindo questionário, diagnóstico, fluxogramas e documentos.
            </p>

            <div className="space-y-2 mb-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                O que fazer com o cliente vinculado?
              </p>
              <button
                onClick={() => handleDelete(false)}
                disabled={deleting}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <p className="text-sm font-medium text-foreground">Apagar só a análise</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  O cliente {client?.name} será mantido no sistema
                </p>
              </button>
              <button
                onClick={() => handleDelete(true)}
                disabled={deleting}
                className="w-full text-left p-3 rounded-lg border border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50"
              >
                <p className="text-sm font-medium text-destructive">Apagar análise e cliente</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {client?.name} será removido (se não tiver outras análises)
                </p>
              </button>
            </div>

            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>

            {deleting && (
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Apagando...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
