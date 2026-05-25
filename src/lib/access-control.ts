// Sistema central de controle de acesso do CALIGON
// Determina se um usuário tem acesso a um diagnóstico específico

import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────────
// VERIFICAR SE USUÁRIO É INTERNO (sócio/analista/etc)
// ─────────────────────────────────────────────────
export async function isInternalUser(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type" as any)
    .eq("user_id", user.id)
    .single();

  return (profile as any)?.user_type === "internal";
}

// ─────────────────────────────────────────────────
// VERIFICAR ACESSO A UM DIAGNÓSTICO ESPECÍFICO
// ─────────────────────────────────────────────────
export type AccessResult = {
  hasAccess: boolean;
  accessType: "internal" | "unlocked" | "subscription" | "none";
  subscription?: any;
};

export async function hasAccessToAnalysis(analysisId: string): Promise<AccessResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hasAccess: false, accessType: "none" };

  // 1. Internos têm acesso total
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type" as any)
    .eq("user_id", user.id)
    .single();

  if ((profile as any)?.user_type === "internal") {
    return { hasAccess: true, accessType: "internal" };
  }

  // 2. Desbloqueio direto (pagamento único)
  const { data: unlocked } = await supabase
    .from("unlocked_diagnostics" as any)
    .select("id")
    .eq("user_id", user.id)
    .eq("analysis_id", analysisId)
    .maybeSingle();

  if (unlocked) {
    return { hasAccess: true, accessType: "unlocked" };
  }

  // 3. Assinatura ativa
  const { data: subscription } = await supabase
    .from("subscriptions" as any)
    .select("*, plans(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) return { hasAccess: false, accessType: "none" };

  const sub = subscription as any;
  if (sub.expires_at && new Date(sub.expires_at) < new Date()) {
    return { hasAccess: false, accessType: "none", subscription: sub };
  }

  if (sub.plans?.diagnostics_unlimited) {
    return { hasAccess: true, accessType: "subscription", subscription: sub };
  }

  const allowed = sub.plans?.diagnostics_per_period || 0;
  if ((sub.diagnostics_used || 0) < allowed) {
    return { hasAccess: true, accessType: "subscription", subscription: sub };
  }

  return { hasAccess: false, accessType: "none", subscription: sub };
}

// ─────────────────────────────────────────────────
// PLANO ATUAL DO USUÁRIO
// ─────────────────────────────────────────────────
export async function getUserCurrentPlan() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions" as any)
    .select("*, plans(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) return null;

  const sub = subscription as any;
  const plan = sub.plans;
  const diagnosticsRemaining = plan?.diagnostics_unlimited
    ? ("unlimited" as const)
    : Math.max(0, (plan?.diagnostics_per_period || 0) - (sub.diagnostics_used || 0));

  return { plan, subscription: sub, diagnosticsRemaining };
}

// ─────────────────────────────────────────────────
// DESBLOQUEAR DIAGNÓSTICO
// ─────────────────────────────────────────────────
export async function unlockDiagnostic(
  analysisId: string,
  paymentId: string,
  subscriptionId?: string,
  targetUserId?: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  await supabase.from("unlocked_diagnostics" as any).upsert(
    {
      user_id: targetUserId || user.id,
      analysis_id: analysisId,
      payment_id: paymentId,
      subscription_id: subscriptionId || null,
      unlocked_at: new Date().toISOString(),
    },
    { onConflict: "user_id,analysis_id" },
  );
}

// ─────────────────────────────────────────────────
// REGISTRAR PAGAMENTO MANUAL (sócios no painel interno)
// ─────────────────────────────────────────────────
export async function registerManualPayment(params: {
  targetUserId: string;
  planSlug: string;
  analysisId?: string;
  method?: string;
  installments?: number;
  notes?: string;
}): Promise<{ paymentId: string; subscriptionId?: string }> {
  const { data: { user: internalUser } } = await supabase.auth.getUser();
  if (!internalUser) throw new Error("Não autenticado");

  const { data: plan, error: planError } = await supabase
    .from("plans" as any)
    .select("*")
    .eq("slug", params.planSlug)
    .single();

  if (planError || !plan) throw new Error(`Plano '${params.planSlug}' não encontrado`);
  const p = plan as any;

  const { data: payment, error: paymentError } = await supabase
    .from("payments" as any)
    .insert({
      user_id: params.targetUserId,
      plan_id: p.id,
      amount_cents: p.price_cents,
      installments: params.installments || 1,
      type: p.billing_cycle === "one_time" ? "one_time" : "subscription",
      status: "approved",
      gateway: "manual",
      method: params.method || "pix",
      registered_by: internalUser.id,
      notes: params.notes || null,
    })
    .select()
    .single();

  if (paymentError || !payment) throw new Error("Erro ao registrar pagamento");
  const pay = payment as any;

  let subscriptionId: string | undefined;

  if (p.billing_cycle !== "one_time") {
    const expiresAt = new Date();
    if (p.billing_cycle === "monthly") expiresAt.setMonth(expiresAt.getMonth() + 1);
    else if (p.billing_cycle === "quarterly") expiresAt.setMonth(expiresAt.getMonth() + 3);

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions" as any)
      .insert({
        user_id: params.targetUserId,
        plan_id: p.id,
        status: "active",
        diagnostics_used: 0,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (subError || !subscription) throw new Error("Erro ao criar assinatura");
    subscriptionId = (subscription as any).id;
  }

  if (params.analysisId) {
    await supabase.from("unlocked_diagnostics" as any).upsert(
      {
        user_id: params.targetUserId,
        analysis_id: params.analysisId,
        payment_id: pay.id,
        subscription_id: subscriptionId || null,
      },
      { onConflict: "user_id,analysis_id" },
    );
  }

  return { paymentId: pay.id, subscriptionId };
}

// ─────────────────────────────────────────────────
// LISTAR PLANOS ATIVOS
// ─────────────────────────────────────────────────
export async function getActivePlans() {
  const { data: plans } = await supabase
    .from("plans" as any)
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (plans as any[]) || [];
}
