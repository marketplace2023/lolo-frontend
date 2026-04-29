import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/FormPrimitives";
import { Loader2, Store, Upload, MapPin, Building2, Phone, Mail, Award, Globe, BadgeCheck, Package } from "lucide-react";

export function SettingsPage() {
  const user = useAuthStore(s => s.user);
  const companyId = user?.companyId;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    rif: "",
    direccion: "",
    telefono: "",
    email: "",
    descripcionPublica: "",
    estadoUbicacion: "",
    anosFundacion: "",
    rncContratista: "",
    isPublic: false,
    especialidades: [] as string[],
  });

  const [newSpecialty, setNewSpecialty] = useState("");

  const { data: company, isLoading } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => api.get(`/companies/${companyId}`).then(r => r.data),
    enabled: !!companyId,
  });

  useEffect(() => {
    if (company) {
      setForm({
        nombre: company.nombre || "",
        rif: company.rif || "",
        direccion: company.direccion || "",
        telefono: company.telefono || "",
        email: company.email || "",
        descripcionPublica: company.descripcionPublica || "",
        estadoUbicacion: company.estadoUbicacion || "",
        anosFundacion: company.anosFundacion?.toString() || "",
        rncContratista: company.rncContratista || "",
        isPublic: company.isPublic || false,
        especialidades: company.especialidades || [],
      });
    }
  }, [company]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/companies/${companyId}`, {
      ...data,
      anosFundacion: parseInt(data.anosFundacion) || null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      alert("Perfil de negocio actualizado correctamente.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    updateMutation.mutate(form);
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !form.especialidades.includes(newSpecialty.trim())) {
      setForm({ ...form, especialidades: [...form.especialidades, newSpecialty.trim()] });
      setNewSpecialty("");
    }
  };

  const handleRemoveSpecialty = (spec: string) => {
    setForm({ ...form, especialidades: form.especialidades.filter(s => s !== spec) });
  };

  if (!companyId) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
        No tienes una empresa asociada.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="text-primary" /> Perfil del Negocio (Marketplace)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra cómo se ve tu empresa ante otros contratistas y clientes en el Marketplace, similar a Google Business.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Visibilidad Pública:</span>
          <button 
            type="button"
            onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isPublic ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Encabezado / Banner */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative">
            <Button type="button" variant="secondary" size="sm" className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm">
              <Upload size={14} className="mr-2" /> Cambiar Portada
            </Button>
          </div>
          <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row gap-6">
            <div className="-mt-12 relative">
              <div className="w-24 h-24 rounded-xl bg-card border-4 border-card flex items-center justify-center overflow-hidden shadow-lg">
                {company?.logo ? (
                  <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={40} className="text-muted-foreground/50" />
                )}
              </div>
              <button type="button" className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow hover:bg-primary/90 transition">
                <Upload size={14} />
              </button>
            </div>
            <div className="flex-1 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre Comercial / Razón Social <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RIF / Identificación Fiscal <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.rif}
                    onChange={e => setForm({ ...form, rif: e.target.value })}
                    required
                    placeholder="J-12345678-9"
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input uppercase focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Información Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Globe className="text-muted-foreground" size={18} /> Acerca de la Empresa</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción Pública</label>
                  <textarea
                    value={form.descripcionPublica}
                    onChange={e => setForm({ ...form, descripcionPublica: e.target.value })}
                    rows={4}
                    placeholder="Cuenta un poco sobre la historia, misión y visión de la empresa. Esto será visible en el directorio."
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Especialidades / Categorías</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={e => setNewSpecialty(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                      placeholder="Ej. Obras Civiles, Herrería, Movimiento de Tierra..."
                      className="flex-1 px-3 py-2 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <Button type="button" onClick={handleAddSpecialty} variant="secondary">Agregar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.especialidades.map(spec => (
                      <span key={spec} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {spec}
                        <button type="button" onClick={() => handleRemoveSpecialty(spec)} className="hover:text-red-500">&times;</button>
                      </span>
                    ))}
                    {form.especialidades.length === 0 && (
                      <span className="text-sm text-muted-foreground italic">No has agregado especialidades.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin className="text-muted-foreground" size={18} /> Ubicación y Contacto</h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Phone size={14} className="text-muted-foreground"/> Teléfono Principal</label>
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={e => setForm({ ...form, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Mail size={14} className="text-muted-foreground"/> Correo Electrónico</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estado / Región de Operación</label>
                  <input
                    type="text"
                    value={form.estadoUbicacion}
                    onChange={e => setForm({ ...form, estadoUbicacion: e.target.value })}
                    placeholder="Ej. Distrito Capital, Miranda, Zulia..."
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Dirección Fiscal Completa</label>
                  <textarea
                    value={form.direccion}
                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Award className="text-muted-foreground" size={18} /> Credenciales</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Año de Fundación</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={form.anosFundacion}
                    onChange={e => setForm({ ...form, anosFundacion: e.target.value })}
                    placeholder="Ej. 2005"
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
                    Número RNC
                    <BadgeCheck size={14} className="text-blue-500" title="Registro Nacional de Contratistas" />
                  </label>
                  <input
                    type="text"
                    value={form.rncContratista}
                    onChange={e => setForm({ ...form, rncContratista: e.target.value })}
                    placeholder="Opcional. Ej. 123456789"
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Agregar el RNC aumenta la confianza en el Marketplace.</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 shadow-sm text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Store className="text-primary" size={24} />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Atrae más clientes</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Los perfiles completos con logo, descripción detallada y especialidades tienen 80% más de probabilidad de ser invitados a cotizar.
              </p>
              <Button type="submit" className="w-full mb-3" loading={updateMutation.isPending}>
                Guardar Cambios del Perfil
              </Button>
              
              <hr className="border-border/50 my-4" />
              
              <h4 className="font-semibold text-foreground mb-1 flex items-center justify-center gap-2">
                <Package className="text-primary" size={16} /> Tus Productos y Servicios
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Publica en el Marketplace y aumenta tus ventas.
              </p>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-primary/30 hover:bg-primary hover:text-white transition-all"
                onClick={() => navigate('/marketplace/create')}
              >
                + Crear Nueva Publicación
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
