import { Routes, Route, Navigate } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { SetupPage } from "@/features/auth/SetupPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { SettingsPage } from "@/features/dashboard/SettingsPage";
import { ProjectsPage } from "@/features/projects/ProjectsPage";
import { ProjectLayout } from "@/features/projects/ProjectLayout";
import { BudgetPage } from "@/features/budgets/BudgetPage";
import { MeasurementsPage } from "@/features/projects/MeasurementsPage";
import { VariationPage } from "@/features/projects/VariationPage";
import { ValuationsPage } from "@/features/projects/ValuationsPage";
import { ReportsPage } from "@/features/projects/ReportsPage";
import { ExtrasPage } from "@/features/projects/ExtrasPage";
import { ClosingPage } from "@/features/projects/ClosingPage";
import { ProjectDashboard } from "@/features/projects/ProjectDashboard";
import { CronogramaPage } from "@/features/projects/CronogramaPage";
import { MaterialsPage } from "@/features/master-data/MaterialsPage";
import { EquipmentsPage } from "@/features/master-data/EquipmentsPage";
import { LaborsPage } from "@/features/master-data/LaborsPage";
import { ItemsPage } from "@/features/master-data/ItemsPage";
import { ApuEditorPage } from "@/features/master-data/ApuEditorPage";
import { FamiliesPage } from "@/features/master-data/FamiliesPage";
import { SubmaestrosPage } from "@/features/master-data/SubmaestrosPage";

import { RfqPage } from "@/features/marketplace/RfqPage";
import { ProductFormPage } from "@/features/marketplace/ProductFormPage";
import { ReviewsDashboardPage } from "@/features/dashboard/ReviewsDashboardPage";
import { StorefrontPage } from "@/features/marketplace/StorefrontPage";
import { DirectoryPage } from "@/features/marketplace/DirectoryPage";
import { ShopPage } from "@/features/marketplace/ShopPage";
import { ProductDetailPage } from "@/features/marketplace/ProductDetailPage";
import { PublicLayout } from "@/features/marketplace/PublicLayout";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/store" element={<StorefrontPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
        <Route path="settings" element={<SettingsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ProjectDashboard />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="measurements" element={<MeasurementsPage />} />
          <Route path="valuations" element={<ValuationsPage />} />
          <Route path="aumentos" element={<VariationPage type="aumentos" />} />
          <Route path="disminuciones" element={<VariationPage type="disminuciones" />} />
          <Route path="extras" element={<ExtrasPage />} />
          <Route path="cierre" element={<ClosingPage />} />
          <Route path="cronograma" element={<CronogramaPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
        <Route path="master-data/materials" element={<MaterialsPage />} />
        <Route path="master-data/equipments" element={<EquipmentsPage />} />
        <Route path="master-data/labor" element={<LaborsPage />} />
        <Route path="master-data/items" element={<ItemsPage />} />
        <Route path="master-data/items/:id/apu" element={<ApuEditorPage />} />
        <Route path="master-data/bcv-families" element={<FamiliesPage />} />
        <Route path="master-data/submaestros" element={<SubmaestrosPage />} />
        <Route path="marketplace/create" element={<ProductFormPage />} />
        <Route path="marketplace/rfq" element={<RfqPage />} />
        <Route path="marketplace/reviews" element={<ReviewsDashboardPage />} />
      </Route>
    </Routes>
  );
}
