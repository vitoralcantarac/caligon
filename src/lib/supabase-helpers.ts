import { supabase } from "@/integrations/supabase/client";

// Audit log helper
export async function logAudit(action: string, entityType: string, entityId?: string, details?: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details || {},
  });
}

// Create notification
export async function createNotification(userId: string, title: string, body: string, type: string, entityType?: string, entityId?: string, analysisId?: string, actionUrl?: string) {
  await supabase.from("notifications" as any).insert({
    user_id: userId,
    title,
    body,
    type,
    entity_type: entityType,
    entity_id: entityId,
    analysis_id: analysisId,
    action_url: actionUrl,
  } as any);
}

// Create analysis with client (BLOCO 7 fix: better deduplication)
export async function createAnalysis(clientData: {
  name: string; niche: string; contact?: string; email?: string;
  phone?: string; employees?: number; revenue?: string; context?: string;
}, process: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let clientId: string;

  // Dedup: if email provided, match on name+email. Otherwise match on name only.
  let query = supabase.from("clients").select("id").eq("name", clientData.name);
  if (clientData.email) {
    query = query.eq("email", clientData.email);
  }
  const { data: existingClients } = await query.order("created_at", { ascending: false }).limit(1);

  if (existingClients && existingClients.length > 0) {
    clientId = existingClients[0].id;
  } else {
    const { data: newClient, error } = await supabase.from("clients").insert({
      ...clientData,
      created_by: user.id,
    }).select("id").single();
    if (error || !newClient) throw new Error(error?.message || "Failed to create client");
    clientId = newClient.id;
  }

  const { data: analysis, error } = await supabase.from("analyses").insert({
    client_id: clientId,
    process,
    assignee_id: user.id,
    status: "cadastro",
    progress: 5,
  }).select("id").single();

  if (error || !analysis) throw new Error(error?.message || "Failed to create analysis");
  await logAudit("create", "analysis", analysis.id, { client: clientData.name, process });
  return analysis.id;
}

