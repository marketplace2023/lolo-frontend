import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import { ArrowLeft, Plus, Trash2, Package, Wrench, HardHat, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/FormPrimitives";
import { InsumoSelectorDialog } from "./components/InsumoSelectorDialog";
import { cn } from "@/utils/cn";

type TTipo = "materiales" | "equipos" | "manoDeObra";

interface IInsumoLocal {
  tempId: string;
  insumoId: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  tipo: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

interface IPartidaForm {
  codigo: string;
  cobertura: string;
  descripcion: string;
  unidad: string;
  rendimiento: string;
  esSubcontrato: boolean;
}

const TABS: { key: TTipo; label: string; icon: typeof Package }[] = [
  { key: "materiales",  label: "Materiales",   icon: Package  },
  { key: "equipos",     label: "Equipos",       icon: Wrench   },
  { key: "manoDeObra",  label: "Mano de Obra",  icon: HardHat  },
];

export function NewItemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<IPartidaForm>({ codigo: "", cobertura: "", descripcion: "", unidad: "", rendimiento: "", esSubcontrato: false });
  const [insumos, setInsumos] = useState<IInsumoLocal[]>([]);
  const [activeTab, setActiveTab] = useState<TTipo>("materiales");
  const [selectorOpen, setSelectorOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: partida } = await api.post("/items", {
        ...form,
        rendimiento: Number(form.rendimiento) || 0,
      });
      if (insumos.length > 0) {
        await Promise.all(
          insumos.map(ins =>
            api.post(`/apu/${partida.id}/insumos`, {
              insumoId: ins.insumoId,
              tipo: ins.tipo,
              cantidad: String(ins.cantidad),
            })
          )
        );
      }
      return partida;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate("/master-data/items");
    },
  });

  const handleSelectInsumo = (insumoId: string, tipo: string, cantidad: string, insumoData?: any) => {
    if (!insumoData) return;
    const qty = Number(cantidad);
    const cost = Number(insumoData.precio ?? 0);
    setInsumos(prev => [...prev, {
      tempId: `${insumoId}-${Date.now()}`,
      insumoId,
      codigo: insumoData.codigo,
      descripcion: insumoData.descripcion,
      unidad: insumoData.unidad,
      tipo,
      cantidad: qty,
      costoUnitario: cost,
      subtotal: qty * cost,
    }]);
    setSelectorOpen(false);
  };

  const removeInsumo = (tempId: string) => setInsumos(prev => prev.filter(i => i.tempId !== tempId));

  const byTab = insumos.filter(i =>
    activeTab === "materiales" ? i.tipo === "material" :
    activeTab === "equipos" ? i.tipo === "equipo" : i.tipo === "manoDeObra"
  );

  const totalMat = insumos.filter(i => i.tipo === "material").reduce((s, i) => s + i.subtotal, 0);
  const totalEq  = insumos.filter(i => i.tipo === "equipo").reduce((s, i) => s + i.subtotal, 0);
  const totalMO  = insumos.filter(i => i.tipo === "manoDeObra").reduce((s, i) => s + i.subtotal, 0);
  const totalPU  = totalMat + totalEq + totalMO;

  const step1Valid = form.codigo.trim() && form.descripcion.trim();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/master-data/items")} className="p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Nueva Partida (APU)</h1>
          <p className="text-sm text-muted-foreground">Complete los datos y agregue los insumos antes de guardar</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3">
        {[{ n: 1, label: "Datos Básicos" }, { n: 2, label: "Insumos APU" }].map((s, idx) => (
          <div key={s.n} className="flex items-center gap-3">
            <button
              onClick={() => s.n === 2 && step1Valid ? setStep(2) : s.n === 1 ? setStep(1) : null}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                step === s.n ? "bg-primary text-primary-foreground shadow-md" :
                s.n < step ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
              )}
            >
              {s.n < step ? <CheckCircle2 size={15} /> : <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">{s.n}</span>}
              {s.label}
            </button>
            {idx < 1 && <ChevronRight size={16} className="text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Datos básicos ── */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-foreground">Datos de la Partida</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "codigo",    label: "Código *",         placeholder: "EDF0001" },
              { key: "cobertura", label: "Código COVENIN",   placeholder: "04-001-001" },
              { key: "unidad",    label: "Unidad",           placeholder: "M2, M3, ML, GLB..." },
              { key: "rendimiento", label: "Rendimiento",    placeholder: "0", type: "number" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{f.label}</label>
                <input
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Descripción *</label>
              <textarea
                placeholder="Descripción completa de la partida"
                value={form.descripcion}
                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" id="esSub" checked={form.esSubcontrato} onChange={e => setForm(prev => ({ ...prev, esSubcontrato: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <label htmlFor="esSub" className="text-sm text-foreground">¿Es subcontrato?</label>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setStep(2)} disabled={!step1Valid}>
              Siguiente: Agregar Insumos <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Insumos APU ── */}
      {step === 2 && (
        <>
          {/* Price summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Materiales",  value: totalMat, color: "text-blue-400" },
              { label: "Equipos",     value: totalEq,  color: "text-amber-400" },
              { label: "Mano de Obra",value: totalMO,  color: "text-emerald-400" },
              { label: "Precio Unitario", value: totalPU, color: "text-primary", bold: true },
            ].map(c => (
              <div key={c.label} className={cn("bg-card border border-border rounded-xl p-4", c.bold && "border-primary/30")}>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className={cn("text-lg font-mono font-bold", c.color)}>{formatCurrency(c.value.toString(), "")}</p>
              </div>
            ))}
          </div>

          {/* Insumos editor */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/30">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                    activeTab === t.key ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <t.icon size={14} />
                  {t.label} ({insumos.filter(i => i.tipo === (t.key === "materiales" ? "material" : t.key === "equipos" ? "equipo" : "manoDeObra")).length})
                </button>
              ))}
            </div>

            <div className="p-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">{TABS.find(t => t.key === activeTab)?.label}</h3>
              <Button size="sm" variant="secondary" onClick={() => setSelectorOpen(true)}>
                <Plus size={14} /> Añadir
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/30">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Código</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Descripción</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Und.</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Cantidad</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Costo Unit.</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Subtotal</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {byTab.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Sin insumos. Usa "Añadir" para agregar.</td></tr>
                  ) : byTab.map(ins => (
                    <tr key={ins.tempId} className="border-b border-border/50 hover:bg-accent/20">
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{ins.codigo}</td>
                      <td className="px-4 py-2 max-w-xs truncate" title={ins.descripcion}>{ins.descripcion}</td>
                      <td className="px-4 py-2 text-xs">{ins.unidad}</td>
                      <td className="px-4 py-2 text-right font-mono">{ins.cantidad.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                      <td className="px-4 py-2 text-right font-mono">{formatCurrency(ins.costoUnitario.toString(), "")}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">{formatCurrency(ins.subtotal.toString(), "")}</td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => removeInsumo(ins.tempId)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft size={14} /> Volver</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>
              <CheckCircle2 size={16} /> Crear Partida
            </Button>
          </div>
        </>
      )}

      {/* Selector dialog — passes insumoData back via onSelect */}
      <InsumoSelectorDialog
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        tipo={activeTab}
        onSelect={(insumoId, tipo, cantidad, insumoData) => {
          handleSelectInsumo(insumoId, tipo, cantidad, insumoData);
        }}
        isSubmitting={false}
      />
    </div>
  );
}
