
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RAYMOND_LOGO, RAYMOND_FB_URL, COACH_KITA_PHONE } from '../constants';
import { BUILD_CONFIG } from '../services/supabase';
import { 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Star, 
  ExternalLink, 
  ShieldAlert, 
  MessageCircle, 
  Lock, 
  Database, 
  ServerCrash,
  Settings2,
  RefreshCw
} from 'lucide-react';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending'>('idle');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  
  const { user, loginManually, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const businessWaUrl = `https://wa.me/${COACH_KITA_PHONE.replace(/\+/g, '').replace(/\s/g, '')}`;

  useEffect(() => {
    if (user && !authLoading) {
      if (user.isAdmin) navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('gotop_temp_ref', ref);
    
    const savedPhone = localStorage.getItem('gotop_manual_phone');
    if (savedPhone) setPhone(savedPhone.replace('+225', ''));
  }, [location]);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setStatus('idle');
    
    let cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone) return setError('Veuillez entrer votre numéro.');
    if (pin.length < 4) return setError('Le code PIN doit comporter 4 chiffres.');
    
    if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
    if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;

    setLoading(true);
    try {
      const result = await loginManually(cleanPhone, pin);
      
      if (!result.success) {
        if (result.error?.includes("attente")) {
          setStatus('pending');
        } else {
          setError(result.error || "Identifiants invalides.");
        }
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "DB_CONFIG_MISSING") {
        setError("Blocage stratégique : Le serveur n'a pas les clés de la base de données.");
        setShowDiagnostic(true);
      } else {
        setError("Erreur technique. Vérifiez votre connexion.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 overflow-hidden relative mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none text-8xl italic font-serif leading-none">Go'Top</div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="h-20 w-20 bg-brand-50 text-brand-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-brand-100">
            👑
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Accès Privé</h2>
          <p className="text-slate-500 font-medium text-sm">Gérez votre salon avec l'Excellence Kita.</p>
        </div>

        {error && (
          <div className={`p-6 rounded-[2rem] mb-6 text-xs font-bold border flex items-start gap-4 animate-in slide-in-from-top-2 ${showDiagnostic ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            {showDiagnostic ? <ServerCrash className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <div className="space-y-3 flex-grow">
              <p>{error}</p>
              {error.includes("connu") && <Link to="/quiz" className="inline-block bg-rose-600 text-white px-4 py-2 rounded-xl uppercase tracking-widest text-[9px] font-black">Lancer le diagnostic</Link>}
              {showDiagnostic && (
                <button onClick={() => setShowDiagnostic(true)} className="flex items-center gap-2 text-amber-900 underline decoration-amber-500/30">Détails du blocage</button>
              )}
            </div>
          </div>
        )}

        {showDiagnostic && (
          <div className="mb-8 p-6 bg-slate-900 rounded-[2rem] text-white border border-white/10 animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-400 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Rapport de Build</h3>
                <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><RefreshCw className="w-4 h-4" /></button>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                   <span className="text-slate-400">VITE_SUPABASE_URL</span>
                   <span className={BUILD_CONFIG.hasUrl ? 'text-emerald-400' : 'text-rose-400 font-black'}>{BUILD_CONFIG.hasUrl ? 'INJECTÉ' : 'VIDE'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                   <span className="text-slate-400">VITE_SUPABASE_ANON_KEY</span>
                   <span className={BUILD_CONFIG.hasKey ? 'text-emerald-400' : 'text-rose-400 font-black'}>{BUILD_CONFIG.hasKey ? 'INJECTÉ' : 'VIDE'}</span>
                </div>
             </div>
             <div className="mt-6 pt-4 border-t border-white/5 text-[9px] text-slate-500 font-medium leading-relaxed italic">
                Solution : Ajoutez ces variables dans le panneau "Build & Deployments" de Cloudflare et cliquez sur "Retry deployment".
             </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-amber-50 text-amber-700 p-8 rounded-[2.5rem] mb-6 border border-amber-100 animate-in zoom-in-95">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <p className="font-black uppercase text-[10px] tracking-widest">Compte en attente d'activation</p>
            </div>
            <p className="text-sm font-medium leading-relaxed italic mb-6">
              Coach Kita a bien reçu votre demande. L'accès sera activé dès réception de votre paiement Wave.
            </p>
            <a href={businessWaUrl} target="_blank" rel="noreferrer" className="w-full bg-brand-900 text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-3"><MessageCircle className="w-4 h-4" /> Relancer Coach Kita</a>
          </div>
        )}

        <form onSubmit={handlePhoneLogin} className="space-y-8 relative z-10">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Numéro WhatsApp</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+225</span>
                <input 
                  type="tel" 
                  placeholder="0515253545" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  className="w-full pl-20 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-black text-xl focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner" 
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4 flex justify-between">
                Code PIN (4 chiffres)
                <button type="button" onClick={() => setShowPin(!showPin)} className="text-brand-600 lowercase hover:underline">{showPin ? 'Masquer' : 'Afficher'}</button>
              </label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPin ? "text" : "password"}
                  placeholder="••••" 
                  value={pin} 
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                  className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-black text-2xl tracking-[1em] focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner text-brand-900" 
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || phone.length < 8 || pin.length < 4} 
            className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl hover:bg-brand-950 active:scale-95 transition-all disabled:opacity-30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {loading ? 'Vérification...' : 'Ouvrir mon salon'}
          </button>
        </form>
      </div>

      {/* Partenaire Footer */}
      <a 
        href={RAYMOND_FB_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 group hover:bg-white transition-all duration-300"
      >
        <div className="h-8 w-8 rounded-lg overflow-hidden border border-brand-200">
          <img src={RAYMOND_LOGO} alt="Raymond" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-brand-600 uppercase tracking-widest">Partenaire Excellence</span>
            <Star className="w-2.5 h-2.5 text-amber-500 fill-current" />
          </div>
          <span className="text-[10px] font-bold text-slate-900">Salon Chez Raymond</span>
        </div>
      </a>
    </div>
  );
};

export default Login;
