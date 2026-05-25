import { useState } from "react";
import { Zap, Target, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import {
  categoryLabels, confidenceLabels, calculationTypeLabels,
  roadmapPhaseLabels, formatLossValue,
} from "@/lib/constants";

interface RecommendationsTabProps {
  recommendations: any[];
  recsByPhase: Record<string, any[]>;
}

export default function RecommendationsTab({ recommendations, recsByPhase }: RecommendationsTabProps) {
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {recommendations.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <p className="text-muted-foreground">Nenhuma recomendação gerada neste diagnóstico.</p>
          <p className="text-xs text-muted-foreground mt-2">Se o diagnóstico já foi executado, tente reprocessar — pode ter ocorrido falha de geração.</p>
        </div>
      ) : (
        <>
          {recommendations.filter(r => r.is_quick_win).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-accent" />
                <h2 className="font-display text-lg text-foreground">Quick Wins ({recommendations.filter(r => r.is_quick_win).length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.filter(r => r.is_quick_win).map(rec => (
                  <RecCard key={rec.id} rec={rec} expanded={expandedRec === rec.id} onToggle={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)} />
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" /> Roadmap por Fases
            </h2>
            {Object.entries(recsByPhase).filter(([, recs]) => recs.length > 0).map(([phase, recs]) => {
              const phaseInfo = roadmapPhaseLabels[phase] || roadmapPhaseLabels.estabilizacao;
              return (
                <div key={phase} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-sm font-bold ${phaseInfo.color}`}>{phaseInfo.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {phase === 'estabilizacao' ? '— Corrigir origem do caos' : phase === 'padronizacao' ? '— Definir fluxo e critérios' : phase === 'automacao' ? '— Automatizar o estável' : '— Aprimorar eficiência'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recs.filter(r => !r.is_quick_win).map(rec => (
                      <RecCard key={rec.id} rec={rec} expanded={expandedRec === rec.id} onToggle={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function RecCard({ rec, expanded, onToggle }: { rec: any; expanded: boolean; onToggle: () => void }) {
  const phaseInfo = roadmapPhaseLabels[rec.roadmap_phase] || null;
  return (
    <div className="card-premium p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-foreground text-sm">{rec.title}</h3>
        <div className="flex items-center gap-1">
          {rec.is_quick_win && <Zap className="w-4 h-4 text-accent flex-shrink-0" />}
          {phaseInfo && <span className={`text-[10px] font-medium ${phaseInfo.color}`}>{phaseInfo.label}</span>}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{rec.problem}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="badge-info">{categoryLabels[rec.category] || rec.category}</span>
        <span className="text-xs text-muted-foreground">{rec.evidence_type === 'fact' ? '📌 Confirmado' : rec.evidence_type === 'inference' ? '🔍 Estimado' : '💭 Hipotético'}</span>
        <span className="text-xs text-muted-foreground">Confiança: {confidenceLabels[rec.confidence]}</span>
        {rec.calculation_type && <span className="text-[10px] text-muted-foreground">{calculationTypeLabels[rec.calculation_type] || ''}</span>}
      </div>
      <p className="text-xs text-foreground mb-3">{rec.justification}</p>

      {/* How to implement */}
      {Array.isArray(rec.how_to_implement) && rec.how_to_implement.length > 0 && (
        <div className="mb-3 p-3 rounded-lg bg-accent/5 border border-accent/30">
          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-accent" /> Como implementar
          </p>
          <ol className="space-y-1.5">
            {rec.how_to_implement.map((step: string, i: number) => (
              <li key={i} className="text-xs text-foreground flex gap-2">
                <span className="font-bold text-accent flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {Array.isArray(rec.tools_required) && rec.tools_required.length > 0 && (
            <p className="text-[11px] text-muted-foreground mt-2"><strong>Ferramentas:</strong> {rec.tools_required.join(', ')}</p>
          )}
        </div>
      )}

      {/* Expected result */}
      {rec.expected_result && (
        <div className="mb-3 p-2.5 rounded-lg bg-success/10 border border-success/30">
          <p className="text-[11px] font-semibold text-success mb-0.5">✓ Resultado esperado</p>
          <p className="text-xs text-foreground">{rec.expected_result}</p>
        </div>
      )}

      {/* Warning */}
      {rec.warning && (
        <div className="mb-3 p-2 rounded bg-warning/10 border border-warning/30 text-xs">
          <p className="text-warning"><strong>⚠️ Atenção:</strong> {rec.warning}</p>
        </div>
      )}

      {((rec.dependencies && rec.dependencies.length > 0) || rec.anticipation_risk) && (
        <div className="mb-3 p-2 rounded bg-muted/30 border border-border text-xs space-y-1">
          {rec.dependencies && rec.dependencies.length > 0 && <p className="text-foreground"><strong>Depende de:</strong> {rec.dependencies.join(', ')}</p>}
          {rec.anticipation_risk && <p className="text-warning"><strong>⚠️ Risco se antecipar:</strong> {rec.anticipation_risk}</p>}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Economia/mês</p>
          <p className="text-sm font-bold text-success">{formatLossValue(Number(rec.estimated_saving), rec.saving_display_mode, rec.saving_range_min, rec.saving_range_max)}</p>
        </div>
        <div><p className="text-xs text-muted-foreground">Custo</p><p className="text-sm font-semibold text-foreground">R$ {Number(rec.estimated_cost).toLocaleString('pt-BR')}</p></div>
        <div><p className="text-xs text-muted-foreground">Prazo</p><p className="text-sm font-semibold text-foreground">{rec.timeframe}</p></div>
      </div>
      {(Number(rec.roi_percentage) > 0 || Number(rec.payback_months) > 0) && (
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
          <div><p className="text-xs text-muted-foreground">ROI</p><p className="text-sm font-bold text-accent">{Number(rec.roi_percentage)}%</p></div>
          <div><p className="text-xs text-muted-foreground">Payback</p><p className="text-sm font-bold text-foreground">{rec.payback_months ? `${rec.payback_months} meses` : rec.timeframe}</p></div>
        </div>
      )}
      <button onClick={onToggle} className="mt-3 text-xs text-accent flex items-center gap-1 hover:underline">
        <Calculator className="w-3.5 h-3.5" />
        {expanded ? "Ocultar detalhes" : "Ver como foi calculado"}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && rec.calculation_explanation && (
        <div className="mt-2 p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-foreground">{rec.calculation_explanation}</p>
          {rec.saving_display_mode === 'range' && <p className="text-[10px] text-warning italic mt-1">⚠️ Economia apresentada como faixa estimada.</p>}
        </div>
      )}
    </div>
  );
}
