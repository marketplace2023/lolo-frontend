import { Outlet, Link, useNavigate } from "react-router";
import { ShoppingBag, Facebook, Instagram, ArrowLeft } from "lucide-react";

export function PublicLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      {/* Top announcement bar */}
      <div className="bg-[#FF6A00] text-white text-xs font-bold text-center py-2 px-4 tracking-wide shrink-0">
        ¡APROVECHA DESCUENTOS EN MATERIALES AL MAYOR! |{" "}
        <Link to="/register" className="underline hover:text-white/80">
          QUIERO VENDER MIS PRODUCTOS
        </Link>
      </div>

      {/* Main navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Back button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
              title="Volver atrás"
            >
              <ArrowLeft size={20} />
            </button>

            <Link to="/store" className="flex flex-col font-black text-xl leading-none text-gray-900 tracking-tighter">
              <span>LULO<span className="text-[#FF6A00]">WinNG</span></span>
              <span className="text-[9px] tracking-widest text-gray-400 uppercase mt-0.5 font-normal">Marketplace</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-gray-700">
            <Link to="/shop" className="hover:text-[#FF6A00] transition-colors">Comprar</Link>
            <Link to="/directory" className="hover:text-[#FF6A00] transition-colors">Directorio de Empresas</Link>
            <Link to="/register" className="hover:text-[#FF6A00] transition-colors">Quiero Vender</Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 text-gray-500">
              <a href="#" className="hover:text-[#FF6A00] transition-colors"><Facebook size={18} /></a>
              <a href="#" className="hover:text-[#FF6A00] transition-colors"><Instagram size={18} /></a>
            </div>
            <div className="h-5 w-px bg-gray-200 hidden lg:block" />
            <button className="relative text-gray-700 hover:text-[#FF6A00] transition-colors">
              <ShoppingBag size={22} />
              <span className="absolute -top-1 -right-1 bg-[#FF6A00] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </button>
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#FF6A00] text-white pt-12 pb-6 shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/20 pb-10">
          <div className="md:col-span-5 space-y-3">
            <h3 className="text-2xl font-black tracking-tighter">
              LULOWinNG<br/>
              <span className="text-base font-normal opacity-80">Marketplace de Construcción</span>
            </h3>
            <p className="text-white/80 max-w-sm text-sm leading-relaxed">
              Ahorra en materiales y encuentra mano de obra calificada en un solo lugar.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="bg-white/10 p-2.5 rounded-full hover:bg-white/20 transition-colors"><Facebook size={18} /></a>
              <a href="#" className="bg-white/10 p-2.5 rounded-full hover:bg-white/20 transition-colors"><Instagram size={18} /></a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-sm">Contáctanos</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>+58 (412) 123-4567</li>
              <li>soporte@lulowin.com</li>
              <li>Caracas, Venezuela</li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-sm">Comunidad</h4>
            <p className="text-sm text-white/80">Recibe las mejores ofertas directo a tu correo.</p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="w-full px-4 py-2.5 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-black text-sm"
              />
              <button className="w-full px-4 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors text-sm">
                Suscribirse al boletín
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} LULOWinNG Marketplace. Todos los derechos reservados.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Términos de servicio</a>
            <a href="#" className="hover:text-white transition-colors">Políticas de privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
