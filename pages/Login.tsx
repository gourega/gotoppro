
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfileByPhone, saveUserProfile } from '../services/supabase';
import { AlertCircle, Clock, Loader2, Info, CheckCircle2 } from 'lucide-react';

const Login: React.FC = () => {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'denied'>('idle');
  
  const { user, loginManually } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      if (user.isAdmin) navigate('/admin');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('gotop_temp_ref', ref);
    }
  }, [location]);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('idle');
    if (!phone) return setError('Veuillez entrer votre numéro.');
    
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const formattedPhone = cleanPhone.startsWith('0') ? `+225${cleanPhone}` : cleanPhone;
      const profile = await getProfileByPhone(formattedPhone);
      
      if (!profile) {
        setError("Aucun compte associé. Faites d'abord le diagnostic.");
        setLoading(false);
        return;
      }

      if (!profile.isActive) {
        setStatus('pending');
        setLoading(false);
        return;
      }

      await loginManually(formattedPhone);
    } catch (err) {
      setError("Erreur technique de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Champs requis.');
    
    setLoading(true);
    try {
      const { supabase } = await import('../services/supabase');
      if (!supabase) throw new Error("Base de données indisponible.");

      const { data, error: loginError } = await (supabase.auth as any).signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (loginError) throw loginError;

      // Note: La redirection est gérée par le useEffect(user) grâce à onAuthStateChange dans AuthContext
    } catch (err: any) {
      console.error("Login Admin Error:", err);
      if (err.message === "Invalid login credentials") {
        setError("Identifiants incorrects.");
      } else if (err.message === "Email not confirmed") {
        setError("Email non confirmé. Vérifiez votre boîte de réception.");
      } else {
        setError(err.message || "Une erreur est survenue lors de la connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none text-8xl italic font-serif leading-none">Go'Top</div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="h-16 w-16 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner border border-brand-100">
            {method === 'phone' ? '📱' : '✉️'}
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Espace Client</h2>
          <p className="text-slate-500 font-medium text-sm">Accédez à vos modules de formation.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-rose-100 flex items-center gap-3 animate-in shake duration-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-amber-50 text-amber-700 p-6 rounded-[2rem] mb-6 border border-amber-100">
            <div className="flex items-center gap-4 mb-3">
              <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
              <p className="font-black uppercase text-[10px] tracking-widest">Paiement en attente</p>
            </div>
            <p className="text-xs font-medium leading-relaxed italic">Coach Kita valide votre accès après réception de votre paiement Wave.</p>
          </div>
        )}

        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 relative z-10">
          <button type="button" onClick={() => { setMethod('phone'); setError(''); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>N° Téléphone</button>
          <button type="button" onClick={() => { setMethod('email'); setError(''); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Admin</button>
        </div>

        <form onSubmit={method === 'phone' ? handlePhoneLogin : handleEmailLogin} className="space-y-6 relative z-10">
          {method === 'phone' ? (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Votre numéro WhatsApp</label>
              <input type="tel" placeholder="0708047914" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-black text-xl text-center focus:ring-2 focus:ring-brand-500/20 transition-all" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Email Professionnel</label>
                <input type="email" placeholder="email@exemple.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Mot de passe</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {loading ? 'Connexion...' : 'Entrer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
