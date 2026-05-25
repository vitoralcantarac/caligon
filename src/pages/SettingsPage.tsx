import { useState, useEffect } from "react";
import { Users, Shield, Bell, Database, Palette, ArrowLeft, Loader2, Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type SettingsModule = null | "team" | "security" | "data" | "notifications" | "branding";

export default function SettingsPage() {
  const [activeModule, setActiveModule] = useState<SettingsModule>(null);

  const modules = [
    { id: "team" as const, icon: Users, title: "Equipe", desc: "Gerenciar usuários, papéis e permissões" },
    { id: "security" as const, icon: Shield, title: "Segurança", desc: "Autenticação, sessões e políticas de acesso" },
    { id: "data" as const, icon: Database, title: "Dados", desc: "Exportação e gestão de dados" },
    { id: "notifications" as const, icon: Bell, title: "Notificações", desc: "Configurar alertas e notificações" },
    { id: "branding" as const, icon: Palette, title: "Branding", desc: "Logo, cores e identidade visual" },
  ];

  if (activeModule) {
    return (
      <div className="max-w-3xl animate-fade-in">
        <button onClick={() => setActiveModule(null)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar às Configurações
        </button>
        {activeModule === "team" && <TeamModule />}
        {activeModule === "security" && <SecurityModule />}
        {activeModule === "data" && <DataModule />}
        {activeModule === "notifications" && <NotificationSettingsModule />}
        {activeModule === "branding" && <BrandingModule />}
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <h1 className="text-2xl font-display text-foreground">Configurações</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Gerencie sua equipe, permissões e preferências</p>
      <div className="space-y-4">
        {modules.map(({ id, icon: Icon, title, desc }) => (
          <div key={id} onClick={() => setActiveModule(id)} className="card-premium p-5 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-muted"><Icon className="w-5 h-5 text-muted-foreground" /></div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamModule() {
  const { user, role } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    if (!profiles) { setLoading(false); return; }
    const { data: roles } = await supabase.from("user_roles").select("*");
    const merged = profiles.map(p => ({
      ...p,
      role: roles?.find(r => r.user_id === p.user_id)?.role || "analista",
    }));
    setMembers(merged);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    if (role !== "socio") return toast.error("Apenas sócios podem alterar papéis");
    const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", userId);
    if (error) toast.error(error.message);
    else { toast.success("Papel atualizado"); loadMembers(); }
  };

  const roleLabels: Record<string, string> = {
    socio: "Sócio", analista: "Analista", consultor: "Consultor", comercial: "Comercial", gestor: "Gestor", cliente: "Cliente",
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div>
      <h2 className="text-xl font-display text-foreground mb-4">Equipe</h2>
      <p className="text-sm text-muted-foreground mb-6">{members.length} membro{members.length !== 1 ? "s" : ""}</p>
      <div className="space-y-3">
        {members.map(m => (
          <div key={m.id} className="card-premium p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {m.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "??"}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{m.full_name}</p>
                <p className="text-xs text-muted-foreground">{m.user_id === user?.id ? "(Você)" : ""}</p>
              </div>
            </div>
            <select value={m.role} onChange={e => updateRole(m.user_id, e.target.value)}
              disabled={role !== "socio" || m.user_id === user?.id}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none">
              {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityModule() {
  const { user } = useAuth();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePw = async () => {
    if (newPw !== confirmPw) return toast.error("Senhas não coincidem");
    if (newPw.length < 6) return toast.error("Senha deve ter ao menos 6 caracteres");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) toast.error(error.message);
    else { toast.success("Senha alterada com sucesso"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
    setSaving(false);
  };

  const handleLogoutAll = async () => {
    await supabase.auth.signOut({ scope: "global" });
    toast.success("Todas as sessões foram encerradas");
    window.location.href = "/login";
  };

  return (
    <div>
      <h2 className="text-xl font-display text-foreground mb-4">Segurança</h2>
      <div className="space-y-6">
        <div className="card-premium p-5">
          <h3 className="font-semibold text-foreground text-sm mb-4">Alterar Senha</h3>
          <div className="space-y-3 max-w-sm">
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Nova senha"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent pr-10" />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirmar nova senha"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent" />
            <button onClick={handleChangePw} disabled={saving} className="btn-gold text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Alterar Senha
            </button>
          </div>
        </div>
        <div className="card-premium p-5">
          <h3 className="font-semibold text-foreground text-sm mb-2">Sessões</h3>
          <p className="text-xs text-muted-foreground mb-3">Encerre todas as sessões ativas em outros dispositivos.</p>
          <button onClick={handleLogoutAll} className="px-4 py-2 rounded-lg border border-destructive text-destructive text-xs font-medium hover:bg-destructive/5 transition-colors">
            Encerrar Todas as Sessões
          </button>
        </div>
      </div>
    </div>
  );
}

function DataModule() {
  const [exporting, setExporting] = useState(false);

  const exportClientData = async () => {
    setExporting(true);
    try {
      const { data: clients } = await supabase.from("clients").select("*");
      const { data: analyses } = await supabase.from("analyses").select("*");
      const blob = new Blob([JSON.stringify({ clients, analyses }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `caligon-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast.success("Dados exportados com sucesso");
    } catch (err) { toast.error("Erro ao exportar dados"); }
    setExporting(false);
  };

  return (
    <div>
      <h2 className="text-xl font-display text-foreground mb-4">Dados</h2>
      <div className="space-y-4">
        <div className="card-premium p-5">
          <h3 className="font-semibold text-foreground text-sm mb-2">Exportar Dados</h3>
          <p className="text-xs text-muted-foreground mb-3">Exporte todos os dados de clientes e análises em formato JSON.</p>
          <button onClick={exportClientData} disabled={exporting} className="btn-navy text-xs">
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />} Exportar Dados
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettingsModule() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    if (!user) return;
    const { data } = await supabase.from("notification_settings" as any).select("*").eq("user_id", user.id).single();
    if (data) setSettings(data);
    else setSettings({
      email_enabled: true, in_app_enabled: true, on_approval_pending: true, on_review_pending: true,
      on_new_upload: true, on_new_comment: true, on_diagnosis_complete: true, on_report_generated: true, on_error: true,
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { ...settings, user_id: user.id };
    delete payload.id; delete payload.created_at; delete payload.updated_at;
    const { error } = await supabase.from("notification_settings" as any).upsert(payload as any, { onConflict: "user_id" });
    if (error) toast.error(error.message);
    else toast.success("Configurações salvas");
    setSaving(false);
  };

  const toggles = [
    { key: "in_app_enabled", label: "Notificações no app" },
    { key: "email_enabled", label: "Notificações por e-mail" },
    { key: "on_approval_pending", label: "Aprovação pendente" },
    { key: "on_review_pending", label: "Revisão pendente" },
    { key: "on_new_upload", label: "Novo upload" },
    { key: "on_new_comment", label: "Novo comentário" },
    { key: "on_diagnosis_complete", label: "Diagnóstico concluído" },
    { key: "on_report_generated", label: "Relatório gerado" },
    { key: "on_error", label: "Erros na geração" },
  ];

  if (!settings) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div>
      <h2 className="text-xl font-display text-foreground mb-4">Notificações</h2>
      <div className="card-premium p-5 space-y-4">
        {toggles.map(t => (
          <div key={t.key} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{t.label}</span>
            <button onClick={() => setSettings((s: any) => ({ ...s, [t.key]: !s[t.key] }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings[t.key] ? "bg-accent" : "bg-muted"}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${settings[t.key] ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
        <div className="pt-4 border-t border-border">
          <button onClick={handleSave} disabled={saving} className="btn-gold text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}

function BrandingModule() {
  return (
    <div>
      <h2 className="text-xl font-display text-foreground mb-4">Branding</h2>
      <div className="card-premium p-5">
        <p className="text-sm text-muted-foreground">Configurações de branding estarão disponíveis em breve. Por enquanto, os relatórios usam a identidade visual padrão CALIGON.</p>
      </div>
    </div>
  );
}
