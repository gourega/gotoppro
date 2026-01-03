
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Loader2, X, Lock, Mail, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setError('');
    setShowTroubleshoot(false);
    setLoading(true);

    if (!supabase) {
      setError("Erreur : Client de connexion non initialisé.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (loginError) {
        throw loginError;
      }

      if (data?.user) {
        setIsAdminModalOpen(false);
        navigate('/admin');
      }
    } catch (err: any) {
      console.error("Erreur Auth Admin:", err);
      
      if (err.message === "Email not confirmed") {
        setError("Email non confirmé dans Supabase.");
        setShowTroubleshoot(true);
      } else if (err.message === "Invalid login credentials") {
        setError("Identifiants incorrects.");
      } else {
        setError(err.message || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#1e293b] text-white py-10 px-6 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          
          <div className="space-y-3">
            <h3 className="text-xl font-bold font-serif tracking-tight">
              Go'Top <span className="text-brand-500">Pro</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Une question ? Notre équipe d'experts est à votre disposition pour vous accompagner vers l'excellence.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contacts & Services</h4>
            <div className="flex flex-col gap-3 text-sm font-medium">
              <a 
                href="mailto:ourega.goble@canticthinkia.ci" 
                className="text-slate-300 hover:text-brand-400 transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                ourega.goble@canticthinkia.ci
              </a>
              <a 
                href="https://wa.me/2250103438456" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-300 hover:text-brand-400 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp: +225 0103438456
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Légal</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/mentions-legales" className="text-slate-400 hover:text-white transition-colors">Mentions légales</Link>
              <Link to="/confidentialite" className="text-slate-400 hover:text-white transition-colors">Confidentialité</Link>
              <Link to="/cgv" className="text-slate-400 hover:text-white transition-colors">CGV</Link>
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} Go'Top Pro. Propulsé par CanticThinkia.
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setError('');
                setIsAdminModalOpen(true);
              }}
              aria-label="Accès sécurisé"
              title="Accès sécurisé"
              className="text-slate-600 hover:text-brand-400 transition-colors duration-300 p-2"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1e293b] w-full max-w-md rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-[80px]"></div>
            
            <button 
              onClick={() => {
                setIsAdminModalOpen(false);
                setShowTroubleshoot(false);
              }}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-10">
              <div className="h-16 w-16 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-brand-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2 tracking-tight">Accès Administrateur</h2>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Zone de pilotage Go'Top Pro</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-xs font-bold flex flex-col gap-3 animate-in shake duration-300">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
                
                {showTroubleshoot && (
                  <div className="mt-2 p-3 bg-slate-900/50 rounded-lg border border-rose-500/30 text-[10px] leading-relaxed font-medium">
                    <p className="text-white mb-2 flex items-center gap-2">
                      <HelpCircle className="w-3 h-3 text-brand-400" />
                      Comment débloquer :
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Allez dans votre dashboard Supabase</li>
                      <li>Authentication &gt; Providers &gt; Email</li>
                      <li>Décochez <span className="text-brand-400">"Confirm email"</span></li>
                      <li>Cliquez sur <span className="text-brand-400">Save</span></li>
                    </ol>
                    <button 
                      onClick={handleAdminLogin}
                      className="mt-4 w-full py-2 bg-brand-500/20 text-brand-400 rounded-md hover:bg-brand-500/30 transition border border-brand-500/40 uppercase tracking-widest font-black text-[9px]"
                    >
                      Réessayer après correction
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    placeholder="Email Professionnel"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    placeholder="Mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-500 transition shadow-lg shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'identifier"}
              </button>

              <p className="text-center text-[9px] text-slate-500 uppercase tracking-widest font-black opacity-50">
                L'accès est journalisé pour des raisons de sécurité.
              </p>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
