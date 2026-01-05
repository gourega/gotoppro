
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap, Trophy, TrendingUp, Users, ShieldCheck, ArrowRight } from 'lucide-react';

const Benefits: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header section */}
      <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight tracking-tight">
          Pourquoi rejoindre <span className="text-brand-600">l'élite</span> Go'Top Pro ?
        </h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed">
          Découvrez comment notre écosystème propulse votre salon vers une rentabilité et un prestige inégalés.
        </p>
      </section>

      {/* The 4 Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <BenefitCard 
            icon={<Zap className="w-8 h-8 text-amber-500" />}
            title="Audit IA de Performance"
            desc="Notre diagnostic unique analyse 16 points clés de votre business. En 10 minutes, vous savez exactement où vous perdez de l'argent et comment le récupérer."
          />
          <BenefitCard 
            icon={<Trophy className="w-8 h-8 text-brand-600" />}
            title="Certification de Prestige"
            desc="Validez vos acquis avec Coach Kita et obtenez des certificats d'excellence. Affichez-les dans votre salon pour justifier des tarifs premium."
          />
          <BenefitCard 
            icon={<TrendingUp className="w-8 h-8 text-emerald-500" />}
            title="Rentabilité Immédiate"
            desc="Nos modules 'Vente additionnelle' et 'Tarification' sont conçus pour un retour sur investissement en moins de 30 jours."
          />
          <BenefitCard 
            icon={<Users className="w-8 h-8 text-indigo-500" />}
            title="Accompagnement 24h/7j"
            desc="L'IA Coach Kita répond à toutes vos questions de gestion et de management à tout moment de la journée, directement dans votre espace."
          />
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-32 bg-white border-y border-slate-100 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-slate-900 mb-16">Un investissement, pas une dépense</h2>
          <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl text-white">
            <div className="grid grid-cols-2 divide-x divide-white/10 border-b border-white/10">
              <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Gérant Classique</div>
              <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-brand-500 bg-brand-500/5">Go'Top Pro Gérant</div>
            </div>
            <div className="divide-y divide-white/5 font-medium">
              <ComparisonRow left="Subit son planning" right="Maîtrise ses créneaux" />
              <ComparisonRow left="Baisse les prix pour attirer" right="Augmente les prix pour sa qualité" />
              <ComparisonRow left="Gaspille les produits" right="Pèse chaque gramme de mélange" />
              <ComparisonRow left="Équipe démotivée" right="Équipe engagée et rentable" />
              <ComparisonRow left="Peu visible en ligne" right="Réseaux sociaux magnétiques" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <div className="bg-white rounded-[4rem] p-16 md:p-24 shadow-2xl border border-slate-100 max-w-5xl mx-auto relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
            <ShieldCheck className="w-64 h-64" />
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-12 tracking-tight">
            Prêt à changer de dimension ?
          </h2>
          <Link to="/quiz" className="bg-brand-600 text-white px-16 py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition flex items-center gap-4 mx-auto w-fit">
            Lancer mon diagnostic expert <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
};

const BenefitCard = ({ icon, title, desc }: any) => (
  <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
    <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
      {icon}
    </div>
    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed text-lg">{desc}</p>
  </div>
);

const ComparisonRow = ({ left, right }: any) => (
  <div className="grid grid-cols-2 divide-x divide-white/5">
    <div className="p-8 text-sm text-slate-500 flex items-center gap-3 italic">
      <div className="w-1.5 h-1.5 rounded-full bg-rose-500/30"></div>
      {left}
    </div>
    <div className="p-8 text-sm text-white font-bold flex items-center gap-3 bg-brand-500/5">
      <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
      {right}
    </div>
  </div>
);

export default Benefits;
