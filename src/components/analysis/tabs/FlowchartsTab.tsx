import { ArrowLeft, ChevronRight, Save } from "lucide-react";
import FlowEditor from "@/components/analysis/FlowEditor";

interface FlowchartsTabProps {
  flowcharts: any[];
  canAdvanceToReport: boolean;
  onSaveFlowchart: (fcId: string, nodes: any[], edges: any[]) => void;
  onAdvanceStatus: (status: string, progress: number) => void;
}

export default function FlowchartsTab({ flowcharts, canAdvanceToReport, onSaveFlowchart, onAdvanceStatus }: FlowchartsTabProps) {
  return (
    <div className="space-y-6">
      {flowcharts.length === 0 ? (
        <div className="card-premium p-12 text-center"><p className="text-muted-foreground">Fluxogramas serão gerados após o diagnóstico IA.</p></div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => onAdvanceStatus('diagnostico', 40)} className="btn-navy text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar Diagnóstico
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { flowcharts.forEach(fc => onSaveFlowchart(fc.id, Array.isArray(fc.nodes) ? fc.nodes : [], Array.isArray(fc.edges) ? fc.edges : [])); }} className="btn-navy text-xs">
                <Save className="w-3.5 h-3.5" /> Salvar
              </button>
              <button onClick={() => canAdvanceToReport && onAdvanceStatus('relatorio', 80)} disabled={!canAdvanceToReport}
                className={`btn-gold text-xs ${!canAdvanceToReport ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Avançar para Relatório <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {flowcharts.map(fc => (
            <div key={fc.id}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-lg text-foreground">{fc.label || (fc.type === 'as_is' ? 'AS-IS' : 'TO-BE')}</h2>
                <span className="text-xs text-muted-foreground">v{fc.version} • {fc.status || 'draft'}</span>
              </div>
              <div className="card-premium overflow-hidden" style={{ height: 500 }}>
                <FlowEditor initialNodes={Array.isArray(fc.nodes) ? fc.nodes : []} initialEdges={Array.isArray(fc.edges) ? fc.edges : []} editable={true} onSave={(nodes, edges) => onSaveFlowchart(fc.id, nodes, edges)} />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
