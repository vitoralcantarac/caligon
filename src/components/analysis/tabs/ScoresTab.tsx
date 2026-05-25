import { Info, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { confidenceLabels } from "@/lib/constants";

interface ScoresTabProps {
  scores: any[];
}

export default function ScoresTab({ scores }: ScoresTabProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Info className="w-3.5 h-3.5" />
          <span>Todos os scores são <strong>heurísticos</strong>, baseados em respostas do questionário e inferências da IA. Não equivalem a auditoria operacional completa.</span>
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scores.length === 0 ? (
          <div className="col-span-2 card-premium p-12 text-center"><p className="text-muted-foreground">Scores serão gerados após o diagnóstico IA.</p></div>
        ) : scores.map(score => {
          const factors = Array.isArray(score.factors) ? score.factors : [];
          return (
            <div key={score.id} className="card-premium p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{score.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{score.description}</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${score.value > 60 ? 'text-destructive' : score.value > 40 ? 'text-warning' : 'text-success'}`}>{score.value}</span>
                  {(score as any).confidence && <p className="text-[10px] text-muted-foreground">Confiança: {confidenceLabels[(score as any).confidence]}</p>}
                </div>
              </div>
              <div className="progress-bar mb-3">
                <div className="h-full rounded-full" style={{ width: `${score.value}%`, background: score.value > 60 ? 'hsl(var(--destructive))' : score.value > 40 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }} />
              </div>
              {((score as any).basis || (score as any).missing_data) && (
                <div className="mb-3 p-2 rounded bg-muted/30 border border-border text-xs space-y-1">
                  {(score as any).basis && <p className="text-foreground"><strong>Base:</strong> {(score as any).basis}</p>}
                  {(score as any).missing_data && <p className="text-muted-foreground"><strong>Faltou:</strong> {(score as any).missing_data}</p>}
                </div>
              )}
              {factors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fatores</p>
                  {factors.map((f: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      {f.impact === 'down' ? <ArrowDownRight className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" /> : <ArrowUpRight className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />}
                      <div><p className="font-medium text-foreground">{f.label}</p><p className="text-xs text-muted-foreground">{f.detail}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
