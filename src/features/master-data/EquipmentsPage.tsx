import { MasterDataTable } from "@/components/data-table/MasterDataTable";
import { formatCurrency } from "@/utils/cn";

interface IEquipment {
  id: string;
  codigo: string;
  codigoFamilia: string;
  descripcion: string;
  unidad: string;
  precio: string | number;
  costoHorario: string | number;
  costoDiario: string | number;
  depreciacion: string | number;
  transporte: string | null;
  proveedor: string | null;
  importado: boolean;
  porcentajeNacional: string | number;
  tipoEquipo: number;
  fechaActualizacion: string | null;
}

export function EquipmentsPage() {
  return (
    <MasterDataTable<IEquipment>
      title="Equipos"
      queryKey="equipments"
      endpoint="/equipments"
      searchPlaceholder="Buscar por código o descripción..."
      formFields={[
        { key: "codigo",             label: "Código",             required: true, placeholder: "EQU001" },
        { key: "descripcion",        label: "Descripción",        required: true, placeholder: "Descripción del equipo" },
        { key: "unidad",             label: "Unidad",             placeholder: "Hr, Día, Mes..." },
        { key: "precio",             label: "Precio",             type: "number", placeholder: "0.0000" },
        { key: "costoHorario",       label: "Costo Horario",      type: "number", placeholder: "0.0000" },
        { key: "costoDiario",        label: "Costo Diario",       type: "number", placeholder: "0.0000" },
        { key: "depreciacion",       label: "Depreciación",       type: "number", placeholder: "0.0000", hint: "Factor de depreciación (ej: 0.0025)" },
        { key: "transporte",         label: "Transporte",         placeholder: "Costo de transporte" },
        { key: "proveedor",          label: "Proveedor",          placeholder: "Nombre del proveedor" },
        { key: "porcentajeNacional", label: "% Nacional",         type: "number", placeholder: "100" },
        { key: "importado",          label: "¿Es importado?",     type: "checkbox" },
        { key: "fechaActualizacion", label: "Fecha Actualización",type: "date" },
      ]}
      columns={[
        { key: "codigo",             label: "Código" },
        { key: "codigoFamilia",      label: "Flia." },
        { key: "descripcion",        label: "Descripción", render: (r) => <span className="max-w-xs truncate block" title={r.descripcion}>{r.descripcion}</span> },
        { key: "unidad",             label: "Unidad" },
        { key: "costoHorario",       label: "C/Hora",      render: (r) => <span className="font-mono">{formatCurrency(r.costoHorario, "")}</span> },
        { key: "costoDiario",        label: "C/Día",       render: (r) => <span className="font-mono">{formatCurrency(r.costoDiario, "")}</span> },
        { key: "depreciacion",       label: "Depreciación",render: (r) => Number(r.depreciacion).toFixed(4) },
        { key: "fechaActualizacion", label: "Fecha",       render: (r) => r.fechaActualizacion ? new Date(r.fechaActualizacion).toLocaleDateString("es-VE") : "—" },
        { key: "proveedor",          label: "Proveedor",   render: (r) => <span className="max-w-[180px] truncate block text-xs" title={r.proveedor ?? ""}>{r.proveedor ?? "—"}</span> },
      ]}
    />
  );
}
