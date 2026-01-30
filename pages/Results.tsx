
import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  Star,
  Sparkles,
  Gem,
  Play,
  Pause,
  Volume2,
  Users,
  Package,
  TrendingDown,
  Gift
} from 'lucide-react';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR, COACH_KITA_WAVE_NUMBER, COACH_KITA_PHONE } from '../constants';
import { TrainingModule } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, getProfileByPhone, updateUserProfile, generateUUID, supabase } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const Results: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [activePack, setActivePack] = useState<'none' | 'full' | 'elite' | 'performance' | 'stock' | 'crm'>('none');
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [recommendedModuleIds, setRecommendedModuleIds] = useState<string[]>([]);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regStep, setRegStep] = useState<'form' | 'success'>('form');
  const [regPhone, setRegPhone] = useState('');
  const [regStoreName, setRegStoreName] = useState('');

  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const cachedAudioBufferRef = useRef<AudioBuffer | null>(null);

  const userContext = useMemo(() => {
    const raw = localStorage.getItem('temp_user_context');
    return raw ? JSON.parse(raw) : null;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rechargeId = params.get('recharge');
    const packParam = params.get('pack');
    
    if (packParam === 'full') setActivePack('full');
    else if (packParam === 'performance') setActivePack('performance'); 
    else if (packParam === 'elite') setActivePack('elite');
    else if (packParam === 'stock') setActivePack('stock');
    else if (packParam === 'crm') setActivePack('crm');

    let initialCart: TrainingModule[] = [];
    const rawResults = localStorage.getItem('temp_quiz_results');
    const results = rawResults ? JSON.parse(rawResults) : null;
    
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
          
          const advice = await generateStrategicAdvice(
            negativeTexts, 
            negativeTexts.length === 0,
            userContext
          );
          setAiAdvice(advice ?? null);
        } catch (err) {
          setAiAdvice("L'analyse du Mentor est temporairement indisponible.");
        } finally {
          setLoadingAdvice(false);
        }
      };
      getAdvice();
    } else {
      setLoadingAdvice(false);
      setAiAdvice("Préparez votre parcours vers l'Excellence.");
    }

    return () => {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) {}
      }
    };
  }, [location.search, user?.purchasedModuleIds, userContext]);

  const handlePlayAdvice = async () => {
    if (isPlaying) {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) {}
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
      return;
    }
    if (!aiAdvice) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    
    if (cachedAudioBufferRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = cachedAudioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      sourceNodeRef.current = source;
      source.start(0);
      setIsPlaying(true);
      return;
    }

    setIsAudioLoading(true);
    const cleanText = aiAdvice.replace(/### \d+\. /g, '').replace(/\*\*/g, '').replace(/---|#|\*|\[|\]/g, ' ').replace(/\s+/g, ' ').trim();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Tu es Coach Kita. Lis ce diagnostic stratégique : ${cleanText.substring(0, 4000)}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: prompt }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      const base64Audio = audioPart?.inlineData?.data;
      if (base64Audio && audioContextRef.current) {
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current, 24000, 1);
        cachedAudioBufferRef.current = audioBuffer;
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        sourceNodeRef.current = source;
        source.start(0);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio error:", err);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const pricingData = useMemo(() => {
    if (activePack === 'full') return { total: 15000, label: 'Pack Excellence Totale', rawTotal: 20500, savings: 5500, nextTier: null };
    if (activePack === 'elite') return { total: 10000, label: 'Pack Académie Élite', rawTotal: 10000, savings: 0, nextTier: null };
    if (activePack === 'performance') return { total: 5000, label: 'Pack RH Performance', rawTotal: 5000, savings: 0, nextTier: null };
    if (activePack === 'stock') return { total: 5000, label: 'Pack Stock Expert', rawTotal: 5000, savings: 0, nextTier: null };
    if (activePack === 'crm') return { total: 500, label: 'Abonnement CRM VIP', rawTotal: 500, savings: 0, nextTier: null };

    const count = cart.length;
    if (count === 0) return { total: 0, label: 'Panier vide', rawTotal: 0, savings: 0, nextTier: 5 };
    
    let unitPrice = 500;
    let nextTier = null;
    let discountLabel = "Prix Standard";

    if (count >= 13) {
      unitPrice = 250;
      discountLabel = "-50% appliqués";
    } else if (count >= 9) {
      unitPrice = 350;
      nextTier = 13;
      discountLabel = "-30% appliqués";
    } else if (count >= 5) {
      unitPrice = 400;
      nextTier = 9;
      discountLabel = "-20% appliqués";
    } else {
      nextTier = 5;
    }

    const total = count === 16 ? 10000 : count * unitPrice;
    const rawTotal = count * 500;
    
    return { 
      total, 
      label: `${count} module(s)`, 
      rawTotal, 
      savings: rawTotal - total,
      nextTier,
      discountLabel,
      unitPrice
    };
  }, [cart, activePack]);

  const handleRegisterAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regStoreName) return;
    setLoading(true);
    try {
      let cleanPhone = regPhone.replace(/\s/g, '').replace(/[^\d+]/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
      if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;
      let pendingIds = activePack !== 'none' ? ["REQUEST_" + activePack.toUpperCase()] : cart.map(m => m.id);
      const existing = await getProfileByPhone(cleanPhone);
      if (existing) {
        await updateUserProfile(existing.uid, { establishmentName: regStoreName, pendingModuleIds: [...new Set([...(existing.pendingModuleIds || []), ...pendingIds])] });
      } else {
        const newUser: any = { uid: generateUUID(), phoneNumber: cleanPhone, pinCode: '1234', establishmentName: regStoreName, firstName: userContext?.firstName || 'Gérant', role: 'CLIENT', isActive: false, isAdmin: false, isKitaPremium: false, pendingModuleIds: pendingIds, createdAt: new Date().toISOString(), purchasedModuleIds: [], actionPlan: [], badges: [] };
        await saveUserProfile(newUser);
      }
      setRegStep('success');
    } catch (err: any) { setDbError("Échec de la validation."); } finally { setLoading(false); }
  };

  const handleValidateEngagement = async () => {
    if (!user) { setIsRegisterModalOpen(true); return; }
    if (pricingData.total === 0) return;
    setLoading(true);
    try {
      let newPending = activePack !== 'none' ? ["REQUEST_" + activePack.toUpperCase()] : cart.map(m => m.id);
      await updateUserProfile(user.uid, { pendingModuleIds: [...new Set([...(user.pendingModuleIds || []), ...newPending])] });
      setRegStep('success');
      setIsRegisterModalOpen(true);
    } catch (err: any) { setDbError("Erreur lors de la mise à jour."); } finally { setLoading(false); }
  };

  const toggleModuleInCart = (mod: TrainingModule) => {
    setActivePack('none');
    setCart(prev => {
      const exists = prev.find(m => m.id === mod.id);
      if (exists) return prev.filter(m => m.id !== mod.id);
      return [...prev, mod];
    });
  };

  const renderCleanAdvice = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###')) return <h3 key={i} className="text-2xl font-serif font-bold text-brand-900 mt-10 mb-6">{line.replace(/### \d+\. /g, '').replace(/### /g, '')}</h3>;
      if (line.trim() === '---') return <hr key={i} className="my-10 border-slate-100" />;
      if (line.trim() === '') return <br key={i} />;
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-900 font-black">$1</strong>');
      if (line.trim().startsWith('* ')) {
        return (
          <div key={i} className="flex items-start gap-4 mb-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <Star className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <p className="m-0 text-slate-700 font-medium" dangerouslySetInnerHTML={{ __html: processed.replace(/^\* /, '') }} />
          </div>
        );
      }
      return <p key={i} className="text-lg text-slate-600 leading-relaxed mb-6 font-medium" dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-brand-900 pt-24 pb-48 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="h-48 w-48 rounded-[3.5rem] bg-white p-1.5 shadow-2xl rotate-3 shrink-0">
            <img src={COACH_KITA_AVATAR} className="w-full h-full object-cover rounded-[2.8rem]" alt="Mentor" />
          </div>
          <div className="text-center md:text-left text-white">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Plan de <span className="text-brand-500 italic">Succès</span></h1>
            <p className="text-slate-300 text-lg opacity-90 max-w-2xl">J'ai analysé tes besoins, {userContext?.firstName || 'Gérant'}. Voici le catalogue pour ton salon.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 space-y-12 relative z-20">
        <section className="bg-white rounded-[4rem] shadow-2xl p-10 md:p-16 border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <Zap className="w-6 h-6 text-brand-600" />
              <h2 className="text-[11px] font-black text-brand-900 uppercase tracking-[0.4em]">Analyse de Coach Kita</h2>
            </div>
            {aiAdvice && !loadingAdvice && (
              <button onClick={handlePlayAdvice} disabled={isAudioLoading} className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-xl ${isPlaying ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}>
                {isAudioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "En lecture..." : "Écouter l'analyse"}
              </button>
            )}
          </div>
          {loadingAdvice ? (
            <div className="flex flex-col items-center py-20 gap-6">
              <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Consultation du Mentor...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {aiAdvice ? renderCleanAdvice(aiAdvice) : <p className="text-slate-400 italic">Analyse non disponible.</p>}
            </div>
          )}
        </section>

        <section className="space-y-8">
           <div className="text-center">
              <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.5em] mb-3">Recommandations Prioritaires</h3>
              <p className="text-2xl font-serif font-bold text-slate-900">Solutions Clés en Main</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <button onClick={() => setActivePack('full')} className={`p-10 rounded-[3.5rem] border-2 transition-all flex flex-col items-center justify-between h-full ${activePack === 'full' ? 'bg-brand-900 border-brand-900 text-white shadow-2xl scale-105' : 'bg-white border-amber-500 shadow-xl'}`}>
                <Gem className="w-12 h-12 mb-8 text-amber-400" />
                <h4 className="text-lg font-black uppercase mb-4">Excellence Totale</h4>
                <p className="text-[10px] font-bold opacity-70 mb-6">16 Masterclass + RH + Stock + CRM VIP</p>
                <p className="text-4xl font-black text-amber-400">15 000 F</p>
              </button>

              <button onClick={() => setActivePack('crm')} className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center justify-between h-full ${activePack === 'crm' ? 'border-amber-400 bg-amber-50 shadow-2xl' : 'bg-white border-slate-100'}`}>
                <Star className="w-10 h-10 mb-6 text-amber-500" />
                <h4 className="text-[11px] font-black uppercase">Pack CRM VIP</h4>
                <p className="text-2xl font-black">500 F</p>
              </button>

              <button onClick={() => setActivePack('elite')} className={`p-10 rounded-[3.5rem] border-2 transition-all flex flex-col items-center justify-between h-full ${activePack === 'elite' ? 'bg-brand-900 border-brand-900 text-white shadow-2xl scale-105' : 'bg-white border-brand-100 shadow-xl'}`}>
                <Crown className="w-12 h-12 mb-8 text-brand-500" />
                <h4 className="text-lg font-black uppercase mb-4">Académie Élite</h4>
                <p className="text-[10px] font-bold opacity-70 mb-6">Les 16 Masterclass + Cloud</p>
                <p className="text-4xl font-black text-amber-400">10 000 F</p>
              </button>

              <button onClick={() => setActivePack('performance')} className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center justify-between h-full ${activePack === 'performance' ? 'border-emerald-400 bg-emerald-50 shadow-2xl' : 'bg-white border-slate-100'}`}>
                <Users className="w-10 h-10 mb-6 text-emerald-500" />
                <h4 className="text-[11px] font-black uppercase">Performance RH</h4>
                <p className="text-2xl font-black">5000 F</p>
              </button>

              <button onClick={() => setActivePack('stock')} className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center justify-between h-full ${activePack === 'stock' ? 'border-sky-400 bg-sky-50 shadow-2xl' : 'bg-white border-slate-100'}`}>
                <Package className="w-10 h-10 mb-6 text-sky-500" />
                <h4 className="text-[11px] font-black uppercase">Stock Expert</h4>
                <p className="text-2xl font-black">5000 F</p>
              </button>
           </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Catalogue de Formation</h3>
            <div className="grid gap-4">
              {TRAINING_CATALOG.map(module => {
                const isOwned = (user?.purchasedModuleIds || []).includes(module.id);
                const inCart = cart.some(m => m.id === module.id);
                const isRecommended = recommendedModuleIds.includes(module.id);
                return (
                  <button key={module.id} onClick={() => !isOwned && toggleModuleInCart(module)} disabled={isOwned} className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all ${isOwned ? 'bg-slate-50 border-slate-100 opacity-60' : inCart ? 'border-brand-500 bg-brand-50' : isRecommended ? 'border-brand-100 bg-white shadow-sm' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-black text-brand-600 uppercase tracking-widest">{module.topic}</span>
                        <h4 className="text-lg font-bold text-slate-900">{module.title}</h4>
                      </div>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isOwned ? 'text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>{isOwned ? <CheckCircle2 /> : inCart ? <MinusCircle className="text-brand-500" /> : <Plus />}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-slate-100">
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-4"><ShoppingBag className="text-brand-500" /> Mon Engagement</h3>
                
                {/* JAUGE DE FIDÉLITÉ / RÉDUCTION */}
                {activePack === 'none' && cart.length > 0 && (
                  <div className="mb-10 animate-in slide-in-from-top-2 duration-500">
                     <div className="flex justify-between items-end mb-3">
                        <div className="flex items-center gap-2">
                           <TrendingDown className="w-4 h-4 text-emerald-500" />
                           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Réduction Fidélité</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${cart.length >= 5 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                           {pricingData.discountLabel}
                        </span>
                     </div>
                     
                     {/* Barre de jauge */}
                     <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-50">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                          style={{ width: `${Math.min(100, (cart.length / 16) * 100)}%` }}
                        ></div>
                        {/* Marqueurs de paliers */}
                        <div className="absolute left-[31.25%] top-0 h-full w-0.5 bg-white/50" title="Palier -20%"></div> {/* 5/16 */}
                        <div className="absolute left-[56.25%] top-0 h-full w-0.5 bg-white/50" title="Palier -30%"></div> {/* 9/16 */}
                        <div className="absolute left-[81.25%] top-0 h-full w-0.5 bg-white/50" title="Palier -50%"></div> {/* 13/16 */}
                     </div>

                     <div className="flex justify-between mt-3 px-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">1 module</span>
                        <span className={`text-[8px] font-black uppercase ${cart.length >= 5 ? 'text-emerald-600' : 'text-slate-300'}`}>-20% (5)</span>
                        <span className={`text-[8px] font-black uppercase ${cart.length >= 9 ? 'text-emerald-600' : 'text-slate-300'}`}>-30% (9)</span>
                        <span className={`text-[8px] font-black uppercase ${cart.length >= 13 ? 'text-emerald-600' : 'text-slate-300'}`}>-50% (13)</span>
                     </div>

                     {pricingData.nextTier && (
                       <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-pulse">
                          <Gift className="w-4 h-4 text-emerald-600" />
                          <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest m-0 leading-tight">
                            Encore <span className="text-sm">{pricingData.nextTier - cart.length}</span> module(s) pour débloquer le prochain palier !
                          </p>
                       </div>
                     )}
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  {activePack !== 'none' ? (
                    <div className="p-6 bg-brand-900 text-white rounded-[2rem] flex justify-between items-center shadow-xl"><p className="text-sm font-black uppercase">{pricingData.label}</p><p className="text-xl font-black text-amber-400">{pricingData.total.toLocaleString()} F</p></div>
                  ) : cart.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                      {cart.map(mod => (
                        <div key={mod.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group">
                           <div className="flex-grow">
                             <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{mod.topic}</span>
                             <p className="text-xs font-bold text-slate-700 leading-tight">{mod.title}</p>
                           </div>
                           <div className="text-right flex flex-col items-end">
                              {pricingData.total < pricingData.rawTotal && (
                                <span className="text-[9px] font-bold text-slate-300 line-through">500 F</span>
                              )}
                              <span className="text-xs font-black text-brand-900">{pricingData.unitPrice} F</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 italic py-10">Panier vide</p>
                  )}
                </div>

                <div className="pt-8 border-t border-slate-100 space-y-4 mb-10">
                   {pricingData.savings > 0 && (
                     <div className="flex justify-between items-center bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest m-0">Économie réalisée</p>
                        <p className="text-sm font-black text-emerald-600 m-0">-{pricingData.savings.toLocaleString()} F</p>
                     </div>
                   )}
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total à régler</p>
                        {pricingData.savings > 0 && (
                          <p className="text-xs font-bold text-slate-300 line-through mb-1">{pricingData.rawTotal.toLocaleString()} F</p>
                        )}
                      </div>
                      <p className="text-5xl font-black text-brand-900 tracking-tighter">{pricingData.total.toLocaleString()} <span className="text-sm font-bold opacity-30">F</span></p>
                   </div>
                </div>

                <button onClick={handleValidateEngagement} disabled={loading || (cart.length === 0 && activePack === 'none')} className="w-full bg-brand-900 text-white py-7 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-20 hover:bg-black transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Valider mon plan
                </button>
              </div>

              {/* Rappel des conditions */}
              <div className="px-8 py-6 bg-slate-100/50 rounded-[2.5rem] border border-slate-200/50">
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                   <AlertCircle className="w-3 h-3" /> Note sur les tarifs
                 </p>
                 <ul className="space-y-2 m-0 p-0 list-none">
                    <li className="text-[9px] text-slate-500 font-medium leading-tight">• 1 à 4 modules : 500 F l'unité.</li>
                    <li className="text-[9px] text-slate-500 font-medium leading-tight">• 5 à 8 modules : 400 F l'unité (-20%).</li>
                    <li className="text-[9px] text-slate-500 font-medium leading-tight">• 9 à 12 modules : 350 F l'unité (-30%).</li>
                    <li className="text-[9px] text-slate-500 font-medium leading-tight">• 13+ modules : 250 F l'unité (-50%).</li>
                    <li className="text-[9px] font-black text-brand-900 leading-tight">• Pack Elite (16 modules) : 10 000 F.</li>
                 </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] p-10 md:p-14 relative overflow-hidden">
            {regStep === 'form' ? (
              <>
                <button onClick={() => setIsRegisterModalOpen(false)} className="absolute top-8 right-8 text-slate-300"><X /></button>
                <h2 className="text-3xl font-serif font-bold text-center mb-10">Ouvrir mon Accès</h2>
                {dbError && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-[10px] font-bold mb-6 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{dbError}</div>}
                <form onSubmit={handleRegisterAndValidate} className="space-y-6">
                  <input type="tel" placeholder="Numéro WhatsApp" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" required />
                  <input type="text" placeholder="Nom de l'Etablissement" value={regStoreName} onChange={e => setRegStoreName(e.target.value)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" required />
                  <button type="submit" disabled={loading} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4">
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider mon plan
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-10" />
                <h2 className="text-4xl font-serif font-bold mb-12">Félicitations !</h2>
                <p className="text-slate-500 italic text-sm mb-12 leading-relaxed">Réglez <strong>{pricingData.total.toLocaleString()} F</strong> via Wave au <strong>{COACH_KITA_WAVE_NUMBER}</strong> pour activer vos accès.</p>
                <button onClick={() => { window.open(`https://wa.me/${COACH_KITA_PHONE.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(`Bonjour Coach Kita, j'ai validé mon plan.`)}`, '_blank'); navigate('/login'); }} className="w-full bg-[#10b981] text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-4"><MessageCircle /> Confirmer sur WhatsApp</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
