
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BRAND_LOGO } from '../constants';
import { LogOut, User, ShieldCheck, LayoutDashboard, Sparkles } from 'lucide-react';

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

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6 lg:space-x-8">
            <NavLink to="/" label="Accueil" active={location.pathname === '/'} />
            <NavLink to="/vision" label="Vision" active={location.pathname === '/vision'} />
            <NavLink to="/avantages" label="Avantages" active={location.pathname === '/avantages'} />
            <NavLink to="/audit-miroir" label="Miroir du Succès" highlight active={location.pathname === '/audit-miroir'} />
            <NavLink to="/quiz" label="Diagnostic" active={location.pathname === '/quiz' || location.pathname === '/results'} />
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link to="/dashboard" className={`flex items-center gap-2 transition-colors p-2 rounded-xl ${location.pathname === '/dashboard' ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-brand-600'}`} title="Mon Espace">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <Link to="/profile" className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 overflow-hidden shadow-sm transition-all ${location.pathname === '/profile' ? 'border-brand-500 ring-2 ring-brand-100' : 'border-white hover:border-brand-500'}`}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="P" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-brand-100 w-full h-full flex items-center justify-center">
                      <span className="text-brand-700 font-black text-xs">{user.firstName?.[0] || 'U'}</span>
                    </div>
                  )}
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className={`p-2 transition-colors ${location.pathname === '/admin' ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600'}`} title="Administration">
                    <ShieldCheck className="w-6 h-6" />
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-brand-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-brand-800 transition-all active:scale-95">Connexion</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-400 hover:text-slate-500 bg-slate-50 rounded-xl">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-slate-100 p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <Link to="/" onClick={() => setMenuOpen(false)} className={`block font-bold p-4 rounded-2xl ${location.pathname === '/' ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'}`}>Accueil</Link>
          <Link to="/vision" onClick={() => setMenuOpen(false)} className={`block font-bold p-4 rounded-2xl ${location.pathname === '/vision' ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'}`}>Notre Vision</Link>
          <Link to="/avantages" onClick={() => setMenuOpen(false)} className={`block font-bold p-4 rounded-2xl ${location.pathname === '/avantages' ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'}`}>Avantages</Link>
          <Link to="/audit-miroir" onClick={() => setMenuOpen(false)} className={`block font-bold p-4 rounded-2xl flex items-center gap-2 ${location.pathname === '/audit-miroir' ? 'bg-brand-50 text-brand-600' : 'text-brand-600 hover:bg-slate-50'}`}>Miroir du Succès <Sparkles className="w-4 h-4" /></Link>
          <Link to="/quiz" onClick={() => setMenuOpen(false)} className={`block font-bold p-4 rounded-2xl ${location.pathname === '/quiz' ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'}`}>Diagnostic</Link>
          {user && (
            <>
              <div className="h-px bg-slate-100 my-2"></div>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-slate-700 font-bold p-4 hover:bg-slate-50 rounded-2xl">Mon Espace</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block text-slate-700 font-bold p-4 hover:bg-slate-50 rounded-2xl">Mon Profil</Link>
              {user.isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-brand-600 font-bold p-4 hover:bg-slate-50 rounded-2xl">Administration</Link>}
            </>
          )}
          {!user ? (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block bg-brand-600 text-white p-5 rounded-2xl font-black text-center text-xs uppercase tracking-widest">Connexion</Link>
          ) : (
            <button onClick={handleLogout} className="w-full text-rose-500 font-black uppercase text-[10px] tracking-widest p-4 text-left border-t border-slate-100">Déconnexion</button>
          )}
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, label, highlight = false, active = false }: { to: string, label: string, highlight?: boolean, active?: boolean }) => (
  <Link to={to} className={`font-black text-[10px] uppercase tracking-widest transition-colors relative group flex items-center gap-2 ${active ? 'text-brand-900' : highlight ? 'text-brand-600' : 'text-slate-500 hover:text-brand-900'}`}>
    {label}
    {highlight && <Sparkles className="w-3 h-3 animate-pulse" />}
    <span className={`absolute -bottom-1 left-0 h-0.5 transition-all group-hover:w-full group-hover:bg-brand-500 ${active ? 'w-full bg-brand-900' : 'w-0'}`}></span>
  </Link>
);

export default Navbar;
