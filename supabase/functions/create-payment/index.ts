// Edge Function: create-payment
// Cria uma cobrança Pix no Mercado Pago para o usuário autenticado.
// O preço é SEMPRE lido da tabela plans no servidor — nunca do navegador.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://vitoralcantarac.github.io",
  "http://localhost:8080",
];

const CORS_ALLOW_HEADERS = "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN") ?? "";

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": CORS_ALLOW_HEADERS,
    "Content-Type": "application/json",
  };
}

serve(async (req) => {
  const headers = corsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    if (!MP_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "Gateway de pagamento não configurado" }), { status: 503, headers });
    }

    // Identifica o usuário a partir do JWT enviado pelo frontend
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers });
    }

    const { plan_slug, analysis_id, result_url } = await req.json() as {
      plan_slug: string;
      analysis_id?: string;
      result_url?: string;
    };
    if (!plan_slug) {
      return new Response(JSON.stringify({ error: "Campo obrigatório: plan_slug" }), { status: 400, headers });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: plan, error: planError } = await admin
      .from("plans")
      .select("*")
      .eq("slug", plan_slug)
      .eq("is_active", true)
      .single();
    if (planError || !plan) {
      return new Response(JSON.stringify({ error: `Plano '${plan_slug}' não encontrado` }), { status: 404, headers });
    }

    // Registro pendente — o id serve de external_reference no Mercado Pago
    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount_cents: plan.price_cents,
        type: plan.billing_cycle === "one_time" ? "one_time" : "subscription",
        status: "pending",
        gateway: "mercadopago",
        method: "pix",
        metadata: { analysis_id: analysis_id ?? null, result_url: result_url ?? null },
      })
      .select()
      .single();
    if (paymentError || !payment) {
      throw new Error(`Erro ao registrar pagamento: ${paymentError?.message}`);
    }

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": payment.id,
      },
      body: JSON.stringify({
        transaction_amount: Math.round(plan.price_cents) / 100,
        description: `CALIGON — ${plan.name}`,
        payment_method_id: "pix",
        payer: { email: user.email },
        external_reference: payment.id,
        notification_url: `${SUPABASE_URL}/functions/v1/payment-webhook`,
      }),
    });

    if (!mpRes.ok) {
      const body = await mpRes.text();
      await admin.from("payments").update({ status: "rejected", notes: `Falha ao criar cobrança MP: ${mpRes.status}` }).eq("id", payment.id);
      throw new Error(`Mercado Pago ${mpRes.status}: ${body}`);
    }

    const mp = await mpRes.json();
    await admin.from("payments").update({ gateway_payment_id: String(mp.id) }).eq("id", payment.id);

    const tx = mp.point_of_interaction?.transaction_data ?? {};
    return new Response(JSON.stringify({
      paymentId: payment.id,
      amountCents: plan.price_cents,
      qrCode: tx.qr_code ?? null,
      qrCodeBase64: tx.qr_code_base64 ?? null,
      ticketUrl: tx.ticket_url ?? null,
    }), { headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("create-payment:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers });
  }
});
