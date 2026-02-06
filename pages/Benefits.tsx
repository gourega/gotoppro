import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap, Trophy, TrendingUp, Users, ShieldCheck, ArrowRight, Gift, Star, Crown, Package, Gem, Sparkles, MessageCircle } from 'lucide-react';

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

      {/* The Pillars */}
      <section className="py-12 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard 
            icon={<MessageCircle className="w-8 h-8 text-emerald-500" />}
            title="Service Conciergerie WhatsApp"
            desc="Envoyez des reçus digitaux via notre canal officiel certifié Meta Business. Nous finançons l'infrastructure technique (Valeur 10.000F/mois) pour professionnaliser instantanément votre image."
          />
          <BenefitCard 
            icon={<Zap className="w-8 h-8 text-amber-500" />}
            title="Audit de Performance Coach Kita"
            desc="Notre diagnostic unique analyse 16 points clés de votre business. En 10 minutes, vous savez exactement où vous perdez de l'argent et comment le récupérer."
          />
          <BenefitCard 
            icon={<Trophy className="w-8 h-8 text-brand-600" />}
            title="Certification de Prestige"
            desc="Validez vos acquis avec Coach Kita et obtenez des certificats d'excellence. Affichez-les dans votre salon pour justifier des tarifs premium auprès de vos clientes."
          />
          <BenefitCard 
            icon={<TrendingUp className="w-8 h-8 text-emerald-500" />}
            title="Rentabilité Immédiate"
            desc="Nos modules 'Vente additionnelle' et 'Tarification' sont conçus pour un retour sur investissement rapide, souvent en moins de 30 jours."
          />
          <BenefitCard 
            icon={<Users className="w-8 h-8 text-indigo-500" />}
            title="Accompagnement Mentoré"
            desc="Coach Kita répond à toutes vos questions de gestion et de management à tout moment de la journée, directement dans votre espace de chat privé par IA."
          />
          <BenefitCard 
            icon={<ShieldCheck className="w-8 h-8 text-brand-600" />}
            title="Standard International"
            desc="Adoptez les méthodes des plus grands salons mondiaux adaptées au marché ivoirien pour transformer votre salon de quartier en institution reconnue."
          />
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-24 bg-brand-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-brand-500 font-black uppercase text-[10px] tracking-[0.5em] mb-4">Investissement Stratégique</h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6">Des tarifs adaptés à votre ambition</h3>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium">Pas d'abonnement. Vous achetez vos outils une fois, vous les gardez pour toujours.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
            <PriceCard 
              tier="Pack Solo" 
              price="500" 
              unit="par module" 
              discount="À la carte" 
              desc={
                <div className="space-y-1 font-bold text-[10px] uppercase tracking-tighter opacity-90">
                  <p className="text-emerald-400">• -20% dès 5 modules</p>
                  <p className="text-emerald-400">• -30% dès 9 modules</p>
                  <p className="text-emerald-400">• -50% dès 13 modules</p>
                </div>
              }
              icon={<Star className="w-6 h-6" />}
            />

            <PriceCard 
              tier="Excellence Totale" 
              price="15 000" 
              unit="Full Option" 
              discount="Prestige Ultime" 
              desc="Accès intégral : Les 16 Masterclass + Packs RH & Stock + CRM VIP + Conciergerie WhatsApp API Illimitée." 
              icon={<Gem className="w-8 h-8" />}
              highlight
              featured
            />

            <PriceCard 
              tier="Académie Élite" 
              price="10 000" 
              unit="Accès Savoir" 
              discount="Masterclass" 
              desc="Les 16 Masterclass incluses, tous les certificats d'Excellence et la sauvegarde Cloud à vie." 
              icon={<Crown className="w-6 h-6" />}
            />

            <PriceCard 
              tier="Performance RH" 
              price="5 000" 
              unit="Pack Outils" 
              discount="Staff & CRM" 
              desc="Calcul automatique des commissions, suivi productivité staff et Fichier Client VIP (CRM)." 
              icon={<Users className="w-6 h-6" />}
            />

            <PriceCard 
              tier="Stock Expert" 
              price="5 000" 
              unit="Pack Outils" 
              discount="Zéro Perte" 
              desc="Inventaire valorisé, alertes ruptures automatiques et gestion simplifiée des fournisseurs." 
              icon={<Package className="w-6 h-6" />}
            />
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl">
              <Gift className="text-brand-500 w-8 h-8" />
              <p className="text-sm font-medium text-slate-300 text-left">
                <span className="text-white font-bold block">Paiement unique via Wave CI</span>
                Activation sous 15 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-slate-900 mb-12 tracking-tight">Un investissement, <br className="md:hidden"/> pas une dépense</h2>
          
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-100">
            {/* Header */}
            <div className="grid grid-cols-2 border-b border-slate-100">
              <div className="p-4 text-center bg-slate-50/50">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Gérant Classique</h4>
              </div>
              <div className="p-4 text-center bg-brand-50/20 border-l border-slate-100">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-600">Go'Top Pro Gérant</h4>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              <ComparisonRow left="Subit son planning" right="Maîtrise ses créneaux" />
              <ComparisonRow left="Baisse les prix pour attirer" right="Augmente les prix pour sa qualité" />
              <ComparisonRow left="Gaspille les produits" right="Pèse chaque gramme de mélange" />
              <ComparisonRow left="Équipe démotivée" right="Équipe engagée et rentable" />
              <ComparisonRow left="Reçu papier souvent perdu" right="Reçu WhatsApp certifié Meta" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <div className="bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl border border-slate-100 max-w-4xl mx-auto relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
            <ShieldCheck className="w-64 h-64" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-10 tracking-tight">
            Prêt à changer de dimension ?
          </h2>
          <Link to="/quiz" className="bg-brand-600 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition flex items-center gap-4 mx-auto w-fit">
            Lancer mon diagnostic expert <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
};

