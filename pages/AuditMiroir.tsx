
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI } from "@google/genai";
import { COACH_KITA_AVATAR, TRAINING_CATALOG } from '../constants';
import { 
  Mic, 
  Square, 
  Send, 
  Loader2, 
  Sparkles, 
  ChevronLeft, 
  MessageSquare, 
  Zap, 
  Award,
  ArrowRight,
  Quote,
  AlertCircle
} from 'lucide-react';

const AuditMiroir: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [suggestedModule, setSuggestedModule] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processDiagnostic(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone inaccessible. Veuillez utiliser le mode texte.");
      setInputMode('text');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processDiagnostic = async (audioOrText: Blob | string) => {
    setLoading(true);
    setDiagnostic(null);
    setSuggestedModule(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let contents: any;

      if (typeof audioOrText === 'string') {
        contents = { parts: [{ text: `Voici mon problème de salon : ${audioOrText}` }] };
      } else {
        const base64Audio = await blobToBase64(audioOrText);
        contents = {
          parts: [
            { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
            { text: "Analyse ce message vocal de gérant de salon. Identifie les douleurs principales." }
          ]
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: `Tu es Coach Kita, mentor d'élite. Un gérant se confie à toi dans ton cabinet privé (Audit Miroir).
          1. Analyse son problème avec empathie et autorité.
          2. Structure ton diagnostic en 3 parties : [L'URGENCE] (ce qui lui fait perdre de l'argent), [L'OPPORTUNITÉ] (ce qu'il peut gagner), [L'ACTION CONCRÈTE].
          3. Recommande UN SEUL module du catalogue Go'Top Pro à la fin (mentionne son ID ou titre précis).
          
          TON : Prestigieux, direct, sans filtre. 300 mots max. Utilise Markdown.
          Interdiction d'anglicismes techniques.`,
        }
      });

      const result = response.text || "Coach Kita réfléchit à votre situation...";
      setDiagnostic(result);

      // Tentative de détection du module suggéré
      const detectedModule = TRAINING_CATALOG.find(m => 
        result.toLowerCase().includes(m.title.toLowerCase()) || 
        result.toLowerCase().includes(m.id.toLowerCase())
      );
      if (detectedModule) setSuggestedModule(detectedModule);

    } catch (err) {
      console.error(err);
      setDiagnostic("Désolé, la connexion avec le mentor a été interrompue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c4a6e] flex flex-col items-center py-20 px-6">
      <div className="max-w-4xl w-full">
        
        {/* Header Suite Privée */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
          <button onClick={() => navigate('/')} className="mb-8 text-white/40 hover:text-white transition-colors flex items-center gap-2 mx-auto font-black text-[10px] uppercase tracking-widest group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quitter la salle
          </button>
          
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-brand-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            <Sparkles className="w-4 h-4" />
            L'Audit Miroir
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
            Consultation Privée <br/>avec <span className="text-brand-500 italic">Coach Kita</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-80">
            Confiez-moi vos doutes, vos pertes ou vos ambitions. Je vais scanner votre réalité et vous donner la clé du succès.
          </p>
        </div>

        {/* Espace de Saisie / Interaction */}
        {!diagnostic && !loading && (
          <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-10 md:p-20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Quote className="w-48 h-48 text-white" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              
              <div className="flex bg-white/5 p-1 rounded-2xl mb-16">
                <button onClick={() => setInputMode('voice')} className={`px-8 py-3 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${inputMode === 'voice' ? 'bg-brand-500 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                  <Mic className="w-4 h-4" /> Message Vocal
                </button>
                <button onClick={() => setInputMode('text')} className={`px-8 py-3 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${inputMode === 'text' ? 'bg-brand-500 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                  <MessageSquare className="w-4 h-4" /> Message Écrit
                </button>
              </div>

              {inputMode === 'voice' ? (
                <div className="text-center space-y-10">
                  <div className="relative">
                    {isRecording && (
                      <div className="absolute inset-0 -m-8 rounded-full bg-rose-500/20 animate-ping"></div>
                    )}
                    <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`h-32 w-32 rounded-full flex items-center justify-center transition-all shadow-2xl ${isRecording ? 'bg-rose-500 scale-110' : 'bg-brand-500 hover:scale-105 active:scale-95 shadow-brand-500/30'}`}
                    >
                      {isRecording ? <Square className="w-10 h-10 text-white" /> : <Mic className="w-12 h-12 text-white" />}
                    </button>
                  </div>
                  <p className="text-white font-black uppercase text-[11px] tracking-widest animate-pulse">
                    {isRecording ? "Le mentor vous écoute..." : "Appuyez pour parler au mentor"}
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-8">
                  <textarea 
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder="Décrivez votre situation (problèmes d'équipe, manque de clients, gestion floue...)"
                    className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-white text-xl font-medium outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[250px] resize-none"
                  />
                  <button 
                    onClick={() => processDiagnostic(textInput)}
                    disabled={!textInput.trim()}
                    className="w-full bg-brand-500 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/20 disabled:opacity-20"
                  >
                    Envoyer au Mentor <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/5 backdrop-blur-2xl rounded-[4rem] p-24 text-center border border-white/10 flex flex-col items-center gap-10">
            <div className="relative">
              <Loader2 className="w-20 h-20 text-brand-500 animate-spin" />
              <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full"></div>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-serif font-bold text-white tracking-tight">Le mentor analyse votre situation...</p>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.4em] animate-pulse">Scan stratégique en cours</p>
            </div>
          </div>
        )}

        {/* Résultat du Diagnostic */}
        {diagnostic && !loading && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
            
            <section className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[15rem] font-serif italic pointer-events-none group-hover:scale-110 transition-transform duration-1000">Audit</div>
               
               <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                 <div className="shrink-0 mx-auto md:mx-0">
                    <div className="h-40 w-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
                      <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                    </div>
                 </div>
                 
                 <div className="flex-grow space-y-10 prose prose-slate max-w-none">
                    <div className="flex items-center gap-4">
                      <Zap className="text-brand-600 w-6 h-6 fill-current" />
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight m-0">Diagnostic Éclair du Mentor</h2>
                    </div>
                    
                    <div className="text-slate-700 text-lg leading-relaxed font-medium">
                      {diagnostic.split('\n').map((line, i) => (
                        <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-900 font-black">$1</strong>') }} />
                      ))}
                    </div>
                 </div>
               </div>
            </section>

            {/* CTA Vers Module Suggéré */}
            <section className="bg-brand-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl border border-white/5 relative overflow-hidden group">
               <div className="absolute inset-0 bg-brand-500/5 blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
               <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                 <div className="space-y-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 text-brand-500 font-black text-[10px] uppercase tracking-widest">
                      <Award className="w-4 h-4" /> Solution Recommandée
                    </div>
                    <h3 className="text-2xl font-bold font-serif">
                      {suggestedModule ? suggestedModule.title : "Accéder à ma formation prioritaire"}
                    </h3>
                    <p className="text-slate-400 max-w-sm">Ce module contient les outils exacts pour corriger votre problème aujourd'hui.</p>
                 </div>
                 
                 <button 
                  onClick={() => navigate(suggestedModule ? `/module/${suggestedModule.id}` : '/results')} 
                  className="bg-brand-500 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/20 group/btn"
                 >
                    Démarrer maintenant
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                 </button>
               </div>
            </section>

            <button 
              onClick={() => setDiagnostic(null)}
              className="text-white/40 hover:text-white transition-colors text-center w-full font-black text-[9px] uppercase tracking-widest"
            >
              Refaire un audit sur un autre sujet
            </button>
          </div>
        )}
      </div>

      {/* Ambiance sonore / Visuelle - Grain subtil */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </div>
  );
};

export default AuditMiroir;
