
// Add React import to avoid UMD global reference error
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Loader2, 
  ShoppingBag, 
  Plus, 
  Crown, 
  Zap, 
  CheckCircle2, 
  MessageCircle,
  X,
  Lock,
  Tag,
  MinusCircle,
  AlertCircle,
  Database,
  Users,
  Package,
  Star,
  Cloud,
  ShieldCheck,
  TrendingUp,
  Target,
  Smartphone,
  Award,
  Sparkles
} from 'lucide-react';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR, COACH_KITA_WAVE_NUMBER, COACH_KITA_PHONE } from '../constants';
import { TrainingModule, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, getProfileByPhone, updateUserProfile, generateUUID, supabase } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';

const Results: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [activePack, setActivePack] = useState<'none' | 'elite' | 'performance' | 'stock' | 'crm'>('none');
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [recommendedModuleIds, setRecommendedModuleIds] = useState<string[]>([]);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regStep, setRegStep] = useState<'form' | 'success'>('form');
  const [regPhone, setRegPhone] = useState('');
  const [regStoreName, setRegStoreName] = useState('');

  const isElite = useMemo(() => {
    if (!user) return false;
    return user.isKitaPremium || (user.purchasedModuleIds?.length || 0) >= 16;
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rechargeId = params.get('recharge');
    const packParam = params.get('pack');
    
    if (packParam === 'performance') setActivePack('performance'); 
    else if (packParam === 'elite') setActivePack('elite');
    else if (packParam === 'stock') setActivePack('stock');
    else if (packParam === 'crm') setActivePack('crm');

    let initialCart: TrainingModule[] = [];
    const raw = localStorage.getItem('temp_quiz_results');
    const results = raw ? JSON.parse(raw) : null;
    
    if (rechargeId) {
      const moduleToRecharge = TRAINING_CATALOG.find(m => m.id === rechargeId);
      if (moduleToRecharge) initialCart = [moduleToRecharge];
    } else if (results) {
      const negativeIds = results.filter((r: any) => !r.answer).map((r: any) => {
        return DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.linkedModuleId;
      }).filter(Boolean) as string[];
      setRecommendedModuleIds(negativeIds);
      initialCart = TRAINING_CATALOG.filter(m => negativeIds.includes(m.id) && !(user?.purchasedModuleIds || []).includes(m.id));
    }
    setCart(initialCart);

    if (results) {
      const getAdvice = async () => {
        try {
          const negativeTexts = results.filter((r: any) => !r.answer).map((r: any) => 
            DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text
          ).filter(Boolean) as string[];
          const advice = await generateStrategicAdvice(negativeTexts, negativeTexts.length === 0);
          setAiAdvice(advice ?? null);
          
          // Sauvegarde automatique si l'utilisateur est connecté
          if (user && advice) {
            updateUserProfile(user.uid, { strategicAudit: advice });
          }
        } catch (err) {
          console.error("Failed to load IA advice", err);
          setAiAdvice("L'analyse stratégique est temporairement indisponible. Concentrez-vous sur vos modules prioritaires.");
        } finally {
          setLoadingAdvice(false);
        }
      };
      getAdvice();
    } else {
      setLoadingAdvice(false);
      setAiAdvice("Préparez votre parcours vers l'Excellence.");
    }
  }, [user?.uid, location.search]);

  const toggleModuleInCart = (mod: TrainingModule) => {
    setActivePack('none');
    setCart(prev => {
      const exists = prev.find(m => m.id === mod.id);
      if (exists) return prev.filter(m => m.id !== mod.id);
      return [...prev, mod];
    });
  };

  const pricingData = useMemo(() => {
    if (activePack === 'elite') return { total: 10000, label: 'Pack Académie Élite', rawTotal: 10000, savings: 0, discountPercent: 0, nextThreshold: null, progress: 100 };
    if (activePack === 'performance') return { total: 5000, label: 'Pack RH Performance', rawTotal: 5000, savings: 0, discountPercent: 0, nextThreshold: null, progress: 0 };
    if (activePack === 'stock') return { total: 5000, label: 'Pack Stock Expert', rawTotal: 5000, savings: 0, discountPercent: 0, nextThreshold: null, progress: 0 };
    if (activePack === 'crm') return { total: 500, label: 'Abonnement CRM VIP', rawTotal: 500, savings: 0, discountPercent: 0, nextThreshold: null, progress: 0 };

    const count = cart.length;
    if (count === 0) return { total: 0, label: 'Panier vide', rawTotal: 0, savings: 0, discountPercent: 0, nextThreshold: null, progress: 0 };
    
    let unitPrice = 500;
    let discountPercent = 0;
    let nextThreshold = null;

    if (count >= 13) { unitPrice = 250; discountPercent = 50; if (count < 16) nextThreshold = { needed: 16 - count, label: "Passage Élite", nextPercent: 100 }; } 
    else if (count >= 9) { unitPrice = 350; discountPercent = 30; nextThreshold = { needed: 13 - count, label: "Remise -50%", nextPercent: 50 }; } 
    else if (count >= 5) { unitPrice = 400; discountPercent = 20; nextThreshold = { needed: 9 - count, label: "Remise -30%", nextPercent: 30 }; } 
    else { nextThreshold = { needed: 5 - count, label: "Remise -20%", nextPercent: 20 }; }

    const total = count === 16 ? 10000 : count * unitPrice;
    const rawTotal = count * 500;
    const progress = (count / 16) * 100;
    
    return { total, label: `${count} module(s) choisi(s)`, rawTotal, savings: rawTotal - total, discountPercent, nextThreshold, progress };
  }, [cart, activePack]);

  const handleRegisterAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regStoreName) return alert("Veuillez remplir tous les champs.");
    if (!supabase) return setDbError("Le service de base de données n'est pas prêt.");
    
    setLoading(true);
    setDbError(null);

    try {
      let cleanPhone = regPhone.replace(/\s/g, '').replace(/[^\d+]/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
      if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;
      
      let pendingIds = activePack !== 'none' ? [`REQUEST_${activePack.toUpperCase()}`] : cart.map(m => m.id);
      const existing = await getProfileByPhone(cleanPhone);
      
      if (existing) {
        await updateUserProfile(existing.uid, { 
          establishmentName: regStoreName, 
          isActive: false, 
          strategicAudit: aiAdvice || '',
          pendingModuleIds: [...new Set([...(existing.pendingModuleIds || []), ...pendingIds])] 
        });
      } else {
        const newUser: any = { 
          uid: generateUUID(), 
          phoneNumber: cleanPhone, 
          pinCode: '1234', 
          establishmentName: regStoreName, 
          firstName: 'Gérant', 
          lastName: 'Elite', 
          isActive: false, 
          role: 'CLIENT', 
          isAdmin: false,
          isPublic: true,
          isKitaPremium: false,
          hasPerformancePack: false,
          hasStockPack: false,
          strategicAudit: aiAdvice || '',
          pendingModuleIds: pendingIds, 
          badges: [], 
          purchasedModuleIds: [],
          actionPlan: [],
          referralCount: 0
        };
        await saveUserProfile(newUser);
      }
      setRegStep('success');
    } catch (err: any) { 
      setDbError(err.message || "Échec de l'enregistrement en base de données.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleValidateEngagement = async () => {
    if (!user) return setIsRegisterModalOpen(true);
    if (pricingData.total === 0) return alert("Sélectionnez au moins un module.");
    setLoading(true);
    try {
      let newPending = activePack !== 'none' ? [`REQUEST_${activePack.toUpperCase()}`] : cart.map(m => m.id);
      await updateUserProfile(user.uid, { 
        isActive: false, 
        strategicAudit: aiAdvice || user.strategicAudit || '',
        pendingModuleIds: [...new Set([...(user.pendingModuleIds || []), ...newPending])] 
      });
      setRegStep('success');
      setIsRegisterModalOpen(true);
    } catch (err: any) { 
      alert("Erreur de mise à jour."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-brand-900 pt-24 pb-48 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="h-48 w-48 rounded-[3.5rem] bg-white p-1.5 shadow-2xl shrink-0 rotate-3">
            <img src={COACH_KITA_AVATAR} className="w-full h-full object-cover rounded-[2.8rem]" alt="Mentor" />
          </div>
          <div className="text-center md:text-left text-white">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Plan de <span className="text-brand-500 italic">Succès</span></h1>
            <p className="text-slate-300 text-lg opacity-90 max-w-2xl">J'ai analysé vos besoins. Voici le catalogue pour bâtir votre empire rentable.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 space-y-12 relative z-20">
        
        {/* SECTION 1: AUDIT STRATÉGIQUE */}
        <section className="bg-white rounded-[3.5rem] shadow-2xl p-10 md:p-16 relative overflow-hidden border border-slate-100">
          <div className="flex items-center gap-4 mb-10"><Zap className="text-brand-600" /><h2 className="text-[11px] font-black text-brand-900 uppercase tracking-[0.4em]">Audit Stratégique IA</h2></div>
          {loadingAdvice ? <div className="flex flex-col items-center py-12 gap-4"><Loader2 className="animate-spin text-brand-600" /><p className="text-[10px] font-black text-slate-400 uppercase">Consultation IA...</p></div> : 
          <div className="prose-kita whitespace-pre-wrap font-medium" dangerouslySetInnerHTML={{ __html: aiAdvice?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-900">$1</strong>') || '' }} />}
        </section>

        {/* SECTION 2: LES PACKS EXPERTS */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
           <div className="text-center">
              <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.5em] mb-3">Recommandations Prioritaires</h3>
              <p className="text-2xl font-serif font-bold text-slate-900">Solutions Clés en Main</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Pack CRM VIP */}
              <button onClick={() => setActivePack('crm')} className={`p-8 rounded-[3rem] border-2 transition-all text-center flex flex-col items-center justify-between group h-full ${activePack === 'crm' ? 'bg-white border-amber-400 shadow-2xl ring-4 ring-amber-50' : 'bg-white border-slate-100 hover:border-amber-200 shadow-sm'}`}>
                  <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center shadow-lg mb-6 transition-transform group-hover:scale-110 ${activePack === 'crm' ? 'bg-amber-400 text-white' : 'bg-amber-50 text-amber-500'}`}><Star className="w-10 h-10" /></div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-900">Pack CRM VIP</h4>
                    <div className="text-[10px] font-bold text-slate-500 space-y-1">
                        <p>• Fiches Techniques</p>
                        <p>• Relances WhatsApp</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                       <p className="text-2xl font-black text-slate-900">500 F</p>
                       <p className="text-[8px] font-black text-brand-600 uppercase tracking-widest">Activ. Immédiate • 30 Jours</p>
                    </div>
                  </div>
              </button>

              {/* Pack Académie Élite */}
              <button onClick={() => setActivePack('elite')} className={`p-10 rounded-[3.5rem] border-2 transition-all text-center flex flex-col items-center justify-between group h-full relative overflow-hidden md:col-span-1 lg:col-span-1 ${activePack === 'elite' ? 'bg-brand-900 border-brand-900 shadow-2xl scale-105' : 'bg-white border-brand-100 shadow-xl ring-1 ring-brand-50'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><Crown className="w-24 h-24 text-white" /></div>
                  <div className={`h-24 w-24 rounded-[2.5rem] flex items-center justify-center shadow-xl mb-8 transition-transform group-hover:scale-110 ${activePack === 'elite' ? 'bg-brand-500 text-white' : 'bg-brand-900 text-brand-500'}`}><Crown className="w-12 h-12" /></div>
                  <div className="space-y-4 relative z-10">
                    <h4 className={`text-lg font-black uppercase leading-tight ${activePack === 'elite' ? 'text-white' : 'text-brand-900'}`}>Académie Élite</h4>
                    <div className={`text-[10px] font-bold space-y-1 ${activePack === 'elite' ? 'text-brand-300' : 'text-slate-500'}`}>
                        <p>• 16 Modules Complets</p>
                        <p>• Sauvegarde Cloud</p>
                    </div>
                    <div className={`pt-6 border-t ${activePack === 'elite' ? 'border-white/10' : 'border-slate-50'}`}>
                       <p className={`text-4xl font-black ${activePack === 'elite' ? 'text-amber-400' : 'text-brand-900'}`}>10 000 F</p>
                       <p className={`text-[8px] font-black uppercase tracking-[0.3em] ${activePack === 'elite' ? 'text-white/40' : 'text-slate-400'}`}>Activ. Immédiate • Acquis à vie</p>
                    </div>
                  </div>
              </button>

              {/* Pack Performance RH */}
              <button onClick={() => setActivePack('performance')} className={`p-8 rounded-[3rem] border-2 transition-all text-center flex flex-col items-center justify-between group h-full ${activePack === 'performance' ? 'bg-white border-emerald-400 shadow-2xl ring-4 ring-emerald-50' : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'}`}>
                  <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center shadow-lg mb-6 transition-transform group-hover:scale-110 ${activePack === 'performance' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}><Users className="w-10 h-10" /></div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-900">Performance RH</h4>
                    <div className="text-[10px] font-bold text-slate-500 space-y-1">
                        <p>• Calcul Commissions</p>
                        <p>• Productivité Staff</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                       <p className="text-2xl font-black text-slate-900">5 000 F</p>
                       <p className="text-[8px] font-black text-brand-600 uppercase tracking-widest">Activ. Immédiate • 3 Ans</p>
                    </div>
                  </div>
              </button>

              {/* Pack Stock Expert */}
              <button onClick={() => setActivePack('stock')} className={`p-8 rounded-[3rem] border-2 transition-all text-center flex flex-col items-center justify-between group h-full ${activePack === 'stock' ? 'bg-white border-sky-400 shadow-2xl ring-4 ring-sky-50' : 'bg-white border-slate-100 hover:border-sky-200 shadow-sm'}`}>
                  <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center shadow-lg mb-6 transition-transform group-hover:scale-110 ${activePack === 'stock' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600'}`}><Package className="w-10 h-10" /></div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-900">Stock Expert</h4>
                    <div className="text-[10px] font-bold text-slate-500 space-y-1">
                        <p>• Alertes Rupture</p>
                        <p>• Inventaire Valorisé</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                       <p className="text-2xl font-black text-slate-900">5 000 F</p>
                       <p className="text-[8px] font-black text-brand-600 uppercase tracking-widest">Activ. Immédiate • 3 Ans</p>
                    </div>
                  </div>
              </button>
           </div>
        </section>

        {/* SECTION 3: CATALOGUE & PANIER */}
        <div className="grid lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-4 px-4">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Catalogue de Formation</h3>
               <div className="h-px bg-slate-200 flex-grow"></div>
            </div>
            
            <div className="grid gap-4">
              {TRAINING_CATALOG
                .filter(module => !cart.some(m => m.id === module.id))
                .map(module => {
                  const isOwned = (user?.purchasedModuleIds || []).includes(module.id);
                  const isRecommended = recommendedModuleIds.includes(module.id);
                  return (
                    <button 
                      key={module.id} 
                      onClick={() => !isOwned && toggleModuleInCart(module)}
                      disabled={isOwned}
                      className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all group ${
                        isOwned ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' :
                        isRecommended ? 'bg-white border-brand-100 shadow-sm ring-1 ring-brand-50' : 'bg-white border-slate-100 hover:border-brand-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[8px] font-black text-brand-600 uppercase tracking-widest">{module.topic}</span>
                            {isRecommended && !isOwned && <span className="text-[7px] bg-amber-400 text-brand-900 px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1"><Sparkles className="w-2 h-2" /> Priorité Diag</span>}
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1">{module.title}</h4>
                          {!isOwned && <p className="text-[10px] font-black text-slate-400 uppercase">Investissement : 500 F • Acquis à vie</p>}
                        </div>
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                          isOwned ? 'text-emerald-500' : 'bg-slate-50 text-slate-300 group-hover:bg-brand-500 group-hover:text-white'
                        }`}>
                          {isOwned ? <CheckCircle2 /> : <Plus />}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* COLONNE PANIER */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 overflow-hidden relative">
                
                {/* JAUGE DE RÉDUCTION VISUELLE */}
                {activePack === 'none' && cart.length > 0 && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-in fade-in">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest">Bonus Maîtrise</p>
                        <p className="text-sm font-bold text-slate-900">{pricingData.label}</p>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                      <div className="h-full bg-brand-500 transition-all duration-1000 ease-out" style={{ width: `${pricingData.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[7px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                      <span>Starter</span>
                      <span>-20%</span>
                      <span>-30%</span>
                      <span>-50%</span>
                      <span>Élite</span>
                    </div>
                  </div>
                )}

                <h3 className="text-xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-4"><ShoppingBag className="text-brand-500" /> Mon Engagement</h3>
                
                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {activePack !== 'none' ? (
                    <div className="p-6 bg-brand-900 text-white rounded-[2rem] shadow-xl relative overflow-hidden group">
                       <Crown className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10 rotate-12" />
                       <div className="flex justify-between items-center relative z-10">
                          <p className="text-sm font-black uppercase tracking-widest">{pricingData.label}</p>
                          <p className="text-xl font-black text-amber-400">{pricingData.total.toLocaleString()} F</p>
                       </div>
                       <button onClick={() => setActivePack('none')} className="mt-4 text-[8px] font-black uppercase tracking-widest text-brand-400 hover:text-white flex items-center gap-1 transition-colors"><X className="w-3 h-3" /> Annuler et revenir au choix individuel</button>
                    </div>
                  ) : cart.length > 0 ? (
                    cart.map(mod => (
                      <div key={mod.id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 group">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{mod.topic}</span>
                          <span className="text-xs font-bold text-slate-700 line-clamp-1">{mod.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-black text-slate-400">500 F</span>
                           <button onClick={() => toggleModuleInCart(mod)} className="text-rose-400 hover:text-rose-600 transition-colors"><MinusCircle className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 opacity-40 grayscale">
                       <ShoppingBag className="w-16 h-16 mx-auto mb-4" />
                       <p className="text-slate-400 text-xs italic px-10">Choisissez des modules ou un Pack expert ci-dessus.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-10 pt-8 border-t border-slate-100">
                   {/* SOUS-TOTAL BRUT */}
                   <div className="flex justify-between items-center text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Sous-total (Brut)</span>
                      <span className="text-sm font-black">{pricingData.rawTotal.toLocaleString()} F</span>
                   </div>

                   {pricingData.savings > 0 && (
                     <div className="flex justify-between items-center text-emerald-500">
                        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Tag className="w-3 h-3" /> Remise Évolutive (-{pricingData.discountPercent}%)</span>
                        <span className="text-sm font-black">-{pricingData.savings.toLocaleString()} F</span>
                     </div>
                   )}
                   <div className="flex justify-between items-end">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total à régler</p>
                     <div className="flex items-baseline gap-1">
                        <p className="text-5xl font-black text-brand-900 tracking-tighter">{pricingData.total.toLocaleString()}</p>
                        <span className="text-sm font-bold opacity-30 uppercase">F</span>
                     </div>
                   </div>
                </div>

                <button onClick={handleValidateEngagement} disabled={loading || (cart.length === 0 && activePack === 'none')} className="w-full bg-brand-900 text-white py-7 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-brand-900/20 flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-95 disabled:opacity-20">
                  {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider mon plan d'action
                </button>
              </div>
              
              <div className="p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 text-center">
                 <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-2"><Target className="w-3 h-3" /> Conseil de Coach Kita</p>
                 <p className="text-xs font-medium text-amber-800 italic leading-relaxed">"Le Pack Académie Élite est l'investissement le plus rentable pour votre salon."</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL RÉGISTRATION */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] p-10 md:p-14 animate-in zoom-in-95 relative overflow-hidden">
            {regStep === 'form' ? (
              <>
                <button onClick={() => setIsRegisterModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors" disabled={loading}><X /></button>
                <h2 className="text-3xl font-serif font-bold text-center mb-10">Ouvrir mon Accès</h2>
                <form onSubmit={handleRegisterAndValidate} className="space-y-6">
                  <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Numéro WhatsApp</label><input type="tel" placeholder="0544869313" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold focus:ring-2 focus:ring-brand-500/20" required disabled={loading} /></div>
                  <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Nom de l'Etablissement</label><input type="text" placeholder="Salon Elite" value={regStoreName} onChange={e => setRegStoreName(e.target.value)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold focus:ring-2 focus:ring-brand-500/20" required disabled={loading} /></div>
                  <button type="submit" disabled={loading} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider mon plan
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 flex flex-col items-center">
                <div className="h-28 w-28 bg-[#f0fdf4] text-[#10b981] rounded-3xl flex items-center justify-center mb-10 shadow-sm">
                   <CheckCircle2 className="w-14 h-14" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-12 tracking-tight">Félicitations !</h2>
                <div className="w-full bg-[#f8fafc] p-10 rounded-[2.5rem] border border-[#f1f5f9] flex flex-col items-center gap-4 mb-14">
                   <div className="flex items-center gap-4">
                      <Lock className="w-5 h-5 text-brand-600" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Code PIN Temporaire</p>
                   </div>
                   <p className="text-4xl font-black text-brand-900 m-0 tracking-[0.2em]">1 2 3 4</p>
                </div>
                <p className="text-slate-500 italic text-sm mb-12 px-6 leading-relaxed">
                  "Réglez <strong>{pricingData.total.toLocaleString()} F</strong> via Wave au <strong>{COACH_KITA_WAVE_NUMBER}</strong> pour activer vos accès immédiatement."
                </p>
                <button 
                  onClick={() => { 
                    const waNum = COACH_KITA_PHONE.replace(/\+/g, '').replace(/\s/g, '');
                    const message = `Bonjour Coach Kita, je viens de valider mon plan d'action (${pricingData.total} F) pour mon salon ${regStoreName || user?.establishmentName}. Voici ma preuve de paiement Wave.`;
                    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(message)}`, '_blank'); 
                    navigate('/login'); 
                  }} 
                  className="w-full bg-[#10b981] text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-[#10b981]/20 flex items-center justify-center gap-4 hover:bg-[#059669] transition-all"
                >
                  <MessageCircle className="w-6 h-6" /> Confirmer sur WhatsApp
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
