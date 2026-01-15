
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RAYMOND_LOGO, RAYMOND_FB_URL, RAYMOND_ADDRESS, RAYMOND_PHONE } from '../constants';
import { ArrowRight, Sparkles, Target, TrendingUp, Users, Wallet, ExternalLink, MapPin } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section - Ajustement du padding (pt-32 pb-56) pour une visibilité totale */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center pt-32 pb-56 overflow-hidden bg-[#0c4a6e]">
        <div 
          className="absolute inset-0 z-0 bg-[#0c4a6e]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c4a6e]/95 via-[#0c4a6e]/85 to-[#0c4a6e] backdrop-blur-[2px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6 md:mb-8 shadow-2xl animate-in fade-in slide-in-from-top">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              L'excellence à portée de main
            </div>
            
            {/* Titre avec leading plus serré et marge réduite */}
            <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-serif font-bold text-white leading-[1.05] mb-6 md:mb-8 max-w-5xl tracking-tight drop-shadow-2xl px-4 animate-in fade-in zoom-in-95">
              Propulsez votre salon <br /> vers <span className="text-brand-500 italic font-normal">l'excellence</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-200 mb-8 md:mb-12 leading-relaxed max-w-3xl font-medium opacity-90 px-6 animate-in fade-in slide-in-from-bottom">
              Découvrez la méthode Go'Top Pro : diagnostic expert, formations stratégiques et plan d'action personnalisé pour transformer votre passion en succès financier.
            </p>

            {/* Boutons avec marges et contrastes renforcés */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto px-6 animate-in fade-in slide-in-from-bottom relative z-20">
              {user ? (
                <>
                  <Link
                    to="/caisse"
                    className="bg-emerald-500 text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-emerald-500/40 hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group"
                  >
                    <Wallet className="w-5 h-5" />
                    Ma Caisse
                  </Link>
                  <Link
                    to="/dashboard"
                    className="bg-white/20 backdrop-blur-xl text-white border-2 border-white/30 px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] hover:bg-white/30 hover:-translate-y-1 transition-all flex items-center justify-center"
                  >
                    Tableau de bord
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/quiz"
                    className="bg-[#0ea5e9] text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-[0_20px_60px_rgba(14,165,233,0.4)] hover:bg-[#0284c7] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                  >
                    Lancer mon diagnostic
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white/20 backdrop-blur-xl text-white border-2 border-white/30 px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] hover:bg-white/30 hover:-translate-y-1 transition-all flex items-center justify-center"
                  >
                    Me connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Décalage ajusté pour ne pas couvrir les boutons */}
      <section className="relative z-30 -mt-12 md:-mt-20 px-4 w-full">
        <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-900/10 p-8 md:p-12 border border-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 md:divide-x divide-slate-100">
            <div className="text-center md:px-4">
              <p className="text-3xl md:text-4xl font-bold text-[#0c4a6e] font-serif mb-1 md:mb-2 tracking-tighter">300+</p>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Salons boostés</p>
            </div>
            <div className="text-center md:px-4 border-l md:border-l-0 border-slate-100">
              <p className="text-3xl md:text-4xl font-bold text-[#0c4a6e] font-serif mb-1 md:mb-2 tracking-tighter">45%</p>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Hausse de CA</p>
            </div>
            <div className="text-center md:px-4 border-l md:border-l-0 border-slate-100">
              <p className="text-3xl md:text-4xl font-bold text-[#0c4a6e] font-serif mb-1 md:mb-2 tracking-tighter">16</p>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Modules experts</p>
            </div>
            <div className="text-center md:px-4 border-l md:border-l-0 border-slate-100">
              <p className="text-3xl md:text-4xl font-bold text-[#0c4a6e] font-serif mb-1 md:mb-2 tracking-tighter">4.9/5</p>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partenaire Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12 group hover:shadow-2xl transition-all duration-500">
            <div className="shrink-0 h-48 w-48 rounded-[2.5rem] overflow-hidden border-4 border-brand-100 shadow-2xl relative">
              <img src={RAYMOND_LOGO} alt="Salon Chez Raymond" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-brand-900/10"></div>
            </div>
            <div className="flex-grow space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-[9px] font-black uppercase tracking-[0.3em]">
                Partenaire d'Excellence
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                Salon de coiffure <span className="text-brand-600">Chez Raymond</span>
              </h2>
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 text-slate-500 font-medium">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-brand-500" />
                  <span className="text-sm">{RAYMOND_ADDRESS}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-brand-500" />
                  <span className="text-sm">Conseil APB Officiel</span>
                </div>
              </div>
              <p className="text-slate-500 max-w-xl leading-relaxed italic">
                "Go'Top Pro est la méthode que nous recommandons pour structurer et faire briller les talents de la coiffure ivoirienne."
              </p>
              <a 
                href={RAYMOND_FB_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-brand-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-950 transition-all shadow-lg"
              >
                Découvrir le salon <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 md:py-32 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-brand-500 font-black uppercase text-[10px] tracking-[0.5em] mb-4">Notre Expertise Unique</h2>
            <p className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">L'accompagnement vers le sommet</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { 
                icon: <Target className="w-10 h-10" />, 
                title: "Diagnostic 360°", 
                desc: "Une analyse profonde de 16 points clés pour identifier vos leviers de rentabilité immédiats." 
              },
              { 
                icon: <TrendingUp className="w-10 h-10" />, 
                title: "Formations IA", 
                desc: "Des modules de micro-learning générés par IA, focalisés sur les réalités de votre salon." 
              },
              { 
                icon: <Users className="w-10 h-10" />, 
                title: "Vision Coach", 
                desc: "L'expertise de Coach Kita pour piloter vos équipes et transformer votre management." 
              }
            ].map((feature, i) => (
              <div key={i} className="p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col items-center md:items-start text-center md:text-left">
                <div className="h-16 w-16 md:h-20 md:w-20 bg-white rounded-[1.5rem] md:rounded-[1.8rem] flex items-center justify-center text-brand-500 mb-8 md:mb-12 shadow-sm group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                   {React.cloneElement(feature.icon as React.ReactElement<any>, { 
                     className: "w-8 h-8 md:w-10 md:h-10" 
                   })}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6 font-serif">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-base md:text-lg">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-[#0c4a6e] text-white relative overflow-hidden w-full">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-7xl font-serif font-bold mb-8 md:mb-12 leading-tight">
            Votre réussite <br className="hidden md:block"/> commence ici
          </h2>
          <Link
            to={user ? "/dashboard" : "/quiz"}
            className="inline-block bg-[#0ea5e9] text-white px-12 md:px-20 py-6 md:py-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#0284c7] hover:scale-105 transition-all shadow-2xl shadow-cyan-950/50"
          >
            {user ? "Accéder à mon espace" : "Commencer le diagnostic gratuit"}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
