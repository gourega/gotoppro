import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule } from '../types';
import { supabase } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';
import { Sparkles, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

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

    window.scrollTo(0,0);
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
    <div className="min-h-screen bg-slate-50/30">
      {/* Header Premium */}
      <section className="bg-white pt-24 pb-32 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[10px] font-black uppercase tracking-[0.4em] mb-12">
            <Zap className="w-3 h-3 fill-current" />
            Analyse de Performance
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-8 tracking-tight">
            Votre Bilan d'Excellence
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Voici les piliers stratégiques identifiés pour propulser votre salon vers de nouveaux sommets de rentabilité.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-16 pb-32">
        {/* AI Strategy Section */}
        <section className="mb-24">
          <div className="bg-white rounded-[4rem] p-10 md:p-20 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-50/20 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start gap-16">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                 <div className="h-48 w-48 rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] border-8 border-white rotate-6 relative group">
                   <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                 </div>
                 <div className="mt-8 text-center">
                   <p className="text-[11px] font-black text-brand-600 uppercase tracking-widest mb-1">Expert Mentor</p>
                   <p className="font-serif font-bold text-slate-900 text-2xl">Coach Kita</p>
                 </div>
              </div>
              
              <div className="flex-grow">
                 <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-10 shadow-xl shadow-slate-900/20">
                   <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                   Vision Stratégique Personnalisée
                 </div>
                 
                 {loadingAdvice ? (
                   <div className="space-y-6 animate-pulse">
                     <div className="h-5 bg-slate-100 rounded-full w-full"></div>
                     <div className="h-5 bg-slate-100 rounded-full w-5/6"></div>
                     <div className="h-5 bg-slate-100 rounded-full w-2/3"></div>
                   </div>
                 ) : (
                   <div className="relative">
                     <span className="absolute -top-12 -left-8 text-9xl text-slate-100 font-serif opacity-50 select-none">“</span>
                     <p className="text-3xl md:text-4xl font-serif leading-[1.4] italic text-slate-800 relative z-10">
                       {aiAdvice}
                     </p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </section>

        {/* Modules Detected */}
        <section className="mb-24 px-4">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Modules Recommandés ({cart.length})</h2>
            <div className="w-24 h-1 bg-brand-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cart.map(mod => (
              <div key={mod.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-100 group-hover:bg-brand-500 transition-colors"></div>
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{mod.topic}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 font-serif leading-tight group-hover:text-brand-600 transition-colors">{mod.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {mod.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Box - CTA Excellence */}
        <section className="bg-[#0c4a6e] rounded-[4rem] p-12 md:p-24 text-white shadow-[0_40px_100px_rgba(12,74,110,0.3)] relative overflow-hidden border border-white/10 group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.02] text-[20rem] pointer-events-none italic font-serif group-hover:scale-105 transition-transform duration-1000 leading-none">Pro</div>
          
          <div className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  Offre Certifiée Excellence
                </div>
                <h2 className="text-5xl md:text-7xl font-serif font-bold mb-10 leading-[1.1] tracking-tight">
                  Prenez le contrôle <br/> de votre <span className="text-brand-500">destin</span>.
                </h2>
                <div className="space-y-6 mb-12">
                   {[
                     "Accès illimité aux modules sélectionnés",
                     "Certifications professionnelles Go'Top",
                     "Support stratégique de Coach Kita",
                     "Plan d'action IA automatisé"
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 text-lg font-medium text-slate-200">
                       <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">✓</div>
                       {item}
                     </div>
                   ))}
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-2xl p-12 md:p-16 rounded-[4rem] border border-white/10 text-center relative shadow-2xl">
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-500 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/30">
                   Investissement Unique
                 </div>
                 
                 <div className="mb-10 pt-4">
                   <div className="flex flex-col items-center">
                     <span className="text-7xl md:text-8xl font-black tracking-tighter mb-2">{pricingData.total.toLocaleString()}</span>
                     <span className="text-2xl font-serif text-brand-400">FCFA TTC</span>
                   </div>
                   {pricingData.discount > 0 && (
                     <div className="mt-6 inline-block bg-emerald-500/20 text-emerald-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                       Économie Pack : -{pricingData.savings.toLocaleString()} FCFA
                     </div>
                   )}
                 </div>

                 <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-brand-500 text-white py-8 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(14,165,233,0.4)] hover:bg-brand-400 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group"
                 >
                   Activer mon accès premium
                   <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                 </button>
                 
                 <p className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-60">
                   Paiement sécurisé via Mobile Money (Wave)
                 </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal - Modern Look */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl">
          <div className="bg-white rounded-[4rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-500 border border-slate-100">
            {checkoutStep === 'phone' ? (
              <div className="p-12 md:p-16">
                <div className="mb-12 text-center">
                  <div className="h-28 w-28 rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 border-4 border-white rotate-3 mx-auto relative group">
                    <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Identification</h2>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    Saisissez votre numéro pour lier votre réussite à votre compte personnel.
                  </p>
                </div>
                
                <div className="mb-12">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Numéro WhatsApp (+225)</label>
                  <div className="relative group">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-brand-500 transition-colors group-focus-within:text-brand-600">+225</span>
                    <input 
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="00 00 00 00 00"
                      className="w-full pl-28 pr-8 py-8 rounded-[2.2rem] bg-slate-50 border-none outline-none text-2xl font-black text-slate-900 transition-all focus:bg-slate-100 ring-2 ring-transparent focus:ring-brand-500/10 shadow-inner"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <button 
                    onClick={handleIdentification}
                    disabled={loading}
                    className="w-full py-7 bg-brand-600 text-white font-black rounded-[2rem] hover:bg-brand-700 shadow-[0_20px_40px_rgba(14,165,233,0.3)] transition-all text-[12px] uppercase tracking-widest flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "ACCÉDER À L'ÉTAPE SUIVANTE"}
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="w-full py-4 text-slate-400 font-black rounded-[2rem] hover:text-slate-600 transition text-[10px] uppercase tracking-widest"
                  >
                    RETOURNER AU BILAN
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="h-28 w-28 bg-brand-50 text-brand-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                   <Zap className="w-12 h-12 fill-current" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Paiement Sécurisé</h2>
                <p className="text-slate-500 mb-12 leading-relaxed font-medium text-lg">
                  Transférez <b className="text-slate-900 text-2xl font-black underline decoration-brand-500 underline-offset-8">{pricingData.total.toLocaleString()} FCFA</b> via Wave pour activer votre espace.
                </p>
                
                <div className="bg-slate-50 p-12 rounded-[3.5rem] mb-12 border border-slate-100 shadow-inner group">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Scanner le QR Code Wave</div>
                   <div className="p-4 bg-white rounded-[2.5rem] shadow-xl mx-auto inline-block border border-slate-100">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://pay.wave.com/m/M_ci_tl569RJDWLXi/c/ci/`} alt="QR" className="mix-blend-multiply" />
                   </div>
                   <p className="mt-10 font-black text-slate-900 text-2xl tracking-tighter">+225 01 03 43 84 56</p>
                   <p className="text-[9px] text-brand-600 font-black uppercase mt-2 tracking-widest">Identité : CanticThinkIA / Go'Top</p>
                </div>
                
                <button 
                  onClick={() => navigate('/login')} 
                  className="w-full bg-slate-900 text-white py-8 rounded-[2.2rem] font-black uppercase tracking-[0.2em] text-[12px] hover:bg-black transition shadow-2xl shadow-slate-900/20"
                >
                  J'AI EFFECTUÉ LE PAIEMENT
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