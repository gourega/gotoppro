import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule } from '../types';
import { supabase } from '../services/supabase';

const Results: React.FC = () => {
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'phone' | 'payment'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('temp_quiz_results');
    if (!raw) {
      navigate('/');
      return;
    }
    const results = JSON.parse(raw);
    const negativeLinkedIds = results
      .filter((r: any) => !r.answer)
      .map((r: any) => {
        const q = DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId);
        return q?.linkedModuleId;
      });
    
    setCart(TRAINING_CATALOG.filter(m => negativeLinkedIds.includes(m.id)));
  }, [navigate]);

  const pricingData = useMemo(() => {
    const count = cart.length;
    let discount = count >= 13 ? 50 : count >= 9 ? 30 : count >= 5 ? 20 : 0;
    const subtotal = cart.reduce((acc, curr) => acc + curr.price, 0);
    const savings = Math.round(subtotal * (discount / 100));
    return { discount, subtotal, savings, total: subtotal - savings };
  }, [cart]);

  const handleIdentification = async () => {
    if (phoneInput.length < 8) {
      alert("Veuillez entrer un numéro valide");
      return;
    }
    setLoading(true);
    try {
      // Nettoyage du numéro
      const cleanPhone = phoneInput.startsWith('+225') ? phoneInput : `+225${phoneInput.replace(/\s/g, '')}`;
      
      // Déclenchement de l'OTP Supabase
      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });

      if (error) throw error;
      
      // On passe au paiement pendant que l'utilisateur attend son code (ou après validation)
      // Ici, on simule la transition vers le paiement Wave
      setCheckoutStep('payment');
    } catch (error: any) {
      alert(error.message || "Erreur d'identification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Votre Diagnostic Expert</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Voici les modules recommandés par Coach Kita pour transformer votre salon.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {cart.map(mod => (
          <div key={mod.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{mod.topic}</span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">{mod.title}</h3>
            <p className="text-sm text-slate-500 mt-3">{mod.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-brand-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl pointer-events-none italic font-serif">Go'Top</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2">Plan d'Accélération Complet</h2>
            <p className="text-brand-200">Accès illimité à {cart.length} modules stratégiques.</p>
          </div>
          <div className="text-center md:text-right">
            <div className="text-4xl font-black mb-2">{pricingData.total.toLocaleString()} FCFA</div>
            {pricingData.discount > 0 && (
              <span className="bg-brand-500/20 text-brand-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Économie de {pricingData.discount}% incluse
              </span>
            )}
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-brand-900 px-12 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-sm"
          >
            Activer mon parcours pro
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {checkoutStep === 'phone' ? (
              <div className="p-10 md:p-12">
                <div className="mb-10">
                  <div className="h-20 w-20 rounded-[1.5rem] overflow-hidden shadow-2xl mb-8 border-4 border-white rotate-3">
                    <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-[42px] font-bold text-slate-900 leading-tight font-serif mb-4 tracking-tight">Identification</h2>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium">
                    Entrez votre numéro WhatsApp ou Wave. Ce numéro sera votre identifiant unique pour accéder à vos cours.
                  </p>
                </div>
                
                <div className="mb-12">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Numéro de téléphone</label>
                  <div className="relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-[#0ea5e9]">+225</span>
                    <input 
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="00 00 00 00 00"
                      className="w-full pl-28 pr-8 py-7 rounded-[2.2rem] bg-slate-50 border-none outline-none text-2xl font-black text-slate-900 transition-all focus:bg-slate-100 placeholder:text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 px-4 py-6 bg-slate-50 text-slate-400 font-black rounded-[1.8rem] hover:bg-slate-100 transition text-[11px] uppercase tracking-widest"
                  >
                    ANNULER
                  </button>
                  <button 
                    onClick={handleIdentification}
                    disabled={loading}
                    className="flex-1 px-4 py-6 bg-[#0ea5e9] text-white font-black rounded-[1.8rem] hover:bg-[#0284c7] shadow-xl shadow-blue-200 transition text-[11px] uppercase tracking-widest"
                  >
                    {loading ? "EN COURS..." : "CONFIRMER"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="h-20 w-20 bg-blue-50 text-blue-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <span className="text-4xl">🌊</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 font-serif">Paiement Wave</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">Transférez <b className="text-slate-900 text-xl">{pricingData.total.toLocaleString()} FCFA</b> au numéro ci-dessous pour activer vos modules.</p>
                
                <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-8 border border-slate-100">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Scanner pour payer</div>
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://pay.wave.com/m/M_ci_tl569RJDWLXi/c/ci/`} alt="QR" className="mx-auto rounded-2xl mix-blend-multiply" />
                   <p className="mt-4 font-black text-slate-900 text-lg">+225 01 03 43 84 56</p>
                </div>
                
                <button 
                  onClick={() => navigate('/login')} 
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition shadow-2xl"
                >
                  J'ai payé, accéder à mon code
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;