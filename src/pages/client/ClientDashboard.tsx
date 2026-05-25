import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getUserCurrentPlan } from "@/lib/access-control";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Clock, TrendingUp, Lock, CheckCircle2 } from "lucide-react";

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Buscar clients deste usuário
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name")
        .eq("email", user.email!);

      const clientIds = (clients || []).map((c) => c.id);
      if (clientIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: list } = await supabase
        .from("analyses")
        .select("*, clients(name, niche)")
        .in("client_id", clientIds)
        .order("created_at", { ascending: false });

      setAnalyses(list || []);

      const { data: unlocks } = await supabase
        .from("unlocked_diagnostics")
        .select("analysis_id")
        .eq("user_id", user.id);

      setUnlocked(new Set((unlocks || []).map((u: any) => u.analysis_id)));

      const plan = await getUserCurrentPlan();
      setPlanInfo(plan);
      setLoading(false);
    })();
  }, [user]);

  const firstName = (profile?.full_name || user?.email || "").split(" ")[0];
  const hasAnalyses = analyses.length > 0;
  const hasPaid = analyses.some((a) => unlocked.has(a.id));

  const subtitle = !hasAnalyses
    ? "Pronto para descobrir onde seu negócio está perdendo dinheiro?"
    : !hasPaid
    ? "Você tem um diagnóstico esperando para ser desbloqueado"
    : "Confira a evolução do seu negócio abaixo";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Olá, {firstName}! 👋</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {!loading && !hasAnalyses && (
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2">GRATUITO</Badge>
              <h2 className="text-2xl font-bold mb-2">Faça seu primeiro diagnóstico</h2>
              <p className="text-muted-foreground mb-3">
                Responda 35 perguntas sobre seu negócio e descubra exatamente onde está o dinheiro que está escapando.
              </p>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                <Clock className="w-4 h-4" /> ~25 minutos
              </p>
              <Button asChild size="lg">
                <Link to="/novo-diagnostico">
                  Iniciar diagnóstico gratuito <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {hasAnalyses && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Seus diagnósticos</h2>
            <Button asChild variant="outline">
              <Link to="/novo-diagnostico">+ Novo diagnóstico</Link>
            </Button>
          </div>
          {analyses.map((a) => {
            const isUnlocked = unlocked.has(a.id);
            return (
              <Card key={a.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{a.clients?.name} — {a.process}</h3>
                      {isUnlocked ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Desbloqueado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300">
                          <Lock className="w-3 h-3 mr-1" /> Gratuito — resultado disponível
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    {a.estimated_loss > 0 && (
                      <p className="text-sm mt-2 flex items-center gap-1 text-destructive">
                        <TrendingUp className="w-4 h-4" />
                        Perda estimada: R$ {Number(a.estimated_loss).toLocaleString("pt-BR")}/mês
                      </p>
                    )}
                  </div>
                  <Button asChild>
                    <Link to={`/resultado/${a.id}`}>
                      Ver resultado <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {planInfo && (
        <Card className="p-5 bg-muted/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Plano atual</p>
              <p className="font-semibold">{planInfo.plan?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {planInfo.diagnosticsRemaining === "unlimited"
                  ? "Diagnósticos ilimitados"
                  : `${planInfo.diagnosticsRemaining} diagnósticos disponíveis`}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/planos">Ver todos os planos</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
