import { MasterDataTable } from "@/components/data-table/MasterDataTable";
import { formatCurrency } from "@/utils/cn";

interface IMaterial {
  id: string;
  codigo: string;
  codigoFamilia: string;
  descripcion: string;
  unidad: string;
  precio: string | number;
  desperdicio: string | number;
  proveedor: string | null;
  consumo: string | null;
  importado: boolean;
  porcentajeNacional: string | number;
  fechaActualizacion: string | null;
}

export function MaterialsPage() {
  return (
    <MasterDataTable<IMaterial>
      title="Materiales"
      queryKey="materials"
      endpoint="/materials"
      searchPlaceholder="Buscar por código o descripción..."
      formFields={[
        { key: "codigo",              label: "Código",          required: true, placeholder: "MAT0001" },
        { key: "descripcion",         label: "Descripción",     required: true, placeholder: "Descripción del material" },
        { key: "unidad",              label: "Unidad",          placeholder: "Kg, m3, m2, ml, pto..." },
        { key: "precio",              label: "Costo",           type: "number", placeholder: "0.0000" },
        { key: "desperdicio",         label: "% Desperdicio",   type: "number", placeholder: "0",    hint: "Porcentaje de desperdicio (ej: 5 = 5%)" },
        { key: "proveedor",           label: "Proveedor",       placeholder: "Nombre del proveedor" },
        { key: "consumo",             label: "Consumo",         placeholder: "Consumo del material" },
        { key: "porcentajeNacional",  label: "% Nacional",      type: "number", placeholder: "100" },
        { key: "importado",           label: "¿Es importado?",  type: "checkbox" },
        { key: "fechaActualizacion",  label: "Fecha Actualización", type: "date" },
      ]}
      columns={[
        { key: "codigo",             label: "Código",    },
        { key: "codigoFamilia",      label: "Flia.",     },
        { key: "descripcion",        label: "Descripción", render: (r) => <span className="max-w-xs truncate block" title={r.descripcion}>{r.descripcion}</span> },
        { key: "unidad",             label: "Unidad",    },
        { key: "precio",             label: "Costo",     render: (r) => <span className="font-mono">{formatCurrency(r.precio, "")}</span> },
        { key: "fechaActualizacion", label: "Fecha",     render: (r) => r.fechaActualizacion ? new Date(r.fechaActualizacion).toLocaleDateString("es-VE") : "—" },
        { key: "desperdicio",        label: "%Desp.",    render: (r) => `${Number(r.desperdicio).toFixed(1)}%` },
        { key: "proveedor",          label: "Proveedor", render: (r) => <span className="max-w-[180px] truncate block text-xs" title={r.proveedor ?? ""}>{r.proveedor ?? "—"}</span> },
      ]}
    />
  );
}
