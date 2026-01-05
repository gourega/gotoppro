
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG, COACH_KITA_AVATAR, BADGES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { ModuleStatus, UserActionCommitment } from '../types';
import { saveUserProfile } from '../services/supabase';
import { GoogleGenAI, Modality } from "@google/genai";
import ReactCanvasConfetti from 'react-canvas-confetti';
import { 
  ChevronLeft, 
  Sparkles, 
  Book, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Loader2, 
  Play, 
  Pause, 
  Headphones,
  Crown,
  Share2,
  Calendar,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  Coins
} from 'lucide-react';

// Fonctions de décodage conformes aux directives Google GenAI
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
  // PCM 16-bit : 2 octets par échantillon. 
  // On s'assure que le buffer est aligné en créant une copie si nécessaire.
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const dataInt16 = new Int16Array(arrayBuffer);
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

const ModuleView: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>('lesson');
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [shouldFire, setShouldFire] = useState(false);
  const [commitment, setCommitment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishingQuiz, setIsFinishingQuiz] = useState(false);

  // États Audio
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const module = useMemo(() => TRAINING_CATALOG.find(m => m.id === moduleId), [moduleId]);

  useEffect(() => {
    if (!user?.purchasedModuleIds.includes(moduleId || '')) {
      navigate('/dashboard');
    }
    window.scrollTo(0,0);
    return () => {
      stopAudio();
    };
  }, [moduleId, user, navigate]);

  if (!module || !user) return null;

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsAudioLoading(true);
    // On nettoie le texte pour le TTS
    const cleanText = module.lesson_content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const fullText = `Coach Kita présente : ${module.title}. ${cleanText}`;

    try {
      // Initialisation différée de l'AudioContext pour respecter les politiques navigateurs
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Agis comme Coach Kita, mentor d'élite. Lis ce cours de manière inspirante et professionnelle. Fais des pauses naturelles entre les sections : ${fullText.substring(0, 4000)}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Kore' } 
            } 
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      const base64Audio = audioPart?.inlineData?.data;
      
      if (base64Audio && audioContextRef.current) {
        const audioBuffer = await decodeAudioData(
          decodeBase64(base64Audio), 
          audioContextRef.current, 
          24000, 
          1
        );
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        
        sourceNodeRef.current = source;
        source.start(0);
        setIsPlaying(true);
      } else {
        throw new Error("Données audio non trouvées dans la réponse.");
      }
    } catch (err: any) {
      console.error("Erreur Masterclass Audio:", err);
      alert(`Erreur Audio : ${err.message || "Impossible de générer la masterclass pour le moment."}`);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (isFinishingQuiz) return;
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (currentIdx < module.quiz_questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    setIsFinishingQuiz(true);
    let score = 0;
    finalAnswers.forEach((ans, i) => { 
      if (ans === module.quiz_questions[i].correctAnswer) score++; 
    });
    const percentage = Math.round((score / module.quiz_questions.length) * 100);
    
    try {
      const updatedUser = { ...user };
      if (!updatedUser.progress) updatedUser.progress = {};
      if (!updatedUser.attempts) updatedUser.attempts = {};

      const currentAttempts = (updatedUser.attempts[module.id] || 0) + 1;
      updatedUser.attempts[module.id] = currentAttempts;
      
      const prevBest = updatedUser.progress[module.id] || 0;
      if (percentage > prevBest) {
        updatedUser.progress[module.id] = percentage;
      }

      if (percentage >= 80) {
        setShouldFire(true);
        if (!updatedUser.badges.includes('first_module')) updatedUser.badges.push('first_module');
        const completedModulesCount = Object.values(updatedUser.progress).filter(p => p >= 80).length;
        if (completedModulesCount >= 5 && !updatedUser.badges.includes('dedicated')) {
          updatedUser.badges.push('dedicated');
        }
      }

      await saveUserProfile(updatedUser);
      await refreshProfile();
      
      setQuizState('results');
    } catch (err: any) {
      console.error("Erreur critique quiz:", err);
      setQuizState('results');
      alert("Vos résultats sont affichés mais n'ont pas pu être synchronisés.");
    } finally {
      setIsFinishingQuiz(false);
    }
  };

  const handleCommit = async () => {
    if (!commitment.trim() || !user || !module || isSaving) return;

    setIsSaving(true);
    try {
      const newAction: UserActionCommitment = {
        moduleId: module.id,
        moduleTitle: module.title,
        action: commitment.trim(),
        date: new Date().toLocaleDateString('fr-FR'),
        isCompleted: false
      };

      const updatedUser = {
        ...user,
        actionPlan: [newAction, ...(user.actionPlan || [])]
      };

      await saveUserProfile(updatedUser);
      await refreshProfile();
      setCommitment('');
      navigate('/dashboard');
    } catch (err) {
      console.error("Error saving commitment:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentScore = user.progress?.[module.id] || 0;
  const latestAttemptScore = answers.reduce((acc, ans, i) => ans === module.quiz_questions[i].correctAnswer ? acc + 1 : acc, 0);
  const latestPercentage = Math.round((latestAttemptScore / module.quiz_questions.length) * 100);
  
  const isCertified = currentScore >= 80;
  const attemptCount = user.attempts?.[module.id] || 0;
  const tokensRemaining = Math.max(0, 3 - attemptCount);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {shouldFire && (
        <ReactCanvasConfetti
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}
          onInit={({ confetti }) => {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#fbbf24', '#0c4a6e', '#0ea5e9'] });
            setShouldFire(false);
          }}
        />
      )}
      
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-brand-900 transition-colors font-black text-[10px] uppercase tracking-widest group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour
          </button>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('lesson')} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'lesson' ? 'bg-white text-brand-900 shadow-xl shadow-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}>
              <Book className="w-3 h-3" /> La Leçon
            </button>
            <button onClick={() => setActiveTab('quiz')} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'quiz' ? 'bg-white text-brand-900 shadow-xl shadow-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}>
              <Award className="w-3 h-3" /> Certification
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20 pb-32">
        {isFinishingQuiz && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-6">
              <Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto" />
              <p className="font-serif font-bold text-xl text-brand-900">Calcul de votre excellence...</p>
            </div>
          </div>
        )}

        {activeTab === 'lesson' ? (
          <article className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            <header className="text-center mb-24">
              <span className="text-[10px] font-black text-brand-500 bg-brand-50 px-6 py-2.5 rounded-full uppercase tracking-[0.4em] inline-block mb-8 border border-brand-100">{module.topic}</span>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-[1.1] mb-10 tracking-tight">{module.title}</h1>
              <p className="text-2xl md:text-3xl text-slate-400 font-serif italic max-w-2xl mx-auto mb-14 leading-relaxed opacity-80">"{module.mini_course}"</p>

              <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-6 border border-slate-100 flex items-center gap-6 group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 shadow-xl shadow-slate-100">
                <button 
                  onClick={handlePlayAudio}
                  disabled={isAudioLoading}
                  className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all ${isAudioLoading ? 'bg-slate-200' : isPlaying ? 'bg-rose-500 text-white shadow-xl shadow-rose-200' : 'bg-brand-600 text-white shadow-xl shadow-brand-200 hover:scale-105 active:scale-95'}`}
                >
                  {isAudioLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </button>
                <div className="flex-grow text-left">
                  <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Headphones className="w-3.5 h-3.5" /> Audio Guide Expert</p>
                  <p className="text-sm font-bold text-slate-500">{isPlaying ? "Écoute immersive..." : isAudioLoading ? "Génération..." : "Écouter la masterclass"}</p>
                </div>
              </div>
            </header>

            <div className="lesson-content-container" dangerouslySetInnerHTML={{ __html: module.lesson_content }} />
            
            <div className="my-24 bg-brand-900 rounded-[5rem] p-16 md:p-24 text-white relative overflow-hidden group shadow-2xl shadow-brand-900/20">
               <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000"><Sparkles className="w-48 h-48" /></div>
               <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-start relative z-10">
                 <div className="h-44 w-44 rounded-[3.5rem] bg-white p-2 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700 flex-shrink-0">
                   <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover rounded-[2.8rem]" />
                 </div>
                 <div>
                   <h4 className="font-black text-brand-400 uppercase tracking-[0.6em] text-[10px] mb-10 flex items-center gap-4"><div className="w-12 h-px bg-brand-400"></div> Sagesse du Mentor</h4>
                   <p className="text-white font-serif italic leading-relaxed text-3xl md:text-4xl opacity-90">"{module.coach_tip}"</p>
                 </div>
               </div>
            </div>

            <div className="flex justify-center pt-10">
              <button onClick={() => { stopAudio(); setActiveTab('quiz'); }} className="bg-slate-900 text-white px-16 py-8 rounded-[2.5rem] font-black hover:bg-brand-600 transition shadow-2xl shadow-slate-900/20 flex items-center gap-6 group uppercase tracking-[0.3em] text-xs">Passer la certification <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></button>
            </div>
          </article>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500 min-h-[600px] flex flex-col justify-center">
            {quizState === 'intro' && (
              <div className="text-center max-w-2xl mx-auto">
                <div className="h-36 w-36 bg-slate-900 text-white rounded-[3.5rem] flex items-center justify-center mx-auto mb-14 shadow-2xl relative overflow-hidden group">
                  <Award className="w-16 h-16 relative z-10" />
                </div>
                <h2 className="text-5xl font-bold text-slate-900 mb-8 font-serif tracking-tight">Certification Excellence</h2>
                
                <div className="flex items-center justify-center gap-4 mb-16">
                   <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border ${tokensRemaining > 0 ? 'bg-brand-50 border-brand-100 text-brand-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                      <Coins className={`w-5 h-5 ${tokensRemaining > 0 ? 'animate-bounce' : ''}`} />
                      <span className="font-black text-xs uppercase tracking-widest">{tokensRemaining} Jetons restants</span>
                   </div>
                   <div className="text-slate-400 text-xs font-medium">Tentative {attemptCount}/3</div>
                </div>

                {tokensRemaining > 0 ? (
                  <button onClick={() => setQuizState('active')} className="w-full bg-brand-600 text-white py-8 rounded-[2.5rem] font-black hover:bg-brand-700 transition shadow-2xl shadow-brand-200 uppercase tracking-widest text-xs flex items-center justify-center gap-4">
                     Utiliser 1 jeton & Commencer <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="bg-rose-50 border border-rose-100 p-10 rounded-[3rem] text-center">
                     <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-6" />
                     <h3 className="text-2xl font-bold text-rose-900 font-serif mb-4 tracking-tight">Stock épuisé</h3>
                     <p className="text-rose-700 font-medium mb-10 leading-relaxed italic">Vous avez utilisé vos 3 jetons sans valider l'excellence. Relancez le processus pour continuer votre perfectionnement.</p>
                     <button onClick={() => navigate('/quiz')} className="w-full bg-rose-500 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition shadow-xl shadow-rose-200">Racheter le module</button>
                  </div>
                )}
              </div>
            )}

            {quizState === 'active' && (
              <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-right-10 duration-500">
                <div className="mb-20">
                  <div className="flex justify-between items-center mb-10">
                    <span className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em]">Section {currentIdx + 1} / {module.quiz_questions.length}</span>
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                       <Coins className="w-3.5 h-3.5 text-brand-600" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">En cours : Jeton {attemptCount + 1}</span>
                    </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-[1.2] tracking-tight">{module.quiz_questions[currentIdx].question}</h3>
                </div>
                <div className="grid gap-6">
                  {module.quiz_questions[currentIdx].options.map((opt, i) => (
                    <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left p-10 rounded-[3rem] border-2 border-slate-100 bg-white hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 font-bold text-slate-800 text-xl flex items-center justify-between group">
                      {opt} <div className="h-8 w-8 rounded-full border-2 border-slate-200 group-hover:border-brand-500 group-hover:bg-brand-500 transition-all"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizState === 'results' && (
              <div className="w-full animate-in zoom-in-95 duration-700">
                {/* Score Header */}
                <div className="text-center mb-16">
                   <div className={`h-32 w-32 rounded-[3.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl ${latestPercentage >= 80 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      <span className="text-3xl font-black">{latestPercentage}%</span>
                   </div>
                   <h2 className="text-5xl font-bold text-slate-900 font-serif mb-4 tracking-tight">
                     {latestPercentage >= 80 ? "Excellence Atteinte !" : "Objectif manqué"}
                   </h2>
                   <p className="text-slate-500 text-lg font-medium">Tentative effectuée : {attemptCount} / 3</p>
                </div>

                {/* Case 1: First 2 attempts and failed */}
                {attemptCount < 3 && latestPercentage < 80 ? (
                  <div className="text-center max-w-2xl mx-auto py-10">
                    <div className="bg-amber-50 border border-amber-100 p-10 rounded-[3rem] mb-12">
                       <RotateCcw className="w-10 h-10 text-amber-500 mx-auto mb-6" />
                       <p className="text-amber-900 text-xl font-medium leading-relaxed italic">
                         "La persévérance est la marque des élites. Vous n'avez pas encore atteint les 80%, mais je ne vous donne pas encore les réponses. Relisez bien les chapitres II et III, le secret s'y trouve."
                       </p>
                    </div>
                    <button onClick={() => { setQuizState('intro'); setActiveTab('lesson'); }} className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-brand-900 transition shadow-xl">Recommencer ma leçon</button>
                  </div>
                ) : (
                  /* Case 2: Success OR 3rd attempt exhausted -> Show analysis and correct answers */
                  <div className="space-y-16">
                    {/* Correction Section (Revealed only on 3rd attempt or success) */}
                    <section className="bg-white rounded-[4rem] border border-slate-100 shadow-xl p-12 md:p-20 overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[10rem] font-serif italic pointer-events-none">Audit</div>
                      <h4 className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em] mb-14 flex items-center gap-3">
                         <HelpCircle className="w-5 h-5" /> Débriefing Expert Coach Kita
                      </h4>
                      
                      <div className="space-y-12">
                         {module.quiz_questions.map((q, qIdx) => {
                           const userAns = answers[qIdx];
                           const isCorrect = userAns === q.correctAnswer;
                           return (
                             <div key={qIdx} className="border-b border-slate-50 pb-10 last:border-0">
                               <p className="text-xl font-bold text-slate-900 mb-6 flex items-start gap-4">
                                 <span className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs shrink-0">{qIdx + 1}</span>
                                 {q.question}
                               </p>
                               <div className="grid gap-3 mb-6">
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className={`p-5 rounded-2xl text-sm font-bold flex items-center justify-between ${
                                      oIdx === q.correctAnswer ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100' : 
                                      oIdx === userAns && !isCorrect ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-400 opacity-60'
                                    }`}>
                                      {opt}
                                      {oIdx === q.correctAnswer && <CheckCircle2 className="w-5 h-5" />}
                                    </div>
                                  ))}
                               </div>
                               <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100">
                                  <p className="text-xs text-brand-900 leading-relaxed"><span className="font-black uppercase tracking-widest text-[9px] block mb-2">Explication du Mentor :</span> {q.explanation}</p>
                               </div>
                             </div>
                           );
                         })}
                      </div>
                    </section>

                    {/* Success Outcome */}
                    {isCertified ? (
                      <>
                        <div className="diploma-paper border-[16px] border-double border-slate-100 p-12 md:p-24 rounded-[4rem] text-center relative overflow-hidden shadow-2xl">
                          <div className="absolute top-0 left-0 w-full h-full border-[1px] border-slate-200 pointer-events-none rounded-[3.5rem] m-2"></div>
                          <div className="relative z-10">
                            <div className="mb-14">
                              <Crown className="w-16 h-16 text-brand-500 mx-auto mb-6" />
                              <h2 className="text-[12px] font-black text-brand-900 uppercase tracking-[0.6em] mb-4">Certificat d'Excellence Go'Top Pro</h2>
                              <div className="h-px w-24 bg-brand-200 mx-auto"></div>
                            </div>
                            <p className="text-xl font-serif text-slate-500 mb-8 italic">Ce document atteste que l'expert(e)</p>
                            <h3 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-10 tracking-tight">{user.firstName} {user.lastName}</h3>
                            <p className="text-lg font-medium text-slate-500 max-w-xl mx-auto mb-16 leading-relaxed">A validé avec succès le module de formation magistrale :<br/><span className="text-brand-900 font-black uppercase tracking-widest text-xl mt-4 block">"{module.title}"</span></p>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-12 mt-20 border-t border-slate-100 pt-16">
                              <div className="text-left space-y-4">
                                <div className="flex items-center gap-3 text-slate-400">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{new Date().toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                  <Award className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                                </div>
                              </div>
                              <div className="gold-seal h-28 w-28 rounded-full flex items-center justify-center text-white relative group">
                                <Sparkles className="w-12 h-12" />
                                <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-110"></div>
                                <div className="absolute -bottom-2 font-black text-[8px] uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full whitespace-nowrap">Certifié Kita</div>
                              </div>
                              <div className="text-right">
                                <div className="mb-4 text-center"><img src={COACH_KITA_AVATAR} className="h-16 w-16 rounded-2xl mx-auto grayscale" alt="Kita Sig" /></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Signature du Mentor</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-brand-950 rounded-[4rem] p-16 md:p-24 text-white shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-[15rem] pointer-events-none italic font-serif select-none">Action</div>
                          <h4 className="text-brand-500 font-black uppercase text-[11px] tracking-[0.5em] mb-12 flex items-center gap-3"><Zap className="w-4 h-4 fill-current" /> Sceller ma réussite par l'action</h4>
                          <p className="text-3xl font-serif mb-16 leading-relaxed italic text-slate-300 opacity-90">"{module.strategic_mantra}"</p>
                          <div className="mb-14">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Mon premier engagement concret :</label>
                            <textarea 
                              value={commitment} 
                              onChange={e => setCommitment(e.target.value)} 
                              className="w-full bg-black/20 border border-white/10 rounded-[2.5rem] p-10 text-white placeholder-slate-500 outline-none ring-4 ring-transparent focus:ring-brand-gold/40 focus:bg-black/40 transition text-lg font-medium" 
                              placeholder="Décrivez votre première étape concrète ici..." 
                              rows={4} 
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-6">
                            <button onClick={handleCommit} disabled={isSaving || !commitment.trim()} className="flex-grow bg-brand-500 py-8 rounded-[2rem] font-black hover:bg-brand-400 transition-all disabled:opacity-20 shadow-2xl shadow-brand-500/20 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4">
                              {isSaving ? <Loader2 className="animate-spin" /> : "Terminer et sceller mon évolution"}
                              {!isSaving && <ArrowRight className="w-6 h-6" />}
                            </button>
                            <button className="px-10 py-8 bg-white/10 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white/20 transition"><Share2 className="w-5 h-5" /> Partager</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-rose-50 border border-rose-100 p-16 rounded-[4rem] text-center">
                        <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-8" />
                        <h2 className="text-4xl font-serif font-bold text-rose-900 mb-6">Échec de Certification</h2>
                        <p className="text-rose-700 text-xl font-medium mb-12 leading-relaxed max-w-2xl mx-auto italic">"Même avec l'audit complet sous vos yeux, le standard Go'Top n'est pas atteint. Un expert n'abandonne jamais. Renouvelez vos jetons pour prouver votre détermination."</p>
                        <button onClick={() => navigate('/quiz')} className="bg-rose-600 text-white px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition shadow-2xl shadow-rose-200 flex items-center gap-4 mx-auto">
                           Renouveler mes jetons d'expert <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleView;
