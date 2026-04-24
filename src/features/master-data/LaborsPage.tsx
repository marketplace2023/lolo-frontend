import { MasterDataTable } from "@/components/data-table/MasterDataTable";
import { formatCurrency } from "@/utils/cn";

export function LaborsPage() {
  return (
    <MasterDataTable
      title="Mano de Obra"
      queryKey="labors"
      endpoint="/labors"
      searchPlaceholder="Buscar mano de obra..."
      formFields={[
        { key: "codigo", label: "Código", required: true, placeholder: "MO001" },
        { key: "descripcion", label: "Descripción / Cargo", required: true },
        { key: "unidad", label: "Unidad", placeholder: "HR, DIA, MES..." },
        { key: "precio", label: "Precio/Hora", type: "number", placeholder: "0.0000" },
      ]}
      columns={[
        { key: "codigo", label: "Código" },
        { key: "descripcion", label: "Descripción", render: (r) => <span className="max-w-sm truncate block">{String(r.descripcion)}</span> },
        { key: "unidad", label: "Unidad" },
        { key: "precio", label: "Salario/Hora", render: (r) => <span className="font-mono">{formatCurrency(r.precio as string, "")}</span> },
        { key: "codigoFamilia", label: "Familia" },
      ]}
    />
  );
}
