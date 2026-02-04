import React, { useState } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/supabase';
import { COACH_KITA_AVATAR, COACH_KITA_WAVE_NUMBER, COACH_KITA_PHONE, COACH_KITA_ESTABLISHMENT } from '../constants';
import { 
  MapPin, 
  CheckCircle2, 
  ChevronLeft, 
  Star, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Globe, 
  MessageCircle, 
  X,
  Loader2,
  Clock,
  Navigation,
  FileText,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const GMB_SERVICE_PRICE = 5000;

const ServiceGMB: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [isAccepted, setIsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [details, setDetails] = useState({
    address: '',
    district: '',
    hours: 'Lun-Sam : 08h-20h, Dim : Fermé',
    services: ''
  });

  const handleRequestService = async () => {
    if (!user || !isAccepted) return;
    setLoading(true);
    try {
      const gmbRequest = {
        gmbStatus: 'PENDING' as const,
        gmbContractSignedAt: new Date().toISOString(),
        pendingModuleIds: [...new Set([...(user.pendingModuleIds || []), "REQUEST_GMB"])]
      };
      await updateUserProfile(user.uid, gmbRequest);
      await refreshProfile();
      setStep('payment');
    } catch (err) {
      alert("Erreur lors de la demande.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    const text = `Bonjour Coach Kita, je viens de signer mon contrat Google Business pour mon établissement "${user?.establishmentName}". J'ai pris connaissance du tarif de ${GMB_SERVICE_PRICE.toLocaleString()} F CFA et des clauses du service.`;
    window.open(`https://wa.me/${COACH_KITA_PHONE.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    navigate('/profile');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-brand-900 pt-20 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
           <button onClick={() => navigate('/profile')} className="mb-8 text-white/40 hover:text-white flex items-center gap-2 mx-auto font-black text-[10px] uppercase tracking-widest group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour Profil
           </button>
           <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-brand-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
              <Globe className="w-4 h-4" /> Expert Google Business
           </div>
           <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Dominez la <span className="text-brand-500 italic">Recherche</span> Locale</h1>
           <p className="text-slate-300 text-lg max-w-2xl mx-auto opacity-80 leading-relaxed font-medium">
             Apparaissez en haut des résultats Google Maps et transformez les recherches de votre quartier en nouveaux clients fidèles.
           </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-20 space-y-12">
        {step === 'info' ? (
          <div className="grid lg:grid-cols-12 gap-12 items-start">
             <div className="lg:col-span-7 space-y-8">
                <section className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-slate-100">
                   <h2 className="text-2xl font-serif font-bold text-slate-900 mb-10">Pourquoi une fiche Google Business optimisée ?</h2>
                   <div className="space-y-10">
                      <Benefit icon={<Navigation className="text-brand-500" />} title="Visibilité Géographique" desc="Soyez trouvé par les clientes qui cherchent 'Coiffure à proximité' ou dans votre quartier." />
                      <Benefit icon={<Star className="text-amber-500" />} title="Preuve Sociale Directe" desc="Permettez à vos clientes de laisser des avis 5 étoiles pour convaincre les nouvelles." />
                      <Benefit icon={<TrendingUp className="text-emerald-500" />} title="Conversion Rapide" desc="Accès direct à votre bouton 'Appeler' ou 'Itinéraire' pour venir directement au salon." />
                   </div>
                </section>

                <section className="bg-brand-50 rounded-[3rem] p-10 border border-brand-100 relative overflow-hidden">
                   <div className="flex items-center gap-4 mb-6">
                      <FileText className="w-6 h-6 text-brand-600" />
                      <h3 className="text-xl font-serif font-bold text-brand-900">Résumé du Contrat de Service</h3>
                   </div>
                   <div className="space-y-4 text-sm text-brand-800 font-medium leading-relaxed italic">
                      <p>• <strong>Objet :</strong> Création, paramétrage et optimisation SEO de votre fiche Google Business.</p>
                      <p>• <strong>Durée :</strong> 12 mois de maintenance technique et support Go'Top Pro inclus.</p>
                      <p>• <strong>Engagement :</strong> Go'Top Pro s'engage à livrer la fiche sous 10 jours après réception des photos et du paiement.</p>
                      <p>• <strong>Tarif :</strong> Investissement unique de {GMB_SERVICE_PRICE.toLocaleString()} F CFA pour l'année en cours.</p>
                   </div>
                </section>
             </div>

             <div className="lg:col-span-5 sticky top-32 space-y-6">
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
                   <h3 className="text-xl font-serif font-bold text-slate-900 mb-8">Signature du Contrat</h3>
                   
                   <div className="space-y-6 mb-10">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Quartier / Zone</label>
                        <input type="text" placeholder="Ex: Cocody Angré 8ème Tranche" value={details.district} onChange={e => setDetails({...details, district: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold border-none outline-none focus:ring-2 focus:ring-brand-500/20 shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Adresse précise</label>
                        <textarea placeholder="Ex: Rue G7, immeuble en face de la pharmacie..." value={details.address} onChange={e => setDetails({...details, address: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold border-none outline-none focus:ring-2 focus:ring-brand-500/20 h-24 resize-none shadow-inner" />
                      </div>
                   </div>

                   <div className="pt-8 border-t border-slate-100 space-y-6">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Investissement</p>
                            <p className="text-4xl font-black text-brand-900">{GMB_SERVICE_PRICE.toLocaleString()} <span className="text-sm opacity-30">F</span></p>
                         </div>
                         <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border border-amber-100">Contrat 12 mois</div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                         <div className="flex items-center gap-2 text-brand-600">
                            <ShieldCheck className="w-4 h-4" />
                            <p className="text-[9px] font-black uppercase tracking-widest">Acte d'Engagement</p>
                         </div>
                         <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="relative flex items-center mt-1">
                               <input type="checkbox" checked={isAccepted} onChange={e => setIsAccepted(e.target.checked)} className="peer h-5 w-5 opacity-0 cursor-pointer absolute" />
                               <div className="h-5 w-5 bg-white border-2 border-slate-200 rounded-lg peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center transition-all group-hover:border-brand-300 shadow-sm">
                                  {isAccepted && <CheckCircle2 className="w-3 h-3 text-white" />}
                               </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 leading-relaxed">
                               Je valide la création de ma fiche Google Maps. Ce document fait office de **Contrat de Prestation de Service** avec {COACH_KITA_ESTABLISHMENT} pour une durée de 12 mois. J'accepte de payer {GMB_SERVICE_PRICE.toLocaleString()} F CFA.
                            </span>
                         </label>
                      </div>

                      <button 
                        onClick={handleRequestService}
                        disabled={!isAccepted || loading || !details.district || !details.address}
                        className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-20 hover:bg-black transition-all"
                      >
                         {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-amber-400" />} 
                         {loading ? 'Traitement...' : 'Signer & Commander'}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl text-center animate-in zoom-in-95">
             <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
             </div>
             <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Contrat Enregistré !</h2>
             <p className="text-slate-500 text-lg mb-12 leading-relaxed max-w-xl mx-auto">
                Gérant, votre demande a été transmise aux Administrateurs. Pour lancer les travaux, réglez la somme de <strong>{GMB_SERVICE_PRICE.toLocaleString()} F CFA</strong> via Wave au <strong>{COACH_KITA_WAVE_NUMBER}</strong>.
             </p>
             <button onClick={handleWhatsAppConfirm} className="w-full max-w-md bg-emerald-500 text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all">
                <MessageCircle className="w-6 h-6" /> Confirmer sur WhatsApp
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Benefit = ({ icon, title, desc }: any) => (
  <div className="flex items-start gap-6">
    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shadow-sm shrink-0">
      {React.cloneElement(icon, { className: "w-7 h-7" })}
    </div>
    <div>
      <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default ServiceGMB;