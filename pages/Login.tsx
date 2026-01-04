
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfileByPhone } from '../services/supabase';
import { AlertCircle, ShieldCheck, Clock, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'denied'>('idle');
  
  const { loginManually, loginAdmin, loading: authLoading } = useAuth() as any;
  const navigate = useNavigate();

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('idle');
    
    if (!phone) return setError('Veuillez entrer votre numéro.');
    
    setLoading(true);
    try {
      // Nettoyage du numéro pour la recherche
      const cleanPhone = phone.replace(/\s/g, '');
      const formattedPhone = cleanPhone.startsWith('0') ? `+225${cleanPhone}` : cleanPhone;
      
      const profile = await getProfileByPhone(formattedPhone);
      
      if (!profile) {
        setError("Aucun compte associé à ce numéro. Veuillez d'abord effectuer un diagnostic.");
        setLoading(false);
        return;
      }

      if (!profile.isActive) {
        setStatus('pending');
        setLoading(false);
        return;
      }

      // Si actif, on connecte manuellement (stockage local du numéro)
      const success = await loginManually(formattedPhone);
      if (success) {
        navigate('/dashboard');
      } else {
        setError("Erreur lors de la connexion. Réessayez.");
      }
    } catch (err) {
      setError("Une erreur technique est survenue.");
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
      const { error: loginError } = await supabase!.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (loginError) throw loginError;
      navigate('/admin');
    } catch (err: any) {
      setError("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none text-8xl italic font-serif">Go'Top</div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="h-16 w-16 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner border border-brand-100">
            {method === 'phone' ? '📱' : '✉️'}
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Espace Client</h2>
          <p className="text-slate-500 font-medium text-sm">Accédez à vos modules de formation.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-8 text-xs font-bold border border-rose-100 flex items-center gap-3 animate-in shake duration-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-amber-50 text-amber-700 p-6 rounded-[2rem] mb-8 border border-amber-100 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-3">
              <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
              <p className="font-black uppercase text-[10px] tracking-widest">Paiement en attente</p>
            </div>
            <p className="text-xs font-medium leading-relaxed">
              Votre accès est en cours de validation par nos services. Dès réception de votre paiement Wave, Coach Kita activera vos modules. 
              <br/><br/>
              <b>Délai moyen : 15 minutes.</b>
            </p>
          </div>
        )}

        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 relative z-10">
          <button 
            onClick={() => { setMethod('phone'); setError(''); setStatus('idle'); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            N° Téléphone
          </button>
          <button 
            onClick={() => { setMethod('email'); setError(''); setStatus('idle'); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={method === 'phone' ? handlePhoneLogin : handleEmailLogin} className="space-y-6 relative z-10">
          {method === 'phone' ? (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Votre numéro WhatsApp</label>
              <input 
                type="tel" 
                placeholder="0708047914"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-brand-500/10 outline-none transition font-black text-xl text-center"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Admin</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-brand-500/10 outline-none transition font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mot de passe</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-brand-500/10 outline-none transition font-bold"
                />
              </div>
            </>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black hover:bg-brand-700 shadow-xl shadow-brand-200 disabled:opacity-50 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : method === 'phone' ? 'Accéder à mon espace' : 'S\'identifier'}
          </button>
          
          {method === 'phone' && (
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Une fois activé par l'admin, votre numéro devient votre clé d'accès permanente.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
