
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
  AlertCircle
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

  const isElite = useMemo(() => user?.isKitaPremium || (user?.purchasedModuleIds?.length || 0) >= 16, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rechargeId = params.get('recharge');
    const packParam = params.get('pack');
    
    if (packParam === 'performance') setActivePack('none');
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
    if (activePack === 'elite') return { total: 10000, label: 'Pack Elite (Accès Total)', discount: 50, nextThreshold: 0, nextDiscount: 0, unitPrice: 625 };
    if (activePack === 'stock') return { total: 5000, label: 'Pack Stock Expert (Magasin)', discount: 0, nextThreshold: 0, nextDiscount: 0, unitPrice: 5000 };

    const count = cart.length;
    let unitPrice = 500;
    let discount = 0;
    let nextThreshold = 0;
    let nextDiscount = 0;

    if (count >= 13) { unitPrice = 250; discount = 50; }
    else if (count >= 9) { unitPrice = 350; discount = 30; nextThreshold = 13; nextDiscount = 50; }
    else if (count >= 5) { unitPrice = 400; discount = 20; nextThreshold = 9; nextDiscount = 30; }
    else { nextThreshold = 5; nextDiscount = 20; }

    const total = count === 16 ? 10000 : count * unitPrice;
    
    return { total, unitPrice, discount, label: count > 0 ? `${count} module(s) sélectionné(s)` : 'Sélectionnez vos modules', nextThreshold, nextDiscount };
  }, [cart, activePack]);

  const handleRegisterAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regStoreName) return alert("Veuillez remplir tous les champs.");
    
    setLoading(true);
    try {
      const formattedPhone = regPhone.trim().startsWith('0') ? `+225${regPhone.trim()}` : regPhone.trim();
      const existingProfile = await getProfileByPhone(formattedPhone);
      
      let pendingIds: string[] = [];
      if (activePack === 'elite') pendingIds = ['REQUEST_ELITE'];
      else if (activePack === 'stock') pendingIds = ['REQUEST_STOCK'];
      else pendingIds = cart.map(m => m.id);

      if (pendingIds.length === 0 && activePack === 'none') {
        throw new Error("Votre panier est vide.");
      }

      // UTILISATION D'UN UUID VALIDE GÉNÉRÉ PAR LA NOUVELLE FONCTION
      const targetUid = (existingProfile && existingProfile.uid) ? existingProfile.uid : generateUUID();

      if (existingProfile) {
        await updateUserProfile(existingProfile.uid, {
          establishmentName: regStoreName,
          pendingModuleIds: [...new Set([...(existingProfile.pendingModuleIds || []), ...pendingIds])]
        });
      } else {
        const profileToSave: any = {
          uid: targetUid,
          phoneNumber: formattedPhone,
          establishmentName: regStoreName,
          firstName: 'Gérant',
          lastName: '',
          isActive: false,
          isAdmin: false,
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
      
      localStorage.setItem('gotop_pending_request', JSON.stringify({ phone: formattedPhone, amount: pricingData.total }));
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
      {/* Header avec Coach Kita */}
      <div className="bg-brand-900 pt-24 pb-48 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none text-[20rem] font-serif italic text-white leading-none -mr-20">Audit</div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="h-48 w-48 rounded-[3.5rem] bg-white p-1.5 shadow-2xl shrink-0 rotate-3 transition-transform hover:rotate-0">
            <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover rounded-[2.8rem]" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Votre Plan de <span className="text-brand-500 italic">Succès</span></h1>
            <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl leading-relaxed opacity-90">
              J'ai analysé vos réponses. Voici votre feuille de route stratégique pour transformer votre salon en institution de prestige.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-24 space-y-12 relative z-20">
        {/* Analyse du Mentor */}
        <section className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-10 md:p-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[10rem] font-serif italic pointer-events-none group-hover:scale-110 transition-transform duration-1000">Vision</div>
          <div className="flex items-center gap-4 mb-10">
            <Zap className="text-brand-600 w-6 h-6" />
            <h2 className="text-[11px] font-black text-brand-900 uppercase tracking-[0.4em]">Débriefing de Coach Kita</h2>
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
          {/* Panier et Catalogue */}
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
                    }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[8px] font-black text-brand-600 uppercase tracking-[0.2em]">{module.topic}</span>
                          {isRecommended && <span className="text-[7px] font-black bg-amber-400 text-brand-900 px-2 py-0.5 rounded-full uppercase tracking-widest">Prioritaire</span>}
                          {isOwned && <span className="text-[7px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1"><Check className="w-2 h-2" /> Débloqué</span>}
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

          {/* Caisse et Paiement */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-8xl font-serif italic pointer-events-none">Prix</div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-8 border-b border-slate-50 pb-6 flex items-center gap-4">
                  <ShoppingBag className="w-6 h-6 text-brand-500" /> Votre Panier
                </h3>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pricingData.label}</p>
                    <p className="text-4xl font-black text-brand-900">{pricingData.total.toLocaleString()} <span className="text-sm font-bold opacity-30 uppercase">F</span></p>
                  </div>
                  {pricingData.discount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                      <TrendingUp className="w-3 h-3" /> Remise Exceptionnelle de {pricingData.discount}% appliquée
                    </div>
                  )}
                  {pricingData.nextThreshold > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-medium text-slate-500 leading-relaxed italic">
                        Astuce : Atteignez {pricingData.nextThreshold} modules pour passer à {pricingData.nextDiscount}% de remise.
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleValidateEngagement}
                  disabled={loading || (cart.length === 0 && activePack === 'none')}
                  className="w-full bg-brand-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-brand-200 hover:bg-brand-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Valider mon plan d'action
                </button>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Sécurisé</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div className="flex flex-col items-center gap-2">
                    <Gift className="w-5 h-5" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Inclus</span>
                  </div>
                </div>
              </div>

              {/* Promo Packs */}
              <div className="grid gap-4">
                <button onClick={() => setActivePack('elite')} className={`p-8 rounded-[2.5rem] border-2 text-left transition-all flex items-center gap-6 group ${activePack === 'elite' ? 'bg-amber-400 border-amber-500 shadow-xl' : 'bg-white border-slate-100 hover:border-amber-400 shadow-sm'}`}>
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${activePack === 'elite' ? 'bg-brand-900 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                    <Crown className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-black uppercase tracking-tight mb-1 ${activePack === 'elite' ? 'text-brand-900' : 'text-slate-900'}`}>Pack Académie Elite</h4>
                    <p className={`text-xs font-bold ${activePack === 'elite' ? 'text-brand-800' : 'text-slate-500'}`}>10 000 F • Accès illimité 16 modules</p>
                  </div>
                </button>
                <button onClick={() => setActivePack('stock')} className={`p-8 rounded-[2.5rem] border-2 text-left transition-all flex items-center gap-6 group ${activePack === 'stock' ? 'bg-sky-500 border-sky-600 shadow-xl' : 'bg-white border-slate-100 hover:border-sky-500 shadow-sm'}`}>
                   <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${activePack === 'stock' ? 'bg-white text-sky-500' : 'bg-sky-50 text-sky-600'}`}>
                      <Store className="w-8 h-8" />
                   </div>
                   <div className={activePack === 'stock' ? 'text-white' : 'text-slate-900'}>
                      <h4 className="text-lg font-black uppercase tracking-tight mb-1">Pack Stock Expert</h4>
                      <p className={`text-xs font-bold ${activePack === 'stock' ? 'text-white/80' : 'text-slate-500'}`}>5 000 F • Magasin & Fournisseurs</p>
                   </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modale d'inscription / Confirmation */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {regStep === 'form' ? (
              <>
                <div className="text-center mb-10">
                  <div className="h-20 w-20 bg-brand-50 text-brand-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Store className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Prescription d'Excellence</h2>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Inscription au registre Coach Kita</p>
                </div>

                <form onSubmit={handleRegisterAndValidate} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Numéro WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="tel" 
                          placeholder="0708047914" 
                          value={regPhone} 
                          onChange={e => setRegPhone(e.target.value)} 
                          className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20" 
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Nom de votre établissement</label>
                      <div className="relative">
                        <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="text" 
                          placeholder="Ex: Salon Beauté d'Or" 
                          value={regStoreName} 
                          onChange={e => setRegStoreName(e.target.value)} 
                          className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20" 
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Valider mon plan
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
                  <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Plan Validé !</h2>
                  <p className="text-slate-500 font-medium leading-relaxed italic">
                    "Félicitations pour cet engagement. Pour activer vos accès, veuillez procéder au règlement du plan d'action ({pricingData.total} F) via Wave."
                  </p>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-4">
                    <img src="https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/assets/wave_logo.png" className="h-8 object-contain" alt="Wave" />
                    <span className="text-2xl font-black text-brand-900 tracking-tighter">01 03 43 84 56</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titulaire : OUREGA GOBLE</p>
                </div>

                <button 
                  onClick={finalizeAndRedirect} 
                  className="w-full bg-emerald-500 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-emerald-200"
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
