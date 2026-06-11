import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hasAccessToAnalysis } from "@/lib/access-control";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, Star, TrendingDown, TrendingUp, ShieldCheck, AlertTriangle, CheckCircle2, ArrowLeft, Download } from "lucide-react";
import { generateClientReport } from "@/lib/pdf-generator";
import { track } from "@/lib/analytics";
import PixPaymentModal from "@/components/client/PixPaymentModal";

function formatPrice(cents: number) {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const dur = 1200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{prefix}{Math.round(n).toLocaleString("pt-BR")}{suffix}</>;
}

function scoreCategory(v: number) {
  if (v <= 30) return { label: "CRÍTICO", color: "bg-red-600" };
  if (v <= 50) return { label: "ATENÇÃO", color: "bg-orange-500" };
  if (v <= 70) return { label: "MODERADO", color: "bg-yellow-500" };
  if (v <= 90) return { label: "BOM", color: "bg-green-400" };
  return { label: "EXCELENTE", color: "bg-green-600" };
}

export default function ClientResult() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [singlePlan, setSinglePlan] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [helpful, setHelpful] = useState(false);
  const [recommend, setRecommend] = useState(false);
  const [ratingSent, setRatingSent] = useState(false);

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [aRes, bRes, rRes, sRes, accessRes, planRes] = await Promise.all([
        supabase.from("analyses").select("*, clients(name, niche)").eq("id", id).single(),
        supabase.from("bottlenecks").select("*").eq("analysis_id", id).order("estimated_loss", { ascending: false }),
        supabase.from("recommendations").select("*").eq("analysis_id", id).order("priority", { ascending: true }),
        supabase.from("analysis_scores").select("*").eq("analysis_id", id),
        hasAccessToAnalysis(id),
        supabase.from("plans" as any).select("*").eq("slug", "single").maybeSingle(),
      ]);
      setAnalysis(aRes.data);
      setBottlenecks(bRes.data || []);
      setRecommendations(rRes.data || []);
      setScores(sRes.data || []);
      setHasAccess(accessRes.hasAccess);
      setSinglePlan(planRes.data);
      setLoading(false);
      track("result_viewed", {
        analysisId: id,
        hasAccess: accessRes.hasAccess,
        accessType: accessRes.accessType,
        estimatedLoss: Number(aRes.data?.estimated_loss ?? 0),
      });
    })();
  }, [id]);

  const submitRating = async () => {
    if (!id || !user || rating === 0) return toast.error("Selecione uma avaliação");
    const { error } = await supabase.from("diagnosis_ratings").insert({
      analysis_id: id,
      user_id: user.id,
      rating,
      comment: ratingComment || null,
      helpful_recommendations: helpful,
      would_recommend: recommend,
    });
    if (error) return toast.error(error.message);
    setRatingSent(true);
    toast.success("Obrigado pela sua avaliação!");
  };

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    setDownloadingPdf(true);
    try {
      const doc = await generateClientReport(analysis, scores, bottlenecks, recommendations, []);
      const safe = analysis?.clients?.name?.replace(/[^a-zA-Z0-9]/g, "_") || "empresa";
      doc.save(`diagnostico_caligon_${safe}_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (err: any) {
      toast.error(`Erro ao gerar PDF: ${err.message}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return <div className="p-10 text-center">Diagnóstico não encontrado.</div>;
  }

  const monthlyLoss = Number(analysis.estimated_loss || 0);
  const monthlySavings = Number(analysis.estimated_savings || 0);
  const singlePrice = Number(singlePlan?.price_cents ?? 39700);
  const mainScore = scores.find((s) => s.label?.toLowerCase().includes("saúde") || s.label?.toLowerCase().includes("saude")) || scores[0];
  const scoreValue = mainScore?.value || 0;
  const cat = scoreCategory(scoreValue);

  const critical = bottlenecks.filter((b) => b.severity === "critical").length;
  const high = bottlenecks.filter((b) => b.severity === "high").length;
  const medium = bottlenecks.filter((b) => b.severity === "medium").length;

  const main = bottlenecks[0];
  const others = bottlenecks.slice(1);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Link>

      {/* BLOCO 1: SEMPRE VISÍVEL */}
      <Card className="p-8 md:p-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
        <div className="text-center space-y-2 mb-8">
          <Badge variant="outline" className="border-yellow-500 text-yellow-400">⚠️ Diagnóstico concluído</Badge>
          <h1 className="text-2xl md:text-3xl font-bold">{analysis.clients?.name}</h1>
        </div>

        <div className="text-center space-y-2">
          <p className="text-slate-300">Sua empresa está perdendo</p>
          <p className="text-5xl md:text-6xl font-bold text-red-400">
            R$ <CountUp value={monthlyLoss} /> <span className="text-2xl text-slate-400 font-normal">/ mês</span>
          </p>
          <p className="text-xl text-slate-400">
            R$ {(monthlyLoss * 12).toLocaleString("pt-BR")} / ano
          </p>
        </div>

        {monthlySavings > 0 && (
          <>
            <div className="border-t border-slate-700 my-8" />
            <div className="text-center space-y-2">
              <p className="text-slate-300">Com as melhorias identificadas, você pode economizar</p>
              <p className="text-4xl md:text-5xl font-bold text-green-400">
                Até R$ <CountUp value={monthlySavings} /> <span className="text-xl text-slate-400 font-normal">/ mês</span>
              </p>
            </div>
          </>
        )}

        <div className="border-t border-slate-700 my-8" />

        <div className="text-center space-y-3">
          <p className="text-slate-300">Score de saúde operacional</p>
          <p className="text-6xl font-bold">{scoreValue}/100</p>
          <div className="max-w-md mx-auto space-y-2">
            <Progress value={scoreValue} className="h-3" />
            <Badge className={cat.color}>{cat.label}</Badge>
          </div>
          <p className="text-xs text-slate-400">Comparado a empresas similares no setor</p>
        </div>

        <div className="border-t border-slate-700 my-8" />

        <div className="text-center">
          <p className="text-lg">
            Foram identificados <strong>{bottlenecks.length} gargalos</strong>
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {critical} críticos · {high} altos · {medium} médios
          </p>
        </div>
      </Card>

      {/* BLOCO 2: GARGALO PRINCIPAL */}
      {main && (
        <Card className="p-6 border-2 border-red-500/50">
          <Badge className="bg-red-600 mb-3">🔓 GARGALO PRINCIPAL REVELADO</Badge>
          <h3 className="text-xl font-bold mb-2">{main.title}</h3>
          <p className="text-muted-foreground mb-3">
            {(main.description || "").split(".")[0]}.
          </p>
          <p className="font-semibold text-destructive flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            Impacto estimado: R$ {Number(main.estimated_loss || 0).toLocaleString("pt-BR")}/mês
          </p>
          {!hasAccess && (
            <>
              <div className="border-t border-dashed my-4" />
              <p className="text-red-500 font-medium">→ Como resolver este gargalo está bloqueado</p>
            </>
          )}
        </Card>
      )}

      {/* BLOCO 3 e 4: BLOQUEADO */}
      {!hasAccess && (
        <>
          {others.length > 0 && (
            <div className="relative">
              <div className="space-y-3 opacity-30 blur-[4px] pointer-events-none">
                {others.slice(0, 4).map((b) => (
                  <Card key={b.id} className="p-5">
                    <h4 className="font-semibold">{b.title}</h4>
                    <p className="text-sm text-muted-foreground">Impacto: R$ {Number(b.estimated_loss || 0).toLocaleString("pt-BR")}/mês</p>
                  </Card>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="p-6 text-center shadow-lg">
                  <Lock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-bold">🔒 {others.length} gargalos e todas as soluções bloqueadas</p>
                  <p className="text-sm text-muted-foreground mt-1">Desbloqueie para ver como resolver cada um</p>
                </Card>
              </div>
            </div>
          )}

          {/* CTA */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary">
            <h2 className="text-3xl font-bold mb-2">Desbloquear diagnóstico completo</h2>
            <p className="text-muted-foreground mb-5">
              Acesso permanente a tudo que sua empresa precisa para parar de perder R$ {monthlyLoss.toLocaleString("pt-BR")}/mês
            </p>

            <ul className="space-y-2 mb-6">
              {[
                `Todos os ${bottlenecks.length} gargalos com causa raiz e impacto financeiro`,
                "Recomendações com passo a passo de implementação",
                "Roadmap de implementação em 4 fases",
                "Fluxogramas do processo atual e otimizado",
                "PDF completo para baixar e compartilhar",
                "Acesso permanente ao diagnóstico",
              ].map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <div className="mb-5">
              <p className="text-5xl font-bold">{formatPrice(singlePrice)}</p>
              <p className="text-sm text-muted-foreground">ou 12x de {formatPrice(Math.round(singlePrice / 12))} sem juros</p>
            </div>

            <Button size="lg" className="w-full text-lg py-6" onClick={() => {
              setShowPayment(true);
              track("paywall_unlock_clicked", { analysisId: id, estimatedLoss: monthlyLoss });
            }}>
              Desbloquear agora — {formatPrice(singlePrice)}
            </Button>

            <p className="text-xs text-center mt-4 text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Garantia de 7 dias — se não ficar satisfeito, devolvemos 100%
            </p>
          </Card>
        </>
      )}

      {/* BLOCO 5: ACESSO LIBERADO */}
      {hasAccess && (
        <>
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <CheckCircle2 className="w-5 h-5" /> Diagnóstico completo desbloqueado
          </div>

          <Tabs defaultValue="bottlenecks">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="bottlenecks">Gargalos</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="pdf">Baixar PDF</TabsTrigger>
            </TabsList>

            <TabsContent value="bottlenecks" className="space-y-3 mt-4">
              {bottlenecks.map((b) => (
                <Card key={b.id} className="p-5">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant={b.severity === "critical" ? "destructive" : "secondary"}>
                      {b.severity}
                    </Badge>
                    <h4 className="font-semibold">{b.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{b.description}</p>
                  {b.behavior_description && (
                    <p className="text-sm mb-2"><strong>Causa raiz:</strong> {b.behavior_description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 text-destructive">
                      <TrendingDown className="w-4 h-4" /> R$ {Number(b.estimated_loss || 0).toLocaleString("pt-BR")}/mês
                    </span>
                    <span>Confiança: {b.confidence}</span>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-3 mt-4">
              {recommendations.map((r) => (
                <Card key={r.id} className="p-5">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge>{r.category}</Badge>
                    <h4 className="font-semibold">{r.title}</h4>
                  </div>
                  {r.justification && <p className="text-sm text-muted-foreground mb-3">{r.justification}</p>}
                  {Array.isArray(r.how_to_implement) && r.how_to_implement.length > 0 && (
                    <div className="mb-3">
                      <p className="font-medium text-sm mb-1">Passo a passo:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {r.how_to_implement.map((step: string, i: number) => <li key={i}>{step}</li>)}
                      </ol>
                    </div>
                  )}
                  {Array.isArray(r.tools_required) && r.tools_required.length > 0 && (
                    <p className="text-sm mb-1"><strong>Ferramentas:</strong> {r.tools_required.join(", ")}</p>
                  )}
                  {r.expected_result && (
                    <p className="text-sm mb-1 flex items-start gap-1"><TrendingUp className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> {r.expected_result}</p>
                  )}
                  <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    {r.timeframe && <span>⏱ {r.timeframe}</span>}
                    {r.estimated_cost > 0 && <span>💰 R$ {Number(r.estimated_cost).toLocaleString("pt-BR")}</span>}
                  </div>
                  {r.warning && (
                    <p className="text-sm text-orange-600 mt-2 flex items-start gap-1">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {r.warning}
                    </p>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="overview" className="mt-4">
              <Card className="p-5">
                {analysis.executive_summary ? (
                  <p className="text-sm leading-relaxed whitespace-pre-line">{analysis.executive_summary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Resumo executivo não disponível.</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="pdf" className="mt-4">
              <Card className="p-8 text-center">
                <p className="mb-4">Baixe o PDF completo do seu diagnóstico</p>
                <Button onClick={handleDownloadPDF} disabled={downloadingPdf}>
                  {downloadingPdf ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> Baixar PDF</>
                  )}
                </Button>
              </Card>
            </TabsContent>
          </Tabs>

          {/* AVALIAÇÃO */}
          {!ratingSent && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Como foi este diagnóstico para você?</h3>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} aria-label={`Avaliar com ${n} estrela${n > 1 ? "s" : ""}`}>
                    <Star className={`w-8 h-8 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Algum comentário? (opcional)"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className="mb-3"
              />
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="helpful" checked={helpful} onCheckedChange={(v) => setHelpful(!!v)} />
                  <Label htmlFor="helpful">As recomendações foram úteis e aplicáveis?</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="recommend" checked={recommend} onCheckedChange={(v) => setRecommend(!!v)} />
                  <Label htmlFor="recommend">Indicaria o CALIGON para outros empresários?</Label>
                </div>
              </div>
              <Button onClick={submitRating}>Enviar avaliação</Button>
            </Card>
          )}
        </>
      )}

      {/* MODAL DE PAGAMENTO */}
      <PixPaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        plan={singlePlan ? { slug: singlePlan.slug, name: singlePlan.name, price_cents: singlePlan.price_cents } : { slug: "single", name: "Diagnóstico Único", price_cents: singlePrice }}
        analysisId={id}
        onPaid={() => setHasAccess(true)}
      />
    </div>
  );
}
