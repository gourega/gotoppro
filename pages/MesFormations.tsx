
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_CATALOG } from '../constants';
import KitaTopNav from '../components/KitaTopNav';
import { BookOpen, Play, CheckCircle2, Trophy, ArrowRight, Star, Clock } from 'lucide-react';

const MesFormations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const myModules = useMemo(() => {
    if (!user) return [];
    return TRAINING_CATALOG.filter(m => user.purchasedModuleIds.includes(m.id));
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <KitaTopNav />

      <header className="bg-indigo-900 pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-[15rem] font-serif italic text-white leading-none">Savoir</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
              <BookOpen className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Mon Académie <span className="text-indigo-400 italic">Elite</span></h1>
          </div>
          <p className="text-slate-300 max-w-2xl font-medium leading-relaxed">
            Retrouvez ici vos modules de formation. Chaque certification validée est un pas de plus vers la domination de votre marché local.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-16 space-y-10 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myModules.length > 0 ? (
            myModules.map(module => {
              const score = user.progress?.[module.id] || 0;
              const isCertified = score >= 80;
              
              return (
                <div key={module.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col group hover:-translate-y-1 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">{module.topic}</span>
                    {isCertified && <Trophy className="w-5 h-5 text-amber-500" />}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 flex-grow">{module.title}</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression</span>
                      <span className={`text-xs font-black ${isCertified ? 'text-emerald-500' : 'text-indigo-600'}`}>{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${isCertified ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/module/${module.id}`)}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      isCertified 
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                    }`}
                  >
                    {isCertified ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isCertified ? 'Revoir la leçon' : 'Continuer le module'}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
              <Star className="w-16 h-16 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Votre bibliothèque est vide</h3>
              <p className="text-slate-500 mb-10 max-w-md mx-auto">Vous n'avez pas encore acheté de modules. Réalisez votre diagnostic pour identifier vos besoins prioritaires.</p>
              <button onClick={() => navigate('/results')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto">
                Aller à la boutique <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Aide du Mentor */}
        <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform group-hover:scale-110">
              <BookOpen className="w-48 h-48" />
           </div>
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="h-32 w-32 bg-indigo-500 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl">
                 <Clock className="w-16 h-16 text-white" />
              </div>
              <div className="space-y-4 text-center md:text-left">
                 <h4 className="text-2xl font-serif font-bold italic">"Un gérant qui arrête d'apprendre est un gérant qui accepte de perdre."</h4>
                 <p className="text-slate-400 font-medium">Consultez Coach Kita à tout moment si un concept vous semble flou.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MesFormations;
