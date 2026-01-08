
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BRAND_LOGO } from '../constants';
import { LogOut, User, ShieldCheck, LayoutDashboard, Sparkles, CreditCard, Wallet } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-serif font-bold text-brand-900 flex items-center gap-3 group">
              <div className="h-11 w-11 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 border border-slate-100">
                <img src={BRAND_LOGO} alt="Go'Top Pro" className="w-full h-full object-contain p-1" onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230c4a6e'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                }} />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-xl tracking-tight">Go'Top <span className="text-brand-600">Pro</span></span>
                <span className="text-slate-400 text-[8px] uppercase font-black tracking-[0.3em]">Excellence & Beauté</span>
              </div>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-6 lg:space-x-8">
            <NavLink to="/" label="Accueil" active={location.pathname === '/'} />
            <NavLink to="/vision" label="Vision" active={location.pathname === '/vision'} />
            <NavLink to="/avantages" label="Avantages" active={location.pathname === '/avantages'} />
            <NavLink to="/audit-miroir" label="Miroir" active={location.pathname === '/audit-miroir'} />
            <NavLink to="/quiz" label="Diagnostic" active={location.pathname === '/quiz'} />
            
            {/* MA CAISSE - INSÉRÉ COMME LIEN DE MENU STANDARD */}
            {user && (
              <NavLink to="/caisse" label="Ma Caisse" active={location.pathname === '/caisse'} highlight />
            )}
            
            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-100">
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-2 transition-all p-2.5 rounded-xl ${location.pathname === '/dashboard' ? 'text-brand-600 bg-brand-50 shadow-inner' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'}`} 
                  title="Tableau de bord"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>

                <Link to="/profile" className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 overflow-hidden shadow-sm transition-all ${location.pathname === '/profile' ? 'border-brand-500 ring-2 ring-brand-100' : 'border-white hover:border-brand-500'}`}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="P" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-brand-100 w-full h-full flex items-center justify-center text-brand-700 font-black text-xs">
                      {user.firstName?.[0] || 'U'}
                    </div>
                  )}
                </Link>

                {user.isAdmin && (
                  <Link to="/admin" className={`p-2.5 transition-colors ${location.pathname === '/admin' ? 'text-brand-600 bg-brand-50 rounded-xl' : 'text-slate-400 hover:text-brand-600'}`} title="Administration">
                    <ShieldCheck className="w-6 h-6" />
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-brand-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-brand-800 transition-all active:scale-95">Connexion</Link>
            )}
          </div>

          <div className="flex items-center sm:hidden gap-2">
            {user && (
              <Link to="/caisse" className="p-2 rounded-xl text-emerald-600 bg-emerald-50">
                <Wallet className="w-5 h-5" />
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-400 hover:text-slate-500 bg-slate-50 rounded-xl">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-slate-100 p-6 space-y-4 animate-in slide-in-from-top duration-300">
          {user && (
            <Link to="/caisse" onClick={() => setMenuOpen(false)} className="block font-black p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-3">
              <Wallet className="w-5 h-5" /> MA CAISSE
            </Link>
          )}
          <Link to="/" onClick={() => setMenuOpen(false)} className="block font-bold p-4 text-slate-700">Accueil</Link>
          <Link to="/vision" onClick={() => setMenuOpen(false)} className="block font-bold p-4 text-slate-700">Vision</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block font-bold p-4 text-slate-700">Tableau de bord</Link>
          {user && <button onClick={handleLogout} className="w-full text-rose-500 font-black uppercase text-[10px] tracking-widest p-4 text-left border-t border-slate-100">Déconnexion</button>}
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, label, highlight = false, active = false }: { to: string, label: string, highlight?: boolean, active?: boolean }) => (
  <Link to={to} className={`font-black text-[10px] uppercase tracking-widest transition-colors relative group flex items-center gap-2 ${active ? 'text-brand-900' : highlight ? 'text-emerald-600 underline decoration-2 underline-offset-4' : 'text-slate-500 hover:text-brand-900'}`}>
    {label}
    {highlight && <Sparkles className="w-3 h-3 animate-pulse" />}
    <span className={`absolute -bottom-1 left-0 h-0.5 transition-all group-hover:w-full group-hover:bg-brand-500 ${active ? 'w-full bg-brand-900' : 'w-0'}`}></span>
  </Link>
);

export default Navbar;
