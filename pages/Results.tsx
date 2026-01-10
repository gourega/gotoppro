
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
  Gift
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
  const [activePack, setActivePack] = useState<'none' | 'elite' | 'performance' | 'stock'>('none');
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [recommendedModuleIds, setRecommendedModuleIds] = useState<string[]>([]);

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

      // Pré-remplissage initial avec les recommandations
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

  const handleValidateEngagement = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour valider votre plan d'action.");
      navigate('/login');
      return;
    }

    if (pricingData.total === 0 && activePack === 'none') {
      alert("Veuillez sélectionner au moins un module.");
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error("Base de données indisponible");
      
      let newPendingIds: string[] = [];
      if (activePack === 'elite') {
        newPendingIds = TRAINING_CATALOG.map(m => m.id);
        newPendingIds.push('REQUEST_ELITE');
      } else if (activePack === 'stock') {
        newPendingIds.push('REQUEST_STOCK');
      } else {
        newPendingIds = cart.map(m => m.id);
      }
      
      const updatedPending = [...new Set([...(user.pendingModuleIds || []), ...newPendingIds])];
      await supabase.from('profiles').update({ pendingModuleIds: updatedPending }).eq('uid', user.uid);
      
      const message = `Bonjour Coach Kita, je viens de valider mon plan d'action Go'Top Pro (${pricingData.total} F). Je procède au transfert Wave.`;
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

            {/* Recommandations (Filtering out modules already in cart) */}
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
                  {TRAINING_CATALOG.filter(m => recommendedModuleIds.includes(m.id) && !cart.some(c => c.id === m.id)).length === 0 && (
                    <div className="col-span-full p-10 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                       <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                       <p className="text-emerald-800 font-bold text-sm">Toutes les recommandations prioritaires sont dans votre plan d'action.</p>
                    </div>
                  )}
               </div>
            </section>

            {/* Catalogue Complet (Filtering out modules already in cart) */}
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

          {/* Sidebar Panier / Checkout */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-[#0f172a] rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Crown className="w-40 h-40 text-amber-500" />
              </div>
              
              <h3 className="text-2xl font-black mb-10 relative z-10 flex items-center gap-3">
                <TrendingUp className="text-emerald-500 w-6 h-6" />
                VOTRE PLAN
              </h3>

              {/* Jauge d'incitation */}
              {cart.length > 0 && cart.length < 16 && activePack === 'none' && (
                <div className="mb-10 p-5 bg-white/5 rounded-2xl border border-white/10 relative z-10">
                   <div className="flex justify-between items-center mb-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jauge de Réduction</p>
                      <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                         <Percent className="w-3 h-3" /> -{pricingData.discount}% débloqués
                      </span>
                   </div>
                   <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-4">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-brand-500 transition-all duration-1000" 
                        style={{ width: `${(cart.length / 16) * 100}%` }}
                      ></div>
                   </div>
                   {pricingData.nextThreshold! > cart.length && (
                      <div className="flex items-center gap-3 text-brand-400 text-[10px] font-bold italic">
                         <Gift className="w-3.5 h-3.5 shrink-0" />
                         <span>Plus que {pricingData.nextThreshold! - cart.length} module(s) pour passer à {pricingData.nextDiscount}% de remise !</span>
                      </div>
                   )}
                </div>
              )}

              <div className="space-y-8 mb-12 relative z-10">
                 <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{pricingData.label}</p>
                    <div className="flex items-baseline gap-2">
                       <p className="text-6xl font-black tracking-tighter">{pricingData.total.toLocaleString()}</p>
                       <p className="text-xl font-bold text-brand-500">FCFA</p>
                    </div>
                    {pricingData.discount > 0 && (
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                         Tarif réduit appliqué : {pricingData.unitPrice} F / module
                      </p>
                    )}
                 </div>

                 {/* Liste détaillée du panier */}
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
                              title="Retirer du plan"
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

            {/* Pack Stock Option */}
            {activePack !== 'stock' && (
              <button 
                onClick={() => setActivePack('stock')}
                className="w-full mt-6 bg-white border border-slate-200 p-8 rounded-[2.5rem] text-left hover:border-sky-500 transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                   <h4 className="text-sm font-black text-slate-900 uppercase">Pack Stock Expert</h4>
                   <Zap className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Contrôlez votre magasin et évitez les pertes (5 000 F).</p>
              </button>
            )}
          </div>
        </div>
      </div>
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
