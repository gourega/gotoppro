
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, X, Lock, Mail, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isRedirecting = useRef(false);

  // Redirection Prioritaire dès que l'état global AuthContext détecte l'admin
  useEffect(() => {
    if (isAdminModalOpen && authUser?.isAdmin && !isRedirecting.current) {
      isRedirecting.current = true;
      setIsAdminModalOpen(false);
      navigate('/admin');
      // Petit délai pour libérer le verrou de redirection
      setTimeout(() => { isRedirecting.current = false; }, 1000);
    }
  }, [authUser, isAdminModalOpen, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Sécurité double clic
    
    setError('');
    setLoading(true);

    if (!supabase) {
      setError("Configuration Supabase manquante.");
      setLoading(false);
      return;
    }

    try {
      const { error: loginError } = await (supabase.auth as any).signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (loginError) {
        if (loginError.message.includes("Invalid login credentials")) {
          throw new Error("Identifiants incorrects. Vérifiez votre compte Supabase Auth.");
        }
        throw loginError;
      }
      
      // La redirection est gérée par le useEffect au-dessus via AuthContext
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Une erreur est survenue.");
      setLoading(false); // On réactive le bouton seulement en cas d'erreur
    }
  };

  const closeAdminModal = () => {
    if (loading) return; // Empêcher de fermer pendant le chargement
    setIsAdminModalOpen(false);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <footer className="bg-[#1e293b] text-white py-10 px-6 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <div className="space-y-3">
            <h3 className="text-xl font-bold font-serif">Go'Top <span className="text-brand-500">Pro</span></h3>
            <p className="text-slate-400 text-sm">L'excellence au service de votre salon.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact</h4>
            <a href="mailto:teletechnologyci@gmail.com" className="text-slate-300 text-sm flex items-center gap-2 hover:text-brand-400">
              <Mail className="w-4 h-4" /> teletechnologyci@gmail.com
            </a>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Légal</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <span className="cursor-default">Version Pro 2.5</span>
              <span className="opacity-50">© {new Date().getFullYear()} Go'Top Pro.</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex justify-end items-center">
          <button 
            onClick={() => setIsAdminModalOpen(true)} 
            className="text-slate-700 hover:text-brand-400 p-2 transition-colors flex items-center gap-2"
            title="Accès Administrateur"
          >
            <span className="text-[8px] font-black uppercase tracking-widest opacity-0 hover:opacity-100 transition-opacity">Zone Pilote</span>
            <Lock className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1e293b] w-full max-w-md rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 relative overflow-hidden">
            <button 
              onClick={closeAdminModal} 
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-10">
              <div className="h-16 w-16 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Accès Administrateur</h2>
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Zone de pilotage Go'Top Pro</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-[10px] font-bold flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    placeholder="Email Master Admin"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    placeholder="Mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-500 transition shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "S'identifier"}
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
