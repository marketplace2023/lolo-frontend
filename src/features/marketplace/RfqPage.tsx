import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import {
  Plus, Loader2, AlertCircle, FileText, MapPin, Calendar,
  ChevronDown, ChevronRight, Send, CheckCircle, XCircle,
  Clock, Briefcase, Building2
} from "lucide-react";

interface IRfq {
  id: string; titulo: string; descripcion: string | null;
  especialidad: string | null; estadoUbicacion: string | null;
  presupuestoEstimado: string | null; fechaLimite: string | null;
  estatus: string; createdAt: string;
  companyNombre: string | null; companyEstado: string | null;
  totalBids?: number;
}

interface IBid {
  id: string; montoPropuesto: string | null; plazosDias: number | null;
  notasTecnicas: string | null; estatus: string; createdAt: string;
  companyNombre: string | null; companyEstado: string | null; companyRating: string | null;
}

const ESPECIALIDADES = [
  "Residencial","Comercial","Industrial","Infraestructura",
  "Vialidad","Hidráulica","Eléctrica","Acabados","Remodelación"
];

const ESTADOS_VE = [
  "Amazonas","Anzoátegui","Apure","Aragua","Barinas","Bolívar",
  "Carabobo","Cojedes","Delta Amacuro","Distrito Capital","Falcón",
  "Guárico","Lara","Mérida","Miranda","Monagas","Nueva Esparta",
  "Portuguesa","Sucre","Táchira","Trujillo","Vargas","Yaracuy","Zulia"
];

