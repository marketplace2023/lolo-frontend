import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, Upload, Image as ImageIcon, Plus, Trash2, 
  Tag, Info, DollarSign, Package, CheckCircle2, ChevronRight, Layers, FileText
} from "lucide-react";
import { cn } from "@/utils/cn";

export function ProductFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [images, setImages] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    category: "",
    type: "product", // product or service
    description: "",
    price: "",
    currency: "USD",
    stock: "",
    sku: "",
  });

  const handleAddImage = () => {
    if (images.length < 5) {
      setImages([...images, `https://picsum.photos/seed/${Math.random()}/500/500`]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      alert("¡Registro completado exitosamente!");
      navigate("/marketplace");
    }
  };

  const isStepValid = () => {
    if (step === 1) return form.title.length >= 3 && form.category;
    if (step === 2) return form.description.length >= 10 && images.length > 0;
    if (step === 3) return form.price !== "" && (form.type === 'service' || form.stock !== "");
    return false;
  };

  const steps = [
    { id: 1, name: "Información Básica", icon: Info },
    { id: 2, name: "Detalles y Fotos", icon: ImageIcon },
    { id: 3, name: "Comercialización", icon: DollarSign },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-muted-foreground hover:text-foreground transition-colors" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Nuevo Producto o Servicio</h2>
          <p className="text-sm text-muted-foreground">Registra tu oferta en el catálogo de tu empresa</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -z-10 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500 rounded-full" 
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {steps.map(s => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            
            return (
              <div key={s.id} className="flex flex-col items-center gap-3 bg-card px-2">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all duration-500",
                  isCompleted ? "bg-primary text-primary-foreground scale-95" :
                  isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-100" :
                  "bg-muted text-muted-foreground border border-border"
                )}>
                  {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                </div>
                <span className={cn(
                  "text-xs font-semibold tracking-wide transition-colors duration-300",
                  (isCurrent || isCompleted) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-8">
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Tipo de Registro
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'product', label: 'Producto Físico', icon: Package, desc: 'Materiales, equipos, insumos' },
                      { id: 'service', label: 'Servicio', icon: Tag, desc: 'Mano de obra, alquiler, consultoría' }
                    ].map(type => (
                      <label 
                        key={type.id} 
                        className={cn(
                          "flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-muted/50",
                          form.type === type.id 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-border"
                        )}
                      >
                        <input 
                          type="radio" 
                          name="type" 
                          value={type.id} 
                          checked={form.type === type.id}
                          onChange={e => setForm({...form, type: e.target.value})}
                          className="sr-only" 
                        />
                        <div className="flex items-center gap-3 mb-1">
                          <type.icon size={18} className={form.type === type.id ? "text-primary" : "text-muted-foreground"} />
                          <span className="font-semibold text-foreground">{type.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground pl-7">{type.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nombre del {form.type === 'product' ? 'Producto' : 'Servicio'}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="Ej. Cemento Gris Portland Tipo I"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Categoría</label>
                  <select
                    required
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground outline-none cursor-pointer"
                  >
                    <option value="" disabled>Selecciona una categoría...</option>
                    <optgroup label="Materiales">
                      <option value="mat_agregados">Agregados y Pétreos</option>
                      <option value="mat_cementos">Cementos y Aglomerantes</option>
                      <option value="mat_aceros">Aceros y Metales</option>
                    </optgroup>
                    <optgroup label="Equipos">
                      <option value="eq_pesado">Maquinaria Pesada</option>
                      <option value="eq_ligero">Equipos Ligeros</option>
                    </optgroup>
                    <optgroup label="Servicios">
                      <option value="srv_subcontrato">Subcontratos de Obra</option>
                      <option value="srv_ingenieria">Ingeniería y Arquitectura</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-8">
              
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-foreground mb-4">
                  <span>Imágenes</span>
                  <span className="text-muted-foreground text-xs font-normal">{images.length} / 5</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl border border-border relative group overflow-hidden bg-muted">
                      <img src={img} alt={`Img ${i+1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button type="button" onClick={() => handleRemoveImage(i)} className="bg-red-500/10 text-red-500 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:scale-110">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {i === 0 && <span className="absolute bottom-2 left-2 right-2 text-center text-[10px] font-bold bg-primary text-primary-foreground py-0.5 rounded shadow">PRINCIPAL</span>}
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <button 
                      type="button" 
                      onClick={handleAddImage}
                      className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all hover:border-primary/50 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Plus size={20} />
                      </div>
                      <span className="text-xs font-medium">Añadir foto</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Descripción Detallada
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Detalla las especificaciones técnicas, usos recomendados, dimensiones, etc..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground outline-none resize-none"
                />
              </div>

            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Precio de Venta</label>
                    <div className="flex gap-2">
                      <select 
                        value={form.currency}
                        onChange={e => setForm({...form, currency: e.target.value})}
                        className="w-24 px-3 py-3 bg-muted border border-border rounded-xl font-bold text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="USD">USD $</option>
                        <option value="VES">VES Bs</option>
                      </select>
                      <input
                        type="number"
                        min="0" step="0.01"
                        required
                        autoFocus
                        value={form.price}
                        onChange={e => setForm({...form, price: e.target.value})}
                        placeholder="0.00"
                        className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-right font-bold text-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {form.type === 'product' && (
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Stock Actual</label>
                        <input
                          type="number"
                          min="0"
                          required={form.type === 'product'}
                          value={form.stock}
                          onChange={e => setForm({...form, stock: e.target.value})}
                          placeholder="Cantidad"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground outline-none"
                        />
                      </div>
                    )}
                    <div className={form.type === 'service' ? "col-span-2" : ""}>
                      <label className="block text-sm font-semibold text-foreground mb-2">Código Interno / SKU</label>
                      <input
                        type="text"
                        value={form.sku}
                        onChange={e => setForm({...form, sku: e.target.value})}
                        placeholder="Ej. MAT-001"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-6 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Layers size={20} />
                    <h3 className="font-semibold text-foreground">Resumen del Registro</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium text-foreground capitalize">{form.type === 'product' ? 'Producto' : 'Servicio'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Nombre:</span>
                      <span className="font-medium text-foreground max-w-[150px] truncate">{form.title || '—'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Imágenes:</span>
                      <span className="font-medium text-foreground">{images.length} adjuntas</span>
                    </li>
                    <li className="flex justify-between pt-3 border-t border-border">
                      <span className="text-muted-foreground">Precio Final:</span>
                      <span className="font-bold text-foreground">{form.price ? `${form.currency} ${form.price}` : '—'}</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <button 
            type="button" 
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="px-6 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
          >
            {step > 1 ? "Volver al paso anterior" : "Cancelar"}
          </button>
          
          <button 
            type="submit" 
            disabled={!isStepValid()}
            className={cn(
              "px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm",
              isStepValid() 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20" 
                : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
            )}
          >
            {step < totalSteps ? (
              <>Siguiente Paso <ChevronRight size={18} /></>
            ) : (
              <>Guardar Registro</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
