import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Sparkles, Target, TrendingUp, Users, Award, ShieldCheck } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section - Prestige avec Image de Fond */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-48 overflow-hidden bg-[#0c4a6e]">
        {/* Image de fond "Salon Premium" */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay de couleur de marque avec dégradé pour la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c4a6e]/95 via-[#0c4a6e]/85 to-[#0c4a6e]/95 backdrop-blur-[2px]"></div>
        </div>
        
        {/* Glow Effects dynamiques */}
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-brand-500/30 rounded-full blur-[120px] z-[2]"></div>
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] z-[2]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col items-center text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-in fade-in slide-in-from-top duration-1000 shadow-2xl">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              L'excellence à portée de main
            </div>
            
            <h1 className="text-5xl md:text-[6rem] font-serif font-bold text-white leading-[1.05] mb-10 max-w-5xl tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom duration-1000 delay-100">
              Propulsez votre salon <br /> vers <span className="text-brand-500 italic font-normal">l'excellence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-14 leading-relaxed max-w-3xl font-medium opacity-95 px-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
              Découvrez la méthode Go'Top Pro : diagnostic expert, formations stratégiques et plan d'action personnalisé pour transformer votre passion en succès financier.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
              <Link
                to="/quiz"
                className="bg-[#0ea5e9] text-white px-14 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-[0_20px_60px_rgba(14,165,233,0.4)] hover:bg-[#0284c7] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
              >
                Lancer mon diagnostic
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to={user ? "/dashboard" : "/login"}
                className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-14 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] hover:bg-white/20 hover:-translate-y-1 transition-all flex items-center justify-center"
              >
                {user ? "Mon espace" : "Me connecter"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Flottante au-dessus du Hero */}
      <section className="relative z-20 -mt-24 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-[3.5rem] shadow-2xl shadow-slate-900/10 p-12 border border-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-slate-100">
            <div className="text-center md:px-4">
              <p className="text-4xl font-bold text-[#0c4a6e] font-serif mb-2 tracking-tighter">300+</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Salons boostés</p>
            </div>
            <div className="text-center md:px-4">
              <p className="text-4xl font-bold text-[#0c4a6e] font-serif mb-2 tracking-tighter">45%</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Hausse de CA</p>
            </div>
            <div className="text-center md:px-4">
              <p className="text-4xl font-bold text-[#0c4a6e] font-serif mb-2 tracking-tighter">16</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Modules experts</p>
            </div>
            <div className="text-center md:px-4">
              <p className="text-4xl font-bold text-[#0c4a6e] font-serif mb-2 tracking-tighter">4.9/5</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section - Expertise terrain */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-brand-500 font-black uppercase text-[10px] tracking-[0.5em] mb-4">Notre Expertise Unique</h2>
            <p className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">L'accompagnement vers le sommet</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
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
              <div key={i} className="p-14 rounded-[4rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="h-20 w-20 bg-white rounded-[1.8rem] flex items-center justify-center text-brand-500 mb-12 shadow-sm group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 font-serif">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-lg">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Certification */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-1000">
             <div className="flex items-center gap-3 font-black text-slate-400 text-xl tracking-tighter italic"> <ShieldCheck className="w-8 h-8"/> CERTIFIÉ QUALITÉ</div>
             <div className="flex items-center gap-3 font-black text-slate-400 text-xl tracking-tighter italic"> <Award className="w-8 h-8"/> MÉTHODE KITA</div>
             <div className="flex items-center gap-3 font-black text-slate-400 text-xl tracking-tighter italic"> <Sparkles className="w-8 h-8"/> PROPULSÉ PAR IA</div>
          </div>
        </div>
      </section>

      {/* CTA Final - Engagement */}
      <section className="py-32 bg-[#0c4a6e] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] italic font-serif text-[28rem] pointer-events-none flex items-center justify-center select-none">Go'Top</div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-serif font-bold mb-12 leading-tight">
            Votre réussite <br/> commence ici
          </h2>
          <p className="text-slate-300 text-xl md:text-2xl mb-16 max-w-2xl mx-auto font-medium opacity-85 leading-relaxed">
            Ne laissez plus votre salon stagner. Rejoignez l'élite des gérants et transformez votre passion en une entreprise prospère.
          </p>
          <Link
            to="/quiz"
            className="inline-block bg-[#0ea5e9] text-white px-20 py-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#0284c7] hover:scale-105 transition-all shadow-2xl shadow-cyan-950/50"
          >
            Commencer le diagnostic gratuit
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;