
import { Gift, ArrowRight, Loader2, Zap, Plus, Trash2, CheckCircle2, ShoppingBag, Crown, Users, Cloud, ShieldCheck, TrendingUp, Star, X, Gem } from 'lucide-react';
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
  const [employeeCount, setEmployeeCount] = useState<number>(user?.employeeCount || 0);
  const [yearsOfExistence, setYearsOfExistence] = useState<number>(user?.yearsOfExistence || 0);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  
  // États de sélection des packs
  const [selectedPack, setSelectedPack] = useState<'NONE' | 'ELITE' | 'ELITE_PERF' | 'UPGRADE_PERF'>('NONE');
  
  const navigate = useNavigate();

  const hasAllModules = useMemo(() => user?.purchasedModuleIds.length === TRAINING_CATALOG.length, [user]);

  useEffect(() => {
    const raw = localStorage.getItem('temp_quiz_results');
    const results = raw ? JSON.parse(raw) : null;
    
    const purchasedIds = user?.purchasedModuleIds || [];
    const availableCatalog = TRAINING_CATALOG.filter(m => !purchasedIds.includes(m.id));

    let recommended: TrainingModule[] = [];

    if (results) {
      const negativeQuestions = results.filter((r: any) => !r.answer);
      if (negativeQuestions.length === 0) {
        const masteryIds = ["mod_tarification", "mod_social_media", "mod_management", "mod_tresorerie"];
        recommended = availableCatalog.filter(m => masteryIds.includes(m.id));
      } else {
        const negativeLinkedIds = negativeQuestions.map((r: any) => DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.linkedModuleId);
        recommended = availableCatalog.filter(m => negativeLinkedIds.includes(m.id));
      }

      const getAdvice = async () => {
        const negativeTexts = negativeQuestions.map((r: any) => DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text).filter(Boolean) as string[];
        const advice = await generateStrategicAdvice(negativeTexts, negativeQuestions.length === 0);
        setAiAdvice(advice ?? null);
        setLoadingAdvice(false);
      };
      getAdvice();
    } else {
      setLoadingAdvice(false);
      setAiAdvice("Explorez notre catalogue complet pour renforcer les piliers de votre salon.");
    }
    
    setStrategicModules(recommended);
    setCatalogueModules(availableCatalog.filter(m => !recommended.find(r => r.id === m.id)));
    // Par défaut, on met les modules recommandés dans le panier si on n'est pas déjà Elite
    if (!hasAllModules) setCart(recommended);
    window.scrollTo(0,0);
  }, [user, hasAllModules]);

  const pricingData = useMemo(() => {
    if (selectedPack === 'ELITE_PERF') {
      return { total: 15000, label: 'Pack Elite Performance+', count: TRAINING_CATALOG.length + 1 };
    }
    if (selectedPack === 'ELITE') {
      return { total: 10000, label: 'Pack Elite', count: TRAINING_CATALOG.length };
    }
    if (selectedPack === 'UPGRADE_PERF') {
      return { total: 5000, label: 'Upgrade Performance+', count: 1 };
    }

    const modulesSubtotal = cart.reduce((acc, curr) => acc + curr.price, 0);
    const count = cart.length;
    let rate = count >= 13 ? 0.50 : count >= 9 ? 0.30 : count >= 5 ? 0.20 : 0;
    const discountAmount = Math.round(modulesSubtotal * rate);
    const total = modulesSubtotal - discountAmount;
    
    return { total, label: 'Modules à la carte', count };
  }, [cart, selectedPack]);

  const handleIdentification = async () => {
    const digitsOnly = phoneInput.replace(/\D/g, '');
    if (digitsOnly.length < 10) return alert("Veuillez entrer un numéro valide.");

    setLoading(true);
    const formattedPhone = `+225${digitsOnly.slice(-10)}`;
    
    const isEliteChoice = selectedPack === 'ELITE' || selectedPack === 'ELITE_PERF';
    const isPerfChoice = selectedPack === 'ELITE_PERF' || selectedPack === 'UPGRADE_PERF';

    // Logique expiration (3 ans si Elite)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 3);
    const kitaPremiumUntil = isEliteChoice ? expirationDate.toISOString() : (user?.kitaPremiumUntil || null);

    try {
      if (!supabase) throw new Error("Database error");
      const { data: existingProfile } = await supabase.from('profiles').select('*').eq('phoneNumber', formattedPhone).maybeSingle();
      
      const newPendingIds = (selectedPack === 'ELITE' || selectedPack === 'ELITE_PERF') 
        ? TRAINING_CATALOG.map(m => m.id) 
        : cart.map(m => m.id);
      
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
          isKitaPremium: isEliteChoice,
          kitaPremiumUntil: kitaPremiumUntil,
          hasPerformancePack: isPerfChoice,
          createdAt: new Date().toISOString()
        });
      } else {
        const updatedPending = [...new Set([...(existingProfile.pendingModuleIds || []), ...newPendingIds])];
        await supabase.from('profiles').update({ 
          pendingModuleIds: updatedPending,
          employeeCount,
          yearsOfExistence,
          isKitaPremium: isEliteChoice || existingProfile.isKitaPremium,
          kitaPremiumUntil: isEliteChoice ? kitaPremiumUntil : existingProfile.kitaPremiumUntil,
          hasPerformancePack: isPerfChoice || existingProfile.hasPerformancePack
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

        {/* SECTION DES PACKS ELITE */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          
          {/* Pack Elite Standard (10 000 F) */}
          {!hasAllModules && (
            <section className={`bg-gradient-to-br from-brand-900 to-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl border-4 transition-all ${selectedPack === 'ELITE' ? 'border-amber-400 scale-[1.02]' : 'border-white/5 opacity-90 hover:opacity-100'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000"><Crown className="w-64 h-64" /></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/20 border border-amber-400/30 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest mb-6">Maitrise Totale</div>
                <h2 className="text-3xl font-serif font-bold mb-4">Pack ELITE</h2>
                <p className="text-slate-300 text-sm font-medium leading-relaxed mb-10 max-w-md">
                  Les 16 modules experts pour transformer votre gestion. Idéal pour les gérants solos.
                </p>
                <div className="flex items-end gap-2 mb-10">
                  <span className="text-5xl font-black font-mono">10 000</span>
                  <span className="text-xl font-bold text-amber-400 mb-1">FCFA</span>
                </div>
                <button 
                  onClick={() => { setSelectedPack('ELITE'); setCart([]); }}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedPack === 'ELITE' ? 'bg-amber-400 text-brand-900 shadow-xl' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {selectedPack === 'ELITE' ? 'SÉLECTIONNÉ' : 'CHOISIR LE PACK ELITE'}
                </button>
              </div>
            </section>
          )}

          {/* Pack Elite Performance+ (15 000 F) */}
          {(!user?.hasPerformancePack || !hasAllModules) && (
            <section className={`bg-gradient-to-br from-emerald-900 to-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl border-4 transition-all ${selectedPack === 'ELITE_PERF' ? 'border-emerald-400 scale-[1.02]' : 'border-white/5 opacity-90 hover:opacity-100'}`}>
              <div className="absolute top-4 right-10 bg-brand-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse z-20 shadow-lg">RECOMMANDÉ</div>
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Gem className="w-64 h-64" /></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-400/20 border border-emerald-400/30 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">Empire & Staff</div>
                <h2 className="text-3xl font-serif font-bold mb-4">Pack ELITE PERF<span className="text-brand-500">+</span></h2>
                <p className="text-slate-300 text-sm font-medium leading-relaxed mb-10 max-w-md">
                  Formation complète + Logiciel de gestion staff + Cloud + Répertoire VIP. L'arme ultime de croissance.
                </p>
                <div className="flex items-end gap-2 mb-10">
                  <span className="text-5xl font-black font-mono">15 000</span>
                  <span className="text-xl font-bold text-emerald-400 mb-1">FCFA</span>
                </div>
                <button 
                  onClick={() => { setSelectedPack('ELITE_PERF'); setCart([]); }}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedPack === 'ELITE_PERF' ? 'bg-emerald-500 text-white shadow-xl' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {selectedPack === 'ELITE_PERF' ? 'SÉLECTIONNÉ' : 'CHOISIR LE PACK PERFORMANCE+'}
                </button>
              </div>
            </section>
          )}

          {/* Cas spécial : Alain (Déjà Elite, veut juste Performance+) */}
          {hasAllModules && !user?.hasPerformancePack && (
             <section className={`col-span-full bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-2xl border-4 transition-all ${selectedPack === 'UPGRADE_PERF' ? 'border-brand-500' : 'border-white/5'}`}>
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Zap className="w-64 h-64 text-brand-500" /></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                   <div className="space-y-6 max-w-xl">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/20 border border-brand-500/30 rounded-full text-brand-400 text-[10px] font-black uppercase tracking-widest">Offre Spéciale Upgrade</div>
                      <h2 className="text-4xl font-serif font-bold">Passez au Pilotage Performance<span className="text-brand-500">+</span></h2>
                      <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Vous maîtrisez déjà les 16 modules. Débloquez maintenant les outils de pilotage d'équipe et la sauvegarde Cloud sécurisée.
                      </p>
                   </div>
                   <div className="text-center md:text-right shrink-0">
                      <p className="text-6xl font-black mb-2 font-mono">5 000 <span className="text-xl">F</span></p>
                      <button onClick={() => setSelectedPack('UPGRADE_PERF')} className={`w-full md:w-auto px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${selectedPack === 'UPGRADE_PERF' ? 'bg-brand-500 text-white' : 'bg-white text-brand-900 hover:bg-slate-100'}`}>
                         {selectedPack === 'UPGRADE_PERF' ? 'SÉLECTIONNÉ' : 'ACTIVER MON UPGRADE'}
                      </button>
                   </div>
                </div>
             </section>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-12">
            
            {/* AUDIT IA STRATÉGIQUE */}
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

            {/* CATALOGUE À LA CARTE (Affiche seulement si on ne sélectionne pas un pack global) */}
            <section className={`pt-10 transition-opacity duration-500 ${selectedPack !== 'NONE' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">Modules à l'unité (500 F)</h3>
                  {selectedPack !== 'NONE' && <button onClick={() => setSelectedPack('NONE')} className="text-brand-600 font-black text-[10px] uppercase tracking-widest border-b border-brand-600">Revenir au choix individuel</button>}
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                  {catalogueModules.map(mod => (
                    <div key={mod.id} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${cart.find(c => c.id === mod.id) ? 'border-brand-500 bg-brand-50/30' : 'bg-white border-slate-50'}`}>
                       <div className="max-w-[200px]">
                          <p className="text-[9px] font-black text-brand-500 uppercase mb-1">{mod.topic}</p>
                          <p className="text-sm font-bold text-slate-800 leading-tight truncate">{mod.title}</p>
                       </div>
                       <button 
                        onClick={() => {setSelectedPack('NONE'); setCart(prev => prev.find(item => item.id === mod.id) ? prev.filter(item => item.id !== mod.id) : [...prev, mod]);}}
                        className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${cart.find(c => c.id === mod.id) ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-300 hover:bg-brand-500 hover:text-white'}`}
                       >
                         {cart.find(c => c.id === mod.id) ? <Trash2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                       </button>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* PANIER (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                <div className="flex items-center gap-3"><ShoppingBag className="w-6 h-6 text-brand-600" /><h3 className="text-2xl font-black text-slate-900 tracking-tight">Votre Plan</h3></div>
                <div className="h-8 w-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-black">{pricingData.count}</div>
              </div>
              
              <div className="p-6 max-h-[300px] overflow-y-auto bg-slate-50/30">
                {pricingData.count === 0 ? <p className="py-10 text-center text-slate-300 font-bold italic text-sm">Sélectionnez une offre pour continuer</p> : (
                  <div className="space-y-3">
                    <div className="p-4 bg-brand-900 text-white rounded-2xl flex justify-between items-center shadow-lg animate-in slide-in-from-top-2">
                       <p className="text-[11px] font-black uppercase tracking-widest">{pricingData.label}</p>
                       <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    </div>
                    {cart.map(item => (
                      <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center">
                        <p className="text-[12px] font-black text-slate-800 truncate max-w-[150px]">{item.title}</p>
                        <button onClick={() => { setCart(cart.filter(c => c.id !== item.id)); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-10 bg-slate-900 text-white rounded-t-[3.5rem] space-y-6">
                <div>
                   <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Total à régler</p>
                   <p className="text-4xl font-black text-white font-mono">{pricingData.total.toLocaleString()} <span className="text-xs">FCFA</span></p>
                </div>
                <button onClick={() => setIsModalOpen(true)} disabled={pricingData.count === 0} className="w-full py-6 bg-brand-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-400 transition-all flex items-center justify-center gap-4 active:scale-95">Valider ma commande <ArrowRight className="w-5 h-5" /></button>
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
                <div className="mb-10 text-center"><div className="h-20 w-20 bg-brand-50 text-brand-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6"><Users className="w-8 h-8" /></div><h2 className="text-2xl font-black text-slate-900 mb-2">Identification gérant</h2><p className="text-slate-500 font-medium text-xs">L'activation se fait manuellement sous 15 min.</p></div>
                <div className="space-y-6">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp (requis)</label><input type="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="07 08 04 79 14" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-xl font-black text-center" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Salariés</label><input type="number" value={employeeCount} onChange={(e) => setEmployeeCount(Number(e.target.value))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-center font-bold" /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Années d'exp.</label><input type="number" value={yearsOfExistence} onChange={(e) => setYearsOfExistence(Number(e.target.value))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-center font-bold" /></div>
                  </div>
                </div>
                <button onClick={handleIdentification} disabled={loading} className="w-full mt-10 bg-brand-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer ma demande"}</button>
                <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Retour</button>
              </div>
            ) : (
              <div className="p-10 text-center space-y-8"><div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-12 h-12" /></div><h2 className="text-3xl font-black text-slate-900">Demande Transmise</h2><p className="text-slate-500 font-medium leading-relaxed italic">"Coach Kita a reçu votre demande de <strong>{pricingData.total.toLocaleString()} F</strong>. Effectuez votre paiement Wave au <span className="text-brand-600 font-black">+225 0103438456</span> pour l'activation."</p><button onClick={() => navigate('/dashboard')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 shadow-xl">Accéder à mon espace</button></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
