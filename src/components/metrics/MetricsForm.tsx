import { useState } from "react";
import { ChevronDown, ChevronUp, Calculator, AlertTriangle } from "lucide-react";
import {
  METRIC_GROUPS, MetricDef, getMetricsByGroup, computeConfidenceLevel, computeGroupStats,
} from "@/lib/metrics-config";

export interface MetricState {
  value: number | null;
  status: 'absent' | 'filled' | 'calculated' | 'declined';
  origin: 'manual' | 'calculated' | 'questionnaire';
  formulaUsed?: string;
  calculationInputs?: Record<string, number>;
  observation?: string;
}

interface MetricsFormProps {
  metrics: Record<string, MetricState>;
  onChange: (metrics: Record<string, MetricState>) => void;
}

export default function MetricsForm({ metrics, onChange }: MetricsFormProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('receita');
  const [expandedCalc, setExpandedCalc] = useState<string | null>(null);
  const [auxValues, setAuxValues] = useState<Record<string, Record<string, number>>>({});

  const getState = (key: string): MetricState => metrics[key] || { value: null, status: 'absent', origin: 'manual' };

  const updateMetric = (key: string, partial: Partial<MetricState>) => {
    const current = getState(key);
    onChange({ ...metrics, [key]: { ...current, ...partial } });
  };

  const handleValueChange = (key: string, raw: string) => {
    const num = raw === '' ? null : parseFloat(raw);
    updateMetric(key, { value: num, status: num !== null ? 'filled' : 'absent', origin: 'manual' });
  };

  const handleDecline = (key: string, declined: boolean) => {
    if (declined) {
      updateMetric(key, { value: null, status: 'declined', origin: 'manual' });
    } else {
      updateMetric(key, { status: 'absent' });
    }
  };

  const handleAuxChange = (metricKey: string, auxKey: string, raw: string) => {
    const num = raw === '' ? 0 : parseFloat(raw);
    setAuxValues(prev => ({
      ...prev,
      [metricKey]: { ...(prev[metricKey] || {}), [auxKey]: num },
    }));
  };

  const handleCompute = (metric: MetricDef) => {
    if (!metric.computeFromAux) return;
    const vals = auxValues[metric.key] || {};
    const result = metric.computeFromAux(vals);
    if (result !== null) {
      updateMetric(metric.key, {
        value: result,
        status: 'calculated',
        origin: 'calculated',
        formulaUsed: metric.formula || undefined,
        calculationInputs: vals,
      });
    }
  };

  const confidenceLevel = computeConfidenceLevel(
    Object.fromEntries(Object.entries(metrics).map(([k, v]) => [k, { status: v.status }]))
  );
  const confidenceColors = { baixa: 'bg-destructive', media: 'bg-warning', alta: 'bg-success' };
  const confidenceLabels = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
  const confidenceWidths = { baixa: '33%', media: '66%', alta: '100%' };

  return (
    <div className="space-y-5">
      {/* Confidence bar */}
      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground">Confiabilidade dos dados financeiros e operacionais</h4>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${confidenceColors[confidenceLevel]}`}>
            {confidenceLabels[confidenceLevel]}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${confidenceColors[confidenceLevel]}`}
            style={{ width: confidenceWidths[confidenceLevel] }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Quanto mais métricas essenciais forem preenchidas, mais preciso será o diagnóstico financeiro, ROI, payback e perdas estimadas.
        </p>
      </div>

      {/* Groups */}
      {METRIC_GROUPS.map(group => {
        const stats = computeGroupStats(group.key, Object.fromEntries(Object.entries(metrics).map(([k, v]) => [k, { status: v.status }])));
        const isExpanded = expandedGroup === group.key;
        const groupMetrics = getMetricsByGroup(group.key);

        return (
          <div key={group.key} className="border border-border rounded-lg overflow-hidden bg-card">
            <button onClick={() => setExpandedGroup(isExpanded ? null : group.key)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{group.icon}</span>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-foreground">{group.label}</h4>
                  <p className="text-[10px] text-muted-foreground">
                    {stats.filled} preenchido{stats.filled !== 1 ? 's' : ''} • {stats.declined} recusado{stats.declined !== 1 ? 's' : ''} • {stats.missing} pendente{stats.missing !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {groupMetrics.map(m => {
                    const s = getState(m.key).status;
                    return <div key={m.key} className={`w-2 h-2 rounded-full ${s === 'filled' || s === 'calculated' ? 'bg-success' : s === 'declined' ? 'bg-destructive/50' : 'bg-muted-foreground/20'}`} />;
                  })}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border p-4 space-y-4">
                {groupMetrics.map(metric => {
                  const state = getState(metric.key);
                  const isDeclined = state.status === 'declined';
                  const isCalcOpen = expandedCalc === metric.key;
                  const levelBadge = metric.level === 'essential'
                    ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive uppercase">Essencial</span>
                    : metric.level === 'recommended'
                    ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning uppercase">Recomendada</span>
                    : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">Avançada</span>;

                  return (
                    <div key={metric.key} className={`rounded-lg border p-3 transition-colors ${isDeclined ? 'border-destructive/20 bg-destructive/3' : 'border-border'}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-foreground">{metric.label}</span>
                              {levelBadge}
                              {state.status === 'calculated' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-info/10 text-info">Calculado</span>}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{metric.help}</p>
                          </div>
                        </div>
                      </div>

                      {/* Main input + decline */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="number"
                            value={state.value ?? ''}
                            onChange={e => handleValueChange(metric.key, e.target.value)}
                            disabled={isDeclined}
                            placeholder={`Ex: ${metric.example?.match(/\d[\d.,]*/)?.[0] || '0'}`}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent transition-colors disabled:opacity-40 disabled:bg-muted"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{metric.unit}</span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={isDeclined}
                            onChange={e => handleDecline(metric.key, e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-destructive" />
                          <span className="text-[10px] text-muted-foreground">Não desejo informar</span>
                        </label>
                      </div>

                      {/* Decline warning */}
                      {isDeclined && metric.level === 'essential' && (
                        <div className="mt-2 p-2 rounded bg-destructive/5 border border-destructive/15 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] text-destructive">
                            A ausência desta informação pode reduzir a precisão do diagnóstico financeiro, ROI, payback, perdas estimadas e confiabilidade geral da análise.
                          </p>
                        </div>
                      )}

                      {/* Como calcular */}
                      {metric.formula && (
                        <div className="mt-2">
                          <button onClick={() => setExpandedCalc(isCalcOpen ? null : metric.key)}
                            className="flex items-center gap-1 text-[11px] text-accent hover:underline">
                            <Calculator className="w-3 h-3" /> {isCalcOpen ? 'Fechar' : 'Como calcular'}
                          </button>
                          {isCalcOpen && (
                            <div className="mt-2 p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                              <p className="text-xs text-foreground"><strong>Fórmula:</strong> {metric.formula}</p>
                              {metric.example && <p className="text-[11px] text-muted-foreground"><strong>Exemplo:</strong> {metric.example}</p>}
                              {metric.auxiliaryFields && (
                                <div className="space-y-2 mt-2">
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Cálculo assistido</p>
                                  {metric.auxiliaryFields.map(aux => (
                                    <div key={aux.key} className="flex items-center gap-2">
                                      <label className="text-[11px] text-foreground w-32 flex-shrink-0">{aux.label}</label>
                                      <input type="number"
                                        value={auxValues[metric.key]?.[aux.key] || ''}
                                        onChange={e => handleAuxChange(metric.key, aux.key, e.target.value)}
                                        placeholder={aux.placeholder}
                                        className="flex-1 px-2 py-1.5 rounded border border-border bg-background text-xs outline-none focus:border-accent" />
                                      <span className="text-[10px] text-muted-foreground">{aux.unit}</span>
                                    </div>
                                  ))}
                                  <button onClick={() => handleCompute(metric)}
                                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-accent/10 text-accent-foreground hover:bg-accent/20 transition-colors flex items-center gap-1">
                                    <Calculator className="w-3 h-3" /> Calcular
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
