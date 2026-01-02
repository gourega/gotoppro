
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Sparkles, Target, Users, TrendingUp } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section - Premium Dark Original with Salon Background */}
      <section className="relative bg-brand-900 pt-20 pb-32 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920" 
            alt="Salon de coiffure de luxe" 
            className="w-full h-full object-cover opacity-20"
          />
          {/* Dark Overlay to ensure brand-900 feel */}
          <div className="absolute inset-0 bg-brand-900/40"></div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500 rounded-full blur-[120px] opacity-20 z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-400 rounded-full blur-[120px] opacity-10 z-10"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-brand-300 text-xs font-black uppercase tracking-widest mb-8 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              L'excellence à portée de main
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-8">
              Propulsez votre salon vers <span className="text-brand-400 italic">l'excellence</span>
            </h1>
            
            <p className="text-xl text-brand-100/80 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              Découvrez la méthode Go'Top Pro : diagnostic expert, formations stratégiques et plan d'action personnalisé pour transformer votre passion en succès financier.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/quiz"
                className="w-full sm:w-auto px-10 py-5 bg-brand-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-500/20 hover:bg-brand-400 transition-all hover:scale-105 flex items-center justify-center gap-3 group"
              >
                Lancer mon diagnostic
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to={user ? "/dashboard" : "/login"}
                className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center backdrop-blur-sm"
              >
                {user ? "Accéder à mon espace" : "Me connecter"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Salons Accompagnés', val: '300+' },
              { label: 'Taux de Succès', val: '98%' },
              { label: 'Modules Experts', val: '16' },
              { label: 'Satisfaction', val: '4.9/5' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-slate-900">{stat.val}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-brand-600 font-black uppercase text-xs tracking-widest mb-4">Notre Méthode</h2>
            <p className="text-4xl font-serif font-bold text-slate-900">Un accompagnement à 360°</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-8">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 font-serif">Diagnostic Précis</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Identifiez instantanément les points de friction qui freinent la rentabilité de votre établissement.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-8">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 font-serif">Formation IA</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Des modules courts et percutants générés sur mesure pour répondre à vos besoins spécifiques.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-8">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 font-serif">Coaching Mentor</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Bénéficiez des conseils de Coach Kita pour motiver vos équipes et fidéliser votre clientèle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-brand-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 text-white text-9xl font-serif italic pointer-events-none">Go'Top</div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-10 relative z-10">
              Prêt à franchir le cap de l'excellence ?
            </h2>
            <Link
              to="/quiz"
              className="inline-flex items-center px-12 py-6 bg-brand-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-brand-400 transition-all relative z-10 hover:scale-105"
            >
              Démarrer gratuitement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
