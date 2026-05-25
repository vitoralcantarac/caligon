import { useState } from "react";
import { AlertTriangle, Layers, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import {
  severityStyle, causalLayerLabels, confidenceLabels,
  calculationTypeLabels, sourceLabels, formatLossValue,
} from "@/lib/constants";

interface BottlenecksTabProps {
  bottlenecks: any[];
  rootBottlenecks: any[];
  symptomBottlenecks: any[];
  impactBottlenecks: any[];
}

export default function BottlenecksTab({ bottlenecks, rootBottlenecks, symptomBottlenecks, impactBottlenecks }: BottlenecksTabProps) {
  const [expandedBottleneck, setExpandedBottleneck] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {bottlenecks.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <p className="text-muted-foreground">Nenhum gargalo identificado neste diagnóstico.</p>
          <p className="text-xs text-muted-foreground mt-2">Se o diagnóstico já foi executado, tente reprocessar — pode ter ocorrido falha de geração.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{bottlenecks.length} gargalos identificados • Organizados por camada causal</p>
          </div>
          {[
            { layer: 'causa_raiz', items: rootBottlenecks, label: '🔴 Causas Raiz', desc: 'Problemas estruturais que originam os demais efeitos' },
            { layer: 'sintoma_operacional', items: symptomBottlenecks, label: '🟡 Sintomas Operacionais', desc: 'Efeitos visíveis no processo' },
            { layer: 'impacto_financeiro', items: impactBottlenecks, label: '🔵 Impactos Financeiros', desc: 'Consequências econômicas' },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.layer}>
              <div className="flex items-center gap-2 mb-3 mt-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-display text-base text-foreground">{group.label}</h3>
                <span className="text-xs text-muted-foreground">— {group.desc}</span>
              </div>
              {group.items.map(b => (
                <BottleneckCard key={b.id} b={b} expanded={expandedBottleneck === b.id} onToggle={() => setExpandedBottleneck(expandedBottleneck === b.id ? null : b.id)} />
              ))}
            </div>
          ))}
          {rootBottlenecks.length === 0 && symptomBottlenecks.length === 0 && impactBottlenecks.length === 0 && (
            bottlenecks.map(b => (
              <BottleneckCard key={b.id} b={b} expanded={expandedBottleneck === b.id} onToggle={() => setExpandedBottleneck(expandedBottleneck === b.id ? null : b.id)} />
            ))
          )}
        </>
      )}
    </div>
  );
}

function BottleneckCard({ b, expanded, onToggle }: { b: any; expanded: boolean; onToggle: () => void }) {
  const premises = Array.isArray(b.calculation_premises) ? b.calculation_premises : [];
  return (
    <div className="card-premium p-5 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${b.severity === 'critical' ? 'text-destructive' : b.severity === 'high' ? 'text-warning' : 'text-info'}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{b.title}</h3>
              {b.is_dominant && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">DOMINANTE</span>}
            </div>
            <p className="text-sm text-foreground mt-1">{b.description}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={severityStyle[b.severity]}>{b.severity}</span>
              {b.causal_layer && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted border border-border">{causalLayerLabels[b.causal_layer] || b.causal_layer}</span>}
              <span className="badge-info">{b.layer}</span>
              <span className="text-xs text-muted-foreground">{b.evidence_type === 'fact' ? '📌 Confirmado' : b.evidence_type === 'inference' ? '🔍 Estimado' : '💭 Hipotético'}</span>
              <span className="text-xs text-muted-foreground">Confiança: {confidenceLabels[b.confidence]}</span>
              {b.calculation_type && <span className="text-[10px] text-muted-foreground">{calculationTypeLabels[b.calculation_type] || b.calculation_type}</span>}
              {b.source && <span className="text-[10px] text-muted-foreground">{sourceLabels[b.source] || b.source}</span>}
            </div>
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-lg font-bold text-destructive">-{formatLossValue(Number(b.estimated_loss), b.loss_display_mode, b.loss_range_min, b.loss_range_max)}</p>
          <p className="text-xs text-muted-foreground">/mês</p>
          <p className="text-xs text-destructive/70">-R$ {(Number(b.annual_loss || b.estimated_loss * 12)).toLocaleString('pt-BR')}/ano</p>
        </div>
      </div>
      <button onClick={onToggle} className="mt-3 text-xs text-accent flex items-center gap-1 hover:underline">
        <Calculator className="w-3.5 h-3.5" />
        {expanded ? "Ocultar cálculo" : "Ver cálculo e premissas"}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && (
        <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border space-y-2">
          {b.behavior_description && <div><p className="text-xs font-semibold text-foreground">Comportamento:</p><p className="text-xs text-muted-foreground">{b.behavior_description}</p></div>}
          {b.calculation_formula && <div><p className="text-xs font-semibold text-foreground">Fórmula:</p><p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">{b.calculation_formula}</p></div>}
          {premises.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground">Premissas:</p>
              <div className="space-y-1 mt-1">
                {premises.map((p: any, i: number) => (
                  <div key={i} className="text-xs flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeof p === 'object' && p.source === 'questionário' ? 'bg-success' : typeof p === 'object' && p.source === 'benchmark' ? 'bg-warning' : 'bg-info'}`} />
                    <span className="text-foreground">{typeof p === 'object' ? `${p.label}: ${p.value}` : p}</span>
                    {typeof p === 'object' && <span className="text-muted-foreground">({p.source || 'estimativa'} • {confidenceLabels[p.confidence]?.split(' ')[0] || '🟡'})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {b.loss_display_mode === 'range' && <p className="text-[10px] text-warning italic">⚠️ Valor apresentado como faixa estimada devido a dados parciais.</p>}
          {b.loss_display_mode === 'qualitative' && <p className="text-[10px] text-destructive italic">⚠️ Impacto apenas qualitativo — dados insuficientes para quantificação precisa.</p>}
          {!b.calculation_formula && !b.behavior_description && premises.length === 0 && <p className="text-xs text-muted-foreground italic">Detalhes de cálculo não disponíveis para este gargalo.</p>}
        </div>
      )}
    </div>
  );
}
