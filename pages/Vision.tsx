
import React from 'react';
import { COACH_KITA_AVATAR } from '../constants';
import { Target, Sparkles, Award, Quote, History, ShieldCheck, Heart } from 'lucide-react';

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
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-7 space-y-8">
            <div className="flex items-center gap-3 text-brand-600 font-black text-[10px] uppercase tracking-[0.4em]">
              <Target className="w-4 h-4" /> Notre Manifeste
            </div>
            <h2 className="text-4xl font-serif font-bold text-slate-900 leading-tight">Du salon de quartier à l'institution de prestige.</h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
              <p>
                Nous croyons que chaque gérant de salon possède un talent brut immense. Mais le talent sans stratégie est un moteur sans carburant.
              </p>
              <p>
                Notre mission est d'apporter aux professionnels de la beauté ivoirienne et africaine les outils de gestion, de marketing et de management utilisés par les plus grands salons mondiaux, tout en les adaptant à nos réalités locales.
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

      {/* La Méthode Kita - Design Fidèle au visuel fourni */}
      <section className="py-24 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[3.5rem] p-10 md:p-20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group border border-slate-100 max-w-5xl mx-auto">
            {/* Watermark "K" aligned like in the image */}
            <div className="absolute top-1/2 -right-12 -translate-y-1/2 opacity-[0.03] text-[25rem] pointer-events-none italic font-serif select-none transition-transform duration-1000 group-hover:scale-110 leading-none">K</div>
            
            <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center relative z-10">
              {/* Avatar with specific blue border */}
              <div className="relative shrink-0">
                <div className="h-64 w-64 rounded-[3rem] overflow-hidden border-[6px] border-[#0ea5e9] shadow-2xl transition-transform duration-700 group-hover:scale-105">
                  <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="space-y-8 flex-grow text-center md:text-left">
                {/* Quotation Icon "99" */}
                <div className="flex justify-center md:justify-start">
                  <svg className="w-14 h-14 text-slate-900" viewBox="0 0 40 32" fill="currentColor">
                    <path d="M11.111 0C4.975 0 0 4.975 0 11.111v11.111c0 6.136 4.975 11.111 11.111 11.111h4.444V22.222h-4.444v-11.111h8.889V0h-8.889zm20 0c-6.136 0-11.111 4.975-11.111 11.111v11.111c0 6.136 4.975 11.111 11.111 11.111h4.444V22.222h-4.444v-11.111h8.889V0h-8.889z" />
                  </svg>
                </div>
                
                {/* Quote Text - 25 Years */}
                <p className="text-2xl md:text-4xl text-[#334155] font-serif italic leading-[1.6] tracking-tight">
                  "Après 25 ans à observer les salons d'Afrique de l'Ouest, j'ai identifié 16 points de rupture qui séparent ceux qui survivent de ceux qui règnent. Go'Top Pro est la synthèse de ces solutions."
                </p>
                
                {/* Signature with blue line */}
                <div className="flex items-center justify-center md:justify-start gap-5 pt-4">
                  <div className="h-1.5 w-14 bg-[#0ea5e9] rounded-full"></div>
                  <span className="font-black text-[12px] uppercase tracking-[0.3em] text-[#0c4a6e]">
                    Coach Kita — Fondateur & Mentor d'Élite
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* L'Histoire de Go'Top Pro - Projet APB */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3 sticky top-32">
              <div className="flex items-center gap-3 text-brand-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6">
                <History className="w-4 h-4" /> Notre Histoire
              </div>
              <h2 className="text-4xl font-serif font-bold text-slate-900 leading-tight">Le Projet APB : Une décennie d'impact.</h2>
            </div>
            <div className="md:w-2/3 space-y-8 text-lg text-slate-600 leading-relaxed font-medium">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-10">
                <p className="italic text-slate-500 mb-0">
                  En Côte d’Ivoire, les métiers de la beauté sont souvent considérés comme des options de dernier recours. Pourtant, ils absorbent chaque année plus de 40 % des jeunes du secteur informel.
                </p>
              </div>
              
              <p>
                Lancé en 2014, le projet **APB (Amicale des Professionnels de la Beauté)** est né d'une volonté de formaliser et moderniser ce secteur crucial. En partenariat avec la **COOPEC**, nous avons apporté un accompagnement financier et stratégique aux gérants désireux de changer de dimension.
              </p>
              
              <p>
                En moins de deux ans, les résultats ont dépassé nos attentes. De modestes salons se sont transformés en établissements haut de gamme. Go’Top Pro est l'héritier direct de cette aventure humaine, synthétisant les "Bonnes pratiques" pour les rendre accessibles à tous via la technologie.
              </p>

              <div className="pt-10 border-t border-slate-100 flex items-center gap-6">
                <Heart className="w-8 h-8 text-rose-500 fill-current" />
                <p className="text-sm italic font-serif">
                  "Merci au Président de l'APB, **M. Raymond Kouami Koffi**, pour la fraternité et la confiance depuis plus de 25 ans."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 bg-brand-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { title: "Rigueur", desc: "L'hygiène et l'organisation comme socle de confiance absolue.", icon: "💎" },
              { title: "Innovation", desc: "L'IA au service d'un diagnostic infaillible et rapide.", icon: "⚡" },
              { title: "Rentabilité", desc: "Transformer chaque minute travaillée en profit réel et mesurable.", icon: "📈" }
            ].map((item, i) => (
              <div key={i} className="text-center space-y-6">
                <div className="text-6xl mb-8 flex justify-center">{item.icon}</div>
                <h4 className="text-2xl font-serif font-bold text-white">{item.title}</h4>
                <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Vision;
