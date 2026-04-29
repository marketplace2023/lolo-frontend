import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/FormPrimitives";
import { 
  ArrowLeft, Upload, Image as ImageIcon, Plus, Trash2, 
  Tag, Info, DollarSign, Package, Truck, CheckCircle2 
} from "lucide-react";

export function ProductFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    category: "",
    condition: "new",
    description: "",
    price: "",
    currency: "USD",
    stock: "",
    sku: "",
    shippingMethod: "delivery",
    warranty: "",
  });

  const [attributes, setAttributes] = useState([{ name: "", value: "" }]);

  const handleAddImage = () => {
    // Dummy image placeholder for UI demonstration
    if (images.length < 6) {
      setImages([...images, `https://picsum.photos/seed/${Math.random()}/500/500`]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }]);
  };

  const updateAttribute = (index: number, field: "name" | "value", val: string) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = val;
    setAttributes(newAttrs);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      alert("¡Publicación creada exitosamente en el Marketplace!");
      navigate("/marketplace");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-20">
      <div className="flex items-center gap-4 border-b border-border/50 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold">Crear Publicación</h2>
          <p className="text-sm text-muted-foreground">Ofrece tu producto o servicio en el Marketplace de LULOWinNG</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative px-8 py-4">
        <div className="absolute left-14 right-14 top-1/2 h-0.5 bg-muted -z-10 -translate-y-1/2"></div>
        <div className={`absolute left-14 top-1/2 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
        
        {[
          { num: 1, label: "Información Básica", icon: <Info size={16}/> },
          { num: 2, label: "Detalles y Fotos", icon: <ImageIcon size={16}/> },
          { num: 3, label: "Precio y Condiciones", icon: <DollarSign size={16}/> }
        ].map(s => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-background px-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors duration-300 ${step >= s.num ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-muted text-muted-foreground border-2 border-border'}`}>
              {step > s.num ? <CheckCircle2 size={20} /> : s.num}
            </div>
            <span className={`text-xs font-semibold ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Tag className="text-primary"/> ¿Qué estás ofreciendo?</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Título de la publicación <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="Ej. Cemento Portland Tipo 1 (Saco 42.5kg) o Servicio de Topografía..."
                    className="w-full px-4 py-3 text-lg border border-border/60 rounded-xl bg-input focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Incluye palabras clave que los compradores usarían para encontrarte.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Categoría <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full px-4 py-3 border border-border/60 rounded-xl bg-input focus:ring-4 focus:ring-primary/20 transition-all appearance-none"
                    >
                      <option value="">Selecciona una categoría...</option>
                      <optgroup label="Materiales">
                        <option value="mat_agregados">Agregados (Arena, Piedra)</option>
                        <option value="mat_cementos">Cementos y Aglomerantes</option>
                        <option value="mat_aceros">Aceros y Metales</option>
                      </optgroup>
                      <optgroup label="Equipos">
                        <option value="eq_pesado">Maquinaria Pesada</option>
                        <option value="eq_ligero">Herramientas y Equipos Ligeros</option>
                      </optgroup>
                      <optgroup label="Servicios / Mano de Obra">
                        <option value="srv_subcontrato">Subcontratos (Obra Civil)</option>
                        <option value="srv_ingenieria">Ingeniería y Diseño</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Condición</label>
                    <div className="flex gap-4">
                      {["new", "used", "refurbished", "service"].map(cond => (
                        <label key={cond} className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-xl cursor-pointer transition-all ${form.condition === cond ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border/60 hover:bg-muted'}`}>
                          <input 
                            type="radio" 
                            name="condition" 
                            value={cond} 
                            checked={form.condition === cond}
                            onChange={e => setForm({...form, condition: e.target.value})}
                            className="sr-only" 
                          />
                          <span className="text-sm font-medium capitalize">
                            {cond === 'new' ? 'Nuevo' : cond === 'used' ? 'Usado' : cond === 'refurbished' ? 'Reacondicionado' : 'Servicio'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Images and Description */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ImageIcon className="text-primary"/> Fotos del Producto</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl border border-border/50 relative group overflow-hidden bg-muted">
                    <img src={img} alt={`Imagen ${i+1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => handleRemoveImage(i)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {i === 0 && <span className="absolute bottom-2 left-2 right-2 text-center text-[10px] font-bold bg-white/90 text-black py-0.5 rounded shadow">PORTADA</span>}
                  </div>
                ))}
                
                {images.length < 6 && (
                  <button 
                    type="button" 
                    onClick={handleAddImage}
                    className="aspect-square rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/5 hover:border-primary transition-all"
                  >
                    <Plus size={24} />
                    <span className="text-xs font-semibold">Agregar Foto</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4">Sube hasta 6 fotos de buena calidad. La primera será la portada de tu anuncio.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Package className="text-primary"/> Características y Descripción</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Descripción Detallada <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={6}
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Describe tu producto o servicio. Menciona especificaciones técnicas, usos comunes, ventajas..."
                    className="w-full px-4 py-3 border border-border/60 rounded-xl bg-input resize-none focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-4">Ficha Técnica (Atributos)</label>
                  <div className="space-y-3">
                    {attributes.map((attr, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <input
                          type="text"
                          placeholder="Atributo (Ej. Marca, Modelo, Peso)"
                          value={attr.name}
                          onChange={e => updateAttribute(i, "name", e.target.value)}
                          className="flex-1 px-4 py-2 border border-border/60 rounded-lg bg-input"
                        />
                        <input
                          type="text"
                          placeholder="Valor (Ej. Cemex, 42.5kg)"
                          value={attr.value}
                          onChange={e => updateAttribute(i, "value", e.target.value)}
                          className="flex-1 px-4 py-2 border border-border/60 rounded-lg bg-input"
                        />
                        <button type="button" onClick={() => removeAttribute(i)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={addAttribute} className="mt-2">
                      <Plus size={16} className="mr-2" /> Agregar característica
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Pricing and Inventory */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><DollarSign className="text-primary"/> Precio e Inventario</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Precio <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select 
                        value={form.currency}
                        onChange={e => setForm({...form, currency: e.target.value})}
                        className="w-24 px-3 py-3 border border-border/60 rounded-xl bg-muted font-bold focus:outline-none"
                      >
                        <option value="USD">USD $</option>
                        <option value="VES">VES Bs</option>
                      </select>
                      <input
                        type="number"
                        min="0" step="0.01"
                        required
                        value={form.price}
                        onChange={e => setForm({...form, price: e.target.value})}
                        placeholder="0.00"
                        className="flex-1 px-4 py-3 text-xl font-bold border border-border/60 rounded-xl bg-input focus:ring-4 focus:ring-primary/20 transition-all text-right"
                      />
                    </div>
                  </div>

                  {form.condition !== "service" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Stock Disponible</label>
                        <input
                          type="number"
                          min="0"
                          value={form.stock}
                          onChange={e => setForm({...form, stock: e.target.value})}
                          placeholder="Cantidad"
                          className="w-full px-4 py-3 border border-border/60 rounded-xl bg-input focus:ring-4 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">SKU (Interno)</label>
                        <input
                          type="text"
                          value={form.sku}
                          onChange={e => setForm({...form, sku: e.target.value})}
                          placeholder="Código"
                          className="w-full px-4 py-3 border border-border/60 rounded-xl bg-input focus:ring-4 focus:ring-primary/20 transition-all uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6 p-6 bg-primary/5 rounded-xl border border-primary/10">
                  <h4 className="font-semibold flex items-center gap-2"><Truck className="text-primary" size={18}/> Logística y Condiciones</h4>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Método de Entrega</label>
                    <select
                      value={form.shippingMethod}
                      onChange={e => setForm({...form, shippingMethod: e.target.value})}
                      className="w-full px-4 py-3 border border-border/60 rounded-xl bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="delivery">Despacho a Nivel Nacional</option>
                      <option value="local">Solo Despacho Local</option>
                      <option value="pickup">Retiro en Tienda / Almacén</option>
                      <option value="digital">Digital / Remoto (Servicios)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Garantía</label>
                    <input
                      type="text"
                      value={form.warranty}
                      onChange={e => setForm({...form, warranty: e.target.value})}
                      placeholder="Ej. 6 meses por defectos de fábrica"
                      className="w-full px-4 py-3 border border-border/60 rounded-xl bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center bg-card p-6 border border-border rounded-xl shadow-lg sticky bottom-4 z-10">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          >
            {step > 1 ? "Atrás" : "Cancelar"}
          </Button>
          
          <div className="flex gap-4">
            <Button type="submit" size="lg" className="min-w-[200px] text-lg">
              {step < 3 ? "Continuar" : "Publicar Ahora"}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}
