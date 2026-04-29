import { useOutletContext } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import { Loader2, TrendingUp, AlertCircle, FileText, Layers, Banknote } from "lucide-react";

export function ProjectDashboard() {
  const { project } = useOutletContext<{ project: any }>();
  const id = project?.id;

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["project-dashboard", id],
    queryFn: () => api.get(`/projects/${id}/dashboard`).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold">Avance Físico Financiero</h2>
            <p className="text-sm text-muted-foreground">Proporción del monto cobrado respecto al contrato actualizado</p>
          </div>
          <p className="text-2xl font-bold font-mono text-primary">
            {dashboard.porcentajeAvanceFisico.toFixed(2)}%
          </p>
        </div>
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden mt-4">
          <div 
            className="bg-primary h-full transition-all duration-1000 ease-in-out" 
            style={{ width: `${Math.min(100, dashboard.porcentajeAvanceFisico)}%` }} 
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Monto Contrato Base</p>
            <p className="text-xl font-bold font-mono mt-1 text-foreground">
              {formatCurrency(dashboard.montoContrato, project?.moneda?.simbolo)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Var: {formatCurrency(dashboard.montoVariaciones, "")} · Extras: {formatCurrency(dashboard.montoExtra, "")}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Monto Valuado (Cobrado)</p>
            <p className="text-xl font-bold font-mono mt-1 text-foreground">
              {formatCurrency(dashboard.montoValuado, project?.moneda?.simbolo)}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Saldo por Cobrar</p>
            <p className="text-xl font-bold font-mono mt-1 text-foreground">
              {formatCurrency(dashboard.montoTotalActualizado - dashboard.montoValuado, project?.moneda?.simbolo)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Actualizado: {formatCurrency(dashboard.montoTotalActualizado, "")}
            </p>
          </div>
        </div>
      </div>

      {/* Top Partidas Pendientes */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="text-muted-foreground" size={18} />
          <h2 className="text-md font-semibold">Top Partidas con Más Saldo Pendiente</h2>
        </div>
        
        {dashboard.topPendientes.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No hay partidas con saldo pendiente. ¡Proyecto completado!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-4 py-2 text-left font-medium">Código Partida</th>
                  <th className="px-4 py-2 text-right font-medium">Avance</th>
                  <th className="px-4 py-2 text-right font-medium">Cant. Pendiente</th>
                  <th className="px-4 py-2 text-right font-medium">Monto Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topPendientes.map((p: any) => (
                  <tr key={p.codigo} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="px-4 py-3 font-mono font-medium text-primary">{p.codigo}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">{p.pct.toFixed(1)}%</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, p.pct)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {p.pendiente.toLocaleString("es-VE", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-500">
                      {formatCurrency(p.montoPendiente, project?.moneda?.simbolo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
