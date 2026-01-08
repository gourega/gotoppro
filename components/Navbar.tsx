
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BRAND_LOGO } from '../constants';
import { LogOut, LayoutDashboard, Wallet, ShieldCheck, Menu, X, Bell } from 'lucide-react';

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
    <nav className="bg-white border-b-4 border-emerald-500 sticky top-0 z-[100] h-20 flex items-center shadow-xl">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        
        {/* LOGO AVEC BADGE VERSION */}
        <Link to="/" className="flex items-center gap-3 relative">
          <img src={BRAND_LOGO} alt="Go'Top Pro" className="h-10 w-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-lg font-black text-brand-900 leading-none flex items-center gap-2">
              Go'Top Pro
              <span className="bg-emerald-500 text-white text-[7px] px-1.5 py-0.5 rounded-full animate-pulse">V2 KITA</span>
            </span>
            <span className="text-[7px] uppercase tracking-widest text-slate-400 font-bold">Excellence & Beauté</span>
          </div>
        </Link>

        {/* LIENS DESKTOP - MA CAISSE EST MIS EN AVANT PAR LA COULEUR */}
        <div className="hidden lg:flex items-center gap-4">
          <NavLink to="/" label="Accueil" active={location.pathname === '/'} />
          <NavLink to="/vision" label="Vision" active={location.pathname === '/vision'} />
          <NavLink to="/audit-miroir" label="Miroir" active={location.pathname === '/audit-miroir'} />
          <NavLink to="/quiz" label="Diagnostic" active={location.pathname === '/quiz'} />
          
          {/* LIEN CAISSE - VISIBLE POUR TOUS LES LOGGÉS (GÉRANTS & ADMINS) */}
          {user && (
            <Link 
              to="/caisse" 
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all scale-110 mx-2 ${location.pathname === '/caisse' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_10px_20px_rgba(16,185,129,0.3)]'}`}
            >
              <Wallet className="w-4 h-4" />
              Ma Caisse Kita
            </Link>
          )}
        </div>

        {/* ZONE UTILISATEUR */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
              <Link to="/dashboard" className={`p-2.5 rounded-xl transition-all ${location.pathname === '/dashboard' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-brand-600'}`} title="Dashboard">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              <Link to="/profile" className="h-10 w-10 rounded-xl overflow-hidden border-2 border-emerald-100 p-0.5 hover:border-emerald-500 transition-all">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.firstName}&background=10b981&color=fff`} alt="P" className="w-full h-full object-cover rounded-lg" />
              </Link>
              <button onClick={handleLogout} className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-brand-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Connexion</Link>
          )}
          
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-slate-900 bg-slate-50 rounded-xl">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE - MA CAISSE EN PREMIER */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-2xl border-b border-slate-100 p-6 flex flex-col gap-4 lg:hidden animate-in slide-in-from-top duration-300">
          {user && (
            <Link to="/caisse" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-3 p-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">
              <Wallet className="w-6 h-6" /> OUVRIR MA CAISSE KITA
            </Link>
          )}
          <Link to="/" onClick={() => setMenuOpen(false)} className="p-4 font-bold text-slate-900 border-b border-slate-50">Accueil</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="p-4 font-bold text-slate-900 border-b border-slate-50">Mon Espace Gérant</Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)} className="p-4 font-bold text-slate-900">Mon Profil</Link>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, label, active = false }: { to: string, label: string, active?: boolean }) => (
  <Link to={to} className={`font-black text-[10px] uppercase tracking-[0.2em] transition-all px-2 py-1 ${active ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-brand-900'}`}>
    {label}
  </Link>
);

export default Navbar;
