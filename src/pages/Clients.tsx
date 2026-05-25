import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Building2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("clients").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setClients(data || []); setLoading(false); });
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.niche.toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle: Record<string, string> = {
    ativo: 'badge-success', inativo: 'badge-destructive', prospecto: 'badge-warning',
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} empresas cadastradas</p>
        </div>
        <Link to="/analyses/new" className="btn-gold"><Plus className="w-4 h-4" /> Novo Cliente</Link>
      </div>
      <div className="card-premium">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou nicho..." className="bg-transparent text-sm flex-1 outline-none placeholder:text-muted-foreground" />
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center"><p className="text-muted-foreground text-sm">Nenhum cliente cadastrado.</p></div>
        ) : (
          <table className="table-premium">
            <thead><tr><th>Empresa</th><th>Nicho</th><th>Contato</th><th>Funcionários</th><th>Faturamento</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted text-muted-foreground"><Building2 className="w-4 h-4" /></div>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge-info">{client.niche}</span></td>
                  <td className="text-foreground">{client.contact || "—"}</td>
                  <td className="text-foreground">{client.employees || "—"}</td>
                  <td className="font-medium text-foreground">{client.revenue || "—"}</td>
                  <td><span className={statusStyle[client.status] || 'badge-info'}>{client.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
