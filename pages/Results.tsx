
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  Loader2, 
  Zap, 
  CheckCircle2, 
  ShoppingBag, 
  Users, 
  Plus, 
  Trash2, 
  X, 
  Crown, 
  ShieldCheck,
  Phone,
  Gift,
  TrendingUp,
  Gem
} from 'lucide-react';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';

const Results: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [activePack, setActivePack] = useState<'none' | 'elite' | 'performance' | 'elite_performance'>('none');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [phoneInput, setPhoneInput] = useState('');
  const [employeeCount, setEmployeeCount] = useState<number>(user?.employeeCount || 0);
  const [yearsOfExistence, setYearsOfExistence] = useState<number>(user?.yearsOfExistence || 0);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);

  // Status de possession
  const isElite = useMemo(() => user?.isKitaPremium || (user?.purchasedModuleIds?.length >= 16), [user]);
  const isPerformance = useMemo(() => user?.hasPerformancePack || false, [user]);

  const availableCatalog = useMemo(() => {
    const purchasedIds = user?.purchasedModuleIds || [];
    return TRAINING_CATALOG.filter(m => !purchasedIds.includes(m.id));
  }, [user]);

  const displayCatalog = useMemo(() => {
    return availableCatalog.filter(mod => !cart.find(c => c.id === mod.id));
  }, [availableCatalog, cart]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const packParam = params.get('pack');
    if (packParam === 'performance') setActivePack('performance');
    else if (packParam === 'elite') setActivePack('elite');
    else if (packParam === 'elite_performance') setActivePack('elite_performance');

    const raw = localStorage.getItem('temp_quiz_results');
    const results = raw ? JSON.parse(raw) : null;
    
    if (results) {
      const negativeQuestions = results.filter((r: any) => !r.answer);
      const negativeLinkedIds = negativeQuestions.map((r: any) => 
        DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.linkedModuleId
      );
      
      const recommended = availableCatalog.filter(m => negativeLinkedIds.includes(m.id));
      if (packParam === null) {
        setCart(recommended);
      }

      const getAdvice = async () => {
        const negativeTexts = negativeQuestions.map((r: any) => 
          DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text
        ).filter(Boolean) as string[];
        const advice = await generateStrategicAdvice(negativeTexts, negativeQuestions.length === 0);
        setAiAdvice(advice ?? null);
        setLoadingAdvice(false);
      };
      getAdvice();
    } else {
      setLoadingAdvice(false);
      setAiAdvice("Explorez notre catalogue expert pour transformer votre salon.");
    }
    window.scrollTo(0,0);
  }, [user, availableCatalog, location.search]);

  const pricingData = useMemo(() => {
    if (activePack === 'elite') return { total: 10000, label: 'Pack Elite (Formations)', count: 16 };
    if (activePack === 'performance') return { total: 5000, label: 'Pack Performance+ (Outils)', count: 0 };
    if (activePack === 'elite_performance') return { total: 15000, label: 'Pack Elite Performance+', count: 16 };

    const subtotal = cart.reduce((acc, curr) => acc + curr.price, 0);
    const count = cart.length;
    let rate = 0;
    let nextTier = null;
    let neededForNext = 0;

    if (count >= 13) rate = 0.50;
    else if (count >= 9) { rate = 0.30; nextTier = 50; neededForNext = 13 - count; }
    else if (count >= 5) { rate = 0.20; nextTier = 30; neededForNext = 9 - count; }
    else { rate = 0; nextTier = 20; neededForNext = 5 - count; }

    const discountAmount = Math.round(subtotal * rate);
    const total = subtotal - discountAmount;
    return { subtotal, discountAmount, total, rate: rate * 100, count, nextTier, neededForNext, label: null };
  }, [cart, activePack]);

  const toggleModuleInCart = (mod: TrainingModule) => {
    setActivePack('none');
    setCart(prev => prev.find(item => item.id === mod.id) 
      ? prev.filter(item => item.id !== mod.id) 
      : [...prev, mod]
    );
  };

  const handleValidateEngagement = async () => {
    if (user) {
      setLoading(true);
      try {
        if (!supabase) throw new Error("Base de données indisponible");
        
        const isEliteReq = activePack === 'elite' || activePack === 'elite_performance';
        const isPerformanceReq = activePack === 'performance' || activePack === 'elite_performance';
        
        let newPendingIds: string[] = isEliteReq ? TRAINING_CATALOG.map(m => m.id) : cart.map(m => m.id);
        
        // On ajoute des marqueurs spéciaux pour que l'Admin voit les packs demandés
        if (isEliteReq) newPendingIds.push('REQUEST_ELITE');
        if (isPerformanceReq) newPendingIds.push('REQUEST_PERFORMANCE');
        
        const updatedPending = [...new Set([...(user.pendingModuleIds || []), ...newPendingIds])];
        
        await supabase.from('profiles').update({ 
          pendingModuleIds: updatedPending
        }).eq('uid', user.uid);
        
        navigate('/dashboard');
      } catch (err: any) {
        alert(`Erreur : ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const handleIdentification = async () => {
    const digitsOnly = phoneInput.replace(/\D/g, '');
    if (digitsOnly.length < 10) return alert("Veuillez entrer un numéro valide.");
    setLoading(true);
    const formattedPhone = `+225${digitsOnly.slice(-10)}`;
    try {
      if (!supabase) throw new Error("Database error");
      const { data: existingProfile } = await supabase.from('profiles').select('*').eq('phoneNumber', formattedPhone).maybeSingle();
      
      const isEliteReq = activePack === 'elite' || activePack === 'elite_performance';
      const isPerformanceReq = activePack === 'performance' || activePack === 'elite_performance';
      
      let newPendingIds: string[] = isEliteReq ? TRAINING_CATALOG.map(m => m.id) : cart.map(m => m.id);
      if (isEliteReq) newPendingIds.push('REQUEST_ELITE');
      if (isPerformanceReq) newPendingIds.push('REQUEST_PERFORMANCE');
      
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
          isKitaPremium: false,
          hasPerformancePack: false,
          createdAt: new Date().toISOString()
        });
      } else {
        const updatedPending = [...new Set([...(existingProfile.pendingModuleIds || []), ...newPendingIds])];
        await supabase.from('profiles').update({ 
          pendingModuleIds: updatedPending,
          employeeCount,
          yearsOfExistence
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
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>');
      if (/^\d+\./.test(line)) {
        return <div key={i} className="mt-8 mb-4 text-slate-900 font-bold text-xl">{formattedLine}</div>;
      }
      return <p key={i} className="mb-4 text-slate-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <header className="mb-14 flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="bg-[#0ea5e9] p-3.5 rounded-2xl text-white shadow-lg shadow-sky-500/20">
             <ShoppingBag className="w-7 h-7" />
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-[#0f172a] tracking-tighter">Boutique de l'excellence</h1>
        </header>

        {activePack === 'none' && !isElite && (
          <section className="mb-20 bg-[#0c4a6e] rounded-[3.5rem] p-10 md:p-16 text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
               <Crown className="w-64 h-64" />
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
              <div className="max-w-2xl space-y-8">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-[#0ea5e9]" /> Offre sérénité intégrale
                </div>
                <h2 className="text-5xl md:text-7xl font-serif font-bold leading-tight">Pack ELITE KITA</h2>
                <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-xl">
                  Débloquez les <span className="text-white border-b-2 border-[#0ea5e9] font-black">16 modules</span> experts et sécurisez vos chiffres sur le <span className="text-white font-black">Cloud</span>.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 min-w-[320px] text-center shadow-2xl">
                 <div className="mb-8">
                    <p className="text-7xl font-black flex items-center justify-center gap-2">
                       10 000 <span className="text-2xl font-bold opacity-60">F</span>
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">Formations Seules</p>
                 </div>
                 <button 
                  onClick={() => { setActivePack('elite'); setCart([]); }}
                  className="w-full bg-white text-[#0c4a6e] py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:scale-105 transition-all shadow-xl shadow-black/20"
                 >
                   Choisir l'Elite
                 </button>
              </div>
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          <div className="space-y-20">
            <section className="bg-white rounded-[4rem] border border-slate-100 p-12 md:p-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] group">
              <div className="flex flex-col md:flex-row gap-16 items-start">
                <div className="shrink-0">
                  <div className="h-56 w-56 rounded-[3.5rem] overflow-hidden border-[8px] border-white shadow-2xl transition-transform duration-700 group-hover:scale-105 bg-slate-50 ring-1 ring-slate-100">
                    <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h2 className="text-5xl font-serif font-bold text-[#0f172a] italic tracking-tight mb-10">Audit stratégique</h2>
                  <div className="text-lg">
                    {loadingAdvice ? (
                      <div className="flex flex-col items-center gap-6 py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0ea5e9]" />
                        <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Calcul de l'hémorragie financière...</span>
                      </div>
                    ) : (
                      <div className="audit-text-container">
                        {aiAdvice ? renderFormattedText(aiAdvice) : "Générez un diagnostic pour obtenir votre audit."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {displayCatalog.length > 0 && (
              <section className="space-y-12">
                <div className="flex items-center gap-4">
                   <div className="h-px flex-grow bg-slate-100"></div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Complétez votre plan</h3>
                   <div className="h-px flex-grow bg-slate-100"></div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {displayCatalog.map(mod => (
                    <div key={mod.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 transition-all flex flex-col justify-between group hover:shadow-2xl hover:border-sky-100">
                      <div>
                        <div className="flex justify-between items-start mb-8">
                           <span className="bg-slate-100 text-[#0c4a6e] px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{mod.topic}</span>
                           <span className="text-xl font-black text-[#0f172a]">500 F</span>
                        </div>
                        <h4 className="text-3xl font-bold text-[#0f172a] mb-6 leading-tight group-hover:text-[#0ea5e9] transition-colors">{mod.title}</h4>
                        <p className="text-slate-500 font-medium text-base leading-relaxed mb-12 line-clamp-3">"{mod.description}"</p>
                      </div>
                      <button 
                        onClick={() => toggleModuleInCart(mod)}
                        className="w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-[#0f172a] text-white hover:bg-[#0ea5e9]"
                      >
                        <Plus className="w-4 h-4" /> Ajouter au plan
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-slate-50 overflow-hidden animate-in slide-in-from-right-4 duration-700">
              <div className="p-12 border-b border-slate-50 space-y-8 bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="h-11 w-11 bg-[#0ea5e9] text-white rounded-xl flex items-center justify-center shadow-lg"><ShoppingBag className="w-5.5 h-5.5" /></div>
                    <h3 className="text-4xl font-black text-[#0f172a] tracking-tighter">Panier</h3>
                  </div>
                  <div className="h-10 w-10 bg-[#0ea5e9] text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg shadow-sky-500/30">
                    {activePack !== 'none' ? '1' : cart.length}
                  </div>
                </div>

                {activePack === 'none' && cart.length > 0 && (
                  <div className="space-y-4 animate-in fade-in duration-700">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <TrendingUp className="w-3.5 h-3.5 text-[#0ea5e9]" /> Remise volume
                        </p>
                        {pricingData.nextTier ? (
                          <p className="text-[9px] font-bold text-[#0ea5e9] italic">
                            + {pricingData.neededForNext} module{pricingData.neededForNext > 1 ? 's' : ''} pour <span className="font-black">-{pricingData.nextTier}%</span>
                          </p>
                        ) : (
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Remise maximale</p>
                        )}
                     </div>
                     <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden flex items-center">
                        <div className="absolute left-[31%] h-full w-0.5 bg-white z-10"></div>
                        <div className="absolute left-[56%] h-full w-0.5 bg-white z-10"></div>
                        <div className="absolute left-[81%] h-full w-0.5 bg-white z-10"></div>
                        <div 
                           className="h-full bg-[#0ea5e9] transition-all duration-700 ease-out"
                           style={{ width: `${Math.min(100, (cart.length / 16) * 100)}%` }}
                        />
                     </div>
                  </div>
                )}
              </div>
              
              <div className="p-10 max-h-[400px] overflow-y-auto custom-scrollbar space-y-5">
                {activePack !== 'none' ? (
                  <div className="p-10 bg-sky-50 rounded-[2.5rem] border border-sky-100 animate-in zoom-in-95 text-center">
                     {activePack === 'performance' ? <Gem className="w-10 h-10 text-emerald-500 mx-auto mb-4 animate-bounce" /> : <Crown className="w-10 h-10 text-amber-500 mx-auto mb-4 animate-bounce" />}
                     <p className="text-[#0c4a6e] font-black text-sm uppercase tracking-widest mb-3">{pricingData.label}</p>
                     <p className="text-slate-600 text-xs font-medium italic leading-relaxed">Activation prioritaire immédiate demandée.</p>
                     <button onClick={() => { setActivePack('none'); setCart([]); }} className="mt-6 text-[9px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors">Annuler le pack</button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="py-24 text-center opacity-30 flex flex-col items-center">
                    <ShoppingBag className="w-10 h-10 mb-4 text-slate-300" />
                    <p className="text-slate-400 font-bold italic text-sm">Votre panier est vide.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="p-7 bg-white rounded-2xl border border-slate-100 flex justify-between items-center group/item hover:bg-slate-50 transition-all shadow-sm">
                      <div className="flex-grow min-w-0 pr-4">
                         <div className="flex items-center justify-between mb-1 gap-2">
                           <p className="text-[13px] font-black text-[#0f172a] truncate">{item.title} ...</p>
                           <span className="text-[11px] font-bold text-[#0c4a6e] shrink-0 whitespace-nowrap">{item.price} F</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.topic}</p>
                      </div>
                      <button 
                        onClick={() => toggleModuleInCart(item)} 
                        className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-12 bg-[#0f172a] text-white rounded-t-[4.5rem] space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="space-y-6 relative z-10">
                  {activePack === 'none' && (
                    <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                      <span>Valeur</span>
                      <span>{(pricingData as any).subtotal?.toLocaleString() || 0} F</span>
                    </div>
                  )}
                  {activePack === 'none' && (pricingData as any).discountAmount > 0 && (
                    <div className="flex justify-between text-xs font-black text-emerald-400 uppercase tracking-[0.2em] animate-in fade-in">
                      <span>Remise Volume (-{(pricingData as any).rate}%)</span>
                      <span>-{(pricingData as any).discountAmount?.toLocaleString() || 0} F</span>
                    </div>
                  )}
                  <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black text-[#0ea5e9] uppercase tracking-[0.4em] mb-3">Engagement Net</p>
                    <div className="flex items-baseline gap-3">
                       <p className="text-6xl font-black tracking-tighter">{pricingData.total.toLocaleString()}</p>
                       <p className="text-xl font-bold text-slate-500">FCFA</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleValidateEngagement} 
                  disabled={loading || (activePack === 'none' && cart.length === 0)} 
                  className="w-full py-7 bg-[#0ea5e9] text-white rounded-3xl font-black text-[12px] uppercase tracking-[0.25em] shadow-2xl hover:bg-[#0284c7] transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-20 relative z-10"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Valider l'engagement <ArrowRight className="w-6 h-6" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            {checkoutStep === 'details' ? (
              <div className="p-14">
                <div className="mb-12 text-center">
                  <div className="h-24 w-24 bg-sky-50 text-sky-600 rounded-[2.8rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-sky-100"><Users className="w-10 h-10" /></div>
                  <h2 className="text-4xl font-serif font-bold text-[#0f172a] mb-3">Identification Gérant</h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Activation manuelle sous 15 min.</p>
                </div>
                <div className="space-y-8">
                  <div className="relative">
                    <Phone className="absolute left-7 top-1/2 -translate-y-1/2 w-5.5 h-5.5 text-slate-300" />
                    <input 
                      type="tel" 
                      value={phoneInput} 
                      onChange={(e) => setPhoneInput(e.target.value)} 
                      placeholder="N° WhatsApp" 
                      className="w-full pl-16 pr-8 py-7 rounded-[2rem] bg-slate-50 border-none text-2xl font-black text-[#0f172a] shadow-inner outline-none focus:ring-4 focus:ring-sky-500/10" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Salariés</label>
                        <input type="number" value={employeeCount} onChange={e => setEmployeeCount(Number(e.target.value))} className="w-full px-4 py-5 rounded-2xl bg-slate-50 border-none text-center font-black text-xl shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Expérience</label>
                        <input type="number" value={yearsOfExistence} onChange={e => setYearsOfExistence(Number(e.target.value))} className="w-full px-4 py-5 rounded-2xl bg-slate-50 border-none text-center font-black text-xl shadow-inner" />
                     </div>
                  </div>
                </div>
                <button onClick={handleIdentification} disabled={loading} className="w-full mt-14 bg-sky-600 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.25em] text-[12px] shadow-2xl flex items-center justify-center gap-4 active:scale-95">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Envoyer ma demande"}
                </button>
                <button onClick={() => setIsModalOpen(false)} className="w-full mt-8 text-[11px] font-black uppercase text-slate-300 hover:text-[#0f172a] transition-colors text-center tracking-[0.2em]">Retour boutique</button>
              </div>
            ) : (
              <div className="p-14 text-center space-y-12">
                <div className="h-32 w-32 bg-emerald-50 text-emerald-500 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-inner border border-emerald-100 animate-bounce"><CheckCircle2 className="w-16 h-16" /></div>
                <div className="space-y-5">
                  <h2 className="text-5xl font-serif font-bold text-[#0f172a] tracking-tight">Transmission OK</h2>
                  <p className="text-slate-500 text-lg font-medium leading-relaxed italic px-4">
                    Coach Kita a reçu votre demande de <strong className="text-[#0f172a]">{pricingData.total.toLocaleString()} F</strong>. Effectuez votre paiement Wave pour l'activation.
                  </p>
                </div>
                <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner group">
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Numéro Wave CI</p>
                   <p className="text-4xl font-black text-sky-600 group-hover:scale-110 transition-transform">+225 0103438456</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="w-full bg-[#0f172a] text-white py-7 rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] active:scale-95 shadow-2xl">Accéder à mon espace</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
