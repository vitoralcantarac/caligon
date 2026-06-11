import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

const PIX_KEY = "contato@caligon.com.br";
const CONTACT = "WhatsApp (11) 99999-9999";
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 30 * 60 * 1000; // QR Pix expira; não adianta poll infinito

type PixPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: { slug: string; name: string; price_cents: number } | null;
  analysisId?: string;
  onPaid?: () => void;
};

function formatPrice(cents: number) {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default function PixPaymentModal({ open, onOpenChange, plan, analysisId, onPaid }: PixPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [paid, setPaid] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open || !plan) {
      stopPolling();
      setLoading(false);
      setError(false);
      setPaid(false);
      setQrCode(null);
      setQrCodeBase64(null);
      setPaymentId(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    supabase.functions
      .invoke("create-payment", {
        body: { plan_slug: plan.slug, analysis_id: analysisId, result_url: window.location.href },
      })
      .then(({ data, error: fnError }) => {
        if (cancelled) return;
        if (fnError || !data?.qrCode) {
          setError(true);
        } else {
          setQrCode(data.qrCode);
          setQrCodeBase64(data.qrCodeBase64);
          setPaymentId(data.paymentId);
          track("pix_payment_created", { planSlug: plan.slug, analysisId });
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [open, plan, analysisId, stopPolling]);

  // Aguarda o webhook aprovar o pagamento (RLS permite ler o próprio registro)
  useEffect(() => {
    if (!paymentId || paid) return;
    const startedAt = Date.now();

    pollRef.current = window.setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        stopPolling();
        return;
      }
      const { data } = await supabase
        .from("payments" as any)
        .select("status")
        .eq("id", paymentId)
        .maybeSingle();
      if ((data as any)?.status === "approved") {
        stopPolling();
        setPaid(true);
        track("pix_payment_approved", { planSlug: plan?.slug, analysisId });
        onPaid?.();
      }
    }, POLL_INTERVAL_MS);

    return stopPolling;
  }, [paymentId, paid, plan?.slug, analysisId, onPaid, stopPolling]);

  const copyCode = async () => {
    if (!qrCode) return;
    await navigator.clipboard.writeText(qrCode);
    toast.success("Código Pix copiado!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagamento via Pix — {plan?.name}</DialogTitle>
          <DialogDescription>
            {paid
              ? "Pagamento confirmado com sucesso."
              : "Escaneie o QR Code ou copie o código. A liberação é automática."}
          </DialogDescription>
        </DialogHeader>

        {paid ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
            <p className="text-xl font-bold">Pagamento confirmado! 🎉</p>
            <p className="text-sm text-muted-foreground">Seu acesso já está liberado.</p>
            <Button className="w-full" onClick={() => onOpenChange(false)}>Continuar</Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Gerando cobrança Pix...</p>
          </div>
        ) : error || !qrCode ? (
          <div className="space-y-3">
            <p className="text-sm">
              Não foi possível gerar o pagamento automático agora. Você pode pagar manualmente:
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Chave Pix:</p>
              <p className="font-mono font-semibold">{PIX_KEY}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Valor:</p>
              <p className="text-2xl font-bold">{plan && formatPrice(plan.price_cents)}</p>
            </div>
            <p className="text-sm">
              Envie o comprovante para <strong>{CONTACT}</strong>. Liberação em até 2 horas úteis.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Valor:</p>
              <p className="text-3xl font-bold">{plan && formatPrice(plan.price_cents)}</p>
            </div>
            {qrCodeBase64 && (
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code Pix"
                className="w-52 h-52 mx-auto rounded-lg bg-white p-2"
              />
            )}
            <div className="flex gap-2">
              <input
                readOnly
                value={qrCode}
                aria-label="Código Pix copia e cola"
                className="flex-1 px-3 py-2 text-xs font-mono bg-muted rounded-md border truncate"
              />
              <Button variant="outline" size="icon" onClick={copyCode} aria-label="Copiar código Pix">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Aguardando pagamento — a tela desbloqueia sozinha em segundos após o Pix.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
