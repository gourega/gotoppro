
import React from 'react';
import { COACH_KITA_AVATAR } from '../constants';
import { Target, Sparkles, Award, Quote } from 'lucide-react';

const Vision: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Vision */}
      <section className="bg-brand-900 text-white py-32 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight tracking-tight">
            L'ambition d'un <span className="text-brand-500">empire</span> de la beauté
          </h1>
          <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto opacity-90 leading-relaxed">
            Go'Top Pro n'est pas une simple plateforme de cours. C'est le catalyseur de la nouvelle génération de gérants d'élite en Afrique.
          </p>
        </div>
      </section>

      {/* Le Manifeste */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-7 space-y-8">
            <div className="flex items-center gap-3 text-brand-600 font-black text-[10px] uppercase tracking-[0.4em]">
              <Target className="w-4 h-4" /> Notre Manifeste
            </div>
            <h2 className="text-4xl font-serif font-bold text-slate-900">Du salon de quartier à l'institution de prestige.</h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
              <p>
                Nous croyons que chaque gérant de salon possède un talent brut immense. Mais le talent sans stratégie est un moteur sans carburant.
              </p>
              <p>
                Notre mission est d'apporter aux professionnels de la beauté ivoirienne et africaine les outils de gestion, de marketing et de management utilisés par les plus grands salons parisiens et new-yorkais, tout en les adaptant à nos réalités locales.
              </p>
              <p className="font-serif italic text-brand-900 text-2xl">
                "Nous ne formons pas des coiffeurs, nous bâtissons des entrepreneurs."
              </p>
            </div>
          </div>
          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50 relative group">
              <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80" alt="Excellence Beauté" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-brand-900/20"></div>
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-xl max-w-[250px] border border-slate-100 hidden md:block">
              <Sparkles className="text-brand-500 w-10 h-10 mb-4" />
              <p className="text-sm font-bold text-slate-900">Plus de 300 gérants déjà transformés par notre méthode.</p>
            </div>
          </div>
        </div>
      </section>

      {/* La Méthode Kita */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h3 className="text-brand-500 font-black uppercase text-[10px] tracking-[0.5em] mb-4">L'Origine de l'Excellence</h3>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">La Méthode Coach Kita</h2>
          </div>
          <div className="bg-white rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden group border border-slate-100">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[15rem] pointer-events-none italic font-serif group-hover:scale-110 transition-transform duration-1000">K</div>
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="h-64 w-64 rounded-[4rem] overflow-hidden shadow-2xl border-4 border-brand-500 flex-shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-700">
                <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-8">
                <Quote className="w-12 h-12 text-brand-200" />
                <p className="text-2xl md:text-3xl text-slate-700 font-serif italic leading-relaxed">
                  "Après 15 ans à observer les salons d'Afrique de l'Ouest, j'ai identifié 16 points de rupture qui séparent ceux qui survivent de ceux qui règnent. Go'Top Pro est la synthèse de ces solutions."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-brand-500"></div>
                  <span className="font-black text-xs uppercase tracking-widest text-brand-900">Coach Kita — Fondatrice & Mentor d'Élite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: "Rigueur", desc: "L'hygiène et l'organisation comme socle de confiance.", icon: "💎" },
            { title: "Innovation", desc: "L'IA au service d'un diagnostic infaillible.", icon: "⚡" },
            { title: "Rentabilité", desc: "Transformer chaque minute travaillée en profit réel.", icon: "📈" }
          ].map((item, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="text-5xl mb-6">{item.icon}</div>
              <h4 className="text-2xl font-serif font-bold text-slate-900">{item.title}</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Vision;
