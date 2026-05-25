import {
  ShieldCheck, GitBranch, Calculator, Info, Lightbulb,
  AlertTriangle, Target, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, FileText, CheckCircle, XCircle, AlertOctagon,
} from "lucide-react";
import { useState } from "react";
import {
  financialGateLabels, causalLayerLabels, confidenceLabels,
  calculationTypeLabels, formatLossValue,
} from "@/lib/constants";

interface OverviewTabProps {
  analysis: any;
  scores: any[];
  bottlenecks: any[];
  recommendations: any[];
  rootBottlenecks: any[];
  symptomBottlenecks: any[];
  totalLoss: number;
  totalSaving: number;
  roi: number;
  financialGate: string;
  lossDisplayMode: string;
  validationResult: any;
}

export default function OverviewTab({
  analysis, scores, bottlenecks, recommendations, rootBottlenecks, symptomBottlenecks,
  totalLoss, totalSaving, roi, financialGate, lossDisplayMode, validationResult,
}: OverviewTabProps) {
  const [showCausalTree, setShowCausalTree] = useState(false);
  const [showLossPremises, setShowLossPremises] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const gateInfo = financialGateLabels[financialGate] || financialGateLabels.parcial;
  const docsSummary: any[] = (analysis as any).documents_summary || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Qualification Badge */}
      {(analysis as any).qualification_level && (
        <div className="lg:col-span-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Qualificação pré-diagnóstico:</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            (analysis as any).qualification_level === 'alta' ? 'bg-success/10 text-success' :
            (analysis as any).qualification_level === 'media' ? 'bg-warning/10 text-warning' :
            'bg-destructive/10 text-destructive'
          }`}>
            {(analysis as any).qualification_level === 'alta' ? 'Alta' :
             (analysis as any).qualification_level === 'media' ? 'Média' : 'Baixa'} ({(analysis as any).qualification_score}/30)
          </span>
        </div>
      )}
      <div className="lg:col-span-2 space-y-6">
        {/* Financial Gate Badge */}
        {financialGate && totalLoss > 0 && (
          <div className={`p-3 rounded-lg border border-border flex items-center gap-2 ${financialGate === 'sim' ? 'bg-success/5' : financialGate === 'parcial' ? 'bg-warning/5' : 'bg-destructive/5'}`}>
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span className={`text-xs font-medium ${gateInfo.color}`}>{gateInfo.icon} Gate Financeiro: {gateInfo.label}</span>
          </div>
        )}

        <div className="card-premium p-5">
          <h3 className="font-display text-lg text-foreground mb-4">Resumo Executivo</h3>
          {analysis.executive_summary ? (
            <p className="text-sm text-foreground leading-relaxed">{analysis.executive_summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Resumo será gerado após o diagnóstico.</p>
          )}
          {analysis.ai_reasoning && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground"><strong className="text-foreground">Raciocínio da IA:</strong> {analysis.ai_reasoning}</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Loss Card */}
        {totalLoss > 0 && (
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">Perdas Estimadas</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowCausalTree(!showCausalTree)} className="px-2.5 py-1 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" /> Árvore Causal
                </button>
                <button onClick={() => setShowLossPremises(!showLossPremises)} className="px-2.5 py-1 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5" /> {showLossPremises ? "Ocultar" : "Ver Cálculo"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/15">
                <p className="text-xs text-muted-foreground">Perda Mensal</p>
                <p className="text-xl font-bold text-destructive mt-1">{formatLossValue(totalLoss, lossDisplayMode, (analysis as any).loss_range_min, (analysis as any).loss_range_max)}</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/15">
                <p className="text-xs text-muted-foreground">Perda Anual</p>
                <p className="text-xl font-bold text-destructive mt-1">{formatLossValue(totalLoss * 12, lossDisplayMode, ((analysis as any).loss_range_min || 0) * 12, ((analysis as any).loss_range_max || 0) * 12)}</p>
              </div>
              <div className="p-4 rounded-lg bg-success/5 border border-success/15">
                <p className="text-xs text-muted-foreground">Economia Potencial/mês</p>
                <p className="text-xl font-bold text-success mt-1">R$ {totalSaving.toLocaleString('pt-BR')}</p>
              </div>
              <div className="p-4 rounded-lg bg-success/5 border border-success/15">
                <p className="text-xs text-muted-foreground">ROI Estimado</p>
                <p className="text-xl font-bold text-success mt-1">{roi > 0 ? `${roi}%` : "—"}</p>
              </div>
            </div>

            {/* Causal Tree */}
            {showCausalTree && (
              <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-accent" /> Árvore Causal do Problema
                </h4>
                {rootBottlenecks.length > 0 ? (
                  <div className="space-y-3">
                    {rootBottlenecks.map(root => (
                      <div key={root.id} className="space-y-1">
                        <div className="flex items-center gap-2 p-2 rounded bg-destructive/5 border border-destructive/10">
                          <Target className="w-4 h-4 text-destructive flex-shrink-0" />
                          <span className="text-xs font-bold text-foreground">{root.title}</span>
                          {(root as any).is_dominant && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">DOMINANTE</span>}
                          <span className="ml-auto text-xs text-destructive font-bold">-{formatLossValue(Number(root.estimated_loss), (root as any).loss_display_mode, (root as any).loss_range_min, (root as any).loss_range_max)}/mês</span>
                        </div>
                        {symptomBottlenecks.filter(s => (s as any).causal_parent_id === root.id).map(symptom => (
                          <div key={symptom.id} className="ml-6 flex items-center gap-2 p-2 rounded bg-warning/5 border border-warning/10">
                            <span className="text-xs text-warning">↳</span>
                            <span className="text-xs text-foreground">{symptom.title}</span>
                            <span className="ml-auto text-xs text-warning">{Number(symptom.estimated_loss) > 0 ? `-R$ ${Number(symptom.estimated_loss).toLocaleString('pt-BR')}/mês` : 'derivado'}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {bottlenecks.slice(0, 5).map((b, i) => (
                      <div key={b.id} className={`flex items-center gap-2 p-2 rounded ${i === 0 ? 'bg-destructive/5 border border-destructive/10' : 'bg-muted/50 ml-4'}`}>
                        <span className="text-xs font-medium text-foreground">{i === 0 ? '🔴' : '↳'} {b.title}</span>
                        <span className="ml-auto text-xs text-destructive">-R$ {Number(b.estimated_loss).toLocaleString('pt-BR')}/mês</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground italic">A árvore causal mostra como os problemas se conectam. Perdas não são somadas entre causa e sintoma para evitar dupla contagem.</p>
              </div>
            )}

            {showLossPremises && (
              <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent" /> Composição da Perda
                </h4>
                {bottlenecks.map(b => (
                  <div key={b.id} className="text-xs border-b border-border pb-2 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{b.title}</span>
                        {(b as any).causal_layer && <span className="text-[10px] text-muted-foreground">{causalLayerLabels[(b as any).causal_layer] || ''}</span>}
                      </div>
                      <span className="text-destructive font-bold">-{formatLossValue(Number(b.estimated_loss), (b as any).loss_display_mode, (b as any).loss_range_min, (b as any).loss_range_max)}/mês</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-muted-foreground">Confiança: {confidenceLabels[b.confidence] || b.confidence}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{b.evidence_type === 'fact' ? '📌 Confirmado' : b.evidence_type === 'inference' ? '🔍 Estimado' : '💭 Hipotético'}</span>
                      {(b as any).calculation_type && <><span className="text-muted-foreground">•</span><span className="text-muted-foreground">{calculationTypeLabels[(b as any).calculation_type] || (b as any).calculation_type}</span></>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Validation Result */}
        {Object.keys(validationResult).length > 0 && (
          <div className="card-premium p-5">
            <button onClick={() => setShowValidation(!showValidation)} className="w-full flex items-center justify-between">
              <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent" /> Validação Diagnóstica
              </h3>
              {showValidation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showValidation && (
              <div className="mt-4 space-y-2">
                {validationResult.doubleCounting && <ValidationItem label="Dupla Contagem" passed={!validationResult.doubleCounting.found} detail={validationResult.doubleCounting.action} />}
                {validationResult.minimumData && <ValidationItem label="Dados Mínimos" passed={validationResult.minimumData.status === 'sim'} detail={validationResult.minimumData.status === 'sim' ? 'Dados suficientes' : `Faltam: ${(validationResult.minimumData.missing || []).join(', ')}`} />}
                {validationResult.scoreCoherence && <ValidationItem label="Coerência dos Scores" passed={validationResult.scoreCoherence.passed} detail={validationResult.scoreCoherence.notes} />}
                {validationResult.roadmapCoherence && <ValidationItem label="Coerência do Roadmap" passed={validationResult.roadmapCoherence.passed} detail={validationResult.roadmapCoherence.notes} />}
                {validationResult.toBeFactibility && <ValidationItem label="Factibilidade do TO-BE" passed={validationResult.toBeFactibility.passed} detail={validationResult.toBeFactibility.notes} />}
                {validationResult.excessCertainty && <ValidationItem label="Excesso de Certeza" passed={!validationResult.excessCertainty.found} detail={validationResult.excessCertainty.found ? `Ajustes: ${(validationResult.excessCertainty.adjustments || []).join('; ')}` : 'Nenhum excesso detectado'} />}
              </div>
            )}
          </div>
        )}

        {/* Documents Analyzed */}
        <div className="card-premium p-5">
          <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" /> Documentos Analisados
          </h3>
          {docsSummary.length > 0 ? (
            <div className="space-y-2">
              {docsSummary.map((doc: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30 border border-border">
                  {doc.status === 'success' ? <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" /> :
                   doc.status === 'partial' || doc.status === 'image' ? <AlertOctagon className="w-3.5 h-3.5 text-warning flex-shrink-0" /> :
                   <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
                  <span className="text-foreground font-medium">{doc.name}</span>
                  <span className="text-muted-foreground ml-auto">
                    {doc.status === 'success' ? `${doc.charsExtracted} chars extraídos` :
                     doc.status === 'image' ? 'Conteúdo visual' :
                     doc.status === 'partial' ? 'Extração parcial' :
                     doc.status === 'skipped' ? 'Ignorado (limite)' : 'Erro na extração'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhum documento foi enviado para esta análise</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {scores.length > 0 && (
          <div className="card-premium p-5">
            <h3 className="font-display text-lg text-foreground mb-1">Scores</h3>
            <p className="text-[10px] text-muted-foreground mb-4 italic">Scores heurísticos — não equivalem a auditoria operacional</p>
            <div className="space-y-4">
              {scores.slice(0, 3).map(score => (
                <div key={score.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{score.label}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold ${score.value > 60 ? 'text-destructive' : score.value > 40 ? 'text-warning' : 'text-success'}`}>{score.value}/{score.max_value}</span>
                      {(score as any).confidence && <span className="text-[10px] text-muted-foreground">{confidenceLabels[(score as any).confidence]?.split(' ')[0]}</span>}
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score.value}%`, background: score.value > 60 ? 'hsl(var(--destructive))' : score.value > 40 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {bottlenecks.length > 0 && (
          <div className="card-premium p-5">
            <h3 className="font-display text-lg text-foreground mb-3">Top Gargalos</h3>
            <div className="space-y-2">
              {(rootBottlenecks.length > 0 ? rootBottlenecks : bottlenecks).slice(0, 3).map(b => (
                <div key={b.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${b.severity === 'critical' ? 'text-destructive' : 'text-warning'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.title}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-muted-foreground">-{formatLossValue(Number(b.estimated_loss), (b as any).loss_display_mode, (b as any).loss_range_min, (b as any).loss_range_max)}/mês</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ValidationItem({ label, passed, detail }: { label: string; passed: boolean; detail?: string }) {
  return (
    <div className={`flex items-start gap-2 p-2 rounded ${passed ? 'bg-success/5' : 'bg-warning/5'}`}>
      {passed ? <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-xs font-medium text-foreground">{label}: {passed ? 'OK' : 'Atenção'}</p>
        {detail && <p className="text-[10px] text-muted-foreground">{detail}</p>}
      </div>
    </div>
  );
}
