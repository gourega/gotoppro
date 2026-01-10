
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
  CreditCard
} from 'lucide-react';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase, saveUserProfile, getProfileByPhone } from '../services/supabase';
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
    const packParam = params.get('pack');
    if (packParam === 'performance') setActivePack('none');
    else if (packParam === 'elite') setActivePack('elite');
    else if (packParam === 'stock') setActivePack('stock');

    const raw = localStorage.getItem('temp_quiz_results');
    const results = raw ? JSON.parse(raw) : null;
    
    if (results) {
      const negativeResults = results.filter((r: any) => !r.answer);
      const negativeIds = negativeResults.map((r: any) => {
        const q = DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId);
        return q?.linkedModuleId;
      }).filter(Boolean) as string[];

      setRecommendedModuleIds(negativeIds);
      const recommendedModules = TRAINING_CATALOG.filter(m => negativeIds.includes(m.id));
      setCart(recommendedModules);

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
      setAiAdvice("Explorez notre catalogue expert pour transformer votre salon.");
    }
  }, [user, location.search]);

  const toggleModuleInCart = (mod: TrainingModule) => {
    setActivePack('none');
    setCart(prev => {
      const exists = prev.find(m => m.id === mod.id);
      if (exists) return prev.filter(m => m.id !== mod.id);
      return [...prev, mod];
    });
  };

  const pricingData = useMemo(() => {
    if (activePack === 'elite') return { total: 10000, unitPrice: 625, discount: 50, label: 'Pack Elite (Accès Total)' };
    if (activePack === 'stock') return { total: 5000, unitPrice: 5000, discount: 0, label: 'Pack Stock Expert (Magasin)' };

    const count = cart.length;
    let unitPrice = 500;
    let discount = 0;

    if (count >= 13) { unitPrice = 250; discount = 50; }
    else if (count >= 9) { unitPrice = 350; discount = 30; }
    else if (count >= 5) { unitPrice = 400; discount = 20; }

    const total = count === 16 ? 10000 : count * unitPrice;
    return { 
      total, 
      unitPrice, 
      discount,
      label: count > 0 ? `${count} module(s) sélectionné(s)` : 'Sélectionnez vos modules',
      nextThreshold: count < 5 ? 5 : count < 9 ? 9 : count < 13 ? 13 : 16,
      nextDiscount: count < 5 ? 20 : count < 9 ? 30 : count < 13 ? 50 : 0
    };
  }, [cart, activePack]);

  const handleRegisterAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regStoreName) return alert("Veuillez remplir tous les champs.");
    
    setLoading(true);
    try {
      const formattedPhone = regPhone.trim().startsWith('0') ? `+225${regPhone.trim()}` : regPhone.trim();
      
      // 1. Vérifier si un profil existe déjà pour ce numéro
      const existingProfile = await getProfileByPhone(formattedPhone);
      
      // Capture du panier
      let pendingIds: string[] = [];
      if (activePack === 'elite') pendingIds = ['REQUEST_ELITE'];
      else if (activePack === 'stock') pendingIds = ['REQUEST_STOCK'];
      else pendingIds = cart.map(m => m.id);

      if (pendingIds.length === 0 && activePack === 'none') {
        throw new Error("Votre panier est vide.");
      }

      // 2. Préparer l'objet profil
      // Si le profil existe, on garde son UID actuel pour éviter la violation de contrainte Unique
      const targetUid = existingProfile ? existingProfile.uid : `guest_${Date.now()}_${formattedPhone.replace(/\D/g, '')}`;

      const profileToSave: Partial<UserProfile> & { uid: string } = {
        uid: targetUid,
        phoneNumber: formattedPhone,
        establishmentName: regStoreName,
        firstName: existingProfile?.firstName || 'Gérant',
        lastName: existingProfile?.lastName || '',
        isActive: existingProfile?.isActive || false,
        isAdmin: existingProfile?.isAdmin || false,
        isKitaPremium: existingProfile?.isKitaPremium || false,
        hasPerformancePack: existingProfile?.hasPerformancePack || false,
        hasStockPack: existingProfile?.hasStockPack || false,
        badges: existingProfile?.badges || [],
        purchasedModuleIds: existingProfile?.purchasedModuleIds || [],
        pendingModuleIds: pendingIds, // On remplace le panier en attente par le nouveau
        actionPlan: existingProfile?.actionPlan || [],
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        role: existingProfile?.role || 'CLIENT'
      };

      // 3. Sauvegarder
      await saveUserProfile(profileToSave as any);
      
      localStorage.setItem('gotop_pending_request', JSON.stringify({ phone: formattedPhone, amount: pricingData.total }));
      setRegStep('success');
    } catch (err: any) {
      console.error("Supabase Save Error:", err);
      // Affichage du message d'erreur technique pour aider au diagnostic
      alert(`Erreur : ${err.message || "Vérifiez votre connexion internet."}`);
    } finally {
      setLoading(false);
    }
  };

  const finalizeAndRedirect = () => {
    const message = `Bonjour Coach Kita, je suis le gérant du salon "${regStoreName}". Je viens de valider mon plan d'action (${pricingData.total} F). Je procède au transfert Wave sur votre numéro : 01 03 43 84 56.`;
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
      await saveUserProfile({ uid: user.uid, pendingModuleIds: updatedPending });
      
      const message = `Bonjour Coach Kita, je viens de valider une nouvelle demande (${pricingData.total} F). Je procède au transfert Wave.`;
      window.open(`https://wa.me/2250103438456?text=${encodeURIComponent(message)}`, '_blank');
      
      navigate('/dashboard');
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>');
      return <p key={i} className="mb-4 text-slate-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           <div>
              <div className="flex items-center gap-3 text-brand-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                 <ShoppingBag className="w-4 h-4" /> Boutique de l'excellence
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#0f172a] tracking-tight">
                Votre Plan de <span className="text-brand-500 italic">Réussite</span>
              </h1>
           </div>
           
           <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diagnostic terminé</span>
           </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">
          
          <div className="space-y-16">
            {/* Audit Section */}
            <section className="bg-white rounded-[3.5rem] border border-slate-100 p-10 md:p-16 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[15rem] font-serif italic pointer-events-none select-none">Kita</div>
              <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                <div className="h-44 w-44 rounded-[3rem] overflow-hidden border-[8px] border-slate-50 shadow-xl shrink-0 rotate-2">
                  <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-[#0f172a] mb-8 flex items-center gap-4">
                    L'Audit du Mentor
                    <Zap className="w-6 h-6 text-amber-500 fill-current" />
                  </h2>
                  {loadingAdvice ? (
                    <div className="flex flex-col gap-4 py-4">
                      <div className="h-4 w-full bg-slate-100 animate-pulse rounded"></div>
                      <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded"></div>
                      <div className="h-4 w-5/6 bg-slate-100 animate-pulse rounded"></div>
                      <Loader2 className="animate-spin text-brand-600 mt-4" />
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none">
                       {renderFormattedText(aiAdvice || "")}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Recommandations */}
            <section>
               <div className="flex items-center gap-4 mb-10">
                  <Target className="w-6 h-6 text-brand-600" />
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Modules prioritaires de Coach Kita</h3>
               </div>
               
               <div className="grid md:grid-cols-2 gap-6">
                  {TRAINING_CATALOG
                    .filter(m => recommendedModuleIds.includes(m.id) && !cart.some(c => c.id === m.id))
                    .map(mod => (
                      <ModuleCard 
                        key={mod.id} 
                        module={mod} 
                        isSelected={false}
                        onToggle={() => toggleModuleInCart(mod)}
                        isRecommended
                      />
                    ))}
               </div>
            </section>

            {/* Catalogue Complet */}
            <section>
               <div className="flex items-center gap-4 mb-10 pt-10 border-t border-slate-100">
                  <ShoppingBag className="w-6 h-6 text-slate-400" />
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Perfectionner d'autres domaines</h3>
               </div>
               
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {TRAINING_CATALOG
                    .filter(m => !recommendedModuleIds.includes(m.id) && !cart.some(c => c.id === m.id))
                    .map(mod => (
                      <ModuleCard 
                        key={mod.id} 
                        module={mod} 
                        isSelected={false}
                        onToggle={() => toggleModuleInCart(mod)}
                      />
                    ))}
               </div>
            </section>
          </div>

          {/* Sidebar Panier */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-[#0f172a] rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Crown className="w-40 h-40 text-amber-500" />
              </div>
              
              <h3 className="text-2xl font-black mb-10 relative z-10 flex items-center gap-3">
                <TrendingUp className="text-emerald-500 w-6 h-6" />
                VOTRE PLAN
              </h3>

              <div className="space-y-8 mb-12 relative z-10">
                 <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{pricingData.label}</p>
                    <div className="flex items-baseline gap-2">
                       <p className="text-6xl font-black tracking-tighter">{pricingData.total.toLocaleString()}</p>
                       <p className="text-xl font-bold text-brand-500">FCFA</p>
                    </div>
                 </div>

                 {/* Panier détaillé */}
                 {cart.length > 0 && activePack === 'none' && (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                       {cart.map(m => (
                         <div key={m.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group/item hover:bg-white/10 transition-all">
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black text-white truncate max-w-[180px]">{m.title}</span>
                               <span className="text-[9px] font-bold text-slate-500 uppercase">{pricingData.unitPrice} F</span>
                            </div>
                            <button 
                              onClick={() => toggleModuleInCart(m)} 
                              className="text-slate-500 hover:text-rose-400 p-2 transition-colors"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="space-y-4 relative z-10">
                 {!isElite && activePack !== 'elite' && pricingData.total >= 3000 && (
                   <button 
                    onClick={() => setActivePack('elite')}
                    className="w-full py-5 bg-amber-400 text-brand-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-amber-300 transition-all"
                   >
                      <Crown className="w-4 h-4" /> Passer au Pack Elite (10.000 F)
                   </button>
                 )}

                 <button 
                    onClick={handleValidateEngagement}
                    disabled={loading || (pricingData.total === 0 && activePack === 'none')}
                    className="w-full py-7 bg-[#0ea5e9] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-brand-500/20 hover:bg-[#0284c7] transition-all flex items-center justify-center gap-4 disabled:opacity-20 active:scale-95"
                 >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Valider mon engagement"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl p-10 relative overflow-hidden border border-white/20">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none text-8xl italic font-serif leading-none">Kita</div>
              
              <button 
                onClick={() => { setIsRegisterModalOpen(false); if(regStep === 'success') navigate('/login'); }}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 p-2"
              >
                <X className="w-6 h-6" />
              </button>

              {regStep === 'form' ? (
                <>
                  <div className="text-center mb-10">
                    <div className="h-24 w-24 rounded-[2rem] overflow-hidden border-4 border-brand-50 shadow-xl mx-auto mb-6">
                      <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Identifiez-vous</h2>
                    <p className="text-slate-500 text-xs font-medium max-w-[200px] mx-auto">Pour que Coach Kita enregistre votre plan de réussite.</p>
                  </div>

                  <form onSubmit={handleRegisterAndValidate} className="space-y-6 relative z-10">
                    <div className="space-y-4">
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                        <input 
                          type="tel" 
                          placeholder="Numéro WhatsApp (ex: 0708...)" 
                          value={regPhone} 
                          onChange={e => setRegPhone(e.target.value)} 
                          className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-inner" 
                          required 
                        />
                      </div>
                      <div className="relative group">
                        <Store className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="Nom de votre Salon" 
                          value={regStoreName} 
                          onChange={e => setRegStoreName(e.target.value)} 
                          className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-inner" 
                          required 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-950 transition shadow-xl shadow-brand-900/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                      Finaliser mon engagement
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center animate-in zoom-in-95 duration-500">
                   <div className="h-24 w-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                   </div>
                   <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Plan Enregistré !</h2>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 text-center">
                      Coach Kita attend la confirmation de votre transfert <strong className="text-slate-900">Wave</strong> pour le salon <strong className="text-slate-900">"{regStoreName}"</strong>.
                   </p>

                   <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] mb-10 text-left">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Montant :</span>
                            <span className="text-xl font-black text-brand-900">{pricingData.total.toLocaleString()} F</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Numéro :</span>
                            <span className="text-xs font-black text-slate-900">01 03 43 84 56</span>
                         </div>
                      </div>
                   </div>

                   <button 
                    onClick={finalizeAndRedirect}
                    className="w-full bg-[#25D366] text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-green-200 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                   >
                      <CreditCard className="w-5 h-5" />
                      Procéder au paiement
                   </button>
                   
                   <p className="mt-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      L'App va vous rediriger vers la connexion.
                   </p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const ModuleCard = ({ module, isSelected, onToggle, isRecommended }: any) => {
  return (
    <div 
      onClick={onToggle}
      className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
        isSelected 
        ? 'bg-white border-brand-500 shadow-xl' 
        : 'bg-white border-slate-100 hover:border-brand-200 shadow-sm hover:shadow-md'
      }`}
    >
      {isRecommended && (
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-amber-400 text-brand-900 text-[8px] font-black uppercase tracking-widest rounded-bl-2xl flex items-center gap-2">
           <Zap className="w-3 h-3 fill-current" /> Urgent
        </div>
      )}
      
      <div className="flex justify-between items-start mb-6">
         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 group-hover:text-brand-600`}>
           {module.topic}
         </span>
         <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-200 group-hover:bg-brand-500 group-hover:text-white`}>
            <Plus className="w-5 h-5" />
         </div>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight group-hover:text-brand-600 transition-colors">{module.title}</h3>
      <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-6">{module.description}</p>
      
      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
         <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Masterclass</span>
         </div>
         <p className="font-black text-brand-900">{module.price.toLocaleString()} F</p>
      </div>
    </div>
  );
};

export default Results;
