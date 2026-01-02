import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const Login: React.FC = () => {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePhoneLogin = async () => {
    setError('');
    if (!phone) return setError('Veuillez entrer un numéro au format +225XXXXXXXXXX.');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: phone.replace(/\s/g, ''),
      });
      if (authError) throw authError;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi du SMS.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    if (!otp) return setError('Veuillez entrer le code reçu.');
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone.replace(/\s/g, ''),
        token: otp,
        type: 'sms',
      });
      if (verifyError) throw verifyError;
      navigate('/dashboard');
    } catch (err: any) {
      setError('Code incorrect ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setError('');
    if (!email || !password) return setError('Veuillez remplir tous les champs.');
    setLoading(true);
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;
      navigate('/dashboard');
    } catch (err: any) {
      setError("Identifiants incorrects ou accès non autorisé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">
            {method === 'phone' ? '📱' : '✉️'}
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Bienvenue</h2>
          <p className="text-slate-500 font-medium">Connectez-vous à votre espace Go'Top Pro.</p>
        </div>

        {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-8 text-sm font-bold border border-rose-100 flex items-center gap-3">
          <span className="text-lg">⚠️</span> {error}
        </div>}

        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => { setMethod('phone'); setStep('phone'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${method === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            Téléphone
          </button>
          <button 
            onClick={() => { setMethod('email'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${method === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            Email Admin
          </button>
        </div>

        {method === 'phone' ? (
          step === 'phone' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Numéro de téléphone (+225)</label>
                <input 
                  type="tel" 
                  placeholder="+225 00 00 00 00 00"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-brand-500/10 outline-none transition font-bold text-lg"
                />
              </div>
              <button 
                onClick={handlePhoneLogin}
                disabled={loading}
                className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black hover:bg-brand-700 shadow-xl shadow-brand-200 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
              >
                {loading ? 'Envoi...' : 'Recevoir le code'}
              </button>
              <p className="text-[10px] text-slate-400 text-center font-bold">
                Pour le test Super Admin, utilisez le numéro <br/>
                <span className="text-brand-500">+2250001020304</span>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Code de vérification</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-brand-500/10 outline-none transition text-center tracking-[0.5em] text-3xl font-black text-brand-900"
                  placeholder="000000"
                />
              </div>
              <button 
                onClick={verifyOtp}
                disabled={loading}
                className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black hover:bg-brand-700 shadow-xl shadow-brand-200 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
              >
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </button>
              <button onClick={() => setStep('phone')} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600">Modifier le numéro</button>
            </div>
          )
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Professionnel</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-brand-500/10 outline-none transition font-bold"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mot de passe</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-brand-500/10 outline-none transition font-bold"
                placeholder="••••••••"
              />
            </div>
            <button 
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-black shadow-xl shadow-slate-200 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;