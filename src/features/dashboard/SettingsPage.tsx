import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/FormPrimitives";
import { 
  Loader2, Store, Upload, MapPin, Building2, Phone, Mail, Award, 
  Globe, BadgeCheck, Package, Clock, Link as LinkIcon, Instagram, 
  Linkedin, Image as ImageIcon, Map, Trash2
} from "lucide-react";
import { cn } from "@/utils/cn";

export function SettingsPage() {
  const user = useAuthStore(s => s.user);
  const companyId = user?.companyId;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("info");
  const [newSpecialty, setNewSpecialty] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    rif: "",
    direccion: "",
    telefono: "",
    email: "",
    sitioWeb: "",
    instagram: "",
    linkedin: "",
    horarioAtencion: "",
    coberturaServicio: "",
    descripcionPublica: "",
    estadoUbicacion: "",
    anosFundacion: "",
    rncContratista: "",
    isPublic: false,
    especialidades: [] as string[],
    galeria: [] as string[],
  });

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
        sitioWeb: company.sitioWeb || "",
        instagram: company.instagram || "",
        linkedin: company.linkedin || "",
        horarioAtencion: company.horarioAtencion || "",
        coberturaServicio: company.coberturaServicio || "",
        descripcionPublica: company.descripcionPublica || "",
        estadoUbicacion: company.estadoUbicacion || "",
        anosFundacion: company.anosFundacion?.toString() || "",
        rncContratista: company.rncContratista || "",
        isPublic: company.isPublic || false,
        especialidades: company.especialidades || [],
        galeria: company.galeria || [],
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

  const handleAddGalleryImage = () => {
    if (form.galeria.length < 6) {
      setForm({ ...form, galeria: [...form.galeria, `https://picsum.photos/seed/${Math.random()}/600/400`] });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setForm({ ...form, galeria: form.galeria.filter((_, i) => i !== index) });
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

  const tabs = [
    { id: 'info', label: 'Información', icon: Store },
    { id: 'contacto', label: 'Contacto y Ubicación', icon: MapPin },
    { id: 'horarios', label: 'Horarios y Redes', icon: Clock },
    { id: 'galeria', label: 'Fotos (Galería)', icon: ImageIcon },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="text-primary" /> Perfil del Negocio (Google Business Style)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra la identidad digital de tu empresa para destacar en el ecosistema.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Perfil Público:</span>
            <button 
              type="button"
              onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
              className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", form.isPublic ? 'bg-emerald-500' : 'bg-muted-foreground/30')}
            >
              <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", form.isPublic ? 'translate-x-6' : 'translate-x-1')} />
            </button>
          </div>
          {form.isPublic ? (
            <span className="text-xs text-emerald-500 font-medium">Visible en el directorio</span>
          ) : (
            <span className="text-xs text-muted-foreground font-medium">Perfil oculto</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Banner y Logo */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="h-40 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent relative group">
            <Button type="button" variant="secondary" size="sm" className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload size={14} className="mr-2" /> Actualizar Portada
            </Button>
          </div>
          <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row gap-6 items-end -mt-16">
            <div className="relative group">
              <div className="w-32 h-32 rounded-xl bg-card border-4 border-card flex items-center justify-center overflow-hidden shadow-lg">
                {company?.logo ? (
                  <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={48} className="text-muted-foreground/50" />
                )}
              </div>
              <button type="button" className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-105 transition opacity-0 group-hover:opacity-100">
                <Upload size={16} />
              </button>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-foreground">{form.nombre || "Nombre de Empresa"}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{form.especialidades.slice(0, 3).join(" • ") || "Sin especialidades definidas"}</p>
            </div>
            <div className="pb-2 flex gap-3">
              <Button type="submit" loading={updateMutation.isPending} className="shadow-lg">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-muted/30 p-1 rounded-xl border border-border overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-card text-primary shadow-sm border border-border" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* TAB: INFO */}
            {activeTab === 'info' && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Globe className="text-muted-foreground" size={18} /> Información General</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre Comercial <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={e => setForm({ ...form, nombre: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
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
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input uppercase focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción del Negocio</label>
                  <textarea
                    value={form.descripcionPublica}
                    onChange={e => setForm({ ...form, descripcionPublica: e.target.value })}
                    rows={4}
                    placeholder="Cuenta un poco sobre la historia, misión, visión y servicios de la empresa."
                    className="w-full px-4 py-3 border border-border/50 rounded-lg bg-input resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Especialidades (Categorías de Servicio)</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={e => setNewSpecialty(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                      placeholder="Añadir especialidad. Ej. Obras Civiles, Herrería..."
                      className="flex-1 px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium mb-1">Año de Fundación</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={form.anosFundacion}
                      onChange={e => setForm({ ...form, anosFundacion: e.target.value })}
                      placeholder="Ej. 2005"
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
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
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONTACTO */}
            {activeTab === 'contacto' && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold flex items-center gap-2"><MapPin className="text-muted-foreground" size={18} /> Contacto y Ubicación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Phone size={14} className="text-muted-foreground"/> Teléfono Principal</label>
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={e => setForm({ ...form, telefono: e.target.value })}
                      placeholder="+58 412 1234567"
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Mail size={14} className="text-muted-foreground"/> Correo Electrónico</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="contacto@empresa.com"
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado de la Sede Principal</label>
                    <input
                      type="text"
                      value={form.estadoUbicacion}
                      onChange={e => setForm({ ...form, estadoUbicacion: e.target.value })}
                      placeholder="Ej. Distrito Capital, Zulia..."
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Map size={14} className="text-muted-foreground"/> Área de Cobertura</label>
                    <input
                      type="text"
                      value={form.coberturaServicio}
                      onChange={e => setForm({ ...form, coberturaServicio: e.target.value })}
                      placeholder="Ej. A nivel nacional, Solo Caracas..."
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Dirección Física (Oficina principal)</label>
                  <textarea
                    value={form.direccion}
                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                    rows={2}
                    placeholder="Dirección exacta para mapas y envíos..."
                    className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* TAB: HORARIOS Y REDES */}
            {activeTab === 'horarios' && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Clock className="text-muted-foreground" size={18} /> Disponibilidad y Enlaces</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">Horario de Atención</label>
                  <input
                    type="text"
                    value={form.horarioAtencion}
                    onChange={e => setForm({ ...form, horarioAtencion: e.target.value })}
                    placeholder="Ej. Lunes a Viernes de 8:00 AM a 5:00 PM"
                    className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Especifica los días y horas en que tu empresa está operativa y atiende llamadas.</p>
                </div>

                <div className="pt-4 border-t border-border space-y-5">
                  <h4 className="font-medium text-sm text-muted-foreground">Presencia Digital</h4>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2"><LinkIcon size={14} className="text-muted-foreground"/> Sitio Web</label>
                    <input
                      type="url"
                      value={form.sitioWeb}
                      onChange={e => setForm({ ...form, sitioWeb: e.target.value })}
                      placeholder="https://www.tuempresa.com"
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Instagram size={14} className="text-pink-500"/> Instagram</label>
                      <input
                        type="text"
                        value={form.instagram}
                        onChange={e => setForm({ ...form, instagram: e.target.value })}
                        placeholder="@tuempresa"
                        className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Linkedin size={14} className="text-blue-600"/> LinkedIn</label>
                      <input
                        type="text"
                        value={form.linkedin}
                        onChange={e => setForm({ ...form, linkedin: e.target.value })}
                        placeholder="URL de tu perfil de empresa"
                        className="w-full px-4 py-2.5 border border-border/50 rounded-lg bg-input focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GALERIA */}
            {activeTab === 'galeria' && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><ImageIcon className="text-muted-foreground" size={18} /> Fotos de la Empresa</h3>
                  <span className="text-sm font-medium text-muted-foreground">{form.galeria.length} / 6 fotos</span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Sube fotos de tus obras completadas, equipo de trabajo, maquinaria o instalaciones. Una galería visual genera muchísima más confianza en los clientes (igual que en Google Business).
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {form.galeria.map((img, i) => (
                    <div key={i} className="aspect-video rounded-xl border border-border relative group overflow-hidden bg-muted">
                      <img src={img} alt={`Galería ${i+1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button type="button" onClick={() => handleRemoveGalleryImage(i)} className="bg-red-500/10 text-red-500 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:scale-110">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {form.galeria.length < 6 && (
                    <button 
                      type="button" 
                      onClick={handleAddGalleryImage}
                      className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all hover:border-primary/50 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Plus size={20} />
                      </div>
                      <span className="text-xs font-medium">Añadir foto</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 shadow-sm text-center sticky top-24">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Store className="text-primary" size={24} />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Optimiza tu Perfil</h4>
              <div className="text-left text-xs space-y-2 mb-4 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className={form.descripcionPublica.length > 50 ? "text-emerald-500" : "text-muted-foreground/30"} />
                  <span className={form.descripcionPublica.length > 50 ? "text-foreground" : "text-muted-foreground"}>Descripción agregada</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className={form.galeria.length > 0 ? "text-emerald-500" : "text-muted-foreground/30"} />
                  <span className={form.galeria.length > 0 ? "text-foreground" : "text-muted-foreground"}>Fotos en galería</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className={form.horarioAtencion ? "text-emerald-500" : "text-muted-foreground/30"} />
                  <span className={form.horarioAtencion ? "text-foreground" : "text-muted-foreground"}>Horario definido</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className={form.sitioWeb || form.instagram ? "text-emerald-500" : "text-muted-foreground/30"} />
                  <span className={form.sitioWeb || form.instagram ? "text-foreground" : "text-muted-foreground"}>Redes o Web vinculadas</span>
                </div>
              </div>
              
              <Button type="submit" className="w-full mb-3" loading={updateMutation.isPending}>
                Guardar Perfil
              </Button>
              
              <hr className="border-border/50 my-4" />
              
              <h4 className="font-semibold text-foreground mb-1 flex items-center justify-center gap-2">
                <Package className="text-primary" size={16} /> Tus Servicios / Catálogo
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Agrega productos a tu perfil para que los clientes sepan qué ofreces.
              </p>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-primary/30 hover:bg-primary hover:text-white transition-all"
                onClick={() => navigate('/marketplace/create')}
              >
                + Cargar Nuevo Producto
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
// Placeholder components since lucide-react import was altered above
function CheckCircle2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
}