// Run AI diagnosis
export async function runDiagnosis(analysisId: string) {
  const { data: analysis } = await supabase
    .from("analyses")
    .select("*, clients(*)")
    .eq("id", analysisId)
    .single();

  if (!analysis) throw new Error("Analysis not found");

  const { data: sessions } = await supabase
    .from("questionnaire_sessions")
    .select("id")
    .eq("analysis_id", analysisId);

  const sessionIds = sessions?.map(s => s.id) || [];
  let questionnaire: any[] = [];

  if (sessionIds.length > 0) {
    const { data: questions } = await supabase
      .from("questionnaire_questions")
      .select("question_text, category, questionnaire_responses(response_text)")
      .in("session_id", sessionIds);

    questionnaire = (questions || []).map(q => ({
      question: q.question_text,
      category: q.category,
      answer: q.questionnaire_responses?.[0]?.response_text || "",
    }));
  }

  const clientData = analysis.clients as any;

  // Load client metrics
  const { data: metricsRows } = await supabase
    .from("client_metrics" as any)
    .select("*")
    .eq("client_id", clientData?.id);

  const metricsMap: Record<string, any> = {};
  if (metricsRows) {
    for (const m of metricsRows as any[]) {
      if (m.status === 'filled' || m.status === 'calculated') {
        metricsMap[m.metric_key] = { value: m.value, unit: m.unit, origin: m.origin, status: m.status };
      } else if (m.status === 'declined') {
        metricsMap[m.metric_key] = { value: null, status: 'declined' };
      }
    }
  }

  // Get extracted document text
  const documentsText = analysis.documents_extracted_text || 'Nenhum documento processado.';

  // Build qualification context
  const qualificationScore = (analysis as any).qualification_score || null;
  const qualificationLevel = (analysis as any).qualification_level || null;
  const qualificationContext = qualificationScore
    ? `QUALIFICAÇÃO PRÉ-DIAGNÓSTICO:\nScore: ${qualificationScore}/30\nNível: ${(qualificationLevel || '').toUpperCase()}\nRespostas coletadas: ${((analysis as any).qualification_answers || []).length} perguntas respondidas antes do diagnóstico completo.`
    : 'Qualificação não realizada antes do diagnóstico.';

  const res = await supabase.functions.invoke("questionnaire-ai", {
    body: {
      action: "run_diagnosis",
      context: {
        analysisId,
        niche: clientData?.niche || "",
        companyName: clientData?.name || "",
        process: analysis.process,
        employees: clientData?.employees,
        revenue: clientData?.revenue,
        questionnaire,
        documents: documentsText,
        metrics: metricsMap,
        qualificationContext,
      },
    },
  });

  if (res.error) {
    const msg = res.error.message || '';
    if (msg.includes('timeout') || msg.includes('Timeout')) {
      throw new Error("O diagnóstico demorou mais que o esperado. Tente novamente — se persistir, o questionário pode precisar de mais respostas.");
    }
    if (msg.includes('429') || msg.includes('Rate limit')) {
      throw new Error("Limite de uso da IA atingido. Aguarde alguns minutos e tente novamente.");
    }
    if (msg.includes('402') || msg.includes('Credits')) {
      throw new Error("Limite de uso da IA atingido. Aguarde alguns minutos e tente novamente.");
    }
    throw new Error(msg);
  }
  const diagnosis = res.data;

  // Save scores with heuristic metadata
  if (diagnosis.scores) {
    for (const score of diagnosis.scores) {
      await supabase.from("analysis_scores").insert({
        analysis_id: analysisId,
        label: score.label,
        value: score.value,
        description: score.description,
        factors: score.factors || [],
        confidence: score.confidence || "medium",
        basis: score.basis || null,
        missing_data: score.missingData || null,
        is_heuristic: true,
      } as any);
    }
  }

  // Build a map from AI bottleneck IDs to DB IDs for causal linking
  const bottleneckIdMap: Record<string, string> = {};

  // Save bottlenecks with causal hierarchy - first pass: roots
  if (diagnosis.bottlenecks) {
    const layerOrder: Record<string, number> = { causa_raiz: 0, sintoma_operacional: 1, impacto_financeiro: 2 };
    const sorted = [...diagnosis.bottlenecks].sort((a, b) => 
      (layerOrder[a.causalLayer] ?? 1) - (layerOrder[b.causalLayer] ?? 1)
    );

    for (const b of sorted) {
      const causalParentDbId = b.causalParentId ? bottleneckIdMap[b.causalParentId] : null;
      
      const { data: inserted } = await supabase.from("bottlenecks").insert({
        analysis_id: analysisId,
        title: b.title,
        category: b.category,
        severity: b.severity,
        layer: b.layer,
        estimated_loss: b.estimatedLoss || 0,
        confidence: b.confidence,
        evidence_type: b.evidenceType,
        description: b.description,
        calculation_formula: b.calculationFormula || null,
        calculation_premises: b.calculationPremises || [],
        annual_loss: b.annualLoss || (b.estimatedLoss || 0) * 12,
        behavior_description: b.behaviorDescription || null,
        causal_layer: b.causalLayer || "causa_raiz",
        causal_parent_id: causalParentDbId || null,
        causal_order: b.causalOrder || 0,
        calculation_type: b.calculationType || "estimativa",
        source: b.source || "inferência",
        is_dominant: b.isDominant || false,
        loss_display_mode: b.lossDisplayMode || "exact",
        loss_range_min: b.lossRangeMin || 0,
        loss_range_max: b.lossRangeMax || 0,
      } as any).select("id").single();

      if (inserted) {
        const aiId = sorted.indexOf(b).toString();
        bottleneckIdMap[`bt_${sorted.indexOf(b) + 1}`] = inserted.id;
        if (b.id) bottleneckIdMap[b.id] = inserted.id;
      }
    }
  }

  // Save recommendations with roadmap phases + implementation guidance
  if (diagnosis.recommendations) {
    for (const r of diagnosis.recommendations) {
      await supabase.from("recommendations").insert({
        analysis_id: analysisId,
        title: r.title,
        problem: r.problem,
        evidence_type: r.evidenceType,
        confidence: r.confidence,
        impact: r.impact,
        difficulty: r.difficulty,
        category: r.category,
        estimated_saving: r.estimatedSaving || 0,
        estimated_cost: r.estimatedCost || 0,
        timeframe: r.timeframe,
        is_quick_win: r.isQuickWin || false,
        justification: r.justification,
        area: r.area,
        process: r.process,
        risk: r.risk,
        roi_percentage: r.roiPercentage || 0,
        payback_months: r.paybackMonths || 0,
        calculation_explanation: r.calculationExplanation || null,
        roadmap_phase: r.roadmapPhase || "estabilizacao",
        phase_order: r.phaseOrder || 0,
        dependencies: r.dependencies || [],
        anticipation_risk: r.anticipationRisk || null,
        calculation_type: r.calculationType || "estimativa",
        source: r.source || "inferência",
        saving_display_mode: r.savingDisplayMode || "exact",
        saving_range_min: r.savingRangeMin || 0,
        saving_range_max: r.savingRangeMax || 0,
        how_to_implement: Array.isArray(r.howToImplement) ? r.howToImplement : [],
        tools_required: Array.isArray(r.toolsRequired) ? r.toolsRequired : [],
        expected_result: r.expectedResult || null,
        warning: r.warning || null,
        priority: typeof r.priority === 'number' ? r.priority : null,
      } as any);
    }
  }

  // Save flowcharts — preserve AI-provided positions, fallback to top-down layout
  const layoutNodes = (rawNodes: any[]) => {
    if (!Array.isArray(rawNodes)) return [];
    return rawNodes.map((n: any, idx: number) => {
      const hasPos = n?.position && typeof n.position.x === 'number' && typeof n.position.y === 'number';
      return {
        ...n,
        position: hasPos ? n.position : { x: 300, y: 50 + idx * 120 },
      };
    });
  };

  if (diagnosis.flowchartAsIs) {
    await supabase.from("flowcharts").insert({
      analysis_id: analysisId,
      type: "as_is",
      label: "Processo Atual (AS-IS)",
      nodes: layoutNodes(diagnosis.flowchartAsIs.nodes || []),
      edges: diagnosis.flowchartAsIs.edges || [],
      status: "draft",
    } as any);
  }

  if (diagnosis.flowchartToBe) {
    await supabase.from("flowcharts").insert({
      analysis_id: analysisId,
      type: "to_be",
      label: "Processo Otimizado (TO-BE)",
      nodes: layoutNodes(diagnosis.flowchartToBe.nodes || []),
      edges: diagnosis.flowchartToBe.edges || [],
      status: "draft",
    } as any);
  }

  const financialGate = diagnosis.financialGate || "parcial";
  const fa = diagnosis.financialAnalysis || {};
  const lcs = diagnosis.lossCalculationSummary || {};

  await supabase.from("analyses").update({
    status: "fluxogramas",
    progress: 70,
    chaos_score: diagnosis.chaosScore || 0,
    estimated_loss: fa.monthlyLoss || lcs.totalMonthly || 0,
    executive_summary: diagnosis.executiveSummary,
    ai_reasoning: diagnosis.aiReasoning,
    financial_gate: financialGate,
    validation_result: diagnosis.validationResult || {},
    causal_tree: diagnosis.causalTree || [],
    loss_display_mode: fa.displayMode || "exact",
    loss_range_min: fa.rangeMin || 0,
    loss_range_max: fa.rangeMax || 0,
  } as any).eq("id", analysisId);

  await logAudit("diagnosis_complete", "analysis", analysisId);
  return diagnosis;
}

