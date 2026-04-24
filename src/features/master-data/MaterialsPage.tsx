import { MasterDataTable } from "@/components/data-table/MasterDataTable";
import { formatCurrency } from "@/utils/cn";

interface IMaterial {
  id: string; codigo: string; descripcion: string; unidad: string;
  precio: string; desperdicio: string; proveedor: string | null;
  importado: boolean; codigoFamilia: string;
}

export function MaterialsPage() {
  return (
    <MasterDataTable<IMaterial>
      title="Materiales"
      queryKey="materials"
      endpoint="/materials"
      searchPlaceholder="Buscar por código o descripción..."
      formFields={[
        { key: "codigo", label: "Código", required: true, placeholder: "MAT001" },
        { key: "descripcion", label: "Descripción", required: true, placeholder: "Descripción del material" },
        { key: "unidad", label: "Unidad", placeholder: "KG, M2, ML..." },
        { key: "precio", label: "Precio", type: "number", placeholder: "0.0000" },
        { key: "desperdicio", label: "Desperdicio (%)", type: "number", placeholder: "0", hint: "Porcentaje de desperdicio (ej: 5 = 5%)" },
        { key: "proveedor", label: "Proveedor", placeholder: "Nombre del proveedor" },
        { key: "porcentajeNacional", label: "% Nacional", type: "number", placeholder: "100" },
        { key: "importado", label: "¿Es importado?", type: "checkbox" },
      ]}
      columns={[
        { key: "codigo", label: "Código" },
        { key: "descripcion", label: "Descripción", render: (r) => <span className="max-w-xs truncate block" title={r.descripcion}>{r.descripcion}</span> },
        { key: "unidad", label: "Unidad" },
        { key: "precio", label: "Precio", render: (r) => <span className="font-mono">{formatCurrency(r.precio, "")}</span> },
        { key: "desperdicio", label: "Desp. %", render: (r) => `${Number(r.desperdicio).toFixed(1)}%` },
        { key: "codigoFamilia", label: "Familia" },
        { key: "importado", label: "Imp.", render: (r) => r.importado ? <span className="text-yellow-400">SI</span> : <span className="text-muted-foreground">NO</span> },
      ]}
    />
  );
}
