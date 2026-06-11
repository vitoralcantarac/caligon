// Edge Function: payment-webhook
// Chamada pelo Mercado Pago quando o status de um pagamento muda.
// Segurança: o payload do webhook NUNCA é confiado — o status real é sempre
// reconsultado na API do Mercado Pago com nosso access token. A assinatura
// x-signature é validada quando MP_WEBHOOK_SECRET está configurado.
// Requer verify_jwt = false (config.toml) pois o MP não envia JWT do Supabase.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN") ?? "";
const MP_WEBHOOK_SECRET = Deno.env.get("MP_WEBHOOK_SECRET") ?? "";

const STATUS_MAP: Record<string, string> = {
  approved: "approved",
  rejected: "rejected",
  cancelled: "rejected",
  refunded: "refunded",
  charged_back: "chargeback",
};

async function validateSignature(req: Request, dataId: string): Promise<boolean> {
  if (!MP_WEBHOOK_SECRET) return true; // sem secret configurado, a segurança vem da reconsulta à API
  const signature = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(signature.split(",").map((p) => p.trim().split("=")));
  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(MP_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === parts.v1;
}

serve(async (req) => {
  const headers = { "Content-Type": "application/json" };
  try {
    const url = new URL(req.url);
    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* notificações antigas vêm só por query string */ }

    const topic = (body.type as string) ?? url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";
    const dataId = String((body.data as { id?: unknown })?.id ?? url.searchParams.get("data.id") ?? "");

    // Ignora notificações que não são de pagamento (ex.: merchant_order)
    if (topic !== "payment" || !dataId) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), { headers });
    }

    if (!(await validateSignature(req, dataId))) {
      return new Response(JSON.stringify({ error: "Assinatura inválida" }), { status: 401, headers });
    }

    // Fonte da verdade: API do Mercado Pago, nunca o payload recebido
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    if (!mpRes.ok) {
      return new Response(JSON.stringify({ error: `MP ${mpRes.status}` }), { status: 500, headers });
    }
    const mp = await mpRes.json();

    const newStatus = STATUS_MAP[mp.status as string];
    if (!newStatus) {
      return new Response(JSON.stringify({ ok: true, status: mp.status }), { headers }); // pending/in_process
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: payment } = await admin
      .from("payments")
      .select("*")
      .eq("id", String(mp.external_reference ?? ""))
      .maybeSingle();
    if (!payment) {
      return new Response(JSON.stringify({ ok: true, unknown_reference: true }), { headers });
    }
    if (payment.status === newStatus) {
      return new Response(JSON.stringify({ ok: true, idempotent: true }), { headers }); // retry do MP
    }

    await admin.from("payments").update({
      status: newStatus,
      gateway_payment_id: String(mp.id),
    }).eq("id", payment.id);

    if (newStatus !== "approved") {
      return new Response(JSON.stringify({ ok: true, status: newStatus }), { headers });
    }

    // ── Pagamento aprovado: libera o acesso ──
    const analysisId = payment.metadata?.analysis_id ?? null;
    const { data: plan } = await admin.from("plans").select("*").eq("id", payment.plan_id).single();

    let subscriptionId: string | null = null;
    if (plan && plan.billing_cycle !== "one_time") {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + (plan.billing_cycle === "quarterly" ? 3 : 1));
      const { data: subscription } = await admin
        .from("subscriptions")
        .insert({
          user_id: payment.user_id,
          plan_id: plan.id,
          status: "active",
          diagnostics_used: 0,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();
      subscriptionId = subscription?.id ?? null;
    }

    if (analysisId) {
      await admin.from("unlocked_diagnostics").upsert(
        {
          user_id: payment.user_id,
          analysis_id: analysisId,
          payment_id: payment.id,
          subscription_id: subscriptionId,
          unlocked_at: new Date().toISOString(),
        },
        { onConflict: "user_id,analysis_id" },
      );
    }

    // Email de confirmação — non-blocking, falha nunca quebra o fluxo
    try {
      const { data: { user } } = await admin.auth.admin.getUserById(payment.user_id);
      if (user?.email) {
        const { data: profile } = await admin
          .from("profiles")
          .select("full_name")
          .eq("user_id", payment.user_id)
          .maybeSingle();
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "payment_confirmed",
            to: user.email,
            data: {
              companyName: profile?.full_name ?? "",
              resultUrl: payment.metadata?.result_url ?? "",
            },
          }),
        });
      }
    } catch (emailErr) {
      console.error("payment-webhook: falha ao enviar email:", emailErr);
    }

    return new Response(JSON.stringify({ ok: true, unlocked: true }), { headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("payment-webhook:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers });
  }
});
