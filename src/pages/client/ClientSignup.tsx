import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { NICHES_CONFIG } from "@/lib/niches-config";

export default function ClientSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    niche: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error("Senha deve ter no mínimo 8 caracteres");
    if (form.password !== form.confirmPassword) return toast.error("Senhas não conferem");
    if (!form.fullName || !form.email || !form.company) return toast.error("Preencha os campos obrigatórios");

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName, company: form.company, niche: form.niche },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;

      if (data.user) {
        // Garantir profile como client
        await supabase.from("profiles").upsert(
          { user_id: data.user.id, full_name: form.fullName, user_type: "client" } as any,
          { onConflict: "user_id" }
        );

        // Criar client inicial
        if (form.company) {
          await supabase.from("clients").insert({
            name: form.company,
            niche: form.niche || "outros",
            email: form.email,
            created_by: data.user.id,
          });
        }
      }

      toast.success("Bem-vindo(a) ao CALIGON! Vamos descobrir onde está seu dinheiro.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-premium)" }}>
      <Card className="w-full max-w-md p-8 bg-card/95 backdrop-blur">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">CALIGON</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Descubra onde sua empresa está perdendo dinheiro — em 30 minutos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nome completo *</Label>
            <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Senha * (mín. 8 caracteres)</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar senha *</Label>
            <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="company">Nome da empresa *</Label>
            <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="niche">Nicho/setor (opcional)</Label>
            <Select value={form.niche} onValueChange={(v) => update("niche", v)}>
              <SelectTrigger id="niche">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NICHES_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta gratuita"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{" "}
          <Link to="/entrar" className="text-primary font-medium hover:underline">Entrar →</Link>
        </p>
      </Card>
    </div>
  );
}
