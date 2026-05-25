import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Informe seu e-mail");
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--gradient-premium)" }}>
      <div className="w-full max-w-md">
        <div className="card-premium p-8">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar ao login
          </Link>
          {sent ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 mx-auto text-accent mb-4" />
              <h2 className="font-display text-xl text-foreground mb-2">E-mail Enviado</h2>
              <p className="text-sm text-muted-foreground">Verifique sua caixa de entrada para redefinir sua senha.</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl text-foreground text-center mb-1">Redefinir Senha</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">Enviaremos um link para redefinir sua senha</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent transition-colors" placeholder="seu@email.com" />
                </div>
                <button type="submit" disabled={submitting} className="btn-gold w-full">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? "Enviando..." : "Enviar Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
