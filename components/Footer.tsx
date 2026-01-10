
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, X, Lock, Mail, ShieldCheck, AlertCircle, KeyRound, Phone } from 'lucide-react';
import { BRAND_LOGO } from '../constants';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isRedirecting = useRef(false);

  useEffect(() => {
    if (isAdminModalOpen && authUser?.isAdmin && !isRedirecting.current) {
      isRedirecting.current = true;
      setIsAdminModalOpen(false);
      navigate('/admin');
      setTimeout(() => { isRedirecting.current = false; }, 1000);
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
      const { error: loginError } = await (supabase.auth as any).signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (loginError) throw new Error("Identifiants incorrects.");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
      setLoading(false);
    }
  };

  const closeAdminModal = () => {
    if (loading) return;
    setIsAdminModalOpen(false);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <footer className="bg-[#1a2332] text-white pt-20 pb-8 px-6 mt-auto border-t border-white/5 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* Bloc 1: Identité & Invitation */}
          <div className="md:col-span-5 space-y-8">
            <Link to="/" className="flex items-center gap-3">
              <img src={BRAND_LOGO} alt="Go'Top Pro" className="h-10 w-10 object-contain" />
              <div className="flex flex-col">
                <span className="text-xl font-black text-white leading-none">
                  Go'Top <span className="text-brand-500">Pro</span>
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Excellence & Beauté</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              Une question ? Notre équipe d'experts est à votre disposition pour vous accompagner vers l'excellence et la rentabilité de votre salon.
            </p>
          </div>

          {/* Bloc 2: Contacts & Services */}
          <div className="md:col-span-4 space-y-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Contacts & Services</h4>
            <div className="space-y-5">
              <a href="mailto:ourega.goble@canticthinkia.ci" className="group flex items-center gap-4 text-slate-300 hover:text-brand-400 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                  <Mail className="w-5 h-5 text-slate-500 group-hover:text-brand-500" />
                </div>
                <span className="text-sm font-bold">ourega.goble@canticthinkia.ci</span>
              </a>
              <a href="https://wa.me/2250103438456" target="_blank" rel="noreferrer" className="group flex items-center gap-4 text-slate-300 hover:text-brand-400 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                  <Phone className="w-5 h-5 text-slate-500 group-hover:text-brand-500" />
                </div>
                <span className="text-sm font-bold">WhatsApp: +225 0103438456</span>
              </a>
            </div>
          </div>

          {/* Bloc 3: Légal */}
          <div className="md:col-span-3 space-y-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Légal</h4>
            <nav className="flex flex-col gap-4 text-sm font-bold text-slate-400">
              <Link to="/mentions" className="hover:text-white transition-colors">Mentions légales</Link>
              <Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link to="/cgv" className="hover:text-white transition-colors">CGV</Link>
            </nav>
          </div>
        </div>

        {/* Barre de Copyright & Cadenas Admin */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] text-center md:text-left">
            © 2026 GO'TOP PRO. PROPULSÉ PAR CANTICTHINKIA.
          </p>
          
          <button 
            onClick={() => setIsAdminModalOpen(true)} 
            className="group flex items-center gap-2 text-slate-800 hover:text-slate-500 transition-all p-2"
            title="Accès Pilotage"
          >
            <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Pilotage</span>
            <Lock className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modal Admin */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1e293b] w-full max-w-md rounded-[3rem] border border-white/5 shadow-2xl p-10 relative overflow-hidden">
            <button 
              onClick={closeAdminModal} 
              className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white transition-colors" 
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
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-8 text-[10px] font-bold flex items-start gap-3 animate-in shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="Email Master Admin" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" 
                    required 
                    disabled={loading} 
                  />
                </div>
                <div className="relative group">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                  <input 
                    type="password" 
                    placeholder="Mot de passe" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" 
                    required 
                    disabled={loading} 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-brand-600 text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-500 transition shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
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
