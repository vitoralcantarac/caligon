import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Senha deve ter no mínimo 6 caracteres");
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setDone(true);
    setTimeout(() => navigate("/", { replace: true }), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--gradient-premium)" }}>
      <div className="w-full max-w-md card-premium p-8">
        {done ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-4" />
            <h2 className="font-display text-xl text-foreground">Senha atualizada!</h2>
            <p className="text-sm text-muted-foreground mt-2">Redirecionando...</p>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl text-foreground text-center mb-6">Nova Senha</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nova Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-accent transition-colors" placeholder="Mínimo 6 caracteres" />
              </div>
              <button type="submit" disabled={submitting} className="btn-gold w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? "Salvando..." : "Atualizar Senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
