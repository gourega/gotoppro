
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap, Trophy, TrendingUp, Users, ShieldCheck, ArrowRight, Gift, Star, Crown } from 'lucide-react';

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

      {/* Pricing Tiers Section */}
      <section className="py-32 bg-brand-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-brand-500 font-black uppercase text-[10px] tracking-[0.5em] mb-4">Investissement Stratégique</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold mb-6">Des tarifs adaptés à votre ambition</h3>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium">Pas d'abonnement. Vous achetez vos modules une fois, vous les gardez pour toujours. Plus vous apprenez, moins vous payez.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <PriceCard 
              tier="Solo" 
              price="500" 
              unit="par module" 
              discount="Tarif standard" 
              desc="Idéal pour résoudre un problème précis immédiatement." 
              icon={<Star className="w-6 h-6" />}
            />
            <PriceCard 
              tier="Ambition" 
              price="400" 
              unit="par module" 
              discount="-20% dès 5 modules" 
              desc="Pour ceux qui veulent stabiliser les bases du salon." 
              icon={<TrendingUp className="w-6 h-6" />}
              highlight
            />
            <PriceCard 
              tier="Performance" 
              price="350" 
              unit="par module" 
              discount="-30% dès 9 modules" 
              desc="Le choix des gérants qui visent la croissance rapide." 
              icon={<Zap className="w-6 h-6" />}
            />
            <PriceCard 
              tier="Empire" 
              price="250" 
              unit="par module" 
              discount="-50% dès 13 modules" 
              desc="L'accès total pour dominer votre marché local." 
              icon={<Crown className="w-6 h-6" />}
            />
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl">
              <Gift className="text-brand-500 w-8 h-8" />
              <p className="text-sm font-medium text-slate-300 text-left">
                <span className="text-white font-bold block">Paiement unique via Wave CI</span>
                Activation manuelle par Coach Kita sous 15 minutes.
              </p>
            </div>
          </div>
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

const PriceCard = ({ tier, price, unit, discount, desc, icon, highlight }: any) => (
  <div className={`p-10 rounded-[3rem] border transition-all duration-500 flex flex-col h-full ${
    highlight 
    ? 'bg-brand-500 border-brand-400 shadow-2xl shadow-brand-500/20 -translate-y-4 text-white' 
    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
  }`}>
    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-8 ${highlight ? 'bg-white text-brand-500' : 'bg-white/10 text-brand-500'}`}>
      {icon}
    </div>
    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${highlight ? 'text-brand-900' : 'text-brand-500'}`}>{tier}</h4>
    <div className="flex items-baseline gap-1 mb-6">
      <span className="text-4xl font-black">{price}</span>
      <span className="text-xs font-bold opacity-60">FCFA</span>
      <span className="text-[10px] font-medium opacity-40 ml-1">{unit}</span>
    </div>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-6 px-3 py-1.5 rounded-lg inline-block w-fit ${highlight ? 'bg-brand-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
      {discount}
    </p>
    <p className="text-sm font-medium leading-relaxed mb-8 flex-grow opacity-80">{desc}</p>
    <Link to="/quiz" className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center transition-all ${
      highlight ? 'bg-white text-brand-900 hover:bg-slate-100' : 'bg-white/10 text-white hover:bg-white/20'
    }`}>
      Choisir ce pack
    </Link>
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
