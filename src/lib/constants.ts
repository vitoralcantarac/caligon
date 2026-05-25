export const STATUS_LABELS: Record<string, string> = {
  cadastro: 'Cadastro',
  questionario: 'Questionário',
  diagnostico: 'Diagnóstico',
  fluxogramas: 'Fluxogramas',
  relatorio: 'Relatório',
  revisao: 'Revisão',
  aprovado: 'Aprovado',
  entregue: 'Entregue',
};

export const STATUS_COLOR: Record<string, string> = {
  cadastro: 'badge-info',
  questionario: 'badge-info',
  diagnostico: 'badge-warning',
  fluxogramas: 'badge-warning',
  relatorio: 'badge-warning',
  revisao: 'badge-gold',
  aprovado: 'badge-success',
  entregue: 'badge-success',
};

export const STATUS_STEPS = ['cadastro', 'questionario', 'diagnostico', 'fluxogramas', 'relatorio', 'revisao', 'aprovado', 'entregue'];

export const severityStyle: Record<string, string> = { critical: 'badge-destructive', high: 'badge-warning', medium: 'badge-info', low: 'badge-success' };
export const categoryLabels: Record<string, string> = { corte: 'Corte Imediato', simplificacao: 'Simplificação', automacao: 'Automação', delegacao: 'Delegação', reestruturacao: 'Reestruturação', acompanhamento: 'Acompanhamento' };
export const confidenceLabels: Record<string, string> = { high: '🟢 Alta', medium: '🟡 Média', low: '🔴 Baixa' };
export const causalLayerLabels: Record<string, string> = { causa_raiz: '🔴 Causa Raiz', sintoma_operacional: '🟡 Sintoma Operacional', impacto_financeiro: '🔵 Impacto Financeiro' };
export const roadmapPhaseLabels: Record<string, { label: string; color: string; order: number }> = {
  estabilizacao: { label: '1. Estabilização', color: 'text-destructive', order: 1 },
  padronizacao: { label: '2. Padronização', color: 'text-warning', order: 2 },
  automacao: { label: '3. Automação', color: 'text-info', order: 3 },
  otimizacao: { label: '4. Otimização', color: 'text-success', order: 4 },
};
export const calculationTypeLabels: Record<string, string> = {
  calculo_direto: '📊 Cálculo direto', estimativa_aproximacao: '📐 Estimativa', inferencia_operacional: '🔍 Inferência',
  benchmark_nicho: '📈 Benchmark', hipotese_qualitativa: '💭 Hipótese',
};
export const sourceLabels: Record<string, string> = {
  questionario: '📋 Questionário', cadastro: '📝 Cadastro', documento: '📄 Documento',
  inferencia_ia: '🤖 Inferência IA', benchmark: '📈 Benchmark',
};
export const financialGateLabels: Record<string, { label: string; icon: string; color: string }> = {
  sim: { label: 'Dados suficientes — valores exatos', icon: '🟢', color: 'text-success' },
  parcial: { label: 'Dados parciais — faixas estimadas', icon: '🟡', color: 'text-warning' },
  nao: { label: 'Dados insuficientes — tendências qualitativas', icon: '🔴', color: 'text-destructive' },
};

export function formatLossValue(loss: number, displayMode?: string, rangeMin?: number, rangeMax?: number): string {
  if (displayMode === 'range' && rangeMin && rangeMax) {
    return `R$ ${rangeMin.toLocaleString('pt-BR')} – ${rangeMax.toLocaleString('pt-BR')}`;
  }
  if (displayMode === 'qualitative') {
    return loss > 0 ? `~R$ ${loss.toLocaleString('pt-BR')} (estimativa)` : 'Impacto não quantificado';
  }
  return `R$ ${loss.toLocaleString('pt-BR')}`;
}
