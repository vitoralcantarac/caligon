import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Preencha todos os campos");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos" : error.message);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-premium)" }}>
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 text-primary-foreground">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-2xl font-bold" style={{ background: "var(--gradient-gold)", color: "hsl(var(--navy))" }}>C</div>
          <span className="font-display text-3xl tracking-wide">CALIGON</span>
        </div>
        <h1 className="font-display text-4xl leading-tight mb-4">Inteligência Operacional<br />para Empresas que<br />Querem Crescer</h1>
        <p className="text-lg opacity-80 max-w-md">Diagnósticos profundos, recomendações acionáveis e relatórios premium para otimizar processos e aumentar lucro.</p>
        <div className="flex gap-6 mt-12 text-sm opacity-60">
          <div><p className="text-2xl font-bold">10+</p><p>Nichos</p></div>
          <div><p className="text-2xl font-bold">6</p><p>Camadas de Análise</p></div>
          <div><p className="text-2xl font-bold">∞</p><p>Insights</p></div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="card-premium p-8">
            <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-xl font-bold" style={{ background: "var(--gradient-gold)", color: "hsl(var(--navy))" }}>C</div>
              <span className="font-display text-xl text-foreground">CALIGON</span>
            </div>
            <h2 className="font-display text-2xl text-foreground text-center mb-1">Entrar</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">Acesse o painel de inteligência operacional</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent transition-colors" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Senha</label>
                <div className="relative mt-1">
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent transition-colors pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-accent hover:underline">Esqueceu a senha?</Link>
              </div>
              <button type="submit" disabled={submitting} className="btn-gold w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {submitting ? "Entrando..." : "Entrar"}
              </button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-6">
              Não tem conta? <Link to="/signup" className="text-accent hover:underline font-medium">Criar conta</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-premium)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-2xl font-bold" style={{ background: "var(--gradient-gold)", color: "hsl(var(--navy))" }}>C</div>
        <Loader2 className="w-6 h-6 animate-spin text-primary-foreground" />
      </div>
    </div>
  );
}
