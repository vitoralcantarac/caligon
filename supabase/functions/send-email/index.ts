import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = "CALIGON <noreply@caligon.com.br>";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function diagnosisCompletedHtml(companyName: string, estimatedLoss: number, resultUrl: string): string {
  const lossBlock = estimatedLoss > 0
    ? `<div style="background:#1a0505;border:1px solid #ef4444;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:#999;">Perda estimada identificada</p>
        <p style="margin:0;font-size:36px;font-weight:700;color:#ef4444;">
          R$ ${Number(estimatedLoss).toLocaleString("pt-BR")}<span style="font-size:18px;font-weight:400;color:#888;">/mês</span>
        </p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:580px;margin:40px auto;padding:0 16px;">
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:40px;">
      <p style="margin:0 0 24px;font-size:11px;letter-spacing:3px;color:#d4af37;text-transform:uppercase;">CALIGON</p>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f1f1f1;">Seu diagnóstico está pronto</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#888;">
        Olá${companyName ? ", " + companyName : ""}! Nossa IA concluiu a análise do seu negócio.
      </p>
      ${lossBlock}
      <a href="${resultUrl}" style="display:block;background:#d4af37;color:#000;text-align:center;padding:16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">
        Ver diagnóstico completo →
      </a>
      <p style="margin:32px 0 0;font-size:12px;color:#444;text-align:center;">
        Este email foi enviado automaticamente. Dúvidas? Fale conosco pelo WhatsApp.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function paymentConfirmedHtml(companyName: string, resultUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:580px;margin:40px auto;padding:0 16px;">
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:40px;">
      <p style="margin:0 0 24px;font-size:11px;letter-spacing:3px;color:#d4af37;text-transform:uppercase;">CALIGON</p>
      <div style="width:56px;height:56px;background:#052e16;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 0 20px;">
        <span style="font-size:28px;">✓</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f1f1f1;">Diagnóstico desbloqueado!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#888;">
        Olá${companyName ? ", " + companyName : ""}! Seu pagamento foi confirmado e o diagnóstico completo está disponível.
      </p>
      <a href="${resultUrl}" style="display:block;background:#d4af37;color:#000;text-align:center;padding:16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">
        Acessar diagnóstico completo →
      </a>
      <p style="margin:32px 0 0;font-size:12px;color:#444;text-align:center;">
        Este email foi enviado automaticamente. Dúvidas? Fale conosco pelo WhatsApp.
      </p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { type, to, data } = await req.json() as {
      type: "diagnosis_completed" | "payment_confirmed";
      to: string;
      data: Record<string, unknown>;
    };

    if (!to || !type) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios: to, type" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    let subject: string;
    let html: string;

    if (type === "diagnosis_completed") {
      subject = "Seu diagnóstico está pronto — CALIGON";
      html = diagnosisCompletedHtml(
        String(data.companyName ?? ""),
        Number(data.estimatedLoss ?? 0),
        String(data.resultUrl ?? ""),
      );
    } else if (type === "payment_confirmed") {
      subject = "Diagnóstico desbloqueado — CALIGON";
      html = paymentConfirmedHtml(
        String(data.companyName ?? ""),
        String(data.resultUrl ?? ""),
      );
    } else {
      return new Response(JSON.stringify({ error: "Tipo de email inválido" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY não configurado — email não enviado");
      return new Response(JSON.stringify({ ok: true, sent: false, reason: "no_api_key" }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend ${res.status}: ${body}`);
    }

    return new Response(JSON.stringify({ ok: true, sent: true }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
