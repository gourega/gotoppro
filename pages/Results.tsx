import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule } from '../types';
import { supabase } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const Results: React.FC = () => {
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'phone' | 'payment'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('temp_quiz_results');
    if (!raw) {
      navigate('/');
      return;
    }
    const results = JSON.parse(raw);
    const negativeQuestions = results.filter((r: any) => !r.answer);
    const negativeLinkedIds = negativeQuestions.map((r: any) => {
      const q = DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId);
      return q?.linkedModuleId;
    });
    
    const modules = TRAINING_CATALOG.filter(m => negativeLinkedIds.includes(m.id));
    setCart(modules);

    // AI Synthesis
    const getAdvice = async () => {
      const negativeTexts = negativeQuestions.map((r: any) => {
        return DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text;
      }).filter(Boolean) as string[];

      if (negativeTexts.length > 0) {
        const advice = await generateStrategicAdvice(negativeTexts);
        setAiAdvice(advice ?? null);
      }
      setLoadingAdvice(false);
    };
    getAdvice();

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
    if (!supabase) {
      alert("Le service d'identification est indisponible.");
      return;
    }
    setLoading(true);
    try {
      const cleanPhone = phoneInput.startsWith('+225') ? phoneInput : `+225${phoneInput.replace(/\s/g, '')}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });
      if (error) throw error;
      setCheckoutStep('payment');
    } catch (error: any) {
      alert(error.message || "Erreur d'identification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif font-bold text-slate-900 mb-6">Bilan de Performance</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Analyse complète et recommandations personnalisées de Coach Kita.</p>
      </div>

      {/* AI Strategy Section */}
      <section className="mb-20">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start gap-12">
            <div className="flex-shrink-0">
               <div className="h-32 w-32 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white rotate-3">
                 <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
               </div>
               <div className="mt-6 text-center">
                 <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Le mot de la Coach</p>
                 <p className="font-serif font-bold text-slate-900 text-lg">Coach Kita</p>
               </div>
            </div>
            <div className="flex-grow">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                 <Sparkles className="w-3 h-3" />
                 Synthèse IA Stratégique
               </div>
               {loadingAdvice ? (
                 <div className="flex flex-col gap-4 animate-pulse">
                   <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                   <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                   <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
                 </div>
               ) : (
                 <p className="text-2xl font-serif leading-relaxed italic text-slate-800">
                   "{aiAdvice}"
                 </p>
               )}
            </div>
          </div>
        </div>
      </section>

      <div className="mb-12">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 text-center">Modules Prioritaires Détectés ({cart.length})</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {cart.map(mod => (
            <div key={mod.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{mod.topic}</span>
              <h3 className="text-xl font-bold text-slate-900 mt-3 group-hover:text-brand-600 transition-colors leading-tight">{mod.title}</h3>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed font-medium">{mod.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand-900 rounded-[4rem] p-10 md:p-20 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-[15rem] pointer-events-none italic font-serif">Go'Top</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Plan d'Accélération Complet</h2>
            <p className="text-brand-200 text-lg font-medium leading-relaxed">
              Débloquez l'intégralité de ces {cart.length} modules, les certifications et l'accompagnement direct de Coach Kita pour transformer votre business.
            </p>
          </div>
          <div className="text-center md:text-right flex flex-col items-center md:items-end">
            <div className="text-6xl font-black mb-4 tracking-tighter">{pricingData.total.toLocaleString()} <span className="text-2xl">FCFA</span></div>
            {pricingData.discount > 0 && (
              <span className="bg-white/10 text-brand-300 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                Remise Pack : -{pricingData.discount}%
              </span>
            )}
          </div>
        </div>
        <div className="mt-16 flex justify-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-500 text-white px-16 py-7 rounded-[2.2rem] font-black shadow-2xl hover:bg-brand-400 transition-all uppercase tracking-widest text-sm flex items-center gap-3 group"
          >
            Activer mon parcours pro
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {checkoutStep === 'phone' ? (
              <div className="p-10 md:p-12">
                <div className="mb-10 text-center">
                  <div className="h-24 w-24 rounded-[2rem] overflow-hidden shadow-2xl mb-8 border-4 border-white rotate-3 mx-auto">
                    <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 leading-tight font-serif mb-4">Identification</h2>
                  <p className="text-slate-500 font-medium">
                    Entrez votre numéro pour synchroniser votre parcours de formation.
                  </p>
                </div>
                
                <div className="mb-12">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Numéro de téléphone</label>
                  <div className="relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-xl font-black text-brand-500">+225</span>
                    <input 
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="00 00 00 00 00"
                      className="w-full pl-24 pr-8 py-7 rounded-[2rem] bg-slate-50 border-none outline-none text-2xl font-black text-slate-900 transition-all focus:bg-slate-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleIdentification}
                    disabled={loading}
                    className="w-full py-6 bg-brand-600 text-white font-black rounded-[1.8rem] hover:bg-brand-700 shadow-xl shadow-brand-100 transition text-[11px] uppercase tracking-widest flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "CONFIRMER L'ACCÈS"}
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="w-full py-4 text-slate-400 font-black rounded-[1.8rem] hover:text-slate-600 transition text-[10px] uppercase tracking-widest"
                  >
                    ANNULER
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="h-24 w-24 bg-blue-50 text-blue-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <span className="text-5xl">🌊</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 font-serif">Paiement Wave</h2>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium">Transférez <b className="text-slate-900 text-xl font-black">{pricingData.total.toLocaleString()} FCFA</b> via Wave.</p>
                
                <div className="bg-slate-50 p-10 rounded-[3rem] mb-10 border border-slate-100 shadow-inner">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Scanner QR Code</div>
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://pay.wave.com/m/M_ci_tl569RJDWLXi/c/ci/`} alt="QR" className="mx-auto rounded-3xl mix-blend-multiply" />
                   <p className="mt-6 font-black text-slate-900 text-xl tracking-tighter">+225 01 03 43 84 56</p>
                </div>
                
                <button 
                  onClick={() => navigate('/login')} 
                  className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-black transition shadow-2xl"
                >
                  J'AI PAYÉ, ACCÉDER À MES COURS
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