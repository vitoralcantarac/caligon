import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const { user, loading, signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return toast.error("Preencha todos os campos");
    if (password.length < 6) return toast.error("Senha deve ter no mínimo 6 caracteres");
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Verifique seu e-mail para confirmar.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--gradient-premium)" }}>
      <div className="w-full max-w-md">
        <div className="card-premium p-8">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-xl font-bold" style={{ background: "var(--gradient-gold)", color: "hsl(var(--navy))" }}>C</div>
            <span className="font-display text-xl text-foreground">CALIGON</span>
          </div>
          <h2 className="font-display text-2xl text-foreground text-center mb-1">Criar Conta</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Junte-se à equipe CALIGON</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nome Completo</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent transition-colors" placeholder="Seu nome completo" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent transition-colors" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Senha</label>
              <div className="relative mt-1">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent transition-colors pr-10" placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-gold w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {submitting ? "Criando..." : "Criar Conta"}
            </button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Já tem conta? <Link to="/login" className="text-accent hover:underline font-medium">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
