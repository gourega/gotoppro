
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfileByPhone } from '../services/supabase';
import { RAYMOND_LOGO, RAYMOND_FB_URL } from '../constants';
import { AlertCircle, Clock, Loader2, CheckCircle2, Star, ExternalLink } from 'lucide-react';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'denied'>('idle');
  
  const { user, loginManually, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user && !authLoading) {
      if (user.isAdmin) navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('gotop_temp_ref', ref);
    }
  }, [location]);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setStatus('idle');
    
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone) return setError('Veuillez entrer votre numéro.');
    
    setLoading(true);
    try {
      const formattedPhone = cleanPhone.startsWith('0') ? `+225${cleanPhone}` : cleanPhone;
      const profile = await getProfileByPhone(formattedPhone);
      
      if (!profile) {
        setError("Aucun compte trouvé. Veuillez faire le diagnostic d'abord.");
        setLoading(false);
        return;
      }

      if (!profile.isActive) {
        setStatus('pending');
        setLoading(false);
        return;
      }

      const success = await loginManually(formattedPhone);
      if (!success) {
        setError("Échec de l'ouverture de session.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur technique. Vérifiez votre connexion.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 overflow-hidden relative mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none text-8xl italic font-serif leading-none">Go'Top</div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="h-16 w-16 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner border border-brand-100">
            📱
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Espace Gérant</h2>
          <p className="text-slate-500 font-medium text-sm">Accédez à votre académie de réussite.</p>
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

        <form onSubmit={handlePhoneLogin} className="space-y-8 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Votre numéro WhatsApp</label>
            <input 
              type="tel" 
              placeholder="0708047914" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-black text-2xl text-center focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner" 
              autoFocus
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl hover:bg-brand-950 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {loading ? 'Authentification...' : 'Entrer dans mon espace'}
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
