import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingDown, Users, FileSearch, ArrowRight, ChevronRight, Loader2,
  Users2, CheckCircle2, TrendingUp, DollarSign, Unlock
} from "lucide-react";
import { Link } from "react-router-dom";
import { STATUS_COLOR, STATUS_LABELS } from "@/lib/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { registerManualPayment, getActivePlans } from "@/lib/access-control";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; analysisId?: string; userId?: string; companyName?: string; clientEmail?: string }>({ open: false });
  const [paymentForm, setPaymentForm] = useState({ planSlug: "single", method: "pix", installments: 1, notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: analyses = [], isLoading: loadingAnalyses } = useQuery({
    queryKey: ['dashboard-analyses'],
    queryFn: async () => {
      const { data } = await supabase.from("analyses").select("*, clients(name, niche, email)").order("updated_at", { ascending: false }).limit(10);
      return data || [];
    },
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['dashboard-clients'],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*").eq("status", "ativo");
      return data || [];
    },
  });

  const { data: saasMetrics, isLoading: loadingSaas } = useQuery({
    queryKey: ['dashboard-saas-metrics'],
    queryFn: async () => {
      const [clientsRes, totalRes, paidRes, revenueRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'client'),
        supabase.from('analyses').select('id', { count: 'exact', head: true }),
        supabase.from('unlocked_diagnostics').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('amount_cents').eq('status', 'approved'),
      ]);
      const totalClients = clientsRes.count || 0;
      const totalAnalyses = totalRes.count || 0;
      const paidAnalyses = paidRes.count || 0;
      const freeAnalyses = Math.max(0, totalAnalyses - paidAnalyses);
      const conversionRate = totalAnalyses > 0 ? (paidAnalyses / totalAnalyses) * 100 : 0;
      const totalRevenueCents = (revenueRes.data || []).reduce((s, p: any) => s + (p.amount_cents || 0), 0);
      return { totalClients, freeAnalyses, paidAnalyses, conversionRate, totalRevenueCents };
    },
  });

  const { data: opportunities = [], isLoading: loadingOpps } = useQuery({
    queryKey: ['dashboard-opportunities'],
    queryFn: async () => {
      const { data: analysesData } = await supabase
        .from('analyses')
        .select('id, estimated_loss, updated_at, status, client_id, clients(name, email)')
        .in('status', ['relatorio', 'revisao', 'aprovado', 'entregue'])
        .order('updated_at', { ascending: false })
        .limit(30);
      if (!analysesData?.length) return [];
      const ids = analysesData.map(a => a.id);
      const { data: unlocked } = await supabase
        .from('unlocked_diagnostics')
        .select('analysis_id')
        .in('analysis_id', ids);
      const unlockedSet = new Set((unlocked || []).map(u => u.analysis_id));
      return analysesData.filter(a => !unlockedSet.has(a.id)).slice(0, 10);
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['active-plans'],
    queryFn: getActivePlans,
  });

  const loading = loadingAnalyses || loadingClients || loadingSaas;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  const activeAnalyses = analyses.filter(a => !['aprovado', 'entregue'].includes(a.status));
  const totalLoss = analyses.reduce((s, a) => s + (Number(a.estimated_loss) || 0), 0);

  const stats = [
    { label: "Análises Ativas", value: activeAnalyses.length, icon: FileSearch, color: "info" },
    { label: "Clientes Ativos", value: clients.length, icon: Users, color: "success" },
    { label: "Perda Estimada Total", value: totalLoss > 0 ? `R$ ${(totalLoss / 1000).toFixed(0)}k/mês` : "—", icon: TrendingDown, color: "destructive" },
  ];

  const saasStats = saasMetrics ? [
    { label: "Clientes cadastrados", value: saasMetrics.totalClients, icon: Users2, color: "info" },
    { label: "Diagnósticos gratuitos", value: saasMetrics.freeAnalyses, icon: FileSearch, color: "warning" },
    { label: "Diagnósticos pagos", value: saasMetrics.paidAnalyses, icon: CheckCircle2, color: "success" },
    { label: "Taxa de conversão", value: `${saasMetrics.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: "info" },
    { label: "Receita total", value: `R$ ${(saasMetrics.totalRevenueCents / 100).toLocaleString('pt-BR')}`, icon: DollarSign, color: "success" },
  ] : [];

  async function openPaymentModal(opp: any) {
    // Try matching profile by full_name = client name (best-effort heuristic)
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('user_type', 'client')
      .ilike('full_name', opp.clients?.name || '');
    const userId = profilesData?.[0]?.user_id;
    if (!userId) {
      toast({
        title: "Usuário não encontrado",
        description: "Este cliente ainda não tem conta vinculada ao painel self-serve.",
        variant: "destructive"
      });
      return;
    }
    setPaymentModal({ open: true, analysisId: opp.id, userId, companyName: opp.clients?.name, clientEmail: opp.clients?.email });
    setPaymentForm({ planSlug: "single", method: "pix", installments: 1, notes: "" });
  }

  async function handleRegisterPayment() {
    if (!paymentModal.userId || !paymentModal.analysisId) return;
    setSubmitting(true);
    try {
      await registerManualPayment({
        targetUserId: paymentModal.userId,
        planSlug: paymentForm.planSlug,
        analysisId: paymentModal.analysisId,
        method: paymentForm.method,
        installments: paymentForm.installments,
        notes: paymentForm.notes || undefined,
      });
      toast({ title: "Pagamento registrado", description: `Diagnóstico desbloqueado para ${paymentModal.companyName || 'o cliente'}.` });

      // Enviar email de confirmação ao cliente (non-blocking)
      if (paymentModal.clientEmail && paymentModal.analysisId) {
        const resultUrl = `${window.location.origin}${window.location.pathname}#/resultado/${paymentModal.analysisId}`;
        supabase.functions.invoke("send-email", {
          body: {
            type: "payment_confirmed",
            to: paymentModal.clientEmail,
            data: { companyName: paymentModal.companyName ?? "", resultUrl },
          },
        }).catch(() => {});
      }

      setPaymentModal({ open: false });
      queryClient.invalidateQueries({ queryKey: ['dashboard-opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-saas-metrics'] });
    } catch (e: any) {
      toast({ title: "Erro ao registrar pagamento", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral das operações CALIGON</p>
      </div>

      {/* Métricas SaaS */}
      {saasStats.length > 0 && (
        <div>
          <h2 className="font-display text-base text-foreground mb-3">Métricas do SaaS</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {saasStats.map(stat => (
              <div key={stat.label} className="stat-card">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-xl font-bold mt-1 text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg badge-${stat.color}`}><stat.icon className="w-4 h-4" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg badge-${stat.color}`}><stat.icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Oportunidades de conversão */}
      <div className="card-premium">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-display text-lg text-foreground">Oportunidades de conversão</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Diagnósticos concluídos aguardando pagamento</p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {loadingOpps ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
          ) : opportunities.length === 0 ? (
            <div className="p-8 text-center"><p className="text-sm text-muted-foreground">Nenhuma oportunidade pendente.</p></div>
          ) : opportunities.map((opp: any) => (
            <div key={opp.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{opp.clients?.name || 'Sem nome'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {opp.estimated_loss > 0 ? `Perda: R$ ${(Number(opp.estimated_loss) / 1000).toFixed(1)}k/mês · ` : ''}
                  Concluído em {new Date(opp.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-xs px-2 py-1 rounded badge-warning">Aguardando pagamento</span>
                <Button size="sm" onClick={() => openPaymentModal(opp)} className="gap-1">
                  <Unlock className="w-3.5 h-3.5" /> Registrar pagamento
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análises recentes */}
      <div className="card-premium">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-lg text-foreground">Análises Recentes</h2>
          <Link to="/analyses" className="text-sm text-accent hover:underline flex items-center gap-1">Ver todas <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="divide-y divide-border">
          {analyses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma análise ainda.</p>
              <Link to="/analyses/new" className="btn-gold mt-4 inline-flex">Nova Análise</Link>
            </div>
          ) : analyses.slice(0, 5).map(analysis => (
            <Link key={analysis.id} to={`/analyses/${analysis.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground truncate">{analysis.clients?.name}</p>
                  <span className={STATUS_COLOR[analysis.status]}>{STATUS_LABELS[analysis.status]}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{analysis.process} • {analysis.clients?.niche}</p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Progresso</p>
                  <p className="text-sm font-semibold text-foreground">{analysis.progress}%</p>
                </div>
                <div className="w-20"><div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${analysis.progress}%` }} /></div></div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Modal de registrar pagamento */}
      <Dialog open={paymentModal.open} onOpenChange={(o) => !o && setPaymentModal({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento manual</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Cliente: {paymentModal.companyName}</p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Plano</Label>
              <Select value={paymentForm.planSlug} onValueChange={(v) => setPaymentForm(f => ({ ...f, planSlug: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {plans.map((p: any) => (
                    <SelectItem key={p.slug} value={p.slug}>{p.name} — R$ {(p.price_cents / 100).toLocaleString('pt-BR')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Método de pagamento</Label>
              <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm(f => ({ ...f, method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentForm.method === 'credit_card' && (
              <div>
                <Label>Parcelas</Label>
                <Input type="number" min={1} max={12} value={paymentForm.installments} onChange={(e) => setPaymentForm(f => ({ ...f, installments: Number(e.target.value) }))} />
              </div>
            )}
            <div>
              <Label>Observações</Label>
              <Textarea value={paymentForm.notes} onChange={(e) => setPaymentForm(f => ({ ...f, notes: e.target.value }))} placeholder="Opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModal({ open: false })} disabled={submitting}>Cancelar</Button>
            <Button onClick={handleRegisterPayment} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmar pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
