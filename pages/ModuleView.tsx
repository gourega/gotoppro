
// Add React import to avoid UMD global reference error
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG, COACH_KITA_AVATAR, BADGES, LEGACY_ID_MAP } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { ModuleStatus, UserActionCommitment, QuizQuestion } from '../types';
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
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  Coins,
  MessageSquareQuote,
  FileQuestion,
  Printer,
  Share2,
  Download
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

const ModuleView: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>('lesson');
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'expert_speech' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [shouldFire, setShouldFire] = useState(false);
  const [commitment, setCommitment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishingQuiz, setIsFinishingQuiz] = useState(false);

  // États Audio & Cache
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const cachedAudioBufferRef = useRef<AudioBuffer | null>(null);

  const module = useMemo(() => TRAINING_CATALOG.find(m => m.id === moduleId), [moduleId]);

  const attemptCount = useMemo(() => Number(user?.attempts?.[moduleId || ''] || 0), [user?.attempts, moduleId]);
  const tokensRemaining = useMemo(() => Math.max(0, 3 - attemptCount), [attemptCount]);

  const originalQuestions = useMemo(() => module?.quiz_questions || [], [module]);

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

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    if (cachedAudioBufferRef.current) {
      playBuffer(cachedAudioBufferRef.current);
      return;
    }
    setIsAudioLoading(true);
    const cleanText = module.lesson_content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const fullText = `Coach Kita présente : ${module.title}. ${cleanText}`;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Agis comme Coach Kita, mentor d'élite. Lis ce cours de manière inspirante et professionnelle : ${fullText.substring(0, 4000)}`;
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
    } catch (err: any) {
      console.error("Audio error:", err);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const startQuizAttempt = () => {
    if (originalQuestions.length === 0) return;
    
    // Logique de Shuffle des questions ET des options
    const shuffled = originalQuestions.map(q => {
      const optionsWithInfo = q.options.map((opt, idx) => ({ 
        text: opt, 
        isCorrect: idx === q.correctAnswer 
      }));
      
      // Mélange des options
      for (let i = optionsWithInfo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithInfo[i], optionsWithInfo[j]] = [optionsWithInfo[j], optionsWithInfo[i]];
      }

      return {
        ...q,
        options: optionsWithInfo.map(o => o.text),
        correctAnswer: optionsWithInfo.findIndex(o => o.isCorrect)
      };
    });

    // Mélange des questions
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setShuffledQuestions(shuffled);
    setAnswers([]);
    setCurrentIdx(0);
    setQuizState('active');
  };

  const handleAnswer = (idx: number) => {
    if (isFinishingQuiz || quizState !== 'active') return;
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (currentIdx < shuffledQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    setIsFinishingQuiz(true);
    let score = 0;
    shuffledQuestions.forEach((q, i) => { 
      if (finalAnswers[i] !== undefined && finalAnswers[i] === q.correctAnswer) {
        score++; 
      }
    });
    const percentage = Math.round((score / (shuffledQuestions.length || 1)) * 100);
    
    try {
      const updatedUser = JSON.parse(JSON.stringify(user));
      if (!updatedUser.progress) updatedUser.progress = {};
      if (!updatedUser.attempts) updatedUser.attempts = {};

      const newAttempts = (Number(updatedUser.attempts[module.id]) || 0) + 1;
      updatedUser.attempts[module.id] = newAttempts;
      
      const prevBest = Number(updatedUser.progress[module.id]) || 0;
      if (percentage > prevBest) updatedUser.progress[module.id] = percentage;

      await saveUserProfile(updatedUser);
      await refreshProfile();

      if (percentage >= 80) {
        setShouldFire(true);
        setQuizState('expert_speech');
      } else {
        setQuizState('results');
      }
    } catch (err) {
      console.error("Quiz Finish Error:", err);
      setQuizState('results');
    } finally {
      setIsFinishingQuiz(false);
    }
  };

  const handleSaveEngagement = async () => {
    if (!commitment.trim() || isSaving) return;
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
        actionPlan: [newAction, ...(user.actionPlan || [])],
        badges: user.badges.includes('first_module') ? user.badges : [...user.badges, 'first_module']
      };
      await saveUserProfile(updatedUser);
      await refreshProfile();
      setQuizState('results');
    } catch (err) {
      console.error("Commit error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAttemptScore = useMemo(() => {
    return answers.reduce((acc, ans, i) => {
      const question = shuffledQuestions[i];
      return (question && ans === question.correctAnswer) ? acc + 1 : acc;
    }, 0);
  }, [answers, shuffledQuestions]);

  const latestPercentage = Math.round((currentAttemptScore / (shuffledQuestions.length || 1)) * 100);

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleShareCertificate = async () => {
    const shareText = `Je viens de valider avec succès le module "${module.title}" sur Go'Top Pro avec un score d'excellence de ${latestPercentage}% ! Fier(e) de mon parcours vers l'Excellence Beauté.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mon Certificat Go'Top Pro",
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.warn("Share failed, falling back to WhatsApp", err);
      }
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-white print:bg-white print:p-0">
      {shouldFire && (
        <ReactCanvasConfetti
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}
          onInit={({ confetti }) => {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#fbbf24', '#0c4a6e', '#0ea5e9'] });
            setShouldFire(false);
          }}
        />
      )}
      
      <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center print:hidden">
        <div className="max-w-5xl mx-auto w-full px-6 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-brand-900 transition-colors font-black text-[10px] uppercase tracking-widest group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour
          </button>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => { stopAudio(); setActiveTab('lesson'); }} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'lesson' ? 'bg-white text-brand-900 shadow-xl shadow-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}>
              <Book className="w-3 h-3" /> Le Cours
            </button>
            <button onClick={() => setActiveTab('quiz')} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'quiz' ? 'bg-white text-brand-900 shadow-xl shadow-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}>
              <Award className="w-3 h-3" /> Certification
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20 pb-32 print:py-0 print:px-0">
        {activeTab === 'lesson' ? (
          <article className="animate-in fade-in slide-in-from-bottom-5 duration-700 print:hidden">
            <header className="text-center mb-24">
              <span className="text-[10px] font-black text-brand-500 bg-brand-50 px-6 py-2.5 rounded-full uppercase tracking-[0.4em] inline-block mb-8 border border-brand-100">{module.topic}</span>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-[1.1] mb-10 tracking-tight">{module.title}</h1>
              <p className="text-2xl md:text-3xl text-slate-400 font-serif italic max-w-2xl mx-auto mb-14 leading-relaxed opacity-80">"{module.mini_course}"</p>
              <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-6 border border-slate-100 flex items-center gap-6 shadow-xl shadow-slate-100">
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
            <div className="prose-kita" dangerouslySetInnerHTML={{ __html: module.lesson_content }} />
            <div className="my-24 bg-brand-900 rounded-[5rem] p-16 md:p-24 text-white relative overflow-hidden group shadow-2xl shadow-brand-900/20">
               <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-start relative z-10">
                 <div className="h-44 w-44 rounded-[3.5rem] bg-white p-2 shadow-2xl rotate-3 flex-shrink-0">
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
            {/* ETAT INTRO */}
            {quizState === 'intro' && (
              <div className="text-center max-w-2xl mx-auto print:hidden">
                <div className="h-36 w-36 bg-slate-900 text-white rounded-[3.5rem] flex items-center justify-center mx-auto mb-14 shadow-2xl">
                  <Award className="w-16 h-16" />
                </div>
                <h2 className="text-5xl font-bold text-slate-900 mb-8 font-serif tracking-tight">Certification Excellence</h2>
                
                {originalQuestions.length > 0 ? (
                  <>
                    <div className="flex items-center justify-center gap-4 mb-16">
                       <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border ${tokensRemaining > 0 ? 'bg-brand-50 border-brand-100 text-brand-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                          <Coins className="w-5 h-5" />
                          <span className="font-black text-xs uppercase tracking-widest">{tokensRemaining} Jetons restants</span>
                       </div>
                       <div className="text-slate-400 text-xs font-medium">Tentative {attemptCount}/3</div>
                    </div>
                    {tokensRemaining > 0 ? (
                      <button onClick={startQuizAttempt} className="w-full bg-brand-600 text-white py-8 rounded-[2.5rem] font-black hover:bg-brand-700 transition shadow-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-4">
                         Utiliser 1 jeton & Commencer <ArrowRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="bg-rose-50 border border-rose-100 p-10 rounded-[3rem] text-center">
                         <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-6" />
                         <h3 className="text-2xl font-bold text-rose-900 font-serif mb-4 tracking-tight">Accès Verrouillé</h3>
                         <p className="text-rose-700 font-medium mb-10 leading-relaxed italic">Vous avez utilisé vos 3 jetons sans valider l'excellence. Relancez le processus pour continuer votre perfectionnement.</p>
                         <button onClick={() => navigate(`/results?recharge=${module.id}`)} className="w-full bg-rose-500 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition">Racheter le module</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-12 rounded-[3rem] text-center">
                     <FileQuestion className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                     <h3 className="text-2xl font-bold text-slate-900 font-serif mb-4 tracking-tight">Quiz en préparation</h3>
                     <p className="text-slate-500 font-medium leading-relaxed italic">Coach Kita prépare les questions pour ce module. Revenez très bientôt pour passer votre certification.</p>
                     <button onClick={() => setActiveTab('lesson')} className="mt-8 text-[10px] font-black uppercase tracking-widest text-brand-600">Retourner au cours</button>
                  </div>
                )}
              </div>
            )}

            {/* ETAT ACTIF (QUESTIONS) */}
            {quizState === 'active' && shuffledQuestions[currentIdx] && (
              <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-right-10 duration-500 print:hidden">
                <div className="mb-20">
                  <div className="flex justify-between items-center mb-10">
                    <span className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em]">Question {currentIdx + 1} / {shuffledQuestions.length}</span>
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                       <Coins className="w-3.5 h-3.5 text-brand-600" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tentative {attemptCount + 1}</span>
                    </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-[1.2] tracking-tight">{shuffledQuestions[currentIdx].question}</h3>
                </div>
                <div className="grid gap-6">
                  {shuffledQuestions[currentIdx].options.map((opt, i) => (
                    <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left p-10 rounded-[3rem] border-2 border-slate-100 bg-white hover:border-brand-500 hover:shadow-2xl transition-all font-bold text-slate-800 text-xl flex items-center justify-between group">
                      {opt} <div className="h-8 w-8 rounded-full border-2 border-slate-200 group-hover:border-brand-500 group-hover:bg-brand-500 transition-all"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ETAT PAROLE D'EXPERT (SUCCÈS >= 80%) */}
            {quizState === 'expert_speech' && (
              <div className="text-center space-y-12 animate-in zoom-in-95 print:hidden">
                <div className="h-32 w-32 rounded-full mx-auto p-1.5 bg-emerald-500 shadow-xl shadow-emerald-200">
                  <img src={COACH_KITA_AVATAR} className="w-full h-full object-cover rounded-full" alt="Mentor" />
                </div>
                <div>
                   <h2 className="text-5xl font-serif font-bold text-slate-900 mb-6">Parole d'Expert</h2>
                   <p className="text-slate-500 text-xl italic leading-relaxed max-w-2xl mx-auto">
                     "Félicitations pour votre réussite ! Mais un certificat sans action n'est que du papier. Quelle action concrète allez-vous mettre en place dans votre salon dès demain pour honorer ce titre ?"
                   </p>
                </div>
                <div className="relative group max-w-2xl mx-auto">
                  <div className="absolute left-8 top-8 opacity-20"><Zap className="w-8 h-8 text-brand-900" /></div>
                  <textarea 
                    value={commitment}
                    onChange={e => setCommitment(e.target.value)}
                    placeholder="Ex: Je vais peser chaque dose de coloration pour réduire le gaspillage de 20%..."
                    className="w-full p-10 pl-20 rounded-[3.5rem] bg-slate-50 border-none outline-none font-bold text-lg min-h-[250px] resize-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <button 
                  onClick={handleSaveEngagement}
                  disabled={!commitment.trim() || isSaving}
                  className="bg-brand-900 text-white px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-4 mx-auto disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Sparkles className="w-6 h-6" />}
                  Enregistrer mon engagement
                </button>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cet engagement sera ajouté à votre plan de transformation</p>
              </div>
            )}

            {/* ETAT RÉSULTATS (DÉBRIEFING) */}
            {quizState === 'results' && (
              <div className="w-full animate-in zoom-in-95 duration-700">
                <div className="text-center mb-16 print:hidden">
                   <div className={`h-32 w-32 rounded-[3.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl ${latestPercentage >= 80 ? 'bg-emerald-500 text-white' : 'bg-rose-50 text-white'}`}>
                      <span className="text-3xl font-black">{latestPercentage}%</span>
                   </div>
                   <h2 className="text-5xl font-bold text-slate-900 font-serif mb-4 tracking-tight">
                     {latestPercentage >= 80 ? "Excellence Atteinte !" : "Objectif manqué"}
                   </h2>
                   <p className="text-slate-500 text-lg font-medium">Tentative : {attemptCount} / 3</p>
                </div>

                {latestPercentage < 80 ? (
                  <div className="text-center max-w-2xl mx-auto py-10 print:hidden">
                    <div className="bg-amber-50 border border-amber-100 p-10 rounded-[3rem] mb-12">
                       <RotateCcw className="w-10 h-10 text-amber-500 mx-auto mb-6" />
                       <p className="text-amber-900 text-xl font-medium leading-relaxed italic">
                         "La persévérance est la marque des élites. Vous n'avez pas atteint les 80%. Relisez la leçon, le mentor Coach Kita croit en vous."
                       </p>
                    </div>
                    {tokensRemaining > 0 ? (
                      <button onClick={() => { setQuizState('intro'); setActiveTab('lesson'); setAnswers([]); setCurrentIdx(0); }} className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-brand-900 transition">Retenter ma chance</button>
                    ) : (
                      <button onClick={() => navigate(`/results?recharge=${module.id}`)} className="w-full bg-rose-500 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xs">Racheter le module (3 nouveaux jetons)</button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-16">
                    <section className="bg-white rounded-[4rem] border border-slate-100 shadow-xl p-12 md:p-20 overflow-hidden relative print:hidden">
                      <h4 className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em] mb-14 flex items-center gap-3">
                         <HelpCircle className="w-5 h-5" /> Débriefing de votre Maîtrise
                      </h4>
                      <div className="space-y-12">
                         {shuffledQuestions.map((q, qIdx) => {
                           const userAns = answers[qIdx];
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
                                      (oIdx === userAns) ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-400 opacity-60'
                                    }`}>
                                      {opt}
                                      {oIdx === q.correctAnswer && <CheckCircle2 className="w-5 h-5" />}
                                    </div>
                                  ))}
                               </div>
                               <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100">
                                  <p className="text-xs text-brand-900 leading-relaxed"><span className="font-black uppercase tracking-widest text-[9px] block mb-2">Explication :</span> {q.explanation}</p>
                               </div>
                             </div>
                           );
                         })}
                      </div>
                    </section>

                    <div id="certificate-area" className="diploma-paper border-[16px] border-double border-slate-100 p-12 md:p-24 rounded-[4rem] text-center relative overflow-hidden shadow-2xl bg-white print:border-none print:shadow-none print:rounded-none print:w-full print:p-10">
                      <div className="relative z-10">
                        <div className="mb-14">
                          <Crown className="w-16 h-16 text-brand-500 mx-auto mb-6" />
                          <h2 className="text-[12px] font-black text-brand-900 uppercase tracking-[0.6em] mb-4">Certificat d'Excellence Go'Top Pro</h2>
                          <div className="h-px w-24 bg-brand-200 mx-auto"></div>
                        </div>
                        <p className="text-xl font-serif text-slate-500 mb-8 italic">Ce document atteste que l'expert(e)</p>
                        <h3 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-10 tracking-tight">{user.firstName} {user.lastName}</h3>
                        <p className="text-lg font-medium text-slate-500 max-w-xl mx-auto mb-16 leading-relaxed">A validé avec succès le module de formation magistrale :<br/><span className="text-brand-900 font-black uppercase tracking-widest text-xl mt-4 block">"{module.title}"</span></p>
                        <div className="flex items-center justify-center gap-10 mt-12 opacity-80 border-t border-slate-100 pt-10">
                           <div className="text-left">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date de validation</p>
                              <p className="text-xs font-bold text-slate-900">{new Date().toLocaleDateString('fr-FR')}</p>
                           </div>
                           <div className="h-12 w-px bg-slate-100"></div>
                           <div className="text-right">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID Certificat</p>
                              <p className="text-[9px] font-mono font-bold text-slate-500">{module.id.toUpperCase()}-{user.uid.substring(0,8).toUpperCase()}</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS DU CERTIFICAT */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 print:hidden">
                       <button 
                        onClick={handlePrintCertificate}
                        className="bg-brand-900 text-white px-10 py-6 rounded-3xl font-black uppercase text-[10px] shadow-xl flex items-center gap-3 hover:scale-105 transition-all"
                       >
                         <Printer className="w-4 h-4" /> Imprimer / PDF
                       </button>
                       <button 
                        onClick={handleShareCertificate}
                        className="bg-emerald-500 text-white px-10 py-6 rounded-3xl font-black uppercase text-[10px] shadow-xl flex items-center gap-3 hover:scale-105 transition-all"
                       >
                         <Share2 className="w-4 h-4" /> Partager ma réussite
                       </button>
                       <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-brand-900 px-6"
                       >
                         Retour au Dashboard
                       </button>
                    </div>
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
