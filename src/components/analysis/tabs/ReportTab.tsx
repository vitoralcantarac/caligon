import { FileText, Download, Loader2, ChevronRight } from "lucide-react";

interface ReportTabProps {
  analysis: any;
  scores: any[];
  flowcharts: any[];
  downloadingPdf: string | null;
  onDownloadPdf: (type: string) => void;
  onAdvanceStatus: (status: string, progress: number) => void;
}

export default function ReportTab({ analysis, scores, flowcharts, downloadingPdf, onDownloadPdf, onAdvanceStatus }: ReportTabProps) {
  return (
    <div className="space-y-6">
      <div className="card-premium p-5">
        <h2 className="font-display text-lg text-foreground mb-4">Entregáveis</h2>
        <div className="space-y-3">
          {[
            { type: 'client_report', title: 'Relatório do Cliente (PDF Completo)', description: 'PDF unificado e estético para enviar ao cliente', ready: scores.length > 0 },
            { type: 'technical', title: 'Relatório Técnico Interno', description: 'Versão técnica para uso interno da equipe', ready: scores.length > 0 },
            { type: 'zip', title: 'Exportação ZIP (todos os arquivos)', description: 'PDF + dados + fluxogramas em um arquivo', ready: scores.length > 0 },
          ].map(item => (
            <div key={item.type} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{(item as any).description || (item.ready ? 'Disponível para download' : 'Aguardando diagnóstico')}</p>
                </div>
              </div>
              <button onClick={() => onDownloadPdf(item.type)} disabled={!item.ready || downloadingPdf === item.type}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${item.ready ? 'btn-navy' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                {downloadingPdf === item.type ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {downloadingPdf === item.type ? 'Gerando...' : 'Download'}
              </button>
            </div>
          ))}
        </div>
      </div>
      {analysis.status === 'relatorio' && (
        <div className="flex justify-end">
          <button onClick={() => onAdvanceStatus('revisao', 90)} className="btn-gold">
            Enviar para Revisão <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
