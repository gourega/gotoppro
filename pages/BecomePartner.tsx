import React, { useState } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { saveUserProfile, getProfileByPhone, generateUUID } from '../services/supabase';
import { COACH_KITA_AVATAR, COACH_KITA_PHONE } from '../constants';
import { 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Handshake, 
  TrendingUp, 
  MessageCircle,
  Loader2,
  ShieldCheck,
  Zap
} from 'lucide-react';

const BecomePartner: React.FC = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let cleanPhone = formData.whatsapp.replace(/\s/g, '').replace(/[^\d+]/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
      if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;

      const existing = await getProfileByPhone(cleanPhone);
      if (existing) {
        alert("Ce numéro est déjà enregistré. Veuillez vous connecter.");
        navigate('/login');
        return;
      }

      const newUser: any = { 
        uid: generateUUID(), 
        phoneNumber: cleanPhone, 
        pinCode: '1234', 
        firstName: formData.firstName, 
        lastName: formData.lastName,
        role: 'PARTNER', 
        isActive: false, // Doit être validé par l'admin
        isAdmin: false, 
        isPublic: false,
        isKitaPremium: false,
        createdAt: new Date().toISOString(),
        marketingCredits: 0,
        badges: [],
        purchasedModuleIds: [],
        pendingModuleIds: ["REQUEST_PARTNER"]
      };

      await saveUserProfile(newUser);
      setSuccess(true);
    } catch (err) {
      alert("Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0c4a6e] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in-95">
          <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Demande reçue !</h2>
          <p className="text-slate-500 mb-10 leading-relaxed italic">
            Coach Kita examine votre profil de partenaire. Vous recevrez un accès dès validation de votre compte.
          </p>
          <button 
            onClick={() => window.open(`https://wa.me/${COACH_KITA_PHONE.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent("Bonjour Coach Kita, je viens de m'inscrire comme Partenaire Stratégique.")}`, '_blank')}
            className="w-full bg-[#10b981] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl"
          >
            <MessageCircle className="w-5 h-5" /> Presser le Mentor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-brand-900 pt-20 pb-40 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            <Handshake className="w-4 h-4" /> Programme Partenaire Excellence
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Monétisez votre <span className="text-amber-500 italic">réseau</span></h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto opacity-80 leading-relaxed font-medium">
            Devenez Apporteur d'Affaires pour Go'Top Pro et touchez une commission de 10% sur chaque salon propulsé.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
              <h2 className="text-2xl font-serif font-bold mb-10 text-slate-900">Vos avantages Partenaire</h2>
              <div className="space-y-10">
                <BenefitItem 
                  icon={<Zap className="text-amber-500" />} 
                  title="Gain Immédiat" 
                  desc="10% de commission (1 500 FCFA) sur chaque Pack Excellence Totale vendu via votre lien." 
                />
                <BenefitItem 
                  icon={<TrendingUp className="text-emerald-500" />} 
                  title="Croissance Élite" 
                  desc="Aidez les gérants de votre réseau à devenir plus rentables grâce aux outils de Coach Kita." 
                />
                <BenefitItem 
                  icon={<ShieldCheck className="text-brand-600" />} 
                  title="Tableau de Bord Privé" 
                  desc="Suivez vos filleuls et vos commissions en temps réel sur votre espace sécurisé." 
                />
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 sticky top-28">
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-8 text-center">Postuler au programme</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Prénom" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold" 
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="Nom de famille" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold" 
                    required 
                  />
                  <input 
                    type="tel" 
                    placeholder="Votre WhatsApp (07...)" 
                    value={formData.whatsapp} 
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold" 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  Devenir Partenaire
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BenefitItem = ({ icon, title, desc }: any) => (
  <div className="flex items-start gap-6">
    <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">{icon}</div>
    <div>
      <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default BecomePartner;