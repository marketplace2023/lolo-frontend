import { Routes, Route, Navigate } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { SetupPage } from "@/features/auth/SetupPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ProjectsPage } from "@/features/projects/ProjectsPage";
import { ProjectLayout } from "@/features/projects/ProjectLayout";
import { BudgetPage } from "@/features/budgets/BudgetPage";
import { MeasurementsPage } from "@/features/projects/MeasurementsPage";
import { VariationPage } from "@/features/projects/VariationPage";
import { ValuationsPage } from "@/features/projects/ValuationsPage";
import { ReportsPage } from "@/features/projects/ReportsPage";
import { MaterialsPage } from "@/features/master-data/MaterialsPage";
import { EquipmentsPage } from "@/features/master-data/EquipmentsPage";
import { LaborsPage } from "@/features/master-data/LaborsPage";
import { ItemsPage } from "@/features/master-data/ItemsPage";
import { ApuEditorPage } from "@/features/master-data/ApuEditorPage";
import { FamiliesPage } from "@/features/master-data/FamiliesPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectLayout />}>
          <Route index element={<Navigate to="budget" replace />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="measurements" element={<MeasurementsPage />} />
          <Route path="valuations" element={<ValuationsPage />} />
          <Route path="aumentos" element={<VariationPage type="aumentos" />} />
          <Route path="disminuciones" element={<VariationPage type="disminuciones" />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
        <Route path="master-data/materials" element={<MaterialsPage />} />
        <Route path="master-data/equipments" element={<EquipmentsPage />} />
        <Route path="master-data/labor" element={<LaborsPage />} />
        <Route path="master-data/items" element={<ItemsPage />} />
        <Route path="master-data/items/:id/apu" element={<ApuEditorPage />} />
        <Route path="master-data/bcv-families" element={<FamiliesPage />} />
      </Route>
    </Routes>
  );
}
