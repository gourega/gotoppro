
import { Gift, ArrowRight, Loader2, Zap, Plus, Trash2, CheckCircle2, ShoppingBag, Crown, Users, Cloud, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';

const Results: React.FC = () => {
  const { user } = useAuth();
  const [strategicModules, setStrategicModules] = useState<TrainingModule[]>([]);
  const [catalogueModules, setCatalogueModules] = useState<TrainingModule[]>([]);
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [phoneInput, setPhoneInput] = useState('');
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [yearsOfExistence, setYearsOfExistence] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [isEliteSelected, setIsEliteSelected] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('temp_quiz_results');
    const results = raw ? JSON.parse(raw) : null;
    
    const purchasedIds = user?.purchasedModuleIds || [];
    const availableCatalog = TRAINING_CATALOG.filter(m => !purchasedIds.includes(m.id));

    let recommended: TrainingModule[] = [];
    let others: TrainingModule[] = [];

    if (results) {
      const negativeQuestions = results.filter((r: any) => !r.answer);
      if (negativeQuestions.length === 0) {
        const masteryIds = ["mod_tarification", "mod_social_media", "mod_management", "mod_tresorerie"];
        recommended = availableCatalog.filter(m => masteryIds.includes(m.id));
        others = availableCatalog.filter(m => !masteryIds.includes(m.id));
      } else {
        const negativeLinkedIds = negativeQuestions.map((r: any) => DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.linkedModuleId);
        recommended = availableCatalog.filter(m => negativeLinkedIds.includes(m.id));
        others = availableCatalog.filter(m => !negativeLinkedIds.includes(m.id));
      }

      const getAdvice = async () => {
        const negativeTexts = negativeQuestions.map((r: any) => DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text).filter(Boolean) as string[];
        const advice = await generateStrategicAdvice(negativeTexts, negativeQuestions.length === 0);
        setAiAdvice(advice ?? null);
        setLoadingAdvice(false);
      };
      getAdvice();
    } else {
      recommended = [];
      others = availableCatalog;
      setLoadingAdvice(false);
      setAiAdvice("Explorez notre catalogue complet pour renforcer les piliers de votre salon.");
    }
    
    setStrategicModules(recommended);
    setCatalogueModules(others);
    setCart(recommended);
    window.scrollTo(0,0);
  }, [user]);

  const pricingData = useMemo(() => {
    if (isEliteSelected || cart.length === TRAINING_CATALOG.length) {
      return { subtotal: cart.length * 500, discountAmount: Math.max(0, (cart.length * 500) - 10000), total: 10000, count: cart.length, rate: 0, nextTier: null, isElite: true };
    }
    const count = cart.length;
    const subtotal = cart.reduce((acc, curr) => acc + curr.price, 0);
    let rate = count >= 13 ? 0.50 : count >= 9 ? 0.30 : count >= 5 ? 0.20 : 0;
    const discountAmount = Math.round(subtotal * rate);
    const total = subtotal - discountAmount;
    let nextTier = count < 5 ? { count: 5, label: "20 %" } : count < 9 ? { count: 9, label: "30 %" } : count < 13 ? { count: 13, label: "50 %" } : { count: 16, label: "ELITE (Cloud Offert)" };
    return { subtotal, discountAmount, total, count, rate, nextTier, isElite: false };
  }, [cart, isEliteSelected]);

  const handleIdentification = async () => {
    const digitsOnly = phoneInput.replace(/\D/g, '');
    if (digitsOnly.length < 10) return alert("Veuillez entrer un numéro valide.");

    setLoading(true);
    const formattedPhone = `+225${digitsOnly.slice(-10)}`;
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 3);
    const kitaPremiumUntil = isEliteSelected ? expirationDate.toISOString() : null;

    try {
      if (!supabase) throw new Error("Database error");
      const { data: existingProfile } = await supabase.from('profiles').select('*').eq('phoneNumber', formattedPhone).maybeSingle();
      const newPendingIds = cart.map(m => m.id);
      
      if (!existingProfile) {
        await supabase.from('profiles').insert({
          uid: `client_${Date.now()}`,
          phoneNumber: formattedPhone,
          role: 'CLIENT',
          isActive: false,
          isAdmin: false,
          badges: [],
          employeeCount,
          yearsOfExistence,
          purchasedModuleIds: [],
          pendingModuleIds: newPendingIds,
          actionPlan: [],
          isKitaPremium: isEliteSelected,
          kitaPremiumUntil: kitaPremiumUntil,
          createdAt: new Date().toISOString()
        });
      } else {
        const updatedPending = [...new Set([...(existingProfile.pendingModuleIds || []), ...newPendingIds])];
        await supabase.from('profiles').update({ 
          pendingModuleIds: updatedPending,
          isKitaPremium: isEliteSelected || existingProfile.isKitaPremium,
          kitaPremiumUntil: isEliteSelected ? kitaPremiumUntil : existingProfile.kitaPremiumUntil
        }).eq('uid', existingProfile.uid);
      }
      setCheckoutStep('payment');
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>');
      return <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-14 flex flex-col md:flex-row items-center gap-4">
           <div className="bg-brand-500 p-2 rounded-xl text-white shadow-lg"><ShoppingBag className="w-6 h-6" /></div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Boutique de l'excellence</h1>
        </header>

        {/* Bannière Pack Elite */}
        <section className="mb-16 bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 rounded-[3.5rem] p-8 md:p-14 text-white relative overflow-hidden group shadow-2xl border border-white/10">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Crown className="w-96 h-96" /></div>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-brand-500/20 border border-brand-500/30 rounded-full text-brand-400 text-[11px] font-black uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> Offre Sérénité Intégrale</div>
                <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">Pack ELITE KITA</h2>
                <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
                  Débloquez les <span className="text-white font-bold underline decoration-brand-500">16 modules</span> experts et sécurisez vos chiffres sur le <span className="text-white font-bold">Cloud</span> pendant 3 ans.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                  <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/5 px-4 py-2 rounded-xl border border-emerald-400/20"><CheckCircle2 className="w-4 h-4" /> Formation Complète</div>
                  <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/5 px-4 py-2 rounded-xl border border-emerald-400/20"><Cloud className="w-4 h-4" /> Protection Cloud 3 Ans</div>
                </div>
              </div>
              <div className="text-center lg:text-right shrink-0 bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-2xl">
                <p className="text-6xl font-black mb-2 tracking-tighter font-mono">10 000 <span className="text-xl">F</span></p>
                <p className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-10 opacity-70">Paiement unique</p>
                <button onClick={() => {setCart(TRAINING_CATALOG); setIsEliteSelected(true);}} className="w-full bg-white text-brand-900 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-50 transition-all shadow-xl active:scale-95">Choisir l'Elite</button>
              </div>
            </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-16">
            <section className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-14 shadow-2xl relative overflow-hidden group">
              <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                <div className="shrink-0 mx-auto"><div className="h-40 w-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500"><img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" /></div></div>
                <div className="flex-grow space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 font-serif italic tracking-tight">Audit stratégique</h2>
                  <div className="text-slate-700 font-medium text-lg leading-relaxed whitespace-pre-line animate-in fade-in duration-1000">
                    {loadingAdvice ? <div className="flex flex-col items-center gap-6 py-12"><Loader2 className="w-12 h-12 animate-spin text-brand-500" /><span className="text-slate-400 font-black uppercase text-xs tracking-widest">Analyse en cours...</span></div> : <div className="prose prose-slate max-w-none">{aiAdvice ? renderFormattedText(aiAdvice) : "Explorez nos modules experts."}</div>}
                  </div>
                </div>
              </div>
            </section>

            {!isEliteSelected && (
              <section className="grid md:grid-cols-2 gap-8">
                {TRAINING_CATALOG.filter(m => !user?.purchasedModuleIds.includes(m.id)).map((mod) => (
                  <div key={mod.id} className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 transition-all hover:border-brand-500 flex flex-col group">
                    <div className="flex justify-between items-start mb-6"><span className="text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-slate-100 text-slate-500">{mod.topic}</span><span className="text-xs font-black text-brand-900">{mod.price} F</span></div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight font-serif mb-4 group-hover:text-brand-600 transition-colors">{mod.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-grow">{mod.description}</p>
                    <button 
                      onClick={() => {
                        setIsEliteSelected(false);
                        setCart(prev => prev.find(item => item.id === mod.id) ? prev.filter(item => item.id !== mod.id) : [...prev, mod]);
                      }} 
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${cart.find(c => c.id === mod.id) ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-slate-900 text-white hover:bg-brand-600 shadow-lg'}`}
                    >
                      {cart.find(c => c.id === mod.id) ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {cart.find(c => c.id === mod.id) ? 'Retirer' : 'Ajouter au plan'}
                    </button>
                  </div>
                ))}
              </section>
            )}
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                <div className="flex items-center gap-3"><ShoppingBag className="w-6 h-6 text-brand-600" /><h3 className="text-2xl font-black text-slate-900 tracking-tight">Panier</h3></div>
                <div className="h-8 w-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-black">{pricingData.count}</div>
              </div>
              <div className="p-6 max-h-[300px] overflow-y-auto bg-slate-50/30">
                {cart.length === 0 ? <p className="py-10 text-center text-slate-300 font-bold italic text-sm">Votre sélection est vide</p> : cart.map(item => (
                  <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center mb-2">
                    <p className="text-[12px] font-black text-slate-800 truncate max-w-[150px]">{item.title}</p>
                    <button onClick={() => { setIsEliteSelected(false); setCart(cart.filter(c => c.id !== item.id)); }} className="p-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="p-10 bg-slate-900 text-white rounded-t-[3.5rem] space-y-6">
                <div className="flex justify-between items-center font-mono text-slate-400 text-xs"><span>Valeur</span><span>{pricingData.subtotal.toLocaleString()} F</span></div>
                {pricingData.discountAmount > 0 && <div className="flex justify-between items-center font-mono text-emerald-400 text-xs"><span>{pricingData.isElite ? "Remise ELITE KITA" : "Remise Volume"}</span><span>-{pricingData.discountAmount.toLocaleString()} F</span></div>}
                <div className="border-t border-white/10 pt-4"><p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Engagement net</p><p className="text-4xl font-black text-white font-mono">{pricingData.total.toLocaleString()} <span className="text-xs">FCFA</span></p></div>
                <button onClick={() => setIsModalOpen(true)} disabled={cart.length === 0} className="w-full py-6 bg-brand-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-brand-400 transition-all flex items-center justify-center gap-4 active:scale-95">Valider l'engagement <ArrowRight className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {checkoutStep === 'details' ? (
              <div className="p-10">
                <div className="mb-10 text-center"><div className="h-20 w-20 bg-brand-50 text-brand-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6"><Users className="w-8 h-8" /></div><h2 className="text-2xl font-black text-slate-900 mb-2">Identification du gérant</h2><p className="text-slate-500 font-medium text-xs">Ces informations serviront à générer vos accès.</p></div>
                <div className="space-y-6">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp (requis)</label><input type="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="07 08 04 79 14" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-xl font-black text-center" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Employés</label><input type="number" value={employeeCount} onChange={(e) => setEmployeeCount(Number(e.target.value))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-center font-bold" /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Années d'exp.</label><input type="number" value={yearsOfExistence} onChange={(e) => setYearsOfExistence(Number(e.target.value))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-center font-bold" /></div>
                  </div>
                </div>
                <button onClick={handleIdentification} disabled={loading} className="w-full mt-10 bg-brand-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer mon identité"}</button>
                <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Annuler</button>
              </div>
            ) : (
              <div className="p-10 text-center space-y-8"><div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-12 h-12" /></div><h2 className="text-3xl font-black text-slate-900">Engagement Transmis</h2><p className="text-slate-500 font-medium leading-relaxed italic">"Coach Kita a reçu votre demande. Effectuez votre paiement Wave au <span className="text-brand-600 font-black">+225 0103438456</span> pour activer vos modules."</p><button onClick={() => navigate('/dashboard')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 shadow-xl">Aller au tableau de bord</button></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
