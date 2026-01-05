
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

      {/* La Méthode Kita - Design Aligné sur l'image fournie */}
      <section className="py-24 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h3 className="text-brand-500 font-black uppercase text-[10px] tracking-[0.5em] mb-4">L'Origine de l'Excellence</h3>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">La Méthode Coach Kita</h2>
          </div>
          
          <div className="bg-white rounded-[3.5rem] p-10 md:p-20 shadow-2xl relative overflow-hidden group border border-slate-100 max-w-5xl mx-auto">
            {/* Watermark "K" aligned to the right like in the image */}
            <div className="absolute top-1/2 -right-12 -translate-y-1/2 opacity-[0.03] text-[25rem] pointer-events-none italic font-serif select-none transition-transform duration-1000 group-hover:scale-110 leading-none">K</div>
            
            <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center relative z-10">
              {/* Avatar with blue border like in the image */}
              <div className="relative shrink-0">
                <div className="h-56 w-56 rounded-[3rem] overflow-hidden border-[6px] border-brand-500 shadow-xl transition-transform duration-700 group-hover:scale-105">
                  <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="space-y-10 flex-grow text-center md:text-left">
                {/* Quotation Icon like in the image */}
                <div className="flex justify-center md:justify-start">
                  <svg className="w-12 h-12 text-slate-900" viewBox="0 0 40 32" fill="currentColor">
                    <path d="M11.111 0C4.975 0 0 4.975 0 11.111v11.111c0 6.136 4.975 11.111 11.111 11.111h4.444V22.222h-4.444v-11.111h8.889V0h-8.889zm20 0c-6.136 0-11.111 4.975-11.111 11.111v11.111c0 6.136 4.975 11.111 11.111 11.111h4.444V22.222h-4.444v-11.111h8.889V0h-8.889z" />
                  </svg>
                </div>
                
                {/* Quote Text updated to 25 years */}
                <p className="text-2xl md:text-3xl text-slate-700 font-serif italic leading-[1.6]">
                  "Après 25 ans à observer les salons d'Afrique de l'Ouest, j'ai identifié 16 points de rupture qui séparent ceux qui survivent de ceux qui règnent. Go'Top Pro est la synthèse de ces solutions."
                </p>
                
                {/* Signature with blue line like in the image */}
                <div className="flex items-center justify-center md:justify-start gap-5">
                  <div className="h-1.5 w-12 bg-brand-500 rounded-full"></div>
                  <span className="font-black text-[11px] uppercase tracking-[0.3em] text-brand-900">
                    Coach Kita — Fondateur & Mentor d'Élite
                  </span>
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
