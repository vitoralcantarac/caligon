import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Search, CreditCard, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Meus Diagnósticos" },
  { to: "/novo-diagnostico", icon: Search, label: "Novo Diagnóstico" },
  { to: "/planos", icon: CreditCard, label: "Planos" },
  { to: "/minha-conta", icon: Settings, label: "Minha Conta" },
];

export default function ClientLayout() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("clients")
      .select("name")
      .eq("email", user.email!)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCompanyName(data.name);
      });
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/entrar");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">CALIGON</h1>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="mb-3">
          <p className="text-sm font-medium truncate">{profile?.full_name || user?.email}</p>
          {companyName && <p className="text-xs text-muted-foreground truncate">{companyName}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-destructive hover:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r bg-card flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b bg-card z-40 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-primary">CALIGON</h1>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-14">
          <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full bg-card flex flex-col border-r">
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="flex-1 md:ml-0 pt-14 md:pt-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