function EstatusTag({ estatus }: { estatus: string }) {
  const map: Record<string, string> = {
    abierta: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    cerrada: "text-muted-foreground bg-muted/30 border-border",
    adjudicada: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    enviada: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    aceptada: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    rechazada: "text-red-400 bg-red-500/10 border-red-500/30",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${map[estatus] ?? "text-muted-foreground bg-muted/30 border-border"}`}>
      {estatus}
    </span>
  );
}

function BidRow({ bid, rfqOwnerId, rfqId, isOwner }: {
  bid: IBid; rfqOwnerId: string | null; rfqId: string; isOwner: boolean;
}) {
  const qc = useQueryClient();
  const adjMutation = useMutation({
    mutationFn: (estatus: "aceptada" | "rechazada") =>
      api.put(`/marketplace/rfq/${rfqId}/bids/${bid.id}`, { estatus }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rfq-bids", rfqId] }),
  });

  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg text-sm">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
        {(bid.companyNombre ?? "?")[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-xs">{bid.companyNombre ?? "Empresa"}</p>
        <p className="text-xs text-muted-foreground">{bid.companyEstado ?? "—"}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm text-foreground">{bid.montoPropuesto ? formatCurrency(Number(bid.montoPropuesto)) : "—"}</p>
        <p className="text-xs text-muted-foreground">{bid.plazosDias ? `${bid.plazosDias} días` : "—"}</p>
      </div>
      <EstatusTag estatus={bid.estatus} />
      {isOwner && bid.estatus === "enviada" && (
        <div className="flex gap-1">
          <button onClick={() => adjMutation.mutate("aceptada")} disabled={adjMutation.isPending}
            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Aceptar">
            <CheckCircle className="h-4 w-4" />
          </button>
          <button onClick={() => adjMutation.mutate("rechazada")} disabled={adjMutation.isPending}
            className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-colors" title="Rechazar">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function RfqCard({ rfq, myCompanyId }: { rfq: IRfq; myCompanyId: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidForm, setBidForm] = useState({ montoPropuesto: "", plazosDias: "", notasTecnicas: "" });
  const qc = useQueryClient();

  const isOwner = rfq.companyId === myCompanyId;

  const { data: bidsData } = useQuery({
    queryKey: ["rfq-bids", rfq.id],
    queryFn: () => api.get(`/marketplace/rfq/${rfq.id}/bids`).then(r => r.data as { data: IBid[] }),
    enabled: expanded,
  });

  const bidMutation = useMutation({
    mutationFn: () => api.post(`/marketplace/rfq/${rfq.id}/bids`, {
      montoPropuesto: bidForm.montoPropuesto || null,
      plazosDias: bidForm.plazosDias ? Number(bidForm.plazosDias) : null,
      notasTecnicas: bidForm.notasTecnicas || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rfq-bids", rfq.id] });
      setShowBidForm(false);
      setBidForm({ montoPropuesto: "", plazosDias: "", notasTecnicas: "" });
    },
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <EstatusTag estatus={rfq.estatus} />
              {rfq.especialidad && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{rfq.especialidad}</span>
              )}
            </div>
            <h3 className="font-semibold text-foreground text-sm">{rfq.titulo}</h3>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
              {rfq.companyNombre && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{rfq.companyNombre}</span>}
              {rfq.estadoUbicacion && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{rfq.estadoUbicacion}</span>}
              {rfq.fechaLimite && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Límite: {rfq.fechaLimite}</span>}
              {rfq.presupuestoEstimado && (
                <span className="flex items-center gap-1 text-emerald-400">
                  ~{formatCurrency(Number(rfq.presupuestoEstimado))}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(rfq.totalBids !== undefined) && (
              <span className="text-xs text-muted-foreground">{rfq.totalBids} oferta{rfq.totalBids !== 1 ? "s" : ""}</span>
            )}
            <button onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors text-muted-foreground">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {rfq.descripcion && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{rfq.descripcion}</p>}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          {/* Bids */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Ofertas recibidas</p>
            {!bidsData ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando ofertas...
              </div>
            ) : bidsData.data.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Sin ofertas aún.</p>
            ) : (
              <div className="space-y-2">
                {bidsData.data.map(bid => (
                  <BidRow key={bid.id} bid={bid} rfqOwnerId={rfq.companyId ?? null} rfqId={rfq.id} isOwner={isOwner} />
                ))}
              </div>
            )}
          </div>

          {/* Bid form for non-owners */}
          {!isOwner && rfq.estatus === "abierta" && myCompanyId && (
            <div>
              {!showBidForm ? (
                <button onClick={() => setShowBidForm(true)}
                  className="inline-flex items-center gap-2 text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Send className="h-3.5 w-3.5" /> Enviar oferta
                </button>
              ) : (
                <div className="space-y-3 bg-muted/20 border border-border rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground">Tu oferta</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Monto propuesto</label>
                      <input type="number" placeholder="0.00" value={bidForm.montoPropuesto}
                        onChange={e => setBidForm(f => ({ ...f, montoPropuesto: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Plazo (días)</label>
                      <input type="number" placeholder="30" value={bidForm.plazosDias}
                        onChange={e => setBidForm(f => ({ ...f, plazosDias: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Notas técnicas</label>
                    <textarea value={bidForm.notasTecnicas} rows={3}
                      onChange={e => setBidForm(f => ({ ...f, notasTecnicas: e.target.value }))}
                      className="w-full px-2 py-1.5 text-xs bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => bidMutation.mutate()} disabled={bidMutation.isPending}
                      className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                      {bidMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Enviar
                    </button>
                    <button onClick={() => setShowBidForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border rounded-lg transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RfqPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | "my">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    titulo: "", descripcion: "", especialidad: "",
    estadoUbicacion: "", presupuestoEstimado: "", fechaLimite: ""
  });

  // Get own company from auth store
  const myCompanyId = (window as Record<string, unknown>).__LULO_COMPANY_ID__ as string | null ?? null;

  const { data: allRfqs, isLoading: loadingAll } = useQuery({
    queryKey: ["rfq-all"],
    queryFn: () => api.get("/marketplace/rfq").then(r => r.data as { data: IRfq[] }),
    enabled: tab === "all",
  });

  const { data: myRfqs, isLoading: loadingMy } = useQuery({
    queryKey: ["rfq-my"],
    queryFn: () => api.get("/marketplace/rfq/my").then(r => r.data as { data: IRfq[] }),
    enabled: tab === "my",
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/marketplace/rfq", {
      ...form,
      presupuestoEstimado: form.presupuestoEstimado || null,
      fechaLimite: form.fechaLimite || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rfq-all"] });
      qc.invalidateQueries({ queryKey: ["rfq-my"] });
      setShowCreate(false);
      setForm({ titulo: "", descripcion: "", especialidad: "", estadoUbicacion: "", presupuestoEstimado: "", fechaLimite: "" });
    },
  });

  const rfqs = tab === "all" ? (allRfqs?.data ?? []) : (myRfqs?.data ?? []);
  const isLoading = tab === "all" ? loadingAll : loadingMy;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" /> Solicitudes de Cotización (RFQ)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Publica solicitudes y recibe ofertas de contratistas</p>
        </div>
        <button onClick={() => setShowCreate(s => !s)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Nueva RFQ
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Nueva Solicitud de Cotización</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Título *</label>
              <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Ej: Construcción de vivienda unifamiliar 250m²" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Especialidad</label>
              <select value={form.especialidad} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground">
                <option value="">Seleccionar...</option>
                {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Estado</label>
              <select value={form.estadoUbicacion} onChange={e => setForm(f => ({ ...f, estadoUbicacion: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground">
                <option value="">Seleccionar...</option>
                {ESTADOS_VE.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Presupuesto estimado</label>
              <input type="number" value={form.presupuestoEstimado} onChange={e => setForm(f => ({ ...f, presupuestoEstimado: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Fecha límite</label>
              <input type="date" value={form.fechaLimite} onChange={e => setForm(f => ({ ...f, fechaLimite: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" placeholder="Describe los requisitos, especificaciones técnicas, alcance..." />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => createMutation.mutate()} disabled={!form.titulo || createMutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publicar RFQ
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([["all", "Todas las RFQs", Clock], ["my", "Mis solicitudes", FileText]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
          <Loader2 className="h-5 w-5 animate-spin" /> Cargando solicitudes...
        </div>
      ) : rfqs.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
          <AlertCircle className="h-10 w-10 opacity-20" />
          <p className="text-sm">{tab === "my" ? "Aún no has publicado ninguna RFQ." : "No hay solicitudes abiertas."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rfqs.map(rfq => <RfqCard key={rfq.id} rfq={rfq} myCompanyId={myCompanyId} />)}
        </div>
      )}
    </div>
  );
}
