
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RAYMOND_LOGO, RAYMOND_FB_URL, COACH_KITA_PHONE } from '../constants';
import { AlertCircle, Loader2, CheckCircle2, Star, ExternalLink, ShieldAlert, MessageCircle, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending'>('idle');
  
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
    } catch (err) {
      console.error(err);
      setError("Erreur technique de connexion.");
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
          <p className="text-slate-500 font-medium text-sm">Entrez vos accès sécurisés pour piloter votre salon.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-6 rounded-[2rem] mb-6 text-xs font-bold border border-rose-100 flex items-start gap-4 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="space-y-3">
              <p>{error}</p>
              {error.includes("connu") && <Link to="/quiz" className="inline-block bg-rose-600 text-white px-4 py-2 rounded-xl uppercase tracking-widest text-[9px] font-black">Lancer le diagnostic</Link>}
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
              Coach Kita a bien reçu votre demande. L'accès sera activé (avec votre code PIN) dès réception de votre paiement Wave.
            </p>
            <a 
              href={businessWaUrl} 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-brand-900 text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-4 h-4" /> Relancer Coach Kita
            </a>
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
                  placeholder="0544869313" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  className="w-full pl-20 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-black text-xl focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner" 
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4 flex justify-between">
                Code PIN (4 chiffres)
                <button type="button" onClick={() => setShowPin(!showPin)} className="text-brand-600 lowercase hover:underline">
                  {showPin ? 'Masquer' : 'Afficher'}
                </button>
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
                  inputMode="numeric"
                  autoComplete="current-password"
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

      {/* Partenaire Footer Login */}
      <a 
        href={RAYMOND_FB_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 group hover:bg-white hover:shadow-xl transition-all duration-300"
      >
        <div className="h-8 w-8 rounded-lg overflow-hidden border border-brand-200 shadow-sm flex-shrink-0">
          <img src={RAYMOND_LOGO} alt="Raymond" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-brand-600 uppercase tracking-widest">Partenaire d'Excellence</span>
            <Star className="w-2.5 h-2.5 text-amber-500 fill-current" />
          </div>
          <span className="text-[10px] font-bold text-slate-900">Salon Chez Raymond <ExternalLink className="w-3 h-3 inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
        </div>
      </a>
    </div>
  );
};

export default Login;
