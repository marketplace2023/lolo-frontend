import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import { HardHat, Loader2, Building2, User } from "lucide-react";

export function SetupPage() {
  const [step, setStep] = useState<"company" | "admin">("company");
  const [company, setCompany] = useState({ nombre: "", rif: "", direccion: "", telefono: "", email: "" });
  const [admin, setAdmin] = useState({ nombre: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (admin.password !== admin.confirm) { setError("Las contraseñas no coinciden"); return; }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/setup", {
        company: { nombre: company.nombre, rif: company.rif || undefined, email: company.email || undefined },
        admin: { nombre: admin.nombre, email: admin.email, password: admin.password },
      });
      setAuth(data.token, data.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Error al configurar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
            <HardHat size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Configuración Inicial</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure su empresa y cuenta de administrador</p>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mb-6">
          {(["company", "admin"] as const).map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${step === s || (s === "company" && step === "admin") ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl">
          {step === "company" ? (
            <>
              <div className="flex items-center gap-2 mb-5">
                <Building2 size={18} className="text-primary" />
                <h2 className="text-lg font-semibold">Datos de la Empresa</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Nombre *", key: "nombre" as const, placeholder: "Constructora ABC C.A.", required: true },
                  { label: "RIF", key: "rif" as const, placeholder: "J-00000000-0" },
                  { label: "Email", key: "email" as const, placeholder: "info@empresa.com" },
                ].map(({ label, key, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
                    <input
                      value={company[key]}
                      onChange={(e) => setCompany((c) => ({ ...c, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required={required}
                      className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
                <button
                  onClick={() => company.nombre.trim() && setStep("admin")}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors mt-2"
                >
                  Continuar
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSetup}>
              <div className="flex items-center gap-2 mb-5">
                <User size={18} className="text-primary" />
                <h2 className="text-lg font-semibold">Cuenta Administrador</h2>
              </div>
              {error && <p className="text-destructive text-xs mb-3 bg-destructive/10 rounded p-2">{error}</p>}
              <div className="space-y-3">
                {[
                  { label: "Nombre completo *", key: "nombre" as const, type: "text", placeholder: "Nombre Apellido" },
                  { label: "Email *", key: "email" as const, type: "email", placeholder: "admin@empresa.com" },
                  { label: "Contraseña *", key: "password" as const, type: "password", placeholder: "Mínimo 8 caracteres" },
                  { label: "Confirmar contraseña *", key: "confirm" as const, type: "password", placeholder: "Repita la contraseña" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
                    <input
                      type={type}
                      value={admin[key]}
                      onChange={(e) => setAdmin((a) => ({ ...a, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setStep("company")}
                    className="flex-1 py-2.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors">
                    Atrás
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading ? "Guardando..." : "Finalizar"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
