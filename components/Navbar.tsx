
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BRAND_LOGO } from '../constants';
import { LogOut, User, ShieldCheck, LayoutDashboard, Sparkles } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <NavLink to="/" label="Accueil" />
            <NavLink to="/vision" label="Vision" />
            <NavLink to="/audit-miroir" label="Audit Miroir" highlight />
            <NavLink to="/quiz" label="Diagnostic" />
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors p-2 rounded-xl" title="Mon Espace">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <Link to="/profile" className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center border-2 border-white overflow-hidden shadow-sm hover:border-brand-500 transition-all">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="P" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-brand-700 font-black text-xs">{user.firstName?.[0] || 'U'}</span>
                  )}
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="text-brand-600 hover:text-brand-700 p-2" title="Administration">
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
          <Link to="/" className="block text-slate-700 font-bold p-4 hover:bg-slate-50 rounded-2xl">Accueil</Link>
          <Link to="/vision" className="block text-slate-700 font-bold p-4 hover:bg-slate-50 rounded-2xl">Notre Vision</Link>
          <Link to="/audit-miroir" className="block text-brand-600 font-bold p-4 hover:bg-slate-50 rounded-2xl flex items-center gap-2">Audit Miroir <Sparkles className="w-4 h-4" /></Link>
          <Link to="/quiz" className="block text-slate-700 font-bold p-4 hover:bg-slate-50 rounded-2xl">Diagnostic</Link>
          {user && (
            <>
              <div className="h-px bg-slate-100 my-2"></div>
              <Link to="/dashboard" className="block text-slate-700 font-bold p-4 hover:bg-slate-50 rounded-2xl">Mon Espace</Link>
              <Link to="/profile" className="block text-slate-700 font-bold p-4 hover:bg-slate-50 rounded-2xl">Mon Profil</Link>
              {user.isAdmin && <Link to="/admin" className="block text-brand-600 font-bold p-4 hover:bg-slate-50 rounded-2xl">Administration</Link>}
            </>
          )}
          {!user ? (
            <Link to="/login" className="block bg-brand-600 text-white p-5 rounded-2xl font-black text-center text-xs uppercase tracking-widest">Connexion</Link>
          ) : (
            <button onClick={handleLogout} className="w-full text-rose-500 font-black uppercase text-[10px] tracking-widest p-4 text-left border-t border-slate-100">Déconnexion</button>
          )}
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, label, highlight = false }: { to: string, label: string, highlight?: boolean }) => (
  <Link to={to} className={`font-black text-[10px] uppercase tracking-widest transition-colors relative group flex items-center gap-2 ${highlight ? 'text-brand-600' : 'text-slate-500 hover:text-brand-900'}`}>
    {label}
    {highlight && <Sparkles className="w-3 h-3 animate-pulse" />}
    <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${highlight ? 'bg-brand-600 w-full' : 'bg-brand-500'}`}></span>
  </Link>
);

export default Navbar;
