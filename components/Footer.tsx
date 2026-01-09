
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, X, Lock, Mail, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si l'utilisateur devient admin alors que la modale est ouverte, on redirige
  useEffect(() => {
    if (isAdminModalOpen && authUser?.isAdmin) {
      setIsAdminModalOpen(false);
      setLoading(false);
      navigate('/admin');
    }
  }, [authUser, isAdminModalOpen, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setError('');
    setLoading(true);

    if (!supabase) {
      setError("Configuration Supabase manquante.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (loginError) throw loginError;

      // Si login OK, on laisse le useEffect ou le AuthContext gérer la suite
      // On ne met pas loading à false ici pour garder le spinner jusqu'à la redirection
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message === "Invalid login credentials" ? "Identifiants incorrects." : err.message);
      setLoading(false);
    }
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
              <Link to="/cgv" className="hover:text-white">CGV</Link>
              <Link to="/confidentialite" className="hover:text-white">Confidentialité</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold">© {new Date().getFullYear()} Go'Top Pro.</p>
          <button onClick={() => setIsAdminModalOpen(true)} className="text-slate-600 hover:text-brand-400 p-2">
            <Lock className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1e293b] w-full max-w-md rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 relative overflow-hidden">
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white">
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
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-xs font-bold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  required
                />
                <input 
                  type="password" 
                  placeholder="Mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-500 transition shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3"
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
