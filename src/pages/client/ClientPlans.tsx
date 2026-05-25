import { useEffect, useState } from "react";
import { getActivePlans, getUserCurrentPlan } from "@/lib/access-control";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Loader2 } from "lucide-react";

const PIX_KEY = "contato@caligon.com.br";
const CONTACT = "WhatsApp (11) 99999-9999";

function formatPrice(cents: number) {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function cycleLabel(c: string) {
  return c === "monthly" ? "/mês" : c === "quarterly" ? "/trimestre" : " (pagamento único)";
}

export default function ClientPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    Promise.all([getActivePlans(), getUserCurrentPlan()]).then(([p, c]) => {
      setPlans(p);
      setCurrentPlan(c);
      setLoading(false);
    });
  }, []);

  const recurringPlans = plans.filter((p) => p.billing_cycle !== "one_time");
  const singlePlan = plans.find((p) => p.billing_cycle === "one_time");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold">Escolha o plano certo para sua empresa</h1>
        <p className="text-muted-foreground mt-3">
          Quanto mais você diagnostica, mais você cresce. E você começa a ver resultados com o primeiro diagnóstico.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {recurringPlans.map((plan) => {
          const isCurrent = currentPlan?.plan?.id === plan.id;
          const features = Array.isArray(plan.features) ? plan.features : [];
          const showInstallments = plan.price_cents > 20000;
          return (
            <Card
              key={plan.id}
              className={`p-6 flex flex-col relative ${plan.highlight ? "border-primary border-2 shadow-lg" : ""}`}
            >
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">RECOMENDADO</Badge>
              )}
              {isCurrent && (
                <Badge variant="secondary" className="absolute -top-3 right-3 bg-green-600 text-white">
                  SEU PLANO ATUAL
                </Badge>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <div className="mb-4">
                <span className="text-3xl font-bold">{formatPrice(plan.price_cents)}</span>
                <span className="text-sm text-muted-foreground">{cycleLabel(plan.billing_cycle)}</span>
                {showInstallments && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ou 12x de {formatPrice(Math.round(plan.price_cents / 12))} sem juros
                  </p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {features.map((f: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                disabled={isCurrent}
                onClick={() => setSelected(plan)}
                variant={plan.highlight ? "default" : "outline"}
                className="w-full"
              >
                {isCurrent ? "Plano atual" : "Escolher este plano →"}
              </Button>
            </Card>
          );
        })}
      </div>

      {singlePlan && (
        <Card className="p-6 bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground mb-1">Ou comece com um diagnóstico único</p>
          <p className="text-3xl font-bold mb-2">{singlePlan.name} — {formatPrice(singlePlan.price_cents)}</p>
          <p className="text-sm text-muted-foreground mb-4">{singlePlan.description}</p>
          <Button onClick={() => setSelected(singlePlan)}>Comprar diagnóstico único</Button>
        </Card>
      )}

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Perguntas frequentes</h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="cancel">
            <AccordionTrigger>Posso cancelar quando quiser?</AccordionTrigger>
            <AccordionContent>
              Sim. Os planos não são por assinatura automática — você renova manualmente no fim do período se quiser continuar.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="whitelabel">
            <AccordionTrigger>O que é white-label?</AccordionTrigger>
            <AccordionContent>
              Os relatórios saem com a marca da sua empresa, ideal para consultores e agências que entregam diagnósticos para clientes.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="time">
            <AccordionTrigger>Quanto tempo leva para liberar após o pagamento?</AccordionTrigger>
            <AccordionContent>Até 2 horas úteis após confirmação do pagamento.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="warranty">
            <AccordionTrigger>Tenho garantia?</AccordionTrigger>
            <AccordionContent>Sim. 7 dias de garantia total — se não ficar satisfeito, devolvemos 100% do valor.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* MODAL DE PAGAMENTO */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagamento — {selected?.name}</DialogTitle>
            <DialogDescription>Realize o pagamento via Pix para ativar seu plano.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Valor:</p>
              <p className="text-2xl font-bold">{selected && formatPrice(selected.price_cents)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Chave Pix:</p>
              <p className="font-mono font-semibold">{PIX_KEY}</p>
            </div>
            <p className="text-sm">
              Envie o comprovante para <strong>{CONTACT}</strong>. Seu plano será ativado em até 2 horas úteis.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
