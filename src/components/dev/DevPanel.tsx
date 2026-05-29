import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDevMode } from "@/contexts/DevContext";
import { ArrowLeftRight, ShieldCheck, User } from "lucide-react";

export function DevPanel() {
  const { profile } = useAuth();
  const { viewMode, setViewMode } = useDevMode();
  const navigate = useNavigate();

  if ((profile as any)?.user_type !== "internal") return null;

  const isClient = viewMode === "client";

  const toggle = () => {
    const next = isClient ? "internal" : "client";
    setViewMode(next);
    navigate(next === "internal" ? "/" : "/dashboard", { replace: true });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-background border border-border rounded-full shadow-lg px-4 py-2">
        {isClient ? (
          <User className="w-3.5 h-3.5 text-blue-400" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span className="text-xs font-mono text-muted-foreground">
          {isClient ? "cliente" : "admin"}
        </span>
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <ArrowLeftRight className="w-3 h-3" />
          {isClient ? "Voltar para admin" : "Ver como cliente"}
        </button>
      </div>
    </div>
  );
}
