import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

const NAVY = [30, 41, 59] as const;
const GOLD = [212, 175, 55] as const;
const RED = [220, 38, 38] as const;
const ORANGE = [234, 88, 12] as const;
const BLUE = [59, 130, 246] as const;
const GREEN = [34, 197, 94] as const;

const severityColors: Record<string, readonly [number, number, number]> = {
  critical: RED, high: ORANGE, medium: BLUE, low: GREEN,
};

function addHeaderFooter(doc: jsPDF, clientName: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    // Header line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, 10, 195, 10);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text("CALIGON — Diagnóstico Operacional", 15, 8);
    doc.text(clientName || "", 195, 8, { align: "right" });
    // Footer
    doc.line(15, 287, 195, 287);
    doc.text("Confidencial", 15, 293);
    doc.text(`Página ${i} de ${pageCount}`, 195, 293, { align: "right" });
  }
}

function addHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("CALIGON", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, 15, 28);
  doc.setTextColor(0, 0, 0);
  return 45;
}

function addSection(doc: jsPDF, y: number, title: string): number {
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(title, 15, y);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(15, y + 2, 80, y + 2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  return y + 10;
}

function ensureY(doc: jsPDF, y: number, needed: number = 30): number {
  if (y > 297 - needed) { doc.addPage(); return 20; }
  return y;
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
  const lines = doc.splitTextToSize(text || "", maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 5;
}

function formatLoss(loss: number, displayMode?: string, rangeMin?: number, rangeMax?: number): string {
  if (displayMode === 'range' && rangeMin && rangeMax) return `R$ ${rangeMin.toLocaleString("pt-BR")} – ${rangeMax.toLocaleString("pt-BR")}`;
  if (displayMode === 'qualitative') return loss > 0 ? `~R$ ${loss.toLocaleString("pt-BR")} (est.)` : 'Não quantificado';
  return `R$ ${loss.toLocaleString("pt-BR")}`;
}

const gateLabel: Record<string, string> = {
  sim: 'Dados suficientes — valores exatos', parcial: 'Dados parciais — faixas estimadas', nao: 'Dados insuficientes — tendências qualitativas'
};
const causalLabel: Record<string, string> = { causa_raiz: 'Causa Raiz', sintoma_operacional: 'Sintoma Operacional', impacto_financeiro: 'Impacto Financeiro' };
const phaseLabel: Record<string, string> = { estabilizacao: 'Estabilização', padronizacao: 'Padronização', automacao: 'Automação', otimizacao: 'Otimização' };
const calcTypeLabel: Record<string, string> = { calculo_direto: 'Cálculo direto', estimativa_aproximacao: 'Estimativa', inferencia_operacional: 'Inferência', benchmark_nicho: 'Benchmark', hipotese_qualitativa: 'Hipótese' };

export function generateTechnicalReport(analysis: any, scores: any[], bottlenecks: any[], recommendations: any[], flowcharts: any[]): jsPDF {
  const doc = new jsPDF();
  const client = analysis.clients;
  const financialGate = analysis.financial_gate || 'parcial';
  const validationResult = analysis.validation_result || {};

  // Enhanced Cover
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 120, "F"); // 40% of page height
  doc.setTextColor(...GOLD);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("CALIGON", 105, 30, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text("Inteligência Operacional", 105, 38, { align: "center" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(client?.name || "", 105, 65, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Diagnóstico Operacional — ${analysis.process}`, 105, 80, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text(`Nicho: ${client?.niche || ""}`, 105, 95, { align: "center" });
  doc.text(`Versão: ${analysis.version}`, 105, 105, { align: "center" });

  // Cover bottom
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 105, 250, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text("CALIGON", 105, 280, { align: "center" });

  // Executive Summary Table (BLOCO 6.4)
  doc.addPage();
  let y = addHeader(doc, "Sumário Executivo");
  const totalLossVal = Number(analysis.estimated_loss) || 0;
  const totalSavingVal = recommendations.reduce((s: number, r: any) => s + Number(r.estimated_saving || 0), 0);
  const lossMode = analysis.loss_display_mode || 'exact';
  const topRec = recommendations.length > 0 ? recommendations[0].title : '—';

  doc.autoTable({
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Empresa", client?.name || "—"],
      ["Nicho", client?.niche || "—"],
      ["Processo", analysis.process || "—"],
      ["Total de Gargalos", String(bottlenecks.length)],
      ["Perda Estimada Total", formatLoss(totalLossVal, lossMode, analysis.loss_range_min, analysis.loss_range_max) + "/mês"],
      ["Principal Recomendação", topRec],
    ],
    theme: "striped",
    headStyles: { fillColor: NAVY },
    margin: { left: 15 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 }, 1: { cellWidth: 120 } },
  });
  y = doc.lastAutoTable.finalY + 15;

  // Executive Summary Text
  y = addSection(doc, y, "Resumo Executivo");
  y = wrapText(doc, analysis.executive_summary || "Diagnóstico em andamento.", 15, y, 180);
  y += 10;

  if (analysis.ai_reasoning) {
    y = addSection(doc, ensureY(doc, y), "Raciocínio da IA");
    y = wrapText(doc, analysis.ai_reasoning, 15, y, 180);
    y += 10;
  }

  // Financial Gate
  y = addSection(doc, ensureY(doc, y), "Gate de Confiabilidade Financeira");
  doc.setFontSize(10);
  y = wrapText(doc, `Status: ${gateLabel[financialGate] || financialGate}`, 15, y, 180);
  y += 5;

  // Financial Summary
  y = addSection(doc, ensureY(doc, y), "Análise Financeira");
  const totalLoss = Number(analysis.estimated_loss) || 0;
  const totalSaving = recommendations.reduce((s: number, r: any) => s + Number(r.estimated_saving || 0), 0);
  const totalCost = recommendations.reduce((s: number, r: any) => s + Number(r.estimated_cost || 0), 0);

  doc.autoTable({
    startY: y,
    head: [["Métrica", "Valor", "Modo"]],
    body: [
      ["Perda Mensal", formatLoss(totalLoss, lossMode, analysis.loss_range_min, analysis.loss_range_max), lossMode === 'exact' ? 'Exato' : lossMode === 'range' ? 'Faixa' : 'Qualitativo'],
      ["Perda Anual", formatLoss(totalLoss * 12, lossMode, (analysis.loss_range_min || 0) * 12, (analysis.loss_range_max || 0) * 12), ''],
      ["Economia Potencial/mês", `R$ ${totalSaving.toLocaleString("pt-BR")}`, ''],
      ["Custo de Implantação", `R$ ${totalCost.toLocaleString("pt-BR")}`, ''],
      ["ROI Estimado", totalCost > 0 ? `${Math.round(totalSaving / totalCost * 100)}%` : "—", ''],
      ["Chaos Score", `${analysis.chaos_score || 0}/100 (heurístico)`, ''],
    ],
    theme: "striped",
    headStyles: { fillColor: NAVY },
    margin: { left: 15 },
  });
  y = doc.lastAutoTable.finalY + 15;

  // Scores with heuristic note
  if (scores.length > 0) {
    doc.addPage();
    y = addHeader(doc, "Scores de Diagnóstico");
    y = addSection(doc, y, "Scores (Heurísticos)");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Nota: Scores são heurísticos baseados em respostas e inferências. Não equivalem a auditoria.", 15, y);
    y += 6;
    doc.setTextColor(0, 0, 0);
    doc.autoTable({
      startY: y,
      head: [["Score", "Valor", "Confiança", "Base", "Faltou"]],
      body: scores.map((s: any) => [s.label, `${s.value}/${s.max_value}`, s.confidence || 'medium', s.basis || '—', s.missing_data || '—']),
      theme: "striped",
      headStyles: { fillColor: NAVY },
      margin: { left: 15 },
      columnStyles: { 3: { cellWidth: 50 }, 4: { cellWidth: 40 } },
    });
    y = doc.lastAutoTable.finalY + 15;
  }

  // Bottlenecks with severity color bars (BLOCO 6.3)
  if (bottlenecks.length > 0) {
    doc.addPage();
    y = addHeader(doc, "Gargalos — Hierarquia Causal");

    const groups = [
      { label: "Causas Raiz", items: bottlenecks.filter((b: any) => b.causal_layer === 'causa_raiz' || !b.causal_layer) },
      { label: "Sintomas Operacionais", items: bottlenecks.filter((b: any) => b.causal_layer === 'sintoma_operacional') },
      { label: "Impactos Financeiros", items: bottlenecks.filter((b: any) => b.causal_layer === 'impacto_financeiro') },
    ];

    for (const group of groups) {
      if (group.items.length === 0) continue;
      y = addSection(doc, ensureY(doc, y), group.label);

      for (const b of group.items) {
        y = ensureY(doc, y, 25);
        // Severity color bar
        const color = severityColors[b.severity] || BLUE;
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(15, y - 4, 2.5, 14, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${b.is_dominant ? '⭐ ' : ''}${b.title}`, 20, y);

        // Loss in red
        const lossText = formatLoss(Number(b.estimated_loss), b.loss_display_mode, b.loss_range_min, b.loss_range_max);
        doc.setTextColor(...RED);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`${lossText}/mês`, 195, y, { align: "right" });

        y += 5;
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Severidade: ${b.severity} | Confiança: ${b.confidence} | ${calcTypeLabel[b.calculation_type] || b.calculation_type || '—'}`, 20, y);
        y += 8;
      }
      y += 5;
    }

    // Calculation premises section
    doc.addPage();
    y = addHeader(doc, "Memória de Cálculo");
    y = addSection(doc, y, "Como as Perdas Foram Calculadas");
    for (const b of bottlenecks) {
      y = ensureY(doc, y, 40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`• ${b.title} ${b.causal_layer ? `[${causalLabel[b.causal_layer] || b.causal_layer}]` : ''}`, 15, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      if (b.behavior_description) { y = wrapText(doc, `Comportamento: ${b.behavior_description}`, 20, y, 170); y += 2; }
      if (b.calculation_formula) { y = wrapText(doc, `Fórmula: ${b.calculation_formula}`, 20, y, 170); y += 2; }
      if (b.calculation_type) { doc.text(`Tipo de cálculo: ${calcTypeLabel[b.calculation_type] || b.calculation_type}`, 20, y); y += 5; }
      const premises = Array.isArray(b.calculation_premises) ? b.calculation_premises : [];
      if (premises.length > 0) {
        doc.text("Premissas:", 20, y); y += 5;
        for (const p of premises) {
          const pLabel = typeof p === "object" ? `${p.label}: ${p.value} (fonte: ${p.source || "estimativa"}, confiança: ${p.confidence || "média"})` : String(p);
          y = wrapText(doc, `  - ${pLabel}`, 25, ensureY(doc, y), 165); y += 1;
        }
      }
      if (b.loss_display_mode && b.loss_display_mode !== 'exact') {
        doc.setTextColor(180, 100, 0);
        doc.text(`Modo: ${b.loss_display_mode === 'range' ? 'Faixa estimada' : 'Tendência qualitativa'}`, 20, y);
        doc.setTextColor(0, 0, 0);
        y += 5;
      }
      y += 5;
    }
  }

  // Recommendations with ROI highlight (BLOCO 6.3)
  if (recommendations.length > 0) {
    doc.addPage();
    y = addHeader(doc, "Roadmap de Recomendações");

    const phases = ['estabilizacao', 'padronizacao', 'automacao', 'otimizacao'];
    for (const phase of phases) {
      const phaseRecs = recommendations.filter((r: any) => (r.roadmap_phase || 'estabilizacao') === phase);
      if (phaseRecs.length === 0) continue;

      y = addSection(doc, ensureY(doc, y), `Fase: ${phaseLabel[phase]}`);

      for (const r of phaseRecs) {
        y = ensureY(doc, y, 20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`• ${r.title}`, 15, y);

        // ROI in green
        if (Number(r.roi_percentage) > 0) {
          doc.setTextColor(...GREEN);
          doc.setFontSize(9);
          doc.text(`ROI: ${r.roi_percentage}%`, 195, y, { align: "right" });
        }

        y += 5;
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const savingText = formatLoss(Number(r.estimated_saving), r.saving_display_mode, r.saving_range_min, r.saving_range_max);
        doc.text(`Economia: ${savingText}/mês | Custo: R$ ${Number(r.estimated_cost).toLocaleString("pt-BR")} | Prazo: ${r.timeframe || '—'} | Confiança: ${r.confidence}`, 20, y);
        y += 5;

        if (r.anticipation_risk) {
          doc.setTextColor(180, 100, 0);
          doc.setFontSize(7);
          doc.text(`⚠ Risco: ${r.anticipation_risk}`, 20, y); y += 4;
          doc.setTextColor(0, 0, 0);
        }
        if (r.dependencies && r.dependencies.length > 0) {
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text(`Depende de: ${r.dependencies.join(', ')}`, 20, y); y += 4;
        }
        y += 3;
      }
      y += 5;
    }
  }

  // Validation
  if (Object.keys(validationResult).length > 0) {
    y = addSection(doc, ensureY(doc, y, 60), "Validação de Consistência Diagnóstica");
    const checks = [
      ['Dupla contagem', validationResult.doubleCounting?.found ? `Ajuste: ${validationResult.doubleCounting.action}` : 'Não detectada'],
      ['Dados mínimos', `${validationResult.minimumData?.status || '—'}${validationResult.minimumData?.missing?.length ? ` — Faltam: ${validationResult.minimumData.missing.join(', ')}` : ''}`],
      ['Coerência scores', validationResult.scoreCoherence?.notes || '—'],
      ['Coerência roadmap', validationResult.roadmapCoherence?.notes || '—'],
      ['Factibilidade TO-BE', validationResult.toBeFactibility?.notes || '—'],
      ['Excesso de certeza', validationResult.excessCertainty?.found ? `Ajustes: ${(validationResult.excessCertainty.adjustments || []).join('; ')}` : 'Não detectado'],
    ];
    doc.autoTable({
      startY: y,
      head: [["Verificação", "Resultado"]],
      body: checks,
      theme: "striped",
      headStyles: { fillColor: NAVY },
      margin: { left: 15 },
      columnStyles: { 1: { cellWidth: 110 } },
    });
  }

  addHeaderFooter(doc, client?.name || "");
  return doc;
}

export function generateExecutiveSummary(analysis: any, bottlenecks: any[], recommendations: any[]): jsPDF {
  const doc = new jsPDF();
  const client = analysis.clients;
  const financialGate = analysis.financial_gate || 'parcial';

  let y = addHeader(doc, "Resumo Executivo");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(client?.name || "", 15, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Processo: ${analysis.process} | Nicho: ${client?.niche} | ${new Date().toLocaleDateString("pt-BR")}`, 15, y);
  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Gate financeiro: ${gateLabel[financialGate] || financialGate}`, 15, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  y = addSection(doc, y, "Situação Atual");
  y = wrapText(doc, analysis.executive_summary || "", 15, y, 180);
  y += 10;

  const totalLoss = Number(analysis.estimated_loss) || 0;
  const totalSaving = recommendations.reduce((s: number, r: any) => s + Number(r.estimated_saving || 0), 0);
  const lossMode = analysis.loss_display_mode || 'exact';

  y = addSection(doc, y, "Números-Chave");
  doc.autoTable({
    startY: y,
    body: [
      ["Perda Mensal", formatLoss(totalLoss, lossMode, analysis.loss_range_min, analysis.loss_range_max), "Economia Potencial", `R$ ${totalSaving.toLocaleString("pt-BR")}/mês`],
      ["Perda Anual", formatLoss(totalLoss * 12, lossMode), "Chaos Score", `${analysis.chaos_score || 0}/100 (heurístico)`],
    ],
    theme: "plain",
    styles: { fontSize: 11, fontStyle: "bold" },
    margin: { left: 15 },
  });
  y = doc.lastAutoTable.finalY + 15;

  const roots = bottlenecks.filter((b: any) => b.causal_layer === 'causa_raiz' || b.is_dominant);
  const topBn = roots.length > 0 ? roots.slice(0, 3) : bottlenecks.slice(0, 3);

  y = addSection(doc, y, "Causas Raiz Principais");
  for (const b of topBn) {
    y = ensureY(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.text(`• ${b.title} — `, 15, y);
    doc.setTextColor(...RED);
    doc.text(formatLoss(Number(b.estimated_loss), b.loss_display_mode, b.loss_range_min, b.loss_range_max) + `/mês`, 15 + doc.getTextWidth(`• ${b.title} — `), y);
    doc.setTextColor(0, 0, 0);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, b.description || "", 20, y, 170);
    y += 4;
  }

  y += 5;
  y = addSection(doc, ensureY(doc, y), "Quick Wins");
  const qw = recommendations.filter((r: any) => r.is_quick_win).slice(0, 5);
  for (const r of qw) {
    y = ensureY(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.text(`• ${r.title} — Economia: `, 15, y);
    doc.setTextColor(...GREEN);
    doc.text(formatLoss(Number(r.estimated_saving), r.saving_display_mode, r.saving_range_min, r.saving_range_max) + `/mês`, 15 + doc.getTextWidth(`• ${r.title} — Economia: `), y);
    doc.setTextColor(0, 0, 0);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, r.justification || "", 20, y, 170);
    y += 4;
  }

  addHeaderFooter(doc, client?.name || "");
  return doc;
}

export function generateCommercialPresentation(analysis: any, scores: any[], bottlenecks: any[], recommendations: any[]): jsPDF {
  const doc = new jsPDF({ orientation: "landscape" });
  const client = analysis.clients;
  const financialGate = analysis.financial_gate || 'parcial';
  const lossMode = analysis.loss_display_mode || 'exact';

  // Slide 1 - Cover
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 297, 210, "F");
  doc.setTextColor(...GOLD);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("CALIGON", 148, 60, { align: "center" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Diagnóstico Operacional", 148, 85, { align: "center" });
  doc.setFontSize(18);
  doc.text(client?.name || "", 148, 110, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(180, 180, 180);
  doc.text(new Date().toLocaleDateString("pt-BR"), 148, 130, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Confiabilidade: ${gateLabel[financialGate]?.split('—')[0]?.trim() || financialGate}`, 148, 145, { align: "center" });

  // Slide 2 - Key Numbers
  doc.addPage();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 297, 35, "F");
  doc.setTextColor(...GOLD);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Números-Chave", 20, 24);

  const totalLoss = Number(analysis.estimated_loss) || 0;
  const totalSaving = recommendations.reduce((s: number, r: any) => s + Number(r.estimated_saving || 0), 0);
  const totalCost = recommendations.reduce((s: number, r: any) => s + Number(r.estimated_cost || 0), 0);

  doc.setTextColor(0, 0, 0);
  const metrics = [
    { label: "Perda Mensal", value: formatLoss(totalLoss, lossMode, analysis.loss_range_min, analysis.loss_range_max), color: RED },
    { label: "Perda Anual", value: formatLoss(totalLoss * 12, lossMode), color: RED },
    { label: "Economia/mês", value: `R$ ${totalSaving.toLocaleString("pt-BR")}`, color: GREEN },
    { label: "Investimento", value: `R$ ${totalCost.toLocaleString("pt-BR")}`, color: BLUE },
  ];

  metrics.forEach((m, i) => {
    const x = 20 + i * 68;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, 50, 60, 50, 4, 4, "F");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(m.label, x + 30, 65, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    const val = m.value.length > 20 ? m.value.substring(0, 20) + '…' : m.value;
    doc.text(val, x + 30, 82, { align: "center" });
  });

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Confiabilidade: ${gateLabel[financialGate] || financialGate}`, 148, 115, { align: "center" });

  // Slide 3 - Main Bottlenecks (roots)
  doc.addPage();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 297, 35, "F");
  doc.setTextColor(...GOLD);
  doc.setFontSize(18);
  doc.text("Causas Raiz Identificadas", 20, 24);

  doc.setTextColor(0, 0, 0);
  const roots = bottlenecks.filter((b: any) => b.causal_layer === 'causa_raiz' || b.is_dominant);
  const topBn = roots.length > 0 ? roots : bottlenecks;
  doc.autoTable({
    startY: 45,
    head: [["Causa Raiz", "Impacto/mês", "Severidade", "Confiança"]],
    body: topBn.slice(0, 6).map((b: any) => [
      b.title,
      formatLoss(Number(b.estimated_loss), b.loss_display_mode, b.loss_range_min, b.loss_range_max),
      b.severity,
      b.confidence,
    ]),
    theme: "striped",
    headStyles: { fillColor: NAVY },
    margin: { left: 20 },
  });

  // Slide 4 - Roadmap
  doc.addPage();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 297, 35, "F");
  doc.setTextColor(...GOLD);
  doc.setFontSize(18);
  doc.text("Roadmap de Ação", 20, 24);

  doc.setTextColor(0, 0, 0);
  const phases = ['estabilizacao', 'padronizacao', 'automacao', 'otimizacao'];
  const roadmapRows: any[] = [];
  for (const phase of phases) {
    const phaseRecs = recommendations.filter((r: any) => (r.roadmap_phase || 'estabilizacao') === phase);
    for (const r of phaseRecs.slice(0, 3)) {
      roadmapRows.push([phaseLabel[phase], r.title, formatLoss(Number(r.estimated_saving), r.saving_display_mode, r.saving_range_min, r.saving_range_max) + '/mês', r.timeframe || '—']);
    }
  }
  if (roadmapRows.length > 0) {
    doc.autoTable({
      startY: 45,
      head: [["Fase", "Ação", "Economia/mês", "Prazo"]],
      body: roadmapRows,
      theme: "striped",
      headStyles: { fillColor: NAVY },
      margin: { left: 20 },
    });
  }

  return doc;
}

export function generateQualificationReport(
  companyName: string, niche: string, score: number, level: string,
  answers: {question: string; answer: string; score: number}[],
  report: {summary: string; strengths: string[]; risks: string[]; recommendation: string}
): jsPDF {
  const doc = new jsPDF();

  // Cover
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 297, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("CALIGON", 30, 80);
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório de Qualificação Diagnóstica", 30, 95);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.line(30, 100, 120, 100);
  doc.setFontSize(14);
  doc.text(companyName, 30, 120);
  doc.setFontSize(11);
  doc.text(`Nicho: ${niche}`, 30, 132);
  doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 30, 144);
  const levelLabel = level === 'alta' ? 'ALTA' : level === 'media' ? 'MÉDIA' : 'BAIXA';
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const levelColor = level === 'alta' ? GREEN : level === 'media' ? ORANGE : RED;
  doc.setTextColor(levelColor[0], levelColor[1], levelColor[2]);
  doc.text(`Classificação: ${levelLabel}`, 30, 170);
  doc.setFontSize(24);
  doc.text(`${score}/30`, 30, 185);

  // Page 2 — Details
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  let y = addHeader(doc, "Qualificação Diagnóstica");

  y = addSection(doc, y, "Resumo");
  y = wrapText(doc, report.summary, 15, y, 180);
  y += 5;

  y = addSection(doc, y + 5, "Respostas do Questionário");
  const tableRows = answers.map((a, i) => [`${i + 1}`, a.question, a.answer, `${a.score}`]);
  doc.autoTable({
    startY: y,
    head: [["#", "Pergunta", "Resposta", "Pts"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: NAVY },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 80 }, 2: { cellWidth: 70 }, 3: { cellWidth: 15 } },
    margin: { left: 15 },
    styles: { fontSize: 8 },
  });
  y = doc.lastAutoTable.finalY + 10;

  y = ensureY(doc, y, 50);
  y = addSection(doc, y, "Pontos Fortes");
  for (const s of report.strengths) {
    y = ensureY(doc, y, 10);
    doc.setFontSize(10);
    doc.text(`✓ ${s}`, 20, y);
    y += 6;
  }

  y += 5;
  y = ensureY(doc, y, 50);
  y = addSection(doc, y, "Pontos de Atenção");
  for (const r of report.risks) {
    y = ensureY(doc, y, 10);
    doc.setFontSize(10);
    doc.text(`⚠ ${r}`, 20, y);
    y += 6;
  }

  y += 5;
  y = ensureY(doc, y, 30);
  y = addSection(doc, y, "Recomendação");
  y = wrapText(doc, report.recommendation, 15, y, 180);

  y += 10;
  y = ensureY(doc, y, 15);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Este relatório é uma análise preliminar. O diagnóstico completo oferece profundidade adicional.", 15, y);

  addHeaderFooter(doc, companyName);
  return doc;
}

// ═══════════════════════════════════════════════════════════════
// CLIENT REPORT — Single unified PDF for self-serve clients
// ═══════════════════════════════════════════════════════════════
export async function generateClientReport(
  analysis: any,
  scores: any[],
  bottlenecks: any[],
  recommendations: any[],
  flowcharts: any[]
): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const client = analysis.clients;
  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN = 15;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

  const C_NAVY: [number, number, number] = [30, 41, 59];
  const C_GOLD: [number, number, number] = [212, 175, 55];
  const C_WHITE: [number, number, number] = [255, 255, 255];
  const C_GRAY_LIGHT: [number, number, number] = [248, 250, 252];
  const C_GRAY_TEXT: [number, number, number] = [100, 116, 139];
  const C_RED: [number, number, number] = [220, 38, 38];
  const C_ORANGE: [number, number, number] = [234, 88, 12];
  const C_GREEN: [number, number, number] = [34, 197, 94];
  const C_BLUE: [number, number, number] = [59, 130, 246];

  const sevColors: Record<string, [number, number, number]> = {
    critical: C_RED, high: C_ORANGE, medium: C_BLUE, low: C_GREEN,
  };
  const sevLabels: Record<string, string> = {
    critical: "CRÍTICO", high: "ALTO", medium: "MÉDIO", low: "BAIXO",
  };

  const fmtBRL = (v: number) =>
    !v || isNaN(v) ? "R$ —" : `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

  function newSection(title: string, subtitle?: string): number {
    doc.addPage();
    doc.setFillColor(...C_NAVY);
    doc.rect(0, 0, PAGE_WIDTH, 28, "F");
    doc.setTextColor(...C_WHITE);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, MARGIN, 18);
    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 190, 200);
      doc.text(subtitle, MARGIN, 25);
    }
    return 40;
  }

  function checkBreak(y: number, needed = 30): number {
    if (y + needed > PAGE_HEIGHT - 20) {
      doc.addPage();
      return 25;
    }
    return y;
  }

  function addClientHeaderFooter(name: string) {
    const total = doc.getNumberOfPages();
    for (let i = 2; i <= total; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, 10, PAGE_WIDTH - MARGIN, 10);
      doc.setFontSize(8);
      doc.setTextColor(...C_GRAY_TEXT);
      doc.setFont("helvetica", "normal");
      doc.text("CALIGON — Diagnóstico Operacional", MARGIN, 8);
      doc.text(name, PAGE_WIDTH - MARGIN, 8, { align: "right" });
      doc.line(MARGIN, PAGE_HEIGHT - 10, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10);
      doc.text("Confidencial — uso exclusivo do cliente", MARGIN, PAGE_HEIGHT - 6);
      doc.text(`Página ${i} de ${total}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 6, { align: "right" });
    }
  }

  // ── COVER ──
  doc.setFillColor(...C_NAVY);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
  doc.setFillColor(...C_GOLD);
  doc.rect(0, 0, PAGE_WIDTH, 3, "F");

  doc.setTextColor(...C_GOLD);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("CALIGON", PAGE_WIDTH / 2, 60, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 190, 210);
  doc.text("Inteligência Operacional", PAGE_WIDTH / 2, 70, { align: "center" });

  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.5);
  doc.line(60, 80, PAGE_WIDTH - 60, 80);

  doc.setFontSize(13);
  doc.setTextColor(160, 175, 195);
  doc.text("DIAGNÓSTICO OPERACIONAL", PAGE_WIDTH / 2, 100, { align: "center" });

  doc.setFontSize(28);
  doc.setTextColor(...C_WHITE);
  doc.setFont("helvetica", "bold");
  const companyName = client?.name || "Empresa";
  const cnLines = doc.splitTextToSize(companyName, CONTENT_WIDTH);
  doc.text(cnLines, PAGE_WIDTH / 2, 125, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 190, 210);
  doc.text(`Processo: ${analysis.process || "Operacional"}`, PAGE_WIDTH / 2, 148, { align: "center" });
  doc.text(`Setor: ${client?.niche || "Não informado"}`, PAGE_WIDTH / 2, 156, { align: "center" });

  const mainScore = scores[0];
  const scoreVal = Math.min(100, Math.round(mainScore?.value || 0));

  doc.setFillColor(20, 30, 50);
  doc.roundedRect(60, 170, PAGE_WIDTH - 120, 50, 4, 4, "F");
  doc.setDrawColor(...C_GOLD);
  doc.roundedRect(60, 170, PAGE_WIDTH - 120, 50, 4, 4, "S");

  doc.setFontSize(10);
  doc.setTextColor(160, 175, 195);
  doc.setFont("helvetica", "normal");
  doc.text("SCORE DE SAÚDE OPERACIONAL", PAGE_WIDTH / 2, 183, { align: "center" });

  doc.setFontSize(42);
  doc.setFont("helvetica", "bold");
  const scoreColor: [number, number, number] = scoreVal < 40 ? C_RED : scoreVal < 60 ? C_ORANGE : C_GREEN;
  doc.setTextColor(...scoreColor);
  doc.text(`${scoreVal}/100`, PAGE_WIDTH / 2, 205, { align: "center" });

  if (analysis.estimated_loss > 0) {
    doc.setFontSize(11);
    doc.setTextColor(...C_RED);
    doc.setFont("helvetica", "bold");
    doc.text(`Perda estimada: ${fmtBRL(analysis.estimated_loss)}/mês`, PAGE_WIDTH / 2, 235, { align: "center" });
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 130, 150);
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Gerado em ${hoje}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 20, { align: "center" });

  doc.setFillColor(...C_GOLD);
  doc.rect(0, PAGE_HEIGHT - 3, PAGE_WIDTH, 3, "F");

  // ── EXECUTIVE SUMMARY ──
  let y = newSection("Resumo Executivo", "O que você precisa saber em 1 minuto");

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 35, 3, 3, "F");
  doc.setDrawColor(...C_RED);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 35, 3, 3, "S");
  doc.setFontSize(10);
  doc.setTextColor(...C_GRAY_TEXT);
  doc.setFont("helvetica", "normal");
  doc.text("Sua empresa está perdendo mensalmente:", MARGIN + 5, y + 10);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C_RED);
  doc.text(fmtBRL(analysis.estimated_loss), MARGIN + 5, y + 25);
  doc.setFontSize(11);
  doc.setTextColor(...C_GRAY_TEXT);
  doc.setFont("helvetica", "normal");
  doc.text(`${fmtBRL(analysis.estimated_loss * 12)} por ano`, PAGE_WIDTH - MARGIN - 5, y + 25, { align: "right" });
  y += 45;

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 25, 3, 3, "F");
  doc.setDrawColor(...C_GREEN);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 25, 3, 3, "S");
  doc.setFontSize(10);
  doc.setTextColor(...C_GRAY_TEXT);
  doc.setFont("helvetica", "normal");
  doc.text("Potencial de economia com as melhorias:", MARGIN + 5, y + 10);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(21, 128, 61);
  const savings = analysis.estimated_savings || Math.round((analysis.estimated_loss || 0) * 0.65);
  doc.text(`Até ${fmtBRL(savings)}/mês`, MARGIN + 5, y + 22);
  y += 35;

  const cnt = (sev: string) => bottlenecks.filter((b) => b.severity === sev);
  const sumLoss = (arr: any[]) => arr.reduce((s, b) => s + (Number(b.estimated_loss) || 0), 0);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C_NAVY);
  doc.text("Gargalos identificados", MARGIN, y + 8);
  y += 14;

  (doc as any).autoTable({
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Severidade", "Quantidade", "Impacto Total Estimado"]],
    body: [
      ["Crítico", cnt("critical").length.toString(), fmtBRL(sumLoss(cnt("critical")))],
      ["Alto", cnt("high").length.toString(), fmtBRL(sumLoss(cnt("high")))],
      ["Médio", cnt("medium").length.toString(), fmtBRL(sumLoss(cnt("medium")))],
      ["Baixo", cnt("low").length.toString(), fmtBRL(sumLoss(cnt("low")))],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: C_NAVY, textColor: C_WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: C_GRAY_LIGHT },
    columnStyles: { 1: { halign: "center" }, 2: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ── SCORES ──
  if (scores.length > 0) {
    y = newSection("Scores por Dimensão", "Como sua empresa se sai em cada área");
    for (const score of scores) {
      y = checkBreak(y, 30);
      const sv = Math.min(100, Math.round(Number(score.value) || 0));
      const barColor: [number, number, number] = sv < 40 ? C_RED : sv < 60 ? C_ORANGE : C_GREEN;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C_NAVY);
      doc.text(score.label || "Dimensão", MARGIN, y);
      doc.setTextColor(...barColor);
      doc.text(`${sv}/100`, PAGE_WIDTH - MARGIN, y, { align: "right" });
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(MARGIN, y + 3, CONTENT_WIDTH, 6, 2, 2, "F");
      doc.setFillColor(...barColor);
      doc.roundedRect(MARGIN, y + 3, (CONTENT_WIDTH * sv) / 100, 6, 2, 2, "F");
      if (score.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_GRAY_TEXT);
        const ls = doc.splitTextToSize(score.description, CONTENT_WIDTH);
        doc.text(ls, MARGIN, y + 15);
        y += 15 + ls.length * 4 + 6;
      } else {
        y += 18;
      }
    }
  }

  // ── BOTTLENECKS ──
  const sortedB = [...bottlenecks].sort((a, b) => {
    const ord: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (ord[a.severity] ?? 9) - (ord[b.severity] ?? 9);
  });

  y = newSection("Gargalos Identificados", `${bottlenecks.length} problemas encontrados no processo`);

  for (let i = 0; i < sortedB.length; i++) {
    const b = sortedB[i];
    const bColor = sevColors[b.severity] || C_BLUE;
    const bLabel = sevLabels[b.severity] || (b.severity || "").toUpperCase();
    const eLoss = Number(b.estimated_loss) || 0;
    const titleLines = doc.splitTextToSize(b.title || "", CONTENT_WIDTH - 30);
    const descLines = doc.splitTextToSize(b.description || "", CONTENT_WIDTH - 15);
    const causeLines = b.behavior_description ? doc.splitTextToSize(b.behavior_description, CONTENT_WIDTH - 15) : [];
    const need = 20 + titleLines.length * 6 + descLines.length * 4 + causeLines.length * 4 + 15;

    y = checkBreak(y, need);

    doc.setFillColor(...bColor);
    doc.rect(MARGIN, y, 4, need - 5, "F");
    doc.setFillColor(250, 250, 252);
    doc.rect(MARGIN + 4, y, CONTENT_WIDTH - 4, need - 5, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...bColor);
    doc.text(`#${i + 1}`, MARGIN + 8, y + 8);
    doc.setFillColor(...bColor);
    doc.roundedRect(MARGIN + 20, y + 2, 22, 7, 2, 2, "F");
    doc.setTextColor(...C_WHITE);
    doc.setFontSize(7);
    doc.text(bLabel, MARGIN + 21, y + 7.5);

    if (eLoss > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C_RED);
      doc.text(`-${fmtBRL(eLoss)}/mês`, PAGE_WIDTH - MARGIN - 5, y + 8, { align: "right" });
    }

    let inner = y + 16;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C_NAVY);
    doc.text(titleLines, MARGIN + 8, inner);
    inner += titleLines.length * 6 + 2;

    if (b.description) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 80);
      doc.text(descLines, MARGIN + 8, inner);
      inner += descLines.length * 4 + 2;
    }

    if (causeLines.length > 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...C_GRAY_TEXT);
      doc.text("Causa raiz:", MARGIN + 8, inner);
      doc.setFont("helvetica", "normal");
      doc.text(causeLines, MARGIN + 28, inner);
      inner += causeLines.length * 4;
    }

    y += need + 3;
  }

  // ── RECOMMENDATIONS ──
  const sortedR = [...recommendations].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  y = newSection("Recomendações e Plano de Ação", "O que fazer, em qual ordem, e como fazer");

  const phaseColors: Record<string, [number, number, number]> = {
    estabilizacao: C_RED, padronizacao: C_ORANGE, automacao: C_BLUE, otimizacao: C_GREEN,
  };
  const phaseLabels: Record<string, string> = {
    estabilizacao: "1. Estabilização", padronizacao: "2. Padronização",
    automacao: "3. Automação", otimizacao: "4. Otimização",
  };

  doc.setFontSize(9);
  doc.setTextColor(...C_GRAY_TEXT);
  doc.text("Fases:", MARGIN, y);
  let px = MARGIN + 18;
  Object.entries(phaseLabels).forEach(([k, label]) => {
    doc.setFillColor(...(phaseColors[k] || C_GRAY_TEXT));
    doc.rect(px, y - 3, 3, 5, "F");
    doc.text(label, px + 5, y);
    px += 42;
  });
  y += 12;

  for (let i = 0; i < sortedR.length; i++) {
    const r = sortedR[i];
    const pColor = phaseColors[r.roadmap_phase] || C_BLUE;
    const pName = phaseLabels[r.roadmap_phase] || r.roadmap_phase || "";
    const titleLines = doc.splitTextToSize(r.title || "", CONTENT_WIDTH - 30);
    const justLines = r.justification ? doc.splitTextToSize(r.justification, CONTENT_WIDTH - 15) : [];

    let steps: string[] = [];
    try {
      const parsed = typeof r.how_to_implement === "string" ? JSON.parse(r.how_to_implement) : r.how_to_implement;
      steps = Array.isArray(parsed) ? parsed : [];
    } catch {
      if (r.how_to_implement) steps = [String(r.how_to_implement)];
    }

    const stepLines = steps.map((s, idx) => doc.splitTextToSize(`${idx + 1}. ${s}`, CONTENT_WIDTH - 18));
    const totalStepLines = stepLines.reduce((s, l) => s + l.length, 0);
    const need = 22 + titleLines.length * 6 + justLines.length * 4 + (steps.length > 0 ? 6 : 0) + totalStepLines * 4 + steps.length * 2 + 12;

    y = checkBreak(y, need);

    doc.setFillColor(...pColor);
    doc.rect(MARGIN, y, 4, need - 5, "F");
    doc.setFillColor(250, 250, 252);
    doc.rect(MARGIN + 4, y, CONTENT_WIDTH - 4, need - 5, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...pColor);
    doc.text(`#${i + 1}`, MARGIN + 8, y + 8);
    doc.setFillColor(...pColor);
    doc.roundedRect(MARGIN + 20, y + 2, 38, 7, 2, 2, "F");
    doc.setTextColor(...C_WHITE);
    doc.setFontSize(7);
    doc.text(pName, MARGIN + 22, y + 7.5);

    if (r.estimated_saving > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C_GREEN);
      doc.text(`+${fmtBRL(r.estimated_saving)}/mês`, PAGE_WIDTH - MARGIN - 5, y + 8, { align: "right" });
    }

    let inner = y + 16;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C_NAVY);
    doc.text(titleLines, MARGIN + 8, inner);
    inner += titleLines.length * 6 + 2;

    if (justLines.length > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 80);
      doc.text(justLines, MARGIN + 8, inner);
      inner += justLines.length * 4 + 3;
    }

    if (steps.length > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C_NAVY);
      doc.text("Como implementar:", MARGIN + 8, inner);
      inner += 5;
      stepLines.forEach((sl) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 70);
        doc.text(sl, MARGIN + 10, inner);
        inner += sl.length * 4 + 2;
      });
    }

    inner += 2;
    const infos: string[] = [];
    if (r.timeframe) infos.push(`Prazo: ${r.timeframe}`);
    if (r.estimated_cost > 0) infos.push(`Custo: ${fmtBRL(r.estimated_cost)}`);
    if (r.expected_result) infos.push(`Resultado: ${r.expected_result}`);
    if (infos.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(...C_GRAY_TEXT);
      doc.setFont("helvetica", "italic");
      const iLines = doc.splitTextToSize(infos.join("   "), CONTENT_WIDTH - 12);
      doc.text(iLines, MARGIN + 8, inner);
    }

    y += need + 4;
  }

  // ── BASIS ──
  y = newSection("Base dos Cálculos", "Transparência sobre como os números foram calculados");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 80);

  const gateLabel =
    analysis.financial_gate === "sim"
      ? "Dados suficientes — valores com alta confiança"
      : analysis.financial_gate === "parcial"
      ? "Dados parciais — valores são estimativas"
      : "Dados insuficientes — valores são indicativos";

  const disclaimer = [
    "Os valores apresentados neste relatório são estimativas baseadas nas informações fornecidas durante o questionário.",
    "A precisão dos cálculos está diretamente relacionada à qualidade e completude das informações informadas.",
    "",
    `Gate financeiro: ${gateLabel}`,
  ];
  const dLines = doc.splitTextToSize(disclaimer.join("\n"), CONTENT_WIDTH);
  doc.text(dLines, MARGIN, y);
  y += dLines.length * 5 + 8;

  (doc as any).autoTable({
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Métrica", "Valor", "Origem"]],
    body: [
      ["Faturamento mensal", client?.revenue || "Não informado", "Cadastro"],
      ["Perda estimada total", fmtBRL(analysis.estimated_loss), "Diagnóstico IA"],
      ["Economia potencial", fmtBRL(analysis.estimated_savings || 0), "Diagnóstico IA"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: C_NAVY, textColor: C_WHITE, fontSize: 9 },
    alternateRowStyles: { fillColor: C_GRAY_LIGHT },
  });

  addClientHeaderFooter(client?.name || "Empresa");
  return doc;
}
