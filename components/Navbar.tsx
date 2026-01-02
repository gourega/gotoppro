
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-serif font-bold text-brand-900">
              Go'Top <span className="text-brand-500">Pro</span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/" className="text-slate-600 hover:text-brand-600 font-medium">Accueil</Link>
            <Link to="/quiz" className="text-slate-600 hover:text-brand-600 font-medium">Diagnostic</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-brand-600 font-medium">Mon Espace</Link>
                {user.isAdmin && <Link to="/admin" className="text-brand-600 font-bold">Admin</Link>}
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center border-2 border-brand-200 overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt="P" className="w-full h-full object-cover" /> : <span className="text-brand-700 font-bold">{user.firstName?.[0] || 'U'}</span>}
                  </Link>
                  <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 text-sm font-medium">Déconnexion</button>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:bg-brand-700 transition">Connexion</Link>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-400 hover:text-slate-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-slate-100 p-4 space-y-2">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-slate-700 py-2">Accueil</Link>
          <Link to="/quiz" onClick={() => setMenuOpen(false)} className="block text-slate-700 py-2">Diagnostic</Link>
          {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-slate-700 py-2">Mon Espace</Link>}
          {!user && <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-brand-600 font-bold py-2">Connexion</Link>}
          {user && <button onClick={handleLogout} className="block text-red-500 py-2">Déconnexion</button>}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
