import { useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import {
  Loader2, AlertCircle, Calendar, Save, RefreshCw,
  ChevronDown, ChevronRight as ChevronRightIcon
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface IProject { id: string; codigo: string; descripcion: string; }

interface IGanttItem {
  id: string;
  chapterId: string | null;
  codigoPartida: string | null;
  numeroPar: number;
  apuDescripcion: string | null;
  apuCodigo: string | null;
  cantidad: string;
  unidad: string | null;
  montoTotal: string;
  duracionDias: string | null;
  totalDias: number;
  fechaInicioPartida: string | null;
  fechaFin: string | null;
}

interface ICapitulo {
  id: string;
  numero: number;
  descripcion: string;
  partidas: IGanttItem[];
}

interface ICronogramaData {
  project: IProject;
  capitulos: ICapitulo[];
  projectStart: string | null;
  projectEnd: string | null;
}

// ─── Gantt bar renderer ───────────────────────────────────────────────────────
function GanttBar({
  item,
  projectStart,
  totalProjectDays,
}: {
  item: IGanttItem;
  projectStart: Date;
  totalProjectDays: number;
}) {
  if (!item.fechaInicioPartida || item.totalDias === 0) return (
    <div className="flex items-center h-8 text-xs text-muted-foreground italic px-2">Sin programar</div>
  );

  const start = new Date(item.fechaInicioPartida);
  const offsetDays = Math.max(0, Math.round((start.getTime() - projectStart.getTime()) / 86400000));
  const leftPct = (offsetDays / totalProjectDays) * 100;
  const widthPct = Math.max(0.5, (item.totalDias / totalProjectDays) * 100);

  // Color by duration length
  const barColor = item.totalDias <= 7
    ? "bg-emerald-500"
    : item.totalDias <= 30
    ? "bg-blue-500"
    : item.totalDias <= 90
    ? "bg-amber-500"
    : "bg-red-500";

  return (
    <div className="relative h-8 w-full">
      <div
        className={`absolute top-1.5 h-5 rounded-full ${barColor} opacity-80 flex items-center px-2 overflow-hidden`}
        style={{ left: `${Math.min(leftPct, 95)}%`, width: `${Math.min(widthPct, 100 - Math.min(leftPct, 95))}%`, minWidth: "8px" }}
        title={`Inicio: ${item.fechaInicioPartida} — Fin: ${item.fechaFin} (${item.totalDias} días)`}
      >
        {widthPct > 8 && (
          <span className="text-white text-[10px] font-medium truncate">{item.totalDias}d</span>
        )}
      </div>
    </div>
  );
}

// ─── Month header for Gantt ───────────────────────────────────────────────────
function GanttHeader({ projectStart, totalProjectDays }: { projectStart: Date; totalProjectDays: number }) {
  const months: { label: string; widthPct: number }[] = [];
  const cursor = new Date(projectStart);
  cursor.setDate(1);

  let accDays = 0;
  while (accDays < totalProjectDays) {
    const monthStart = new Date(cursor);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const remainingDays = totalProjectDays - accDays;
    const visibleDays = Math.min(daysInMonth, remainingDays);
    months.push({
      label: cursor.toLocaleDateString("es-VE", { month: "short", year: "2-digit" }),
      widthPct: (visibleDays / totalProjectDays) * 100,
    });
    accDays += daysInMonth;
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div className="flex h-6 bg-muted/50 border-b border-border">
      {months.map((m, i) => (
        <div
          key={i}
          className="border-r border-border/50 flex items-center justify-center text-[10px] text-muted-foreground font-medium overflow-hidden shrink-0"
          style={{ width: `${m.widthPct}%` }}
        >
          {m.label}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CronogramaPage() {
  const { project } = useOutletContext<{ project: IProject }>();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [localDates, setLocalDates] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["cronograma", project?.id],
    queryFn: () => api.get(`/projects/${project.id}/cronograma`).then(r => r.data as ICronogramaData),
    enabled: !!project?.id,
  });

  const saveMutation = useMutation({
    mutationFn: (items: { id: string; fechaInicioPartida: string | null }[]) =>
      api.put(`/projects/${project.id}/cronograma/bulk`, { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cronograma", project.id] });
      setLocalDates({});
      setDirty(false);
    },
  });

  // Compute span for Gantt rendering
  const { projectStart, totalProjectDays } = useMemo(() => {
    if (!data) return { projectStart: new Date(), totalProjectDays: 30 };
    const start = data.projectStart ? new Date(data.projectStart) : new Date();
    const end = data.projectEnd ? new Date(data.projectEnd) : new Date(start.getTime() + 30 * 86400000);
    const days = Math.max(30, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 14);
    return { projectStart: start, totalProjectDays: days };
  }, [data]);

  const handleDateChange = (itemId: string, date: string) => {
    setLocalDates(prev => ({ ...prev, [itemId]: date }));
    setDirty(true);
  };

  const handleSave = () => {
    const items = Object.entries(localDates).map(([id, fechaInicioPartida]) => ({
      id,
      fechaInicioPartida: fechaInicioPartida || null,
    }));
    saveMutation.mutate(items);
  };

  const getItemDate = (item: IGanttItem) =>
    localDates[item.id] !== undefined ? localDates[item.id] : item.fechaInicioPartida ?? "";

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
      <Loader2 className="h-5 w-5 animate-spin" /> Cargando cronograma...
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center gap-2 text-red-400 py-10 px-6">
      <AlertCircle className="h-5 w-5" />
      No se pudo cargar el cronograma. Verifica que el proyecto tenga partidas con APU asignado.
    </div>
  );

  const { capitulos } = data;
  const totalItems = capitulos.reduce((acc, c) => acc + c.partidas.length, 0);
  const programmed = capitulos.reduce(
    (acc, c) => acc + c.partidas.filter(p => p.fechaInicioPartida || localDates[p.id]).length, 0
  );
  const pctProgrammed = totalItems > 0 ? Math.round((programmed / totalItems) * 100) : 0;

  // Total monto ponderado
  const totalMonto = capitulos.reduce(
    (acc, ch) => acc + ch.partidas.reduce((a, p) => a + Number(p.montoTotal ?? 0), 0), 0
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Cronograma de Obras
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {programmed} de {totalItems} partidas programadas
            {data.projectStart && (
              <> · Inicio: <span className="font-mono">{data.projectStart}</span>
              {data.projectEnd && <> — Fin: <span className="font-mono">{data.projectEnd}</span></>}
              </>
            )}
          </p>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Guardando...</>
              : <><Save className="h-4 w-4" /> Guardar cambios</>
            }
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Avance de programación</span>
          <span className="font-semibold">{pctProgrammed}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pctProgrammed}%` }}
          />
        </div>
      </div>

      {/* Gantt Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Split layout: left info + right gantt */}
        <div className="flex">
          {/* ── Left: Item info ──────────────────────────────────── */}
          <div className="w-[480px] shrink-0 border-r border-border">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_80px_80px_120px] bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
              <div className="px-4 py-3">Partida</div>
              <div className="px-2 py-3 text-right">Días</div>
              <div className="px-2 py-3 text-right">Monto</div>
              <div className="px-3 py-3 text-center">Inicio</div>
            </div>

            {capitulos.map((cap) => {
              const isCollapsed = collapsed[cap.id];
              const capDays = cap.partidas.reduce((a, p) => a + p.totalDias, 0);
              const capMonto = cap.partidas.reduce((a, p) => a + Number(p.montoTotal ?? 0), 0);

              return (
                <div key={cap.id}>
                  {/* Chapter row */}
                  <div
                    className="grid grid-cols-[1fr_80px_80px_120px] bg-muted/30 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setCollapsed(prev => ({ ...prev, [cap.id]: !prev[cap.id] }))}
                  >
                    <div className="px-3 py-2.5 flex items-center gap-2 font-semibold text-sm text-foreground">
                      {isCollapsed
                        ? <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                      <span className="text-primary font-mono text-xs">{cap.numero}.</span>
                      <span className="truncate text-xs">{cap.descripcion}</span>
                    </div>
                    <div className="px-2 py-2.5 text-right text-xs text-muted-foreground">{capDays}d</div>
                    <div className="px-2 py-2.5 text-right text-xs text-muted-foreground font-mono">
                      {formatCurrency(capMonto)}
                    </div>
                    <div className="px-3 py-2.5" />
                  </div>

                  {!isCollapsed && cap.partidas.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_80px_80px_120px] border-b border-border/60 hover:bg-muted/10 transition-colors"
                    >
                      <div className="px-4 py-2 flex flex-col justify-center min-w-0">
                        <span className="font-mono text-[10px] text-muted-foreground">{item.codigoPartida ?? `P${item.numeroPar}`}</span>
                        <span className="text-xs text-foreground truncate">{item.apuDescripcion ?? "—"}</span>
                      </div>
                      <div className="px-2 py-2 text-right text-xs font-mono text-muted-foreground self-center">
                        {item.totalDias > 0 ? `${item.totalDias}d` : "—"}
                      </div>
                      <div className="px-2 py-2 text-right text-xs font-mono text-muted-foreground self-center">
                        {formatCurrency(Number(item.montoTotal ?? 0))}
                      </div>
                      <div className="px-3 py-2 self-center">
                        <input
                          type="date"
                          value={getItemDate(item)}
                          onChange={(e) => handleDateChange(item.id, e.target.value)}
                          className="w-full text-xs bg-card border border-border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Footer total */}
            <div className="grid grid-cols-[1fr_80px_80px_120px] bg-muted/40 border-t border-border text-xs font-bold">
              <div className="px-4 py-3 text-foreground">TOTAL PROYECTO</div>
              <div className="px-2 py-3 text-right text-muted-foreground">—</div>
              <div className="px-2 py-3 text-right text-foreground font-mono">{formatCurrency(totalMonto)}</div>
              <div className="px-3 py-3" />
            </div>
          </div>

          {/* ── Right: Gantt bars ─────────────────────────────────── */}
          <div className="flex-1 min-w-0 overflow-x-auto">
            {/* Month header */}
            <GanttHeader projectStart={projectStart} totalProjectDays={totalProjectDays} />

            {capitulos.map((cap) => {
              const isCollapsed = collapsed[cap.id];
              // Merge local dates into items for rendering
              const mergedItems = cap.partidas.map(p => ({
                ...p,
                fechaInicioPartida: localDates[p.id] !== undefined ? localDates[p.id] || null : p.fechaInicioPartida,
              }));

              // Chapter span
              const capStart = mergedItems.filter(p => p.fechaInicioPartida).map(p => new Date(p.fechaInicioPartida!).getTime());
              const capEnd = mergedItems.filter(p => p.fechaFin).map(p => new Date(p.fechaFin!).getTime());
              const capStartDate = capStart.length ? new Date(Math.min(...capStart)) : null;
              const capEndDate = capEnd.length ? new Date(Math.max(...capEnd)) : null;
              const capTotalDias = capEndDate && capStartDate
                ? Math.ceil((capEndDate.getTime() - capStartDate.getTime()) / 86400000) + 1
                : 0;

              const capItemFake = capStartDate ? {
                ...mergedItems[0],
                fechaInicioPartida: capStartDate.toISOString().split("T")[0],
                totalDias: capTotalDias,
                fechaFin: capEndDate?.toISOString().split("T")[0] ?? null,
              } : null;

              return (
                <div key={cap.id}>
                  {/* Chapter bar row */}
                  <div className="h-[37px] border-b border-border bg-muted/20 flex items-center px-2">
                    {capItemFake ? (
                      <GanttBar item={capItemFake} projectStart={projectStart} totalProjectDays={totalProjectDays} />
                    ) : (
                      <span className="text-xs text-muted-foreground italic px-2">Sin partidas programadas</span>
                    )}
                  </div>

                  {!isCollapsed && mergedItems.map((item) => (
                    <div key={item.id} className="h-[45px] border-b border-border/60 flex items-center hover:bg-muted/10">
                      <GanttBar item={item} projectStart={projectStart} totalProjectDays={totalProjectDays} />
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Footer spacer */}
            <div className="h-[37px] bg-muted/40 border-t border-border" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> ≤ 7 días</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> 8–30 días</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> 31–90 días</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> {"> 90 días"}</span>
      </div>
    </div>
  );
}
