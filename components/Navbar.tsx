
import React, { useState } from 'react';
// @ts-ignore
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BRAND_LOGO, KITA_LOGO } from '../constants';
import { 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X, 
  Eye, 
  Star, 
  ClipboardCheck, 
  Sparkles,
  ShieldAlert,
  Users
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Accueil', icon: null },
    { to: '/vision', label: 'Vision', icon: <Eye className="w-3.5 h-3.5" /> },
    { to: '/avantages', label: 'Avantages', icon: <Star className="w-3.5 h-3.5" /> },
    { to: '/nos-gerants', label: 'Nos Gérants', icon: <Users className="w-3.5 h-3.5" /> },
    { to: '/audit-miroir', label: 'Miroir du Succès', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { to: '/quiz', label: 'Diagnostic', icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] h-20 flex items-center shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        
        {/* Logo & Version */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 shrink-0 overflow-hidden">
            <img src={BRAND_LOGO} alt="Go'Top Pro" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col hidden xs:flex">
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

        {/* Desktop Navigation (links) */}
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

        {/* Right Section (Actions) */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {user && (
            <Link 
              to="/dashboard" 
              title="Tableau de bord" 
              className={`p-3 rounded-xl transition-colors ${location.pathname === '/dashboard' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
          )}

          {user ? (
            <>
              {/* BOUTON QUITTER - TOUJOURS VISIBLE (MÊME SUR MOBILE) */}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shadow-sm active:scale-95 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Quitter</span>
              </button>

              <div 
                className="h-10 w-10 rounded-xl overflow-hidden border-2 border-emerald-500 cursor-pointer hidden sm:block" 
                onClick={() => navigate('/profile')}
              >
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.firstName}&background=10b981&color=fff`} 
                  alt="Profil" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {user.isAdmin && (
                <Link to="/admin" title="Administration" className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition-all hidden md:block">
                  <ShieldAlert className="w-5 h-5" />
                </Link>
              )}
            </>
          ) : (
            <Link to="/login" className="bg-brand-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-800 transition-all shadow-md">
              Connexion
            </Link>
          )}

          {/* Hamburger pour les liens restants */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="xl:hidden p-3 text-slate-900 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Overlay) */}
      {menuOpen && (
        <div className="fixed inset-0 top-20 bg-slate-900/95 backdrop-blur-md z-[150] xl:hidden">
          <div className="bg-white w-full shadow-2xl p-8 flex flex-col gap-6 rounded-b-[3rem] max-h-[85vh] overflow-y-auto animate-in slide-in-from-top duration-300">
            {user && (
              <Link to="/caisse" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-4 p-6 bg-amber-400 text-brand-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">
                <img src={KITA_LOGO} className="h-6 w-6 object-contain" alt="" /> MA CAISSE KITA
              </Link>
            )}
            
            <div className="grid grid-cols-1 gap-2">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-4 mb-2">Navigation</p>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={`flex items-center gap-4 p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${location.pathname === link.to ? 'bg-brand-50 text-brand-600' : 'text-slate-600 border-b border-slate-50'}`}>
                  <div className={`p-2 rounded-lg ${location.pathname === link.to ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{link.icon || <Sparkles className="w-4 h-4"/>}</div>
                  {link.label}
                </Link>
              ))}
              
              {user && (
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 p-5 font-black text-xs uppercase tracking-widest text-slate-600 border-b border-slate-50">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><LayoutDashboard className="w-4 h-4"/></div>
                  Mon Profil Gérant
                </Link>
              )}

              {user?.isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 p-5 font-black text-xs uppercase tracking-widest text-brand-600 bg-brand-50 rounded-2xl mt-4">
                  <div className="p-2 bg-brand-100 rounded-lg"><ShieldAlert className="w-4 h-4"/></div>
                  Pilotage Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
