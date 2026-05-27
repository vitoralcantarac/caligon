import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FileSearch, Settings, ChevronLeft,
  ChevronRight, Plus
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/clients", icon: Users, label: "Clientes" },
  { to: "/analyses", icon: FileSearch, label: "Análises" },
  { to: "/settings", icon: Settings, label: "Configurações" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 border-r"
      style={{
        width: collapsed ? 72 : 260,
        background: "hsl(var(--sidebar-background))",
        borderColor: "hsl(var(--sidebar-border))",
      }}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-lg font-bold" style={{ background: "var(--gradient-gold)", color: "hsl(var(--navy))" }}>
          C
        </div>
        {!collapsed && (
          <span className="font-display text-lg tracking-wide" style={{ color: "hsl(var(--sidebar-accent-foreground))" }}>
            CALIGON
          </span>
        )}
      </div>

      <div className="px-3 mt-4">
        <NavLink to="/analyses/new" className={`btn-gold w-full ${collapsed ? "!px-0 justify-center" : ""}`}>
          <Plus className="w-4 h-4" />
          {!collapsed && <span>Nova Análise</span>}
        </NavLink>
      </div>

      <nav className="flex-1 px-3 mt-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
          return (
            <NavLink key={to} to={to} className={`sidebar-item ${isActive ? "active" : ""} ${collapsed ? "justify-center !px-0" : ""}`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <button onClick={() => setCollapsed(!collapsed)} className="sidebar-item w-full justify-center" aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
