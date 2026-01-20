
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
  TrendingUp
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
          pendingModuleIds: [...new Set([...(existing.pendingModuleIds || []), ...pendingIds])] 
        });
      } else {
        const newUser: UserProfile = { 
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
          pendingModuleIds: pendingIds, 
          createdAt: new Date().toISOString(), 
          badges: [], 
          purchasedModuleIds: [],
          actionPlan: [],
          referralCount: 0
        };
        await saveUserProfile(newUser);
      }
      setRegStep('success');
    } catch (err: any) { 
      setDbError(err.message || "Impossible de créer le compte automatiquement.");
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

      <div className="max-w-5xl mx-auto px-6 -mt-24 space-y-12 relative z-20">
        <section className="bg-white rounded-[3.5rem] shadow-2xl p-10 md:p-16 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10"><Zap className="text-brand-600" /><h2 className="text-[11px] font-black text-brand-900 uppercase tracking-[0.4em]">Audit Stratégique IA</h2></div>
          {loadingAdvice ? <div className="flex flex-col items-center py-12 gap-4"><Loader2 className="animate-spin text-brand-600" /><p className="text-[10px] font-black text-slate-400 uppercase">Consultation IA...</p></div> : 
          <div className="prose-kita whitespace-pre-wrap font-medium" dangerouslySetInnerHTML={{ __html: aiAdvice?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-900">$1</strong>') || '' }} />}
        </section>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Catalogue de Formation</h3>
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
                      className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all ${
                        isOwned ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' :
                        isRecommended ? 'bg-white border-brand-100 shadow-sm ring-1 ring-brand-50' : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[8px] font-black text-brand-600 uppercase tracking-widest">{module.topic}</span>
                            {isRecommended && !isOwned && <span className="text-[7px] bg-amber-400 text-brand-900 px-2 py-0.5 rounded-full font-black uppercase">Priorité Diag</span>}
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1">{module.title}</h4>
                          {!isOwned && <p className="text-[10px] font-black text-slate-400 uppercase">Valeur : 500 F</p>}
                        </div>
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                          isOwned ? 'text-emerald-500' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {isOwned ? <CheckCircle2 /> : <Plus />}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 overflow-hidden relative">
                {/* JAUGE DE REMISE RESTAURÉE */}
                {activePack === 'none' && cart.length > 0 && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest">Thermomètre d'Excellence</p>
                        <p className="text-sm font-bold text-slate-900">{pricingData.label}</p>
                      </div>
                      {pricingData.nextThreshold && (
                        <div className="text-right">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Paiement unique</p>
                          <p className="text-[10px] font-bold text-slate-400">-{pricingData.nextThreshold.needed} modules restants</p>
                        </div>
                      )}
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                      <div className="h-full bg-brand-500 transition-all duration-1000 ease-out" style={{ width: `${pricingData.progress}%` }}></div>
                      <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                        <div className="h-full w-px bg-white/30" style={{ left: '31.25%' }}></div>
                        <div className="h-full w-px bg-white/30" style={{ left: '56.25%' }}></div>
                        <div className="h-full w-px bg-white/30" style={{ left: '81.25%' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-[7px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                      <span>Starter</span>
                      <span>-20% (5)</span>
                      <span>-30% (9)</span>
                      <span>-50% (13)</span>
                      <span>Elite (16)</span>
                    </div>
                  </div>
                )}

                <h3 className="text-xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-4"><ShoppingBag className="text-brand-500" /> Mon Engagement</h3>
                
                <div className="space-y-4 mb-8 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                  {activePack !== 'none' ? (
                    <div className="flex items-center justify-between p-4 bg-brand-50 rounded-2xl border border-brand-100">
                       <p className="text-sm font-bold text-brand-900">{pricingData.label}</p>
                       <p className="text-sm font-black text-brand-600">{pricingData.total.toLocaleString()} F</p>
                    </div>
                  ) : cart.length > 0 ? (
                    cart.map(mod => (
                      <div key={mod.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{mod.topic}</span>
                          <span className="text-xs font-bold text-slate-700 line-clamp-1">{mod.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-black text-slate-400">500 F</span>
                           <button onClick={() => toggleModuleInCart(mod)} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><MinusCircle className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-40 grayscale group">
                       <ShoppingBag className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                       <p className="text-slate-400 text-xs italic">Sélectionnez des modules ou un Pack expert ci-dessous.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-10 pt-6 border-t border-slate-50">
                   {pricingData.savings > 0 && (
                     <>
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Valeur initiale</span>
                        <span className="text-sm font-black line-through">{pricingData.rawTotal.toLocaleString()} F</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-500">
                        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Tag className="w-3 h-3" /> Réduction appliquée (-{pricingData.discountPercent}%)</span>
                        <span className="text-sm font-black">-{pricingData.savings.toLocaleString()} F</span>
                      </div>
                     </>
                   )}
                   <div className="flex justify-between items-center pt-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Net à régler</p>
                     <div className="flex items-baseline gap-1">
                        <p className="text-5xl font-black text-brand-900">{pricingData.total.toLocaleString()}</p>
                        <span className="text-sm font-bold opacity-30 uppercase">F</span>
                     </div>
                   </div>
                </div>

                <button onClick={handleValidateEngagement} disabled={loading || (cart.length === 0 && activePack === 'none')} className="w-full bg-brand-600 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-20">
                  {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider mon plan
                </button>
              </div>

              {/* GRID DES PACKS EXPERTS AVEC AVANTAGES DÉTAILLÉS */}
              <div className="grid grid-cols-1 gap-4">
                
                {/* Pack CRM VIP */}
                <button onClick={() => setActivePack('crm')} className={`p-6 rounded-[2.5rem] border-2 transition-all text-left group ${activePack === 'crm' ? 'bg-amber-400 border-amber-500 shadow-xl scale-[1.03]' : 'bg-white border-slate-100 hover:border-amber-200'}`}>
                    <div className="flex items-center gap-4">
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${activePack === 'crm' ? 'bg-brand-900 text-amber-400' : 'bg-amber-50 text-amber-600'}`}><Star className="w-6 h-6" /></div>
                       <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pack CRM VIP & Fidélité</h4>
                          <ul className={`text-[9px] font-bold space-y-0.5 mb-2 ${activePack === 'crm' ? 'text-amber-900' : 'text-slate-400'}`}>
                             <li>• Fiches techniques & Préférences Clients</li>
                             <li>• Relances WhatsApp automatiques</li>
                          </ul>
                          <p className="text-lg font-black leading-tight">500 F <span className="text-[9px] opacity-40 uppercase">/ mois</span></p>
                       </div>
                    </div>
                </button>

                {/* Pack Académie Élite (LE CŒUR DE LA STRATÉGIE) */}
                {!isElite && (
                  <button onClick={() => setActivePack('elite')} className={`p-8 rounded-[3rem] border-2 transition-all text-left group overflow-hidden relative ${activePack === 'elite' ? 'bg-brand-900 border-brand-900 shadow-2xl scale-[1.05]' : 'bg-white border-brand-500/30 hover:bg-brand-50'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 transition-transform group-hover:scale-125"><ShieldCheck className={`w-32 h-32 ${activePack === 'elite' ? 'text-white' : 'text-brand-900'}`} /></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-6 mb-4">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${activePack === 'elite' ? 'bg-brand-500 text-white' : 'bg-brand-900 text-white'}`}><Crown /></div>
                        <div>
                          <h4 className={`text-xl font-black uppercase leading-tight ${activePack === 'elite' ? 'text-white' : 'text-brand-900'}`}>Académie Élite</h4>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${activePack === 'elite' ? 'text-brand-400' : 'text-brand-600'}`}>Standard d'Excellence KITA</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className={`p-4 rounded-2xl border ${activePack === 'elite' ? 'bg-white/5 border-white/10' : 'bg-brand-50 border-brand-100'}`}>
                            <Cloud className={`w-4 h-4 mb-2 ${activePack === 'elite' ? 'text-brand-400' : 'text-brand-600'}`} />
                            <p className={`text-[9px] font-black uppercase leading-tight ${activePack === 'elite' ? 'text-white' : 'text-brand-900'}`}>Sauvegarde Cloud à vie</p>
                            <p className={`text-[8px] font-medium opacity-60 ${activePack === 'elite' ? 'text-slate-300' : 'text-slate-600'}`}>Vos chiffres sécurisés</p>
                         </div>
                         <div className={`p-4 rounded-2xl border ${activePack === 'elite' ? 'bg-white/5 border-white/10' : 'bg-brand-50 border-brand-100'}`}>
                            <Zap className={`w-4 h-4 mb-2 ${activePack === 'elite' ? 'text-brand-400' : 'text-brand-600'}`} />
                            <p className={`text-[9px] font-black uppercase leading-tight ${activePack === 'elite' ? 'text-white' : 'text-brand-900'}`}>16 Modules Inclus</p>
                            <p className={`text-[8px] font-medium opacity-60 ${activePack === 'elite' ? 'text-slate-300' : 'text-slate-600'}`}>Maîtrise totale 360°</p>
                         </div>
                      </div>

                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <ShieldCheck className={`w-5 h-5 ${activePack === 'elite' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                           <span className={`text-[10px] font-black uppercase ${activePack === 'elite' ? 'text-white' : 'text-slate-500'}`}>Certification Mentor</span>
                         </div>
                         <p className={`text-2xl font-black ${activePack === 'elite' ? 'text-brand-400' : 'text-brand-900'}`}>10 000 F</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Pack Performance RH */}
                <button onClick={() => setActivePack('performance')} className={`p-6 rounded-[2.5rem] border-2 transition-all text-left group ${activePack === 'performance' ? 'bg-emerald-500 border-emerald-600 shadow-xl scale-[1.03] text-white' : 'bg-white border-slate-100 hover:border-emerald-200'}`}>
                    <div className="flex items-center gap-4">
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${activePack === 'performance' ? 'bg-white text-emerald-600' : 'bg-emerald-50 text-emerald-600'}`}><Users className="w-6 h-6" /></div>
                       <div>
                          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${activePack === 'performance' ? 'text-emerald-100' : 'text-emerald-600'}`}>Pack Performance RH</h4>
                          <p className={`text-[9px] font-bold mb-2 ${activePack === 'performance' ? 'text-emerald-50' : 'text-slate-400'}`}>Calcul commissions & Productivité staff.</p>
                          <p className="text-lg font-black leading-tight text-inherit">5 000 F <span className="text-[9px] opacity-40 uppercase text-center">Activ.</span></p>
                       </div>
                    </div>
                </button>

                {/* Pack Stock Expert */}
                <button onClick={() => setActivePack('stock')} className={`p-6 rounded-[2.5rem] border-2 transition-all text-left group ${activePack === 'stock' ? 'bg-sky-500 border-sky-600 shadow-xl scale-[1.03] text-white' : 'bg-white border-slate-100 hover:border-sky-200'}`}>
                    <div className="flex items-center gap-4">
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${activePack === 'stock' ? 'bg-white text-sky-600' : 'bg-sky-50 text-sky-600'}`}><Package className="w-6 h-6" /></div>
                       <div>
                          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${activePack === 'stock' ? 'text-sky-100' : 'text-sky-600'}`}>Pack Stock Expert</h4>
                          <p className={`text-[9px] font-bold mb-2 ${activePack === 'stock' ? 'text-sky-50' : 'text-slate-400'}`}>Alertes rupture & Inventaire valorisé.</p>
                          <p className="text-lg font-black leading-tight text-inherit">5 000 F <span className="text-[9px] opacity-40 uppercase text-center">Activ.</span></p>
                       </div>
                    </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] p-10 md:p-14 animate-in zoom-in-95 relative overflow-hidden">
            {regStep === 'form' ? (
              <>
                <button onClick={() => setIsRegisterModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors" disabled={loading}><X /></button>
                <h2 className="text-3xl font-serif font-bold text-center mb-10">Finaliser mon Accès</h2>
                
                {dbError && (
                  <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] mb-8 flex items-start gap-4 animate-in shake">
                    <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                       <p className="text-[11px] font-black text-rose-600 leading-tight uppercase tracking-widest">Échec de validation</p>
                       <p className="text-xs font-bold text-rose-500 leading-relaxed">{dbError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegisterAndValidate} className="space-y-6">
                  <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Numéro WhatsApp</label><input type="tel" placeholder="0544869313" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold focus:ring-2 focus:ring-brand-500/20" required disabled={loading} /></div>
                  <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Nom de l'Etablissement</label><input type="text" placeholder="Salon Elite" value={regStoreName} onChange={e => setRegStoreName(e.target.value)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold focus:ring-2 focus:ring-brand-500/20" required disabled={loading} /></div>
                  <button type="submit" disabled={loading} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider et créer mon compte
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 flex flex-col items-center">
                <div className="h-28 w-28 bg-[#f0fdf4] text-[#10b981] rounded-3xl flex items-center justify-center mb-10 shadow-sm">
                   <CheckCircle2 className="w-14 h-14" />
                </div>
                
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-12 tracking-tight">C'est validé !</h2>
                
                <div className="w-full bg-[#f8fafc] p-10 rounded-[2.5rem] border border-[#f1f5f9] flex flex-col items-center gap-4 mb-14">
                   <div className="flex items-center gap-4">
                      <Lock className="w-5 h-5 text-brand-600" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Code PIN par défaut</p>
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
                  <MessageCircle className="w-6 h-6" /> Envoyer la preuve WhatsApp
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
