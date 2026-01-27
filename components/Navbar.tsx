import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BRAND_LOGO, KITA_LOGO } from '../constants';
import { 
  LogOut, 
  LayoutDashboard, 
  Wallet, 
  Menu, 
  X, 
  Eye, 
  Star, 
  ClipboardCheck, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Accueil', icon: null },
    { to: '/vision', label: 'Vision', icon: <Eye className="w-3.5 h-3.5" /> },
    { to: '/avantages', label: 'Avantages', icon: <Star className="w-3.5 h-3.5" /> },
    { to: '/audit-miroir', label: 'Miroir du Succès', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { to: '/quiz', label: 'Diagnostic', icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] h-20 flex items-center shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        
        {/* Logo & Version - Sécurisé */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 shrink-0 overflow-hidden">
            <img src={BRAND_LOGO} alt="Go'Top Pro" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-brand-900 leading-none flex items-center gap-2">
              Go'Top Pro
              <div className="flex items-center bg-emerald-500 px-2 py-0.5 rounded-full gap-1">
                <img src={KITA_LOGO} className="h-2.5 w-2.5 object-contain brightness-0 invert" alt="K" />
                <span className="text-white text-[7px] font-black uppercase">V2.5</span>
              </div>
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Excellence & Beauté</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.15em] transition-all hover:text-brand-600 ${
                location.pathname === link.to ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {user && (
            <Link 
              to="/caisse" 
              className="hidden lg:flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-amber-400 text-brand-900 shadow-lg shadow-amber-200 hover:scale-105 transition-all"
            >
              <img src={KITA_LOGO} className="h-4 w-4 object-contain" alt="" />
              Ma Caisse KITA
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
              <Link to="/dashboard" title="Tableau de bord" className={`p-2 rounded-xl transition-colors ${location.pathname === '/dashboard' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              
              <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-emerald-500 hover:scale-110 transition-transform mx-1 cursor-pointer" onClick={() => navigate('/profile')}>
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.firstName}&background=10b981&color=fff`} 
                  alt="Profil" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {user.isAdmin && (
                <Link to="/admin" title="Administration" className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                  <ShieldAlert className="w-5 h-5" />
                </Link>
              )}

              {/* Bouton de déconnexion accentué sur Desktop */}
              <button 
                onClick={handleLogout} 
                className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase tracking-widest">Quitter</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-brand-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-800 transition-all shadow-md">
              Connexion
            </Link>
          )}

          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="xl:hidden p-2 text-slate-900 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-20 bg-slate-900/95 backdrop-blur-md z-[150] xl:hidden">
          <div className="bg-white w-full shadow-2xl p-8 flex flex-col gap-6 rounded-b-[3rem] max-h-[85vh] overflow-y-auto">
            {user && (
              <Link to="/caisse" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-4 p-6 bg-amber-400 text-brand-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">
                <img src={KITA_LOGO} className="h-6 w-6 object-contain" alt="" /> MA CAISSE KITA
              </Link>
            )}
            
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="flex items-center gap-4 p-4 font-black text-xs uppercase tracking-widest text-slate-600 border-b border-slate-50">
                  <div className="p-2 bg-slate-100 rounded-lg text-brand-600">{link.icon || <Sparkles className="w-4 h-4"/>}</div>
                  {link.label}
                </Link>
              ))}
              
              {user?.isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 p-4 font-black text-xs uppercase tracking-widest text-brand-600 bg-brand-50 rounded-xl">
                  <div className="p-2 bg-brand-100 rounded-lg"><ShieldAlert className="w-4 h-4"/></div>
                  Pilotage Admin
                </Link>
              )}

              {/* BOUTON DÉCONNEXION MOBILE - TRÈS VISIBLE */}
              {user && (
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="mt-8 flex items-center justify-center gap-4 p-6 bg-rose-50 text-rose-600 rounded-[2rem] font-black text-xs uppercase tracking-widest border-2 border-rose-100 hover:bg-rose-100 transition-all shadow-sm"
                >
                  <LogOut className="w-6 h-6" />
                  DÉCONNEXION (SORTIE)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;