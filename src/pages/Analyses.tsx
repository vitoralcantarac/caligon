import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { STATUS_COLOR, STATUS_LABELS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export default function Analyses() {
  const { data: analyses = [], isLoading: loading } = useQuery({
    queryKey: ['analyses-list'],
    queryFn: async () => {
      const { data } = await supabase.from("analyses").select("*, clients(name, niche)")
        .order("updated_at", { ascending: false });
      return data || [];
    },
  });

  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? analyses : analyses.filter(a => a.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">Análises</h1>
          <p className="text-sm text-muted-foreground mt-1">{analyses.length} diagnósticos</p>
        </div>
        <Link to="/analyses/new" className="btn-gold"><Plus className="w-4 h-4" /> Nova Análise</Link>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
          Todas ({analyses.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = analyses.filter(a => a.status === key).length;
          if (count === 0) return null;
          return (
            <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {label} ({count})
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <p className="text-muted-foreground">Nenhuma análise encontrada.</p>
          <Link to="/analyses/new" className="btn-gold mt-4 inline-flex">Criar primeira análise</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(analysis => (
            <Link key={analysis.id} to={`/analyses/${analysis.id}`} className="card-premium p-5 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground group-hover:text-accent transition-colors">{analysis.clients?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{analysis.clients?.niche}</p>
                </div>
                <span className={STATUS_COLOR[analysis.status]}>{STATUS_LABELS[analysis.status]}</span>
              </div>
              <p className="text-sm text-foreground mt-3">{analysis.process}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1"><span>Progresso</span><span>{analysis.progress}%</span></div>
                <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${analysis.progress}%` }} /></div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  <span>v{analysis.version}</span>
                </div>
                {Number(analysis.estimated_loss) > 0 && <span className="text-xs font-semibold text-destructive">-R$ {(Number(analysis.estimated_loss) / 1000).toFixed(1)}k/mês</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
