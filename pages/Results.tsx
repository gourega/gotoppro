
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  Loader2, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Crown, 
  Zap, 
  Star, 
  X, 
  Target,
  CheckCircle2,
  TrendingUp,
  Percent,
  Gift,
  Phone,
  Store,
  ShieldCheck,
  MessageCircle,
  QrCode,
  CreditCard,
  Check,
  AlertCircle,
  ArrowUpRight,
  Info,
  Quote,
  Sparkles,
  Gem,
  Infinity,
  Cloud,
  Award,
  CalendarDays,
  Users,
  Package,
  Banknote
} from 'lucide-react';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase, saveUserProfile, getProfileByPhone, updateUserProfile, generateUUID } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';

const Results: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [activePack, setActivePack] = useState<'none' | 'elite' | 'performance' | 'stock'>('none');
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [recommendedModuleIds, setRecommendedModuleIds] = useState<string[]>([]);

  // États pour la modale d'inscription
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

    let initialCart: TrainingModule[] = [];

    if (rechargeId) {
      const moduleToRecharge = TRAINING_CATALOG.find(m => m.id === rechargeId);
      if (moduleToRecharge) {
        initialCart = [moduleToRecharge];
      }
    } 
    else {
      const raw = localStorage.getItem('temp_quiz_results');
      const results = raw ? JSON.parse(raw) : null;
      
      if (results) {
        const negativeResults = results.filter((r: any) => !r.answer);
        const negativeIds = negativeResults.map((r: any) => {
          const q = DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId);
          return q?.linkedModuleId;
        }).filter(Boolean) as string[];

        setRecommendedModuleIds(negativeIds);
        
        const diagnosticModules = TRAINING_CATALOG.filter(m => 
          negativeIds.includes(m.id) && 
          !(user?.purchasedModuleIds || []).includes(m.id)
        );
        initialCart = diagnosticModules;
      }
    }

    setCart(initialCart);

    const rawResults = localStorage.getItem('temp_quiz_results');
    if (rawResults) {
      const results = JSON.parse(rawResults);
      const negativeResults = results.filter((r: any) => !r.answer);
      const getAdvice = async () => {
        const negativeTexts = negativeResults.map((r: any) => 
          DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text
        ).filter(Boolean) as string[];
        const advice = await generateStrategicAdvice(negativeTexts, negativeResults.length === 0);
        setAiAdvice(advice ?? null);
        setLoadingAdvice(false);
      };
      getAdvice();
    } else {
      setLoadingAdvice(false);
      setAiAdvice(rechargeId ? "Concentrez-vous sur la validation de ce module pour franchir une nouvelle étape." : "Explorez notre catalogue expert pour transformer votre salon.");
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
    if (activePack === 'elite') return { total: 10000, label: 'Pack Académie Élite (Totalité)', discount: 60, nextThreshold: 0, nextDiscount: 0, unitPrice: 625, rawTotal: 25000, savings: 15000 };
    if (activePack === 'performance') return { total: 5000, label: 'Pack RH & Pilotage (3 ans)', discount: 0, nextThreshold: 0, nextDiscount: 0, unitPrice: 5000, rawTotal: 5000, savings: 0 };
    if (activePack === 'stock') return { total: 5000, label: 'Pack Stock Expert (3 ans)', discount: 0, nextThreshold: 0, nextDiscount: 0, unitPrice: 5000, rawTotal: 5000, savings: 0 };

    const count = cart.length;
    let unitPrice = 500;
    let discount = 0;
    let nextThreshold = 0;
    let nextDiscount = 0;

    if (count >= 13) { unitPrice = 250; discount = 50; }
    else if (count >= 9) { unitPrice = 350; discount = 30; nextThreshold = 13; nextDiscount = 50; }
    else if (count >= 5) { unitPrice = 400; discount = 20; nextThreshold = 9; nextDiscount = 30; }
    else if (count > 0) { nextThreshold = 5; nextDiscount = 20; }

    const rawTotal = count * 500;
    const total = count === 16 ? 10000 : count * unitPrice;
    const savings = rawTotal - total;
    
    return { total, unitPrice, discount, label: count > 0 ? `${count} module(s) sélectionné(s)` : 'Panier vide', nextThreshold, nextDiscount, rawTotal, savings };
  }, [cart, activePack]);

  const handleRegisterAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regStoreName) return alert("Veuillez remplir tous les champs.");
    
    setLoading(true);
    try {
      // Nettoyage et formatage du numéro
      let cleanPhone = regPhone.replace(/\s/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
      if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;

      const existingProfile = await getProfileByPhone(cleanPhone);
      
      let pendingIds: string[] = [];
      if (activePack === 'elite') pendingIds = ['REQUEST_ELITE'];
      else if (activePack === 'performance') pendingIds = ['REQUEST_PERFORMANCE'];
      else if (activePack === 'stock') pendingIds = ['REQUEST_STOCK'];
      else pendingIds = cart.map(m => m.id);

      if (pendingIds.length === 0 && activePack === 'none') {
        throw new Error("Votre panier est vide.");
      }

      const targetUid = (existingProfile && existingProfile.uid) ? existingProfile.uid : generateUUID();

      if (existingProfile) {
        // Mise à jour de la demande sur un compte existant
        await updateUserProfile(existingProfile.uid, {
          establishmentName: regStoreName,
          pendingModuleIds: [...new Set([...(existingProfile.pendingModuleIds || []), ...pendingIds])]
        });
      } else {
        // Création intégrale du nouveau Gérant
        const profileToSave: any = {
          uid: targetUid,
          phoneNumber: cleanPhone,
          establishmentName: regStoreName,
          firstName: 'Gérant',
          lastName: '',
          isActive: false, // Sera activé par l'admin après paiement
          isAdmin: false,
          isPublic: true,
          isKitaPremium: false,
          hasPerformancePack: false,
          hasStockPack: false,
          badges: [],
          purchasedModuleIds: [],
          pendingModuleIds: pendingIds,
          actionPlan: [],
          createdAt: new Date().toISOString(),
          role: 'CLIENT'
        };
        await saveUserProfile(profileToSave);
      }
      
      // Stockage temporaire pour la confirmation
      localStorage.setItem('gotop_pending_request', JSON.stringify({ phone: cleanPhone, amount: pricingData.total }));
      setRegStep('success');
    } catch (err: any) {
      console.error("Save error:", err);
      alert(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const finalizeAndRedirect = () => {
    const message = `Bonjour Coach Kita, je suis le gérant du salon "${regStoreName || user?.establishmentName}". Je viens de valider mon plan d'action (${pricingData.total} F). Je procède au transfert Wave sur votre numéro : 01 03 43 84 56.`;
    window.open(`https://wa.me/2250103438456?text=${encodeURIComponent(message)}`, '_blank');
    setIsRegisterModalOpen(false);
    navigate('/login');
  };

  const handleValidateEngagement = async () => {
    if (!user) {
      setIsRegisterModalOpen(true);
      return;
    }

    if (pricingData.total === 0 && activePack === 'none') {
      alert("Veuillez sélectionner au moins un module.");
      return;
    }

    setLoading(true);
    try {
      let newPendingIds: string[] = [];
      if (activePack === 'elite') newPendingIds = ['REQUEST_ELITE'];
      else if (activePack === 'performance') newPendingIds = ['REQUEST_PERFORMANCE'];
      else if (activePack === 'stock') newPendingIds = ['REQUEST_STOCK'];
      else newPendingIds = cart.map(m => m.id);
      
      const updatedPending = [...new Set([...(user.pendingModuleIds || []), ...newPendingIds])];
      await updateUserProfile(user.uid, { pendingModuleIds: updatedPending });
      setRegStep('success');
      setIsRegisterModalOpen(true);
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-brand-900 pt-24 pb-48 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none text-[20rem] font-serif italic text-white leading-none -mr-20">Audit</div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="h-48 w-48 rounded-[3.5rem] bg-white p-1.5 shadow-2xl shrink-0 rotate-3 transition-transform hover:rotate-0">
            <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover rounded-[2.8rem]" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Votre Plan de <span className="text-brand-500 italic">Succès</span></h1>
            <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl leading-relaxed opacity-90">
              J'ai analysé votre situation. Voici le chemin vers l'Excellence et la rentabilité certifiée.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-24 space-y-12 relative z-20">
        <section className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-10 md:p-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[10rem] font-serif italic pointer-events-none group-hover:scale-110 transition-transform duration-1000">Vision</div>
          <div className="flex items-center gap-4 mb-10">
            <Zap className="text-brand-600 w-6 h-6" />
            <h2 className="text-[11px] font-black text-brand-900 uppercase tracking-[0.4em]">Débriefing Stratégique</h2>
          </div>
          
          {loadingAdvice ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Analyse IA en cours...</p>
            </div>
          ) : (
            <div className="prose-kita text-slate-700">
              {aiAdvice ? (
                <div className="whitespace-pre-wrap leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: aiAdvice.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-900 font-bold">$1</strong>') }} />
              ) : (
                <p>Analyse indisponible pour le moment.</p>
              )}
            </div>
          )}
        </section>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Modules Recommandés</h3>
              <div className="h-px bg-slate-200 flex-grow ml-6"></div>
            </div>

            <div className="grid gap-4">
              {TRAINING_CATALOG.map(module => {
                const isInCart = cart.find(m => m.id === module.id);
                const isRecommended = recommendedModuleIds.includes(module.id);
                const isOwned = (user?.purchasedModuleIds || []).includes(module.id);

                return (
                  <button 
                    key={module.id} 
                    onClick={() => !isOwned && toggleModuleInCart(module)}
                    disabled={isOwned}
                    className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${
                      isOwned ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' :
                      isInCart ? 'bg-brand-50 border-brand-500 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-200'
                    } ${isRecommended && !isInCart ? 'border-amber-200 bg-amber-50/10' : ''}`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[8px] font-black text-brand-600 uppercase tracking-[0.2em]">{module.topic}</span>
                          <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-tight border border-slate-200">500 F</span>
                          {isRecommended && (
                            <span className="text-[7px] font-black bg-amber-400 text-brand-900 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                               <Star className="w-2 h-2 fill-current" /> Priorité Mentor
                            </span>
                          )}
                          {isOwned && <span className="text-[7px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1"><Check className="w-2 h-2" /> Possédé</span>}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-900 transition-colors">{module.title}</h4>
                      </div>
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${isOwned ? 'bg-emerald-100 text-emerald-600' : isInCart ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100'}`}>
                        {isOwned ? <CheckCircle2 className="w-6 h-6" /> : isInCart ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-8xl font-serif italic pointer-events-none">Prix</div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-8 border-b border-slate-50 pb-6 flex items-center gap-4">
                  <ShoppingBag className="w-6 h-6 text-brand-500" /> Votre Engagement
                </h3>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{pricingData.label}</p>
                       {pricingData.savings > 0 ? (
                         <div className="flex flex-wrap items-center gap-2">
                           <span className="text-slate-300 line-through font-bold text-base">{pricingData.rawTotal.toLocaleString()} F</span>
                           <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-1 rounded-md uppercase tracking-tighter shadow-sm">Remise appliquée</span>
                         </div>
                       ) : cart.length > 0 ? (
                         <p className="text-xs font-bold text-slate-400">Tarif : 500 F / module</p>
                       ) : null}
                    </div>
                    <div className="text-right shrink-0">
                       <p className="text-5xl font-black text-brand-900 leading-none">
                        {pricingData.total.toLocaleString()} <span className="text-sm font-bold opacity-30 uppercase">F</span>
                       </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleValidateEngagement}
                  disabled={loading || (cart.length === 0 && activePack === 'none')}
                  className="w-full bg-brand-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-brand-200 hover:bg-brand-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Valider mon plan d'action
                </button>
              </div>

              <div className="grid gap-4">
                <div className={`p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden group ${activePack === 'elite' ? 'bg-amber-400 border-amber-500 shadow-xl' : 'bg-white border-slate-100 hover:border-amber-400 shadow-sm'}`}>
                  <div className="flex items-center gap-6 mb-4">
                    <button onClick={() => setActivePack('elite')} className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${activePack === 'elite' ? 'bg-brand-900 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                      <Crown className="w-8 h-8" />
                    </button>
                    <div className="flex-grow">
                      <h4 className={`text-lg font-black uppercase tracking-tight mb-1 ${activePack === 'elite' ? 'text-brand-900' : 'text-slate-900'}`}>Académie Élite</h4>
                      <p className={`text-xl font-black ${activePack === 'elite' ? 'text-brand-900' : 'text-slate-900'}`}>10 000 F <span className="text-xs font-bold opacity-40">Illimité</span></p>
                    </div>
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-80 mb-6">Débloquez les 16 modules d'un coup et activez la sauvegarde Cloud certifiée à vie.</p>
                  {activePack !== 'elite' && (
                    <button onClick={() => setActivePack('elite')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all">Sélectionner Élite</button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setActivePack('performance')} className={`p-6 rounded-[2.5rem] border-2 text-left transition-all group ${activePack === 'performance' ? 'bg-emerald-500 border-emerald-600 shadow-xl text-white' : 'bg-white border-slate-100 hover:border-emerald-500 shadow-sm'}`}>
                      <Users className={`w-8 h-8 mb-4 ${activePack === 'performance' ? 'text-white' : 'text-emerald-500'}`} />
                      <h4 className="text-xs font-black uppercase tracking-tight mb-1">Pack RH</h4>
                      <p className="text-[10px] font-bold opacity-70">5 000 F / 3 ans</p>
                   </button>

                   <button onClick={() => setActivePack('stock')} className={`p-6 rounded-[2.5rem] border-2 text-left transition-all group ${activePack === 'stock' ? 'bg-sky-500 border-sky-600 shadow-xl text-white' : 'bg-white border-slate-100 hover:border-sky-500 shadow-sm'}`}>
                      <Package className={`w-8 h-8 mb-4 ${activePack === 'stock' ? 'text-white' : 'text-sky-500'}`} />
                      <h4 className="text-xs font-black uppercase tracking-tight mb-1">Pack Stock</h4>
                      <p className="text-[10px] font-bold opacity-70">5 000 F / 3 ans</p>
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {regStep === 'form' ? (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Inscription Gérant</h2>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Créez votre accès Coach Kita</p>
                </div>

                <form onSubmit={handleRegisterAndValidate} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Numéro WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input type="tel" placeholder="0708047914" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Nom de votre établissement</label>
                      <div className="relative">
                        <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input type="text" placeholder="Ex: Salon de l'Élite" value={regStoreName} onChange={e => setRegStoreName(e.target.value)} className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20" required />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Valider mon plan et créer mon compte
                  </button>
                  <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="w-full py-4 text-[10px] font-black uppercase text-slate-300">Annuler</button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-10 animate-in fade-in">
                <div className="h-24 w-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Compte créé !</h2>
                  <p className="text-slate-500 font-medium leading-relaxed italic">
                    "Pour activer vos accès et sécuriser vos données, veuillez régler ({pricingData.total} F) via Wave."
                  </p>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-4">
                    <img src="https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/assets/wave_logo.png" className="h-8 object-contain" alt="Wave" />
                    <span className="text-2xl font-black text-brand-900 tracking-tighter">01 03 43 84 56</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titulaire : OUREGA GOBLE</p>
                </div>

                <button onClick={finalizeAndRedirect} className="w-full bg-emerald-500 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-emerald-200">
                  <MessageCircle className="w-6 h-6" /> Envoyer ma preuve sur WhatsApp
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
