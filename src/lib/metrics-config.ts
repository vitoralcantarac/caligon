// Metrics configuration — defines all metrics, groups, levels, units, formulas, and help text.

export interface MetricDef {
  key: string;
  label: string;
  group: string;
  level: 'essential' | 'recommended' | 'advanced';
  unit: string;
  help: string;
  formula?: string;
  example?: string;
  auxiliaryFields?: { key: string; label: string; unit: string; placeholder: string }[];
  computeFromAux?: (values: Record<string, number>) => number | null;
}

export const METRIC_GROUPS = [
  { key: 'receita', label: 'Receita e Margem', icon: '💰' },
  { key: 'marketing', label: 'Marketing e Vendas', icon: '📈' },
  { key: 'operacional', label: 'Eficiência Operacional', icon: '⚙️' },
  { key: 'equipe', label: 'Equipe e Custo', icon: '👥' },
  { key: 'qualidade', label: 'Qualidade e Perdas', icon: '🔍' },
  { key: 'retencao', label: 'Retenção e Recorrência', icon: '🔄' },
];

export const METRICS: MetricDef[] = [
  // ── Receita e margem ──
  {
    key: 'faturamento_mensal', label: 'Faturamento Mensal', group: 'receita', level: 'essential',
    unit: 'R$', help: 'Quanto a empresa fatura em média por mês, somando todas as fontes de receita.',
    formula: 'Ticket médio × Volume de vendas no mês',
    example: 'Se o ticket médio é R$ 80 e você vende 500 por mês: R$ 40.000',
    auxiliaryFields: [
      { key: 'ticket_aux', label: 'Ticket médio', unit: 'R$', placeholder: 'Ex: 80' },
      { key: 'volume_aux', label: 'Vendas/mês', unit: 'un', placeholder: 'Ex: 500' },
    ],
    computeFromAux: (v) => v.ticket_aux && v.volume_aux ? v.ticket_aux * v.volume_aux : null,
  },
  {
    key: 'ticket_medio', label: 'Ticket Médio', group: 'receita', level: 'essential',
    unit: 'R$', help: 'Valor médio que cada cliente paga por compra ou pedido.',
    formula: 'Faturamento mensal ÷ Número de vendas no mês',
    example: 'Faturou R$ 40.000 com 500 vendas: Ticket = R$ 80',
    auxiliaryFields: [
      { key: 'fat_aux', label: 'Faturamento mensal', unit: 'R$', placeholder: 'Ex: 40000' },
      { key: 'vendas_aux', label: 'Vendas/mês', unit: 'un', placeholder: 'Ex: 500' },
    ],
    computeFromAux: (v) => v.fat_aux && v.vendas_aux ? Math.round(v.fat_aux / v.vendas_aux) : null,
  },
  {
    key: 'margem', label: 'Margem de Lucro', group: 'receita', level: 'essential',
    unit: '%', help: 'Percentual do faturamento que sobra como lucro, depois de pagar todos os custos.',
    formula: '(Faturamento − Custos totais) ÷ Faturamento × 100',
    example: 'Faturou R$ 100k, custos R$ 75k: Margem = 25%',
    auxiliaryFields: [
      { key: 'fat_calc', label: 'Faturamento mensal', unit: 'R$', placeholder: 'Ex: 100000' },
      { key: 'custo_calc', label: 'Custos totais mensais', unit: 'R$', placeholder: 'Ex: 75000' },
    ],
    computeFromAux: (v) => v.fat_calc && v.custo_calc && v.fat_calc > 0
      ? Math.round(((v.fat_calc - v.custo_calc) / v.fat_calc) * 100 * 10) / 10
      : null,
  },
  {
    key: 'margem_produto', label: 'Margem por Produto/Serviço', group: 'receita', level: 'recommended',
    unit: '%', help: 'Margem de lucro do produto ou serviço principal.',
  },
  {
    key: 'custo_fixo', label: 'Custo Fixo Mensal', group: 'receita', level: 'recommended',
    unit: 'R$', help: 'Gastos mensais que não variam com o volume (aluguel, salários fixos, etc).',
  },
  {
    key: 'custo_variavel', label: 'Custo Variável Médio', group: 'receita', level: 'advanced',
    unit: 'R$', help: 'Gastos que variam com o volume de vendas (matéria-prima, comissões).',
  },

  // ── Marketing e vendas ──
  {
    key: 'volume_leads', label: 'Volume de Leads/mês', group: 'marketing', level: 'recommended',
    unit: 'un', help: 'Quantas pessoas demonstram interesse no seu produto ou serviço por mês.',
  },
  {
    key: 'taxa_conversao', label: 'Taxa de Conversão', group: 'marketing', level: 'recommended',
    unit: '%', help: 'De cada 100 leads, quantos viram clientes.',
    formula: 'Clientes novos ÷ Leads × 100',
    example: '10 vendas de 200 leads: Conversão = 5%',
    auxiliaryFields: [
      { key: 'clientes_novos', label: 'Vendas fechadas', unit: 'un', placeholder: 'Ex: 10' },
      { key: 'leads_total', label: 'Leads recebidos', unit: 'un', placeholder: 'Ex: 200' },
    ],
    computeFromAux: (v) => v.clientes_novos && v.leads_total ? Math.round((v.clientes_novos / v.leads_total) * 100 * 10) / 10 : null,
  },
  {
    key: 'cac', label: 'CAC (Custo de Aquisição)', group: 'marketing', level: 'recommended',
    unit: 'R$', help: 'Quanto a empresa gasta, em média, para conquistar um novo cliente.',
    formula: 'Gasto total em marketing ÷ Clientes novos no período',
    example: 'Gastou R$ 5.000 e trouxe 20 clientes: CAC = R$ 250',
    auxiliaryFields: [
      { key: 'gasto_mkt', label: 'Gasto marketing/mês', unit: 'R$', placeholder: 'Ex: 5000' },
      { key: 'clientes_mkt', label: 'Clientes novos/mês', unit: 'un', placeholder: 'Ex: 20' },
    ],
    computeFromAux: (v) => v.gasto_mkt && v.clientes_mkt ? Math.round(v.gasto_mkt / v.clientes_mkt) : null,
  },
  {
    key: 'comissao', label: 'Comissão sobre Vendas', group: 'marketing', level: 'advanced',
    unit: '%', help: 'Percentual pago ao vendedor ou intermediário sobre cada venda.',
  },
  {
    key: 'clientes_ativos', label: 'Clientes Ativos', group: 'marketing', level: 'recommended',
    unit: 'un', help: 'Número de clientes que compraram nos últimos 30-90 dias.',
  },
  {
    key: 'taxa_noshow', label: 'Taxa de No-show', group: 'marketing', level: 'advanced',
    unit: '%', help: 'Percentual de clientes que agendam e não comparecem.',
  },
  {
    key: 'taxa_followup_perdido', label: 'Follow-up Perdido', group: 'marketing', level: 'advanced',
    unit: '%', help: 'Percentual de leads que não receberam retorno a tempo.',
  },

  // ── Eficiência operacional ──
  {
    key: 'tempo_tarefa', label: 'Tempo Médio por Tarefa', group: 'operacional', level: 'essential',
    unit: 'min', help: 'Tempo médio que uma tarefa-chave do processo leva para ser concluída.',
    example: 'Se preparar um pedido leva em média 15 minutos.',
  },
  {
    key: 'retrabalho', label: 'Taxa de Retrabalho', group: 'operacional', level: 'essential',
    unit: '%', help: 'Percentual de tarefas que precisam ser refeitas por erro ou falha.',
    formula: 'Tarefas refeitas ÷ Total de tarefas × 100',
    example: 'Se de 100 pedidos, 8 precisam ser refeitos: 8%',
  },
  {
    key: 'sla', label: 'SLA (Prazo de Entrega)', group: 'operacional', level: 'recommended',
    unit: 'horas', help: 'Prazo médio prometido ao cliente para entrega do produto ou serviço.',
  },
  {
    key: 'capacidade_operacional', label: 'Capacidade Operacional', group: 'operacional', level: 'recommended',
    unit: 'un/dia', help: 'Quantas unidades, pedidos ou atendimentos a empresa consegue processar por dia.',
  },
  {
    key: 'pedidos_mes', label: 'Pedidos por Mês', group: 'operacional', level: 'recommended',
    unit: 'un', help: 'Volume total de pedidos ou atendimentos realizados por mês.',
  },
  {
    key: 'taxa_erro', label: 'Taxa de Erro Operacional', group: 'operacional', level: 'recommended',
    unit: '%', help: 'Percentual de operações com algum tipo de erro.',
  },
  {
    key: 'tempo_resposta', label: 'Tempo Médio de Resposta', group: 'operacional', level: 'advanced',
    unit: 'min', help: 'Quanto tempo o cliente espera para receber a primeira resposta.',
  },

  // ── Equipe e custo ──
  {
    key: 'custo_hora', label: 'Custo Hora da Equipe', group: 'equipe', level: 'essential',
    unit: 'R$/h', help: 'Quanto custa, em média, uma hora de trabalho de cada funcionário (salário + encargos ÷ horas trabalhadas).',
    formula: '(Salário + Encargos) ÷ Horas trabalhadas no mês',
    example: 'Salário R$ 3.000, encargos R$ 1.200, 176 horas: R$ 23,86/h',
    auxiliaryFields: [
      { key: 'salario_aux', label: 'Salário + encargos', unit: 'R$', placeholder: 'Ex: 4200' },
      { key: 'horas_aux', label: 'Horas/mês', unit: 'h', placeholder: 'Ex: 176' },
    ],
    computeFromAux: (v) => v.salario_aux && v.horas_aux ? Math.round((v.salario_aux / v.horas_aux) * 100) / 100 : null,
  },
  {
    key: 'funcionarios_area', label: 'Funcionários por Área', group: 'equipe', level: 'recommended',
    unit: 'un', help: 'Quantos funcionários trabalham na área principal do processo analisado.',
  },
  {
    key: 'horas_dono', label: 'Horas do Dono na Operação/semana', group: 'equipe', level: 'recommended',
    unit: 'h', help: 'Quantas horas por semana o dono gasta em tarefas operacionais (não estratégicas).',
  },

  // ── Qualidade e perdas ──
  {
    key: 'desperdicio', label: 'Desperdício', group: 'qualidade', level: 'recommended',
    unit: '%', help: 'Percentual de matéria-prima, produto ou recurso que é perdido no processo.',
  },
  {
    key: 'taxa_devolucao', label: 'Taxa de Devolução', group: 'qualidade', level: 'recommended',
    unit: '%', help: 'Percentual de produtos ou serviços devolvidos ou cancelados.',
  },
  {
    key: 'taxa_ruptura', label: 'Taxa de Ruptura', group: 'qualidade', level: 'advanced',
    unit: '%', help: 'Percentual de vezes que um item ou serviço não está disponível quando o cliente precisa.',
  },
  {
    key: 'custo_entrega', label: 'Custo por Entrega', group: 'qualidade', level: 'advanced',
    unit: 'R$', help: 'Custo médio para entregar um pedido ou completar uma prestação de serviço.',
  },

  // ── Retenção ──
  {
    key: 'churn', label: 'Churn (Cancelamento)', group: 'retencao', level: 'recommended',
    unit: '%', help: 'De cada 100 clientes ativos, quantos deixam de comprar ou cancelam por mês.',
    formula: 'Clientes perdidos ÷ Clientes totais × 100',
    example: 'Tinha 200 clientes, perdeu 10: Churn = 5%',
    auxiliaryFields: [
      { key: 'clientes_perdidos', label: 'Clientes perdidos/mês', unit: 'un', placeholder: 'Ex: 10' },
      { key: 'clientes_total', label: 'Clientes totais', unit: 'un', placeholder: 'Ex: 200' },
    ],
    computeFromAux: (v) => v.clientes_perdidos && v.clientes_total ? Math.round((v.clientes_perdidos / v.clientes_total) * 100 * 10) / 10 : null,
  },
];

export function getMetricsByGroup(group: string): MetricDef[] {
  return METRICS.filter(m => m.group === group);
}

export function getEssentialMetrics(): MetricDef[] {
  return METRICS.filter(m => m.level === 'essential');
}

export function computeConfidenceLevel(metricStates: Record<string, { status: string }>): 'baixa' | 'media' | 'alta' {
  const essential = getEssentialMetrics();
  const filledEssential = essential.filter(m => metricStates[m.key]?.status === 'filled' || metricStates[m.key]?.status === 'calculated');
  const ratio = filledEssential.length / essential.length;
  if (ratio >= 0.8) return 'alta';
  if (ratio >= 0.4) return 'media';
  return 'baixa';
}

export function computeGroupStats(group: string, metricStates: Record<string, { status: string }>) {
  const metrics = getMetricsByGroup(group);
  const filled = metrics.filter(m => metricStates[m.key]?.status === 'filled' || metricStates[m.key]?.status === 'calculated').length;
  const declined = metrics.filter(m => metricStates[m.key]?.status === 'declined').length;
  const missing = metrics.length - filled - declined;
  return { total: metrics.length, filled, declined, missing };
}
