import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getUserCurrentPlan } from "@/lib/access-control";
import { createAnalysis } from "@/lib/supabase-helpers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { NICHES_CONFIG } from "@/lib/niches-config";

const PROCESSES = ["Comercial", "Operação", "Financeiro", "Marketing", "RH", "Atendimento", "Logística"];

export default function ClientNewDiagnosis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [form, setForm] = useState({ company: "", niche: "", process: "", description: "" });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("clients")
      .select("name, niche")
      .eq("email", user.email!)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setForm((f) => ({ ...f, company: data.name, niche: data.niche }));
      });
  }, [user]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.niche || !form.process) return toast.error("Preencha os campos obrigatórios");

    setLoading(true);
    try {
      // Verificar limite
      const plan = await getUserCurrentPlan();
      const { data: clients } = await supabase.from("clients").select("id").eq("email", user!.email!);
      const clientIds = (clients || []).map((c) => c.id);

      if (!plan && clientIds.length > 0) {
        const { count } = await supabase
          .from("analyses")
          .select("id", { count: "exact", head: true })
          .in("client_id", clientIds);
        if ((count || 0) >= 1) {
          setShowLimitModal(true);
          setLoading(false);
          return;
        }
      }

      const analysisId = await createAnalysis(
        {
          name: form.company,
          niche: form.niche,
          email: user!.email!,
          context: form.description,
        },
        form.process
      );

      // Avançar para questionário
      await supabase.from("analyses").update({ status: "questionario", progress: 15 }).eq("id", analysisId);

      toast.success("Diagnóstico iniciado! Vamos ao questionário.");
      navigate(`/questionario/${analysisId}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar diagnóstico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Novo diagnóstico</h1>
        <p className="text-muted-foreground mt-1">Conte rapidamente sobre seu negócio para começarmos.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company">Nome da empresa *</Label>
            <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="niche">Nicho/setor *</Label>
            <Select value={form.niche} onValueChange={(v) => update("niche", v)}>
              <SelectTrigger id="niche"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(NICHES_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="process">Processo que quer analisar *</Label>
            <Select value={form.process} onValueChange={(v) => update("process", v)}>
              <SelectTrigger id="process"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {PROCESSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descrição rápida (opcional)</Label>
            <Textarea
              id="description"
              maxLength={200}
              placeholder="Em poucas palavras, qual é o principal problema que você quer resolver?"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">{form.description.length}/200</p>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar questionário →"}
          </Button>
        </form>
      </Card>

      <Card className="p-5 mt-6 bg-muted/30">
        <h3 className="font-semibold mb-3">O que vai acontecer depois?</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li><strong className="text-foreground">1.</strong> Você responde ~35 perguntas sobre seu negócio (~25 minutos)</li>
          <li><strong className="text-foreground">2.</strong> Nossa IA analisa suas respostas e identifica gargalos</li>
          <li><strong className="text-foreground">3.</strong> Você vê quanto sua empresa está perdendo por mês (gratuito)</li>
          <li><strong className="text-foreground">4.</strong> Desbloqueie o diagnóstico completo para ver como resolver</li>
        </ol>
      </Card>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Você já usou seu diagnóstico gratuito</DialogTitle>
            <DialogDescription>
              Para fazer mais diagnósticos, escolha um plano que se encaixe no seu negócio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitModal(false)}>Cancelar</Button>
            <Button onClick={() => navigate("/planos")}>Ver planos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
