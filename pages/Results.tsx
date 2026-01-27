import { useEffect, useState, useMemo, useRef } from 'react';
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
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
  Gift,
  Gem,
  Play,
  Pause,
  Headphones,
  Volume2,
  // Add missing icons
  Users,
  Package
} from 'lucide-react';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR, COACH_KITA_WAVE_NUMBER, COACH_KITA_PHONE } from '../constants';
import { TrainingModule, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, getProfileByPhone, updateUserProfile, generateUUID, supabase } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";

// Fonctions de décodage audio
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
  const { user } = useAuth();
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

  // États Audio
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

    return () => stopAudio();
  }, [location.search, user?.purchasedModuleIds, userContext]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlaying(false);
    sourceNodeRef.current = source;
    source.start(0);
    setIsPlaying(true);
  };

  const handlePlayAdvice = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }
    if (!aiAdvice) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    
    if (cachedAudioBufferRef.current) {
      playBuffer(cachedAudioBufferRef.current);
      return;
    }

    setIsAudioLoading(true);
    // Nettoyage du texte pour la lecture
    const cleanText = aiAdvice
      .replace(/### \d+\. /g, '')
      .replace(/\*\*/g, '')
      .replace(/---|#|\*|\[|\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Tu es Coach Kita. Lis ce diagnostic stratégique de manière percutante, autoritaire et bienveillante pour ton gérant : ${cleanText.substring(0, 4000)}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
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
        playBuffer(audioBuffer);
      }
    } catch (err) {
      console.error("Audio error:", err);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const pricingData = useMemo(() => {
    if (activePack === 'full') {
      return { total: 15000, label: 'Pack Excellence Totale', rawTotal: 20500, savings: 5500, discountPercent: 27, progress: 100 };
    }
    if (activePack === 'elite') {
      const ownedCount = user?.purchasedModuleIds?.length || 0;
      const loyaltyCredit = ownedCount * 500;
      const finalPrice = Math.max(2000, 10000 - loyaltyCredit);
      return { total: finalPrice, label: 'Pack Académie Élite', rawTotal: 10000, savings: 10000 - finalPrice, discountPercent: Math.round(((10000 - finalPrice) / 10000) * 100), progress: 100, isLoyaltyUpgrade: ownedCount > 0, loyaltyCredit };
    }
    if (activePack === 'performance') return { total: 5000, label: 'Pack RH Performance', rawTotal: 5000, savings: 0, discountPercent: 0, progress: 0 };
    if (activePack === 'stock') return { total: 5000, label: 'Pack Stock Expert', rawTotal: 5000, savings: 0, discountPercent: 0, progress: 0 };
    if (activePack === 'crm') return { total: 500, label: 'Abonnement CRM VIP', rawTotal: 500, savings: 0, discountPercent: 0, progress: 0 };

    const count = cart.length;
    if (count === 0) return { total: 0, label: 'Panier vide', rawTotal: 0, savings: 0, discountPercent: 0, progress: 0 };
    let unitPrice = 500;
    let discountPercent = 0;
    if (count >= 13) { unitPrice = 250; discountPercent = 50; } 
    else if (count >= 9) { unitPrice = 350; discountPercent = 30; } 
    else if (count >= 5) { unitPrice = 400; discountPercent = 20; } 
    const total = count === 16 ? 10000 : count * unitPrice;
    const rawTotal = count * 500;
    return { total, label: `${count} module(s)`, rawTotal, savings: rawTotal - total, discountPercent, progress: (count / 16) * 100 };
  }, [cart, activePack, user?.purchasedModuleIds]);

  const handleRegisterAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regStoreName) return;
    if (!supabase) return setDbError("Service indisponible.");
    setLoading(true);
    setDbError(null);
    try {
      let cleanPhone = regPhone.replace(/\s/g, '').replace(/[^\d+]/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
      if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;
      let pendingIds = activePack !== 'none' ? [`REQUEST_${activePack.toUpperCase()}`] : cart.map(m => m.id);
      const existing = await getProfileByPhone(cleanPhone);
      if (existing) {
        await updateUserProfile(existing.uid, { establishmentName: regStoreName, firstName: userContext?.firstName || existing.firstName, isActive: existing.isActive, pendingModuleIds: [...new Set([...(existing.pendingModuleIds || []), ...pendingIds])] });
      } else {
        const newUser: any = { uid: generateUUID(), phoneNumber: cleanPhone, pinCode: '1234', establishmentName: regStoreName, firstName: userContext?.firstName || 'Gérant', lastName: 'Elite', isActive: false, role: 'CLIENT', isAdmin: false, isPublic: true, isKitaPremium: false, hasPerformancePack: false, hasStockPack: false, pendingModuleIds: pendingIds, badges: [], purchasedModuleIds: [], actionPlan: [], referralCount: 0, createdAt: new Date().toISOString() };
        await saveUserProfile(newUser);
      }
      setRegStep('success');
    } catch (err: any) { setDbError("Échec de la validation."); } finally { setLoading(false); }
  };

  const handleValidateEngagement = async () => {
    if (!user) return setIsRegisterModalOpen(true);
    if (pricingData.total === 0) return;
    setLoading(true);
    try {
      let newPending = activePack !== 'none' ? [`REQUEST_${activePack.toUpperCase()}`] : cart.map(m => m.id);
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

  // Parser simple pour un rendu Markdown propre sans symboles
  const renderCleanAdvice = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###')) {
        const title = line.replace(/### \d+\. /g, '').replace(/### /g, '');
        return <h3 key={i} className="text-2xl font-serif font-bold text-brand-900 mt-10 mb-6 flex items-center gap-3"><div className="h-6 w-1.5 bg-brand-500 rounded-full"></div>{title}</h3>;
      }
      if (line.trim() === '---') return <hr key={i} className="my-10 border-slate-100" />;
      if (line.trim() === '') return <br key={i} />;
      
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-900 font-black">$1</strong>');
      if (line.trim().startsWith('* ')) {
        processedLine = processedLine.replace(/^\* /, '');
        return <div key={i} className="flex items-start gap-4 mb-4 p-5 bg-slate-50 rounded-2xl border border-slate-100"><Star className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" /><p className="m-0 text-slate-700 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: processedLine }} /></div>;
      }

      return <p key={i} className="text-lg text-slate-600 leading-relaxed mb-6 font-medium" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    });
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
            <p className="text-slate-300 text-lg opacity-90 max-w-2xl">J'ai analysé tes besoins, {userContext?.firstName || 'Gérant'}. Voici le catalogue pour ton salon de {userContext?.domain || 'beauté'}.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 space-y-12 relative z-20">
        
        {/* SECTION 1: AUDIT DE PERFORMANCE COACH KITA */}
        <section className="bg-white rounded-[4rem] shadow-2xl p-10 md:p-16 relative overflow-hidden border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-[11px] font-black text-brand-900 uppercase tracking-[0.4em]">Analyse de Coach Kita</h2>
            </div>
            
            {aiAdvice && !loadingAdvice && (
              <button 
                onClick={handlePlayAdvice}
                disabled={isAudioLoading}
                className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${isPlaying ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-1'}`}
              >
                {isAudioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                {isPlaying ? "En lecture..." : "Écouter l'analyse"}
              </button>
            )}
          </div>

          {loadingAdvice ? (
            <div className="flex flex-col items-center py-20 gap-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
                <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full"></div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Consultation du Mentor...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
              {aiAdvice ? renderCleanAdvice(aiAdvice) : <p className="text-slate-400 italic">Analyse non disponible.</p>}
              
              {/* Barre WhatsApp Simulation pendant la lecture */}
              {isPlaying && (
                <div className="mt-12 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-6 animate-in slide-in-from-bottom-4">
                   <Volume2 className="text-emerald-500 w-6 h-6 animate-bounce" />
                   <div className="flex-grow h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full origin-left animate-[loading_60s_linear]"></div>
                   </div>
                   <span className="text-[10px] font-black text-emerald-600 uppercase">Kita Voice</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* SECTION 2: LES PACKS EXPERTS */}
        <section className="space-y-8">
           <div className="text-center">
              <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.5em] mb-3">Recommandations Prioritaires</h3>
              <p className="text-2xl font-serif font-bold text-slate-900">Solutions Clés en Main</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <button onClick={() => setActivePack('full')} className={`p-10 rounded-[3.5rem] border-2 transition-all text-center flex flex-col items-center justify-between group h-full relative overflow-hidden col-span-1 sm:col-span-2 xl:col-span-1 ${activePack === 'full' ? 'bg-brand-900 border-brand-900 shadow-2xl scale-105' : 'bg-white border-amber-500 shadow-xl'}`}>
                  <div className="absolute top-0 right-0 p-4"><Sparkles className="w-5 h-5 text-amber-400 animate-pulse" /></div>
                  <div className={`h-24 w-24 rounded-[2.5rem] flex items-center justify-center shadow-xl mb-8 transition-transform group-hover:scale-110 ${activePack === 'full' ? 'bg-amber-400 text-brand-900' : 'bg-brand-900 text-amber-400'}`}><Gem className="w-12 h-12" /></div>
                  <div className="space-y-4 relative z-10">
                    <h4 className={`text-lg font-black uppercase leading-tight ${activePack === 'full' ? 'text-white' : 'text-brand-900'}`}>Excellence Totale</h4>
                    <div className={`text-[9px] font-bold space-y-1 ${activePack === 'full' ? 'text-brand-300' : 'text-slate-500'}`}>
                      <p>• Les 16 Masterclass</p>
                      <p>• Pilotage RH & Stock</p>
                      <p>• CRM VIP & Cloud à Vie</p>
                    </div>
                    <div className={`pt-6 border-t ${activePack === 'full' ? 'border-white/10' : 'border-slate-50'}`}>
                      <p className={`text-4xl font-black ${activePack === 'full' ? 'text-amber-400' : 'text-brand-900'}`}>15 000 F</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase mt-1">Économie 5 500 F</p>
                    </div>
                  </div>
              </button>
              <button onClick={() => setActivePack('crm')} className={`p-8 rounded-[3rem] border-2 transition-all text-center flex flex-col items-center justify-between group h-full ${activePack === 'crm' ? 'bg-white border-amber-400 shadow-2xl ring-4 ring-amber-50' : 'bg-white border-slate-100 hover:border-amber-200'}`}>
                  <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center shadow-lg mb-6 transition-transform group-hover:scale-110 ${activePack === 'crm' ? 'bg-amber-400 text-white' : 'bg-amber-50 text-amber-500'}`}><Star className="w-10 h-10" /></div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-900">Pack CRM VIP</h4>
                    <div className="text-[10px] font-bold text-slate-500 space-y-1"><p>• Fiches Techniques</p><p>• Relances WhatsApp</p></div>
                    <div className="pt-4 border-t border-slate-50"><p className="text-2xl font-black text-slate-900">500 F</p></div>
                  </div>
              </button>
              <button onClick={() => setActivePack('elite')} className={`p-10 rounded-[3.5rem] border-2 transition-all text-center flex flex-col items-center justify-between group h-full relative overflow-hidden ${activePack === 'elite' ? 'bg-brand-900 border-brand-900 shadow-2xl scale-105' : 'bg-white border-brand-100 shadow-xl'}`}>
                  <div className={`h-24 w-24 rounded-2.5rem flex items-center justify-center shadow-xl mb-8 transition-transform group-hover:scale-110 ${activePack === 'elite' ? 'bg-brand-500 text-white' : 'bg-brand-900 text-brand-500'}`}><Crown className="w-12 h-12" /></div>
                  <div className="space-y-4 relative z-10">
                    <h4 className={`text-lg font-black uppercase leading-tight ${activePack === 'elite' ? 'text-white' : 'text-brand-900'}`}>Académie Élite</h4>
                    <div className={`text-[10px] font-bold space-y-1 ${activePack === 'elite' ? 'text-brand-300' : 'text-slate-500'}`}><p>• 16 Modules Complets</p><p>• Sauvegarde Cloud</p></div>
                    <div className={`pt-6 border-t ${activePack === 'elite' ? 'border-white/10' : 'border-slate-50'}`}>
                      <p className={`text-4xl font-black ${activePack === 'elite' ? pricingData.total.toLocaleString() : '10 000'} F</p>
                    </div>
                  </div>
              </button>
              <button onClick={() => setActivePack('performance')} className={`p-8 rounded-[3rem] border-2 transition-all text-center flex flex-col items-center justify-between group h-full ${activePack === 'performance' ? 'bg-white border-emerald-400 shadow-2xl ring-4 ring-emerald-50' : 'bg-white border-slate-100 hover:border-emerald-200'}`}>
                  <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center shadow-lg mb-6 transition-transform group-hover:scale-110 ${activePack === 'performance' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}><Users className="w-10 h-10" /></div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-900">Performance RH</h4>
                    <div className="text-[10px] font-bold text-slate-500 space-y-1"><p>• Calcul Commissions</p><p>• Productivité Staff</p></div>
                    <div className="pt-4 border-t border-slate-50"><p className="text-2xl font-black text-slate-900">5000 F</p></div>
                  </div>
              </button>
              <button onClick={() => setActivePack('stock')} className={`p-8 rounded-[3rem] border-2 transition-all text-center flex flex-col items-center justify-between group h-full ${activePack === 'stock' ? 'bg-white border-sky-400 shadow-2xl ring-4 ring-sky-50' : 'bg-white border-slate-100 hover:border-sky-200'}`}>
                  <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center shadow-lg mb-6 transition-transform group-hover:scale-110 ${activePack === 'stock' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600'}`}><Package className="w-10 h-10" /></div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-900">Stock Expert</h4>
                    <div className="text-[10px] font-bold text-slate-500 space-y-1"><p>• Alertes Rupture</p><p>• Inventaire Valorisé</p></div>
                    <div className="pt-4 border-t border-slate-50"><p className="text-2xl font-black text-slate-900">5000 F</p></div>
                  </div>
              </button>
           </div>
        </section>

        {/* SECTION 3: CATALOGUE & PANIER */}
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-4 px-4"><h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Catalogue de Formation</h3><div className="h-px bg-slate-200 flex-grow"></div></div>
            <div className="grid gap-4">
              {TRAINING_CATALOG.filter(module => !cart.some(m => m.id === module.id)).map(module => {
                  const isOwned = (user?.purchasedModuleIds || []).includes(module.id);
                  const isRecommended = recommendedModuleIds.includes(module.id);
                  return (
                    <button key={module.id} onClick={() => !isOwned && toggleModuleInCart(module)} disabled={isOwned} className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all ${isOwned ? 'bg-slate-50 border-slate-100 opacity-60' : isRecommended ? 'bg-white border-brand-100 shadow-sm ring-1 ring-brand-50' : 'bg-white border-slate-100 hover:border-brand-300'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[8px] font-black text-brand-600 uppercase tracking-widest">{module.topic}</span>
                            {isRecommended && !isOwned && <span className="text-[7px] bg-amber-400 text-brand-900 px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1"><Sparkles className="w-2 h-2" /> Priorité</span>}
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1">{module.title}</h4>
                        </div>
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${isOwned ? 'text-emerald-500' : 'bg-slate-50 text-slate-300 group-hover:bg-brand-500 group-hover:text-white'}`}>{isOwned ? <CheckCircle2 /> : <Plus />}</div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 overflow-hidden relative">
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-4"><ShoppingBag className="text-brand-500" /> Mon Engagement</h3>
                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {activePack !== 'none' ? (
                    <div className="p-6 bg-brand-900 text-white rounded-[2rem] shadow-xl relative overflow-hidden group">
                       {activePack === 'full' ? <Gem className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10 rotate-12" /> : <Crown className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10 rotate-12" />}
                       <div className="flex justify-between items-center relative z-10">
                          <p className="text-sm font-black uppercase tracking-widest">{pricingData.label}</p>
                          <p className="text-xl font-black text-amber-400">{pricingData.total.toLocaleString()} F</p>
                       </div>
                    </div>
                  ) : cart.length > 0 ? (
                    cart.map(mod => (
                      <div key={mod.id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 group">
                        <span className="text-xs font-bold text-slate-700">{mod.title}</span>
                        <div className="flex items-center gap-4"><span className="text-xs font-black text-slate-400">500 F</span><button onClick={() => toggleModuleInCart(mod)} className="text-rose-400 hover:text-rose-600"><MinusCircle className="w-4 h-4" /></button></div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 opacity-40 grayscale"><p className="text-slate-400 text-xs italic px-10">Choisissez des modules ou un Pack expert ci-dessus.</p></div>
                  )}
                </div>

                <div className="space-y-3 mb-10 pt-8 border-t border-slate-100">
                   <div className="flex justify-between items-center text-slate-400"><span className="text-[10px] font-bold uppercase tracking-widest">Sous-total</span><span className="text-sm font-black">{pricingData.rawTotal.toLocaleString()} F</span></div>
                   {pricingData.savings > 0 && (
                     <div className="flex justify-between items-center text-emerald-500">
                       <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Tag className="w-3 h-3" /> {activePack === 'elite' && (pricingData as any).isLoyaltyUpgrade ? "Déduction modules" : `Remise (-${pricingData.discountPercent}%)`}</span>
                       <span className="text-sm font-black">-{pricingData.savings.toLocaleString()} F</span>
                     </div>
                   )}
                   <div className="flex justify-between items-end"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total à régler</p><div className="flex items-baseline gap-1"><p className="text-5xl font-black text-brand-900 tracking-tighter">{pricingData.total.toLocaleString()}</p><span className="text-sm font-bold opacity-30 uppercase">F</span></div></div>
                </div>

                <button onClick={handleValidateEngagement} disabled={loading || (cart.length === 0 && activePack === 'none')} className="w-full bg-brand-900 text-white py-7 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-95 disabled:opacity-20">
                  {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider mon plan d'action
                </button>
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
                {dbError && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-[10px] font-bold mb-6 flex items-center gap-2 animate-in shake"><AlertCircle className="w-4 h-4" />{dbError}</div>}
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
                <div className="h-28 w-28 bg-[#f0fdf4] text-[#10b981] rounded-3xl flex items-center justify-center mb-10 shadow-sm"><CheckCircle2 className="w-14 h-14" /></div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-12 tracking-tight">Félicitations !</h2>
                <div className="w-full bg-[#f8fafc] p-10 rounded-[2.5rem] border border-[#f1f5f9] flex flex-col items-center gap-4 mb-14">
                   <div className="flex items-center gap-4"><Lock className="w-5 h-5 text-brand-600" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Code PIN Temporaire</p></div>
                   <p className="text-4xl font-black text-brand-900 m-0 tracking-[0.2em]">1 2 3 4</p>
                </div>
                <p className="text-slate-500 italic text-sm mb-12 px-6 leading-relaxed">"Réglez <strong>{pricingData.total.toLocaleString()} F</strong> via Wave au <strong>{COACH_KITA_WAVE_NUMBER}</strong> pour activer vos accès."</p>
                <button onClick={() => { window.open(`https://wa.me/${COACH_KITA_PHONE.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(`Bonjour Coach Kita, j'ai validé mon plan (${pricingData.total} F) pour ${regStoreName || user?.establishmentName || 'mon salon'}. Voici ma preuve de paiement.`)}`, '_blank'); navigate('/login'); }} className="w-full bg-[#10b981] text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-4 hover:bg-[#059669] transition-all"><MessageCircle className="w-6 h-6" /> Confirmer sur WhatsApp</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
