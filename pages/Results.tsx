
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Loader2, 
  ShoppingBag, 
  Plus, 
  Crown, 
  Zap, 
  CheckCircle2, 
  MessageCircle,
  Check,
  Package,
  Users,
  Lock,
  TrendingUp,
  Gift,
  ArrowRight,
  Star,
  ShieldCheck,
  MinusCircle,
  Tag
} from 'lucide-react';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR, COACH_KITA_WAVE_NUMBER, COACH_KITA_PHONE } from '../constants';
import { TrainingModule, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, getProfileByPhone, updateUserProfile, generateUUID } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';

const Results: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [activePack, setActivePack] = useState<'none' | 'elite' | 'performance' | 'stock' | 'crm'>('none');
  const [loading, setLoading] = useState(false);
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
        const negativeTexts = results.filter((r: any) => !r.answer).map((r: any) => 
          DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text
        ).filter(Boolean) as string[];
        const advice = await generateStrategicAdvice(negativeTexts, negativeTexts.length === 0);
        setAiAdvice(advice ?? null);
        setLoadingAdvice(false);
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
    if (activePack === 'elite') return { total: 10000, label: 'Pack Académie Élite', rawTotal: 8000, savings: 0, discountPercent: 0, nextThreshold: null, progress: 100 };
    if (activePack === 'performance') return { total: 5000, label: 'Pack RH Performance', rawTotal: 5000, savings: 0, discountPercent: 0, nextThreshold: null, progress: 0 };
    if (activePack === 'stock') return { total: 5000, label: 'Pack Stock Expert', rawTotal: 5000, savings: 0, discountPercent: 0, nextThreshold: null, progress: 0 };
    if (activePack === 'crm') return { total: 500, label: 'Abonnement CRM VIP', rawTotal: 500, savings: 0, discountPercent: 0, nextThreshold: null, progress: 0 };

    const count = cart.length;
    let unitPrice = 500;
    let discountPercent = 0;
    let nextThreshold = null;

    if (count >= 13) {
      unitPrice = 250;
      discountPercent = 50;
      if (count < 16) nextThreshold = { needed: 16 - count, label: "Passage Élite", nextPercent: 100 };
    } else if (count >= 9) {
      unitPrice = 350;
      discountPercent = 30;
      nextThreshold = { needed: 13 - count, label: "Remise -50%", nextPercent: 50 };
    } else if (count >= 5) {
      unitPrice = 400;
      discountPercent = 20;
      nextThreshold = { needed: 9 - count, label: "Remise -30%", nextPercent: 30 };
    } else if (count > 0) {
      nextThreshold = { needed: 5 - count, label: "Remise -20%", nextPercent: 20 };
    }

    const total = count === 16 ? 10000 : count * unitPrice;
    const rawTotal = count * 500;
    const progress = (count / 16) * 100;
    
    return { 
      total, 
      label: `${count} module(s) choisi(s)`, 
      rawTotal, 
      savings: rawTotal - total,
      discountPercent,
      nextThreshold,
      progress
    };
  }, [cart, activePack]);

  const handleRegisterAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regStoreName) return alert("Champs obligatoires.");
    setLoading(true);
    try {
      let cleanPhone = regPhone.replace(/\s/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
      if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;
      
      const existing = await getProfileByPhone(cleanPhone);
      let pendingIds = activePack !== 'none' ? [`REQUEST_${activePack.toUpperCase()}`] : cart.map(m => m.id);
      
      if (existing) {
        await updateUserProfile(existing.uid, { 
          establishmentName: regStoreName, 
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
          actionPlan: []
        };
        await saveUserProfile(newUser);
      }
      setRegStep('success');
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleValidateEngagement = async () => {
    if (!user) return setIsRegisterModalOpen(true);
    if (pricingData.total === 0 && activePack === 'none') return alert("Sélectionnez un module.");
    setLoading(true);
    try {
      let newPending = activePack !== 'none' ? [`REQUEST_${activePack.toUpperCase()}`] : cart.map(m => m.id);
      await updateUserProfile(user.uid, { pendingModuleIds: [...new Set([...(user.pendingModuleIds || []), ...newPending])] });
      setRegStep('success');
      setIsRegisterModalOpen(true);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
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
              {TRAINING_CATALOG.filter(module => !cart.some(m => m.id === module.id)).length === 0 && (
                <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium italic">Tous les modules disponibles sont déjà dans votre panier.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              {/* PANIER DÉTAILLÉ */}
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-4"><ShoppingBag className="text-brand-500" /> Mon Engagement</h3>
                
                {/* Liste des modules dans le panier */}
                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
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
                    <p className="text-center text-slate-400 text-xs italic py-6">Aucun module sélectionné</p>
                  )}
                </div>

                {/* JAUGE DE RÉDUCTION */}
                {activePack === 'none' && cart.length > 0 && (
                  <div className="mb-10 space-y-3">
                    <div className="flex justify-between items-end">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paliers de Réduction</p>
                       {pricingData.nextThreshold ? (
                         <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest">
                           +{pricingData.nextThreshold.needed} modules pour {pricingData.nextThreshold.label}
                         </p>
                       ) : (
                         <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1"><Crown className="w-3 h-3"/> Maximum Remise</p>
                       )}
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="absolute inset-y-0 left-0 bg-brand-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(14,165,233,0.4)]" style={{ width: `${pricingData.progress}%` }}></div>
                       {/* Markers */}
                       <div className="absolute top-0 left-[31.25%] h-full w-0.5 bg-white/50 z-10" title="-20%"></div>
                       <div className="absolute top-0 left-[56.25%] h-full w-0.5 bg-white/50 z-10" title="-30%"></div>
                       <div className="absolute top-0 left-[81.25%] h-full w-0.5 bg-white/50 z-10" title="-50%"></div>
                    </div>
                    <div className="flex justify-between text-[7px] font-black text-slate-300 uppercase tracking-tighter">
                       <span>Départ</span>
                       <span>-20%</span>
                       <span>-30%</span>
                       <span>-50%</span>
                       <span>Élite</span>
                    </div>
                  </div>
                )}

                {/* CALCUL FINAL */}
                <div className="space-y-3 mb-10 pt-6 border-t border-slate-50">
                   {pricingData.savings > 0 && (
                     <>
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Sous-total</span>
                        <span className="text-sm font-black strike-through">{pricingData.rawTotal.toLocaleString()} F</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-500">
                        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Tag className="w-3 h-3" /> Réduction (-{pricingData.discountPercent}%)</span>
                        <span className="text-sm font-black">-{pricingData.savings.toLocaleString()} F</span>
                      </div>
                     </>
                   )}
                   <div className="flex justify-between items-center pt-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix Total Net</p>
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

              <div className="grid gap-4">
                <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${activePack === 'crm' ? 'bg-amber-400 border-amber-500 shadow-xl scale-[1.03]' : 'bg-white border-slate-100'}`}>
                  <button onClick={() => setActivePack('crm')} className="w-full text-left">
                    <div className="flex items-center gap-4 mb-4">
                       <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${activePack === 'crm' ? 'bg-brand-900 text-amber-400' : 'bg-amber-50 text-amber-600'}`}><Star /></div>
                       <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest">Pack Fidélité (CRM)</h4>
                          <p className="text-lg font-black">500 F <span className="text-[10px] opacity-40 uppercase">/ mois</span></p>
                       </div>
                    </div>
                    <p className="text-[10px] font-medium text-slate-600 leading-relaxed mb-2">
                       Activez les relances WhatsApp et les notes VIP. <span className="italic font-bold text-brand-700">(Nécessite le Pack RH actif)</span>.
                    </p>
                  </button>
                </div>

                {!isElite && (
                  <div className={`p-8 rounded-[2.5rem] border-2 transition-all group ${activePack === 'elite' ? 'bg-amber-400 border-amber-500 shadow-xl scale-[1.03]' : 'bg-white border-slate-100'}`}>
                    <button onClick={() => setActivePack('elite')} className="w-full text-left">
                      <div className="flex items-center gap-6 mb-4">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${activePack === 'elite' ? 'bg-brand-900 text-amber-400' : 'bg-amber-50 text-amber-600'}`}><Crown /></div>
                        <div>
                          <h4 className="text-lg font-black uppercase leading-tight">Académie Élite</h4>
                          <p className="font-black">10 000 F</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${activePack === 'elite' ? 'text-brand-900' : 'text-amber-600'}`}>Acquis à vie</p>
                        </div>
                      </div>
                      <p className={`text-[10px] font-medium leading-relaxed ${activePack === 'elite' ? 'text-brand-900' : 'text-slate-500'}`}>
                        Accès illimité aux 16 modules experts, mises à jour incluses et sauvegarde Cloud permanente.
                      </p>
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setActivePack('performance')} className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col items-start ${activePack === 'performance' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg scale-105' : 'bg-white border-slate-100 hover:border-emerald-100'}`}>
                      <Users className="mb-4" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Pack RH</h4>
                      <p className="text-[9px] font-bold opacity-70 mb-3">5 000 F</p>
                      <p className={`text-[8px] font-medium leading-relaxed ${activePack === 'performance' ? 'text-emerald-50' : 'text-slate-500'}`}>
                         Commissions auto, déblocage obligatoire du CRM. <span className="font-black">Valable 3 ans.</span>
                      </p>
                   </button>
                   <button onClick={() => setActivePack('stock')} className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col items-start ${activePack === 'stock' ? 'bg-sky-500 border-sky-600 text-white shadow-lg scale-105' : 'bg-white border-slate-100 hover:border-sky-100'}`}>
                      <Package className="mb-4" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Pack Stock</h4>
                      <p className="text-[9px] font-bold opacity-70 mb-3">5 000 F</p>
                      <p className={`text-[8px] font-medium leading-relaxed ${activePack === 'stock' ? 'text-sky-50' : 'text-slate-500'}`}>
                         Inventaire, alertes ruptures et répertoire grossistes. <span className="font-black">Valable 3 ans.</span>
                      </p>
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] p-10 md:p-14 animate-in zoom-in-95">
            {regStep === 'form' ? (
              <>
                <h2 className="text-3xl font-serif font-bold text-center mb-10">Finaliser l'Accès</h2>
                <form onSubmit={handleRegisterAndValidate} className="space-y-6">
                  <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Numéro WhatsApp</label><input type="tel" placeholder="0544869313" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold focus:ring-2 focus:ring-brand-500/20" required /></div>
                  <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Nom de l'Etablissement</label><input type="text" placeholder="Salon Elite" value={regStoreName} onChange={e => setRegStoreName(e.target.value)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold focus:ring-2 focus:ring-brand-500/20" required /></div>
                  <button type="submit" disabled={loading} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4">
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider et créer mon compte
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-10">
                <div className="h-24 w-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl"><CheckCircle2 className="w-12 h-12" /></div>
                <h2 className="text-4xl font-serif font-bold tracking-tight">Compte créé !</h2>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4 justify-center">
                   <Lock className="w-6 h-6 text-brand-600" />
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PIN de connexion par défaut</p>
                      <p className="text-xl font-black text-brand-900">1 2 3 4</p>
                   </div>
                </div>
                <p className="text-slate-500 italic px-4">
                  "Pour activer vos accès (<strong>{pricingData.total.toLocaleString()} F</strong>), réglez via Wave au numéro <strong>{COACH_KITA_WAVE_NUMBER}</strong>."
                </p>
                <button 
                  onClick={() => { 
                    const waNum = COACH_KITA_PHONE.replace(/\+/g, '').replace(/\s/g, '');
                    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(`Bonjour Coach Kita, je viens de valider mon plan d'action (${pricingData.total} F). Merci d'activer mes accès.`)}`, '_blank'); 
                    navigate('/login'); 
                  }} 
                  className="w-full bg-emerald-500 text-white py-6 rounded-3xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all"
                >
                  <MessageCircle className="w-6 h-6" /> Confirmer sur WhatsApp Business
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
