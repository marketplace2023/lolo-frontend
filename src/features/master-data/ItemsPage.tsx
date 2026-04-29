import { MasterDataTable } from "@/components/data-table/MasterDataTable";
import { formatCurrency } from "@/utils/cn";
import { useNavigate } from "react-router";
import { Calculator } from "lucide-react";

export function ItemsPage() {
  const navigate = useNavigate();

  return (
    <MasterDataTable
      title="Partidas (APU)"
      queryKey="items"
      endpoint="/items"
      searchPlaceholder="Buscar partidas..."
      onCreateClick={() => navigate("/master-data/items/new")}
      formFields={[
        { key: "codigo", label: "Código", required: true, placeholder: "EDF0001" },
        { key: "cobertura", label: "Código COVENIN", placeholder: "04-001-001" },
        { key: "descripcion", label: "Descripción", required: true },
        { key: "unidad", label: "Unidad", placeholder: "M2, M3, ML, GLB..." },
        { key: "rendimiento", label: "Rendimiento", type: "number", placeholder: "0", hint: "Unidades producidas por hora" },
        { key: "esSubcontrato", label: "¿Es subcontrato?", type: "checkbox" },
      ]}
      columns={[
        { key: "codigo", label: "Código" },
        { key: "cobertura", label: "COVENIN" },
        { key: "descripcion", label: "Descripción", render: (r) => <span className="max-w-sm truncate block" title={String(r.descripcion)}>{String(r.descripcion)}</span> },
        { key: "unidad", label: "Unidad" },
        { key: "rendimiento", label: "Rendimiento", render: (r) => <span className="font-mono">{Number(r.rendimiento).toLocaleString()}</span> },
        { key: "precioUnitario", label: "P.U.", render: (r) => <span className="font-mono">{formatCurrency(r.precioUnitario as string, "")}</span> },
        { key: "esSubcontrato", label: "Subcont.", render: (r) => r.esSubcontrato ? <span className="text-yellow-400">SI</span> : "" },
        { 
          key: "apu", 
          label: "Análisis", 
          render: (r) => (
            <button 
              onClick={() => navigate(`/master-data/items/${r.id}/apu`)}
              className="flex items-center gap-1.5 px-2 py-1 bg-accent text-accent-foreground text-[11px] rounded hover:bg-accent/80 transition-colors whitespace-nowrap"
            >
              <Calculator size={12} /> APU
            </button>
          ) 
        },
      ]}
    />
  );
}
