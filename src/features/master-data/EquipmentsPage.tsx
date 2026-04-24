import { MasterDataTable } from "@/components/data-table/MasterDataTable";
import { formatCurrency } from "@/utils/cn";

export function EquipmentsPage() {
  return (
    <MasterDataTable
      title="Equipos"
      queryKey="equipments"
      endpoint="/equipments"
      searchPlaceholder="Buscar equipos..."
      formFields={[
        { key: "codigo", label: "Código", required: true, placeholder: "EQP001" },
        { key: "descripcion", label: "Descripción", required: true },
        { key: "unidad", label: "Unidad", placeholder: "HR, DIA..." },
        { key: "precio", label: "Precio", type: "number", placeholder: "0.0000" },
      ]}
      columns={[
        { key: "codigo", label: "Código" },
        { key: "descripcion", label: "Descripción", render: (r) => <span className="max-w-xs truncate block">{String(r.descripcion)}</span> },
        { key: "unidad", label: "Unidad" },
        { key: "precio", label: "Precio", render: (r) => <span className="font-mono">{formatCurrency(r.precio as string, "")}</span> },
        { key: "codigoFamilia", label: "Familia" },
      ]}
    />
  );
}
