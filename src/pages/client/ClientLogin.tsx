import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ClientLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Usuário não encontrado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type" as any)
        .eq("user_id", data.user.id)
        .maybeSingle();

      const userType = (profile as any)?.user_type || "client";
      toast.success("Bem-vindo de volta!");
      navigate(userType === "internal" ? "/" : "/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-premium)" }}>
      <Card className="w-full max-w-md p-8 bg-card/95 backdrop-blur">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">CALIGON</h1>
          <p className="text-sm text-muted-foreground mt-2">Acesse seu painel de diagnósticos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-6 space-y-2">
          <p>
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">Cadastre-se gratuitamente →</Link>
          </p>
          <Link to="/forgot-password" className="text-muted-foreground hover:underline block">Esqueci minha senha</Link>
        </div>
      </Card>
    </div>
  );
}
