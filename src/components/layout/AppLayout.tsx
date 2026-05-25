import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Search, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout() {
  const { profile, role, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const roleLabels: Record<string, string> = {
    socio: "Sócio", analista: "Analista", consultor: "Consultor",
    comercial: "Comercial", gestor: "Gestor", cliente: "Cliente",
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar cliente, análise ou processo..." className="bg-transparent text-sm flex-1 outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.full_name || "Carregando..."}</p>
                <p className="text-xs text-muted-foreground">{role ? roleLabels[role] || role : ""}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-medium text-sm">
                {initials}
              </div>
              <button onClick={signOut} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Sair">
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
