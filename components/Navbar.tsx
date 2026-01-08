
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BRAND_LOGO } from '../constants';
import { LogOut, LayoutDashboard, Wallet, Menu, X } from 'lucide-react';

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
        
        <Link to="/" className="flex items-center gap-3">
          <img src={BRAND_LOGO} alt="Go'Top Pro" className="h-10 w-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-lg font-black text-brand-900 leading-none flex items-center gap-2">
              Go'Top Pro
              <span className="bg-emerald-500 text-white text-[7px] px-1.5 py-0.5 rounded-full animate-pulse">V2 KITA</span>
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          <NavLink to="/" label="Accueil" active={location.pathname === '/'} />
          <NavLink to="/audit-miroir" label="Miroir" active={location.pathname === '/audit-miroir'} />
          
          {user && (
            <Link 
              to="/caisse" 
              className="flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest bg-amber-400 text-brand-900 shadow-[0_10px_30px_rgba(251,191,36,0.4)] hover:scale-105 transition-all animate-bounce-short"
            >
              <Wallet className="w-5 h-5" />
              Ma Caisse Kita
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
              <Link to="/dashboard" className="p-2.5 text-slate-400 hover:text-brand-600"><LayoutDashboard /></Link>
              <Link to="/profile" className="h-10 w-10 rounded-xl overflow-hidden border-2 border-emerald-500">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.firstName}&background=10b981&color=fff`} alt="P" className="w-full h-full object-cover" />
              </Link>
              <button onClick={handleLogout} className="p-2.5 text-slate-300 hover:text-rose-500"><LogOut /></button>
            </div>
          ) : (
            <Link to="/login" className="bg-brand-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Connexion</Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-slate-900 bg-slate-100 rounded-xl"><Menu /></button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-2xl p-6 flex flex-col gap-4 lg:hidden">
          {user && (
            <Link to="/caisse" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-3 p-6 bg-amber-400 text-brand-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">
              <Wallet className="w-6 h-6" /> OUVRIR MA CAISSE KITA
            </Link>
          )}
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="p-4 font-bold border-b border-slate-50">Dashboard Gérant</Link>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, label, active = false }: { to: string, label: string, active?: boolean }) => (
  <Link to={to} className={`font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-brand-900'}`}>
    {label}
  </Link>
);

export default Navbar;