const BenefitCard = ({ icon, title, desc }: any) => (
  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed text-base">{desc}</p>
  </div>
);

const PriceCard = ({ tier, price, unit, discount, desc, icon, highlight, featured }: any) => (
  <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full relative overflow-hidden ${
    highlight 
    ? 'bg-brand-500 border-brand-400 shadow-2xl shadow-brand-500/20 lg:-translate-y-4 text-white' 
    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
  } ${featured ? 'ring-4 ring-amber-400/30' : ''}`}>
    {featured && <div className="absolute top-4 right-4 animate-pulse"><Sparkles className="w-5 h-5 text-amber-400" /></div>}
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 ${highlight ? 'bg-white text-brand-500' : 'bg-white/10 text-brand-500'}`}>{icon}</div>
    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${highlight ? 'text-brand-900' : 'text-brand-500'}`}>{tier}</h4>
    <div className="flex items-baseline gap-1 mb-4"><span className="text-3xl font-black">{price}</span><span className="text-[10px] font-bold opacity-60">FCFA</span></div>
    <p className={`text-[9px] font-black uppercase tracking-widest mb-4 px-2.5 py-1 rounded-lg inline-block w-fit ${highlight ? 'bg-brand-600' : 'bg-emerald-500/20 text-emerald-400'}`}>{discount}</p>
    <div className="text-xs font-medium leading-relaxed mb-6 flex-grow opacity-80">{desc}</div>
    <Link to="/quiz" className={`w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest text-center transition-all ${highlight ? 'bg-white text-brand-900 hover:bg-slate-100' : 'bg-white/10 text-white hover:bg-white/20'}`}>Choisir</Link>
  </div>
);

const ComparisonRow = ({ left, right }: any) => (
  <div className="grid grid-cols-2 group items-center">
    <div className="px-6 py-4 text-center border-r border-slate-50 flex items-center justify-center gap-3 transition-colors group-hover:bg-slate-50/30 min-h-[60px]">
      <div className="h-1 w-1 rounded-full bg-rose-200 shrink-0"></div>
      <p className="text-xs md:text-sm text-slate-400 font-medium italic leading-snug">{left}</p>
    </div>
    <div className="px-6 py-4 text-center bg-brand-50/[0.08] flex items-center justify-center gap-3 transition-colors group-hover:bg-brand-50/20 border-l border-slate-50 min-h-[60px]">
      <div className="bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20 shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      </div>
      <p className="text-sm md:text-base text-slate-900 font-black tracking-tight leading-snug">{right}</p>
    </div>
  </div>
);

export default Benefits;