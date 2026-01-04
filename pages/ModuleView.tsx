
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG, COACH_KITA_AVATAR } from '../constants';
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
  Headphones
} from 'lucide-react';

// Helpers for Audio Processing
function decodeBase64(base64: string) {
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
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [shouldFire, setShouldFire] = useState(false);
  const [commitment, setCommitment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Audio States
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useNativeFallback, setUseNativeFallback] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const nativeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playNativeFallback = (text: string) => {
    if (!window.speechSynthesis) return;
    
    stopAudio();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; 
    utterance.pitch = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('fr') && v.name.toLowerCase().includes('thomas')) 
                        || voices.find(v => v.lang.includes('fr'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsAudioLoading(false);
      setUseNativeFallback(true);
    };
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsAudioLoading(false);
    };

    nativeUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsAudioLoading(true);
    
    const cleanText = module.lesson_content
      .replace(/<[^>]*>/g, ' ') 
      .replace(/\s+/g, ' ')
      .trim();
    
    const fullText = `${module.title}. ${cleanText}`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const truncatedText = fullText.length > 3500 ? fullText.substring(0, 3500) + "..." : fullText;
      
      const prompt = `Lisez ce cours de coiffure expert avec un ton calme, posé et très inspirant. 
      IMPORTANT : Faites des pauses de 2 secondes après chaque titre (numérotés I, II, III...) et entre chaque paragraphe. 
      Ne prononcez pas les symboles de ponctuation, utilisez-les simplement pour le rythme : ${truncatedText}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        
        sourceNodeRef.current = source;
        source.start(0);
        setIsPlaying(true);
        setIsAudioLoading(false);
        setUseNativeFallback(false);
      } else {
        throw new Error("No data");
      }
    } catch (err: any) {
      console.log("Fallback TTS...");
      playNativeFallback(fullText);
    }
  };

  const handleStartQuiz = () => {
    setQuizState('active');
    setCurrentIdx(0);
    setAnswers([]);
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (currentIdx < module.quiz_questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    let score = 0;
    finalAnswers.forEach((ans, i) => {
      if (ans === module.quiz_questions[i].correctAnswer) score++;
    });
    const percentage = Math.round((score / module.quiz_questions.length) * 100);
    const updatedUser = { ...user };
    if (!updatedUser.progress) updatedUser.progress = {};
    updatedUser.progress[module.id] = percentage;
    if (percentage >= 80) {
      setShouldFire(true);
      if (!updatedUser.badges.includes('first_module')) updatedUser.badges.push('first_module');
    }
    await saveUserProfile(updatedUser);
    await refreshProfile();
    setQuizState('results');
  };

  const handleCommit = async () => {
    if (!commitment.trim()) return;
    setIsSaving(true);
    const newCommitment: UserActionCommitment = {
      moduleId: module.id,
      moduleTitle: module.title,
      action: commitment,
      date: new Date().toLocaleDateString('fr-FR'),
      isCompleted: false
    };
    const updatedUser = { ...user };
    updatedUser.actionPlan = [...user.actionPlan, newCommitment];
    await saveUserProfile(updatedUser);
    await refreshProfile();
    setIsSaving(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {shouldFire && (
        <ReactCanvasConfetti
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}
          onInit={({ confetti }) => {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#0ea5e9', '#0c4a6e', '#fbbf24'] });
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
                  <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <Headphones className="w-3.5 h-3.5" />
                    Audio Guide Masterclass
                  </p>
                  <p className="text-sm font-bold text-slate-500">
                    {isPlaying ? "Écoute en cours..." : isAudioLoading ? "Génération de l'audio..." : "Écouter la leçon complète"}
                  </p>
                  {isPlaying && (
                    <div className="flex items-end gap-1 mt-3 h-5">
                      {[1,2,3,4,5,6,7,8,9,10].map(i => (
                        <div key={i} className="w-1 rounded-full animate-[pulse_0.8s_infinite] bg-brand-500" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.08}s` }}></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Structured Editorial Layout with CSS Overrides */}
            <div 
              className="lesson-content-container"
              dangerouslySetInnerHTML={{ __html: module.lesson_content }} 
            />
            
            <div className="my-24 bg-brand-900 rounded-[5rem] p-16 md:p-24 text-white relative overflow-hidden group shadow-2xl shadow-brand-900/20">
               <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                 <Sparkles className="w-48 h-48" />
               </div>
               
               <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-start relative z-10">
                 <div className="h-44 w-44 rounded-[3.5rem] bg-white p-2 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700 flex-shrink-0">
                   <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover rounded-[2.8rem]" />
                 </div>
                 <div>
                   <h4 className="font-black text-brand-400 uppercase tracking-[0.6em] text-[10px] mb-10 flex items-center gap-4">
                     <div className="w-12 h-px bg-brand-400"></div> Sagesse du Mentor
                   </h4>
                   <p className="text-white font-serif italic leading-relaxed text-3xl md:text-4xl opacity-90">"{module.coach_tip}"</p>
                 </div>
               </div>
            </div>

            <div className="flex justify-center pt-10">
              <button 
                onClick={() => { stopAudio(); setActiveTab('quiz'); }} 
                className="bg-slate-900 text-white px-16 py-8 rounded-[2.5rem] font-black hover:bg-brand-600 transition shadow-2xl shadow-slate-900/20 flex items-center gap-6 group uppercase tracking-[0.3em] text-xs"
              >
                Passer la certification <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </article>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500 min-h-[600px] flex flex-col justify-center max-w-2xl mx-auto">
            {quizState === 'intro' && (
              <div className="text-center">
                <div className="h-36 w-36 bg-slate-900 text-white rounded-[3.5rem] flex items-center justify-center mx-auto mb-14 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-brand-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Award className="w-16 h-16 relative z-10" />
                </div>
                <h2 className="text-5xl font-bold text-slate-900 mb-8 font-serif tracking-tight">Certification Excellence</h2>
                <p className="text-slate-500 mb-16 text-xl font-medium leading-relaxed opacity-80">
                  Le badge d'expert est réservé à ceux qui atteignent <b className="text-brand-900">80%</b> de réussite. Prêt pour l'épreuve ?
                </p>
                <button onClick={handleStartQuiz} className="w-full bg-brand-600 text-white py-8 rounded-[2.5rem] font-black hover:bg-brand-700 transition shadow-2xl shadow-brand-200 uppercase tracking-widest text-xs">Débuter l'évaluation</button>
              </div>
            )}

            {quizState === 'active' && (
              <div className="w-full animate-in slide-in-from-right-10 duration-500">
                <div className="mb-20">
                  <div className="flex justify-between items-center mb-10">
                    <span className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em]">Section {currentIdx + 1} / {module.quiz_questions.length}</span>
                    <div className="flex gap-2">
                      {module.quiz_questions.map((_, i) => (
                        <div key={i} className={`h-2 w-10 rounded-full transition-all duration-700 ${i <= currentIdx ? 'bg-brand-500' : 'bg-slate-200'}`}></div>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-[1.2] tracking-tight">{module.quiz_questions[currentIdx].question}</h3>
                </div>
                
                <div className="grid gap-6">
                  {module.quiz_questions[currentIdx].options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleAnswer(i)} 
                      className="w-full text-left p-10 rounded-[3rem] border-2 border-slate-100 bg-white hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 font-bold text-slate-800 text-xl group flex items-center justify-between"
                    >
                      {opt} <div className="h-8 w-8 rounded-full border-2 border-slate-200 group-hover:border-brand-500 group-hover:bg-brand-500 transition-all shadow-inner"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizState === 'results' && (
              <div className="text-center w-full animate-in zoom-in-95 duration-700">
                <div className="h-32 w-32 bg-emerald-50 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto mb-12 shadow-inner ring-8 ring-emerald-50/50">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
                <h2 className="text-6xl font-bold text-slate-900 font-serif mb-6 tracking-tight">Succès !</h2>
                <div className="inline-block px-10 py-4 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-[0.3em] mb-20 shadow-xl">
                  Score Master : {user.progress?.[module.id]}%
                </div>
                
                <div className="bg-brand-950 rounded-[5rem] p-16 md:p-24 text-white text-left shadow-[0_50px_120px_rgba(12,74,110,0.3)] relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-[15rem] pointer-events-none italic font-serif leading-none">Action</div>
                  <h4 className="text-brand-500 font-black uppercase text-[11px] tracking-[0.5em] mb-12 flex items-center gap-3">
                    <Zap className="w-4 h-4 fill-current" /> Plan d'Action Stratégique
                  </h4>
                  <p className="text-3xl font-serif mb-16 leading-relaxed italic text-slate-300 opacity-90">"{module.strategic_mantra}"</p>
                  
                  <div className="mb-14">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Mon engagement post-formation :</label>
                    <textarea value={commitment} onChange={e => setCommitment(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[3rem] p-10 text-white placeholder-slate-700 outline-none ring-4 ring-transparent focus:ring-brand-500/20 focus:bg-white/10 transition text-2xl font-medium leading-relaxed" placeholder="Décrivez votre première étape concrète..." rows={4} />
                  </div>
                  
                  <button onClick={handleCommit} disabled={isSaving || !commitment.trim()} className="w-full bg-brand-500 py-8 rounded-[2.5rem] font-black hover:bg-brand-400 transition-all disabled:opacity-20 shadow-2xl shadow-brand-500/20 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4">
                    {isSaving ? <Loader2 className="animate-spin" /> : "Sceller mon évolution"}
                    {!isSaving && <ArrowRight className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleView;
