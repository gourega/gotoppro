
import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RAYMOND_LOGO, RAYMOND_FB_URL, RAYMOND_ADDRESS, RAYMOND_STYLING_PHOTO, COACH_KITA_PROMO_VIDEO, COACH_KITA_AVATAR } from '../constants';
import { ArrowRight, Sparkles, Target, TrendingUp, Users, Wallet, ExternalLink, MapPin, Play, MonitorPlay } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section - Épurée & Personnalisée Coach Kita */}
      <section className="relative min-h-[600px] lg:min-h-[calc(100vh-80px)] flex items-center py-20 overflow-hidden bg-[#0c4a6e]">
        <div 
          className="absolute inset-0 z-0 bg-[#0c4a6e]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c4a6e]/95 via-[#0c4a6e]/85 to-[#0c4a6e] backdrop-blur-[1px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-2xl animate-in fade-in slide-in-from-top">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              L'excellence à portée de main
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-[5rem] xl:text-[6rem] font-serif font-bold text-white leading-[1.1] mb-10 max-w-5xl tracking-tight drop-shadow-2xl animate-in fade-in zoom-in-95 duration-700">
              Propulsez votre salon <br className="hidden md:block" /> vers <span className="text-brand-500 italic font-normal">l'excellence</span>
            </h1>
            
            {/* Processus de diagnostic clair - Mentions Coach Kita */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-10 rounded-[3rem] mb-12 max-w-4xl w-full animate-in fade-in slide-in-from-bottom duration-1000">
               <p className="text-slate-200 text-sm md:text-base font-black mb-8 uppercase tracking-[0.2em] opacity-80">Votre parcours vers la rentabilité :</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  <div className="flex items-start gap-4">
                     <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-lg shadow-brand-500/20">1</div>
                     <div>
                        <p className="text-white text-xs font-black uppercase tracking-wider mb-1">Identifiez vos pertes</p>
                        <p className="text-slate-300 [text-[11px]] leading-relaxed font-medium">Répondez à nos 16 points de contrôle stratégiques.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-lg shadow-brand-500/20">2</div>
                     <div>
                        <p className="text-white text-xs font-black uppercase tracking-wider mb-1">Avis de Coach Kita</p>
                        <p className="text-slate-300 [text-[11px]] leading-relaxed font-medium">Recevez l'analyse immédiate du Mentor sur vos fuites de cash.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-lg shadow-brand-500/20">3</div>
                     <div>
                        <p className="text-white text-xs font-black uppercase tracking-wider mb-1">Validez votre plan</p>
                        <p className="text-slate-300 [text-[11px]] leading-relaxed font-medium">Choisissez vos modules et lancez votre transformation.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto px-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-300 relative z-20">
              {user ? (
                <Link
                  to="/caisse"
                  className="bg-emerald-500 text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-emerald-500/40 hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group"
                >
                  <Wallet className="w-5 h-5" />
                  Ma Caisse KITA
                </Link>
              ) : (
                <Link
                  to="/quiz"
                  className="bg-[#0ea5e9] text-white px-12 md:px-20 py-6 md:py-8 rounded-2xl font-black [text-[11px]] md:text-xs uppercase tracking-[0.25em] shadow-[0_20px_60px_rgba(14,165,233,0.4)] hover:bg-[#0284c7] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group"
                >
                  Faire mon diagnostic
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION VIDÉO DE PRÉSENTATION - NOUVEAU */}
      <section className="py-24 md:py-32 bg-white w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-24">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm border border-brand-100">
               <MonitorPlay className="w-4 h-4" /> En direct du cabinet
             </div>
             <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
               L'Excellence en <span className="text-brand-600 italic">Mouvement</span>
             </h2>
          </div>

          <div className="max-w-5xl mx-auto">
             <div className="bg-slate-900 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(12,74,110,0.3)] relative border-[12px] border-slate-50 group">
                <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-white shadow-xl">
                      <img src={COACH_KITA_AVATAR} className="w-full h-full object-cover" alt="Coach" />
                   </div>
                   <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">Masterclass Kita</span>
                   </div>
                </div>

                <video 
                  className="w-full aspect-video object-cover cursor-pointer"
                  controls
                  playsInline
                  poster={RAYMOND_STYLING_PHOTO}
                >
                  <source src={COACH_KITA_PROMO_VIDEO} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>

                {/* Overlay discret si non en lecture */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/40 to-transparent opacity-60 group-hover:opacity-20 transition-opacity"></div>
             </div>

             <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-50 p-8 md:p-12 rounded-[3rem] border border-slate-100">
                <div className="flex items-center gap-6">
                   <div className="h-14 w-14 bg-brand-900 text-brand-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <Sparkles className="w-8 h-8" />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-slate-900">Pourquoi Go'Top Pro ?</h4>
                      <p className="text-slate-500 font-medium">Découvrez la vision de Coach Kita pour votre réussite.</p>
                   </div>
                </div>
                {!user && (
                   <Link to="/quiz" className="bg-brand-900 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-3">
                      Lancer mon Diagnostic <ArrowRight className="w-4 h-4" />
                   </Link>
                )}
             </div>
          </div>
        </div>
      </section>

      {/* Partenaire Section - Images robustes */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-[4rem] p-10 md:p-20 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12 md:gap-20 group hover:shadow-2xl transition-all duration-500">
            <div className="shrink-0 h-64 w-64 rounded-[3.5rem] overflow-hidden border-4 border-brand-100 shadow-2xl relative">
              <img 
                src={RAYMOND_STYLING_PHOTO} 
                alt="Salon Chez Raymond" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute inset-0 bg-brand-900/10 pointer-events-none"></div>
            </div>
            <div className="flex-grow space-y-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-[0.3em]">
                Partenaire d'Excellence
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                Salon de coiffure <span className="text-brand-600">Chez Raymond</span>
              </h2>
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-slate-500 font-bold">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <MapPin className="w-6 h-6 text-brand-500 shrink-0" />
                  <span className="text-sm uppercase tracking-tighter">{RAYMOND_ADDRESS}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Users className="w-6 h-6 text-brand-500 shrink-0" />
                  <span className="text-sm uppercase tracking-tighter">Conseil APB Officiel</span>
                </div>
              </div>
              <p className="text-slate-500 text-lg md:text-xl max-w-xl leading-relaxed italic mx-auto md:mx-0 font-serif">
                "Go'Top Pro est la méthode que nous recommandons pour structurer et faire briller les talents de la coiffure ivoirienne."
              </p>
              <a 
                href={RAYMOND_FB_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-brand-900 text-white px-10 py-5 rounded-2xl font-black [text-[11px]] uppercase tracking-widest hover:bg-brand-950 transition-all shadow-xl active:scale-95"
              >
                Découvrir le salon <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-24 md:py-40 bg-white w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 md:mb-32">
            <h2 className="text-brand-500 font-black uppercase text-[10px] tracking-[0.6em] mb-6">Notre Expertise Unique</h2>
            <p className="text-4xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight">L'accompagnement vers le sommet</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 md:gap-16">
            {[
              { 
                icon: <Target className="w-10 h-10" />, 
                title: "Diagnostic 360°", 
                desc: "Une analyse profonde de 16 points clés pour identifier vos leviers de rentabilité immédiats et stopper les fuites de cash." 
              },
              { 
                icon: <TrendingUp className="w-10 h-10" />, 
                title: "Méthode Coach Kita", 
                desc: "Des modules de micro-learning audio et texte conçus avec le Mentor, focalisés sur les réalités du marché ivoirien." 
              },
              { 
                icon: <Users className="w-10 h-10" />, 
                title: "Vision Mentor", 
                desc: "L'expertise d'une vie condensée pour piloter vos équipes et transformer votre management au quotidien." 
              }
            ].map((feature, i) => (
              <div key={i} className="p-10 md:p-16 rounded-[4rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 group flex flex-col items-center md:items-start text-center md:text-left">
                <div className="h-20 w-20 md:h-24 md:w-24 bg-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-brand-500 mb-10 md:mb-14 shadow-sm group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                   {React.cloneElement(feature.icon as React.ReactElement<any>, { 
                     className: "w-10 h-10 md:w-12 md:h-12" 
                   })}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 font-serif">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-lg">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
