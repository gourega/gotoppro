
import React, { useState } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createAnnouncement, updateUserProfile } from '../services/supabase';
import { createCoachChat } from '../services/geminiService';
import { 
  Megaphone, 
  ChevronLeft, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Send,
  MessageCircle,
  Clock,
  Zap,
  Info,
  CreditCard,
  Check
} from 'lucide-react';
import { AnnouncementType } from '../types';
import { COACH_KITA_WAVE_NUMBER, COACH_KITA_PHONE } from '../constants';

const PublishAd: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [paymentOption, setPaymentOption] = useState<'single' | 'pack'>('single');
  
  const [formData, setFormData] = useState({
    type: 'RECRUTEMENT' as AnnouncementType,
    title: '',
    description: '',
    proposedPrice: 0
  });

  const hasCredits = (user?.announcementCredits || 0) > 0;

  const handleAISuggest = async () => {
    if (!formData.title || loading) return;
    setLoading(true);
    try {
      const chat = createCoachChat();
      const response = await chat.sendMessage({ 
        message: `Rédige une annonce attractive pour un salon de coiffure. Titre: "${formData.title}". Type: ${formData.type}. Sois professionnel et persuasif.` 
      });
      setFormData({ ...formData, description: response.text || '' });
    } catch (e) {
      alert("IA indisponible, écrivez manuellement.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title || !formData.description) return;
    setLoading(true);
    try {
      if (hasCredits) {
        // Utilisation d'un crédit prépayé
        await createAnnouncement(user.uid, {
          ...formData,
          contactPhone: user.phoneNumber,
          establishmentName: user.establishmentName || "Salon Indépendant"
        }, true); // true = active immédiatement
        
        await updateUserProfile(user.uid, { 
          announcementCredits: Math.max(0, user.announcementCredits - 1) 
        });
        await refreshProfile();
        setStep('success');
      } else {
        // Enregistrement en attente de paiement
        await createAnnouncement(user.uid, {
          ...formData,
          contactPhone: user.phoneNumber,
          establishmentName: user.establishmentName || "Salon Indépendant"
        });
        setStep('payment');
      }
    } catch (err) {
      alert("Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-brand-900 pt-20 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
           <button onClick={() => navigate('/dashboard')} className="mb-8 text-white/40 hover:text-white flex items-center gap-2 mx-auto font-black text-[10px] uppercase tracking-widest group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour Dashboard
           </button>
           <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
              <Megaphone className="w-4 h-4" /> Journal des Opportunités
           </div>
           <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Publiez votre <span className="text-brand-500 italic">Annonce</span></h1>
           <p className="text-slate-300 text-lg max-w-2xl mx-auto opacity-80 font-medium">
             {hasCredits 
                ? `Il vous reste ${user.announcementCredits} crédit(s). Votre annonce sera publiée instantanément.`
                : "Recrutez les meilleurs talents ou trouvez du matériel de qualité au sein de la communauté Go'Top Pro."
             }
           </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-20">
        {step === 'form' ? (
          <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-slate-100">
             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                   {(['RECRUTEMENT', 'FREELANCE', 'VENTE_MATERIEL'] as AnnouncementType[]).map(t => (
                     <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.type === t ? 'bg-brand-900 text-white border-brand-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}>
                        {t.replace('_', ' ')}
                     </button>
                   ))}
                </div>

                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Titre de l'annonce</label>
                   <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Recherche Tresseuse Passionnée" className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold text-lg outline-none focus:ring-2 focus:ring-brand-500/20" required />
                </div>

                <div>
                   <div className="flex justify-between items-center mb-3 px-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                      <button type="button" onClick={handleAISuggest} disabled={!formData.title || loading} className="flex items-center gap-2 text-brand-600 font-black text-[10px] uppercase hover:underline">
                         <Sparkles className="w-3 h-3" /> Aide de Kita IA
                      </button>
                   </div>
                   <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Détaillez votre offre ou votre besoin..." className="w-full px-8 py-6 rounded-3xl bg-slate-50 font-medium text-lg outline-none focus:ring-2 focus:ring-brand-500/20 min-h-[200px] resize-none" required />
                </div>

                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Prix / Salaire proposé (Optionnel)</label>
                   <input type="number" value={formData.proposedPrice || ''} onChange={e => setFormData({...formData, proposedPrice: Number(e.target.value)})} placeholder="Ex: 50000" className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-black text-lg outline-none" />
                </div>

                {!hasCredits && (
                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Option de parution</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                           type="button" 
                           onClick={() => setPaymentOption('single')}
                           className={`p-6 rounded-[2rem] border-2 text-left transition-all ${paymentOption === 'single' ? 'bg-brand-50 border-brand-500' : 'bg-white border-slate-100'}`}
                        >
                           <p className={`text-[10px] font-black uppercase mb-1 ${paymentOption === 'single' ? 'text-brand-600' : 'text-slate-400'}`}>A l'unité</p>
                           <p className="text-2xl font-black text-slate-900">200 F</p>
                           <p className="text-[9px] font-bold text-slate-500 mt-2">Visibilité 7 jours</p>
                        </button>
                        <button 
                           type="button" 
                           onClick={() => setPaymentOption('pack')}
                           className={`p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden ${paymentOption === 'pack' ? 'bg-amber-50 border-amber-500' : 'bg-white border-slate-100'}`}
                        >
                           <div className="absolute top-4 right-4 bg-amber-500 text-white p-1 rounded-full"><Zap className="w-3 h-3" /></div>
                           <p className={`text-[10px] font-black uppercase mb-1 ${paymentOption === 'pack' ? 'text-amber-600' : 'text-slate-400'}`}>Forfait Économique</p>
                           <p className="text-2xl font-black text-slate-900">1 000 F</p>
                           <p className="text-[9px] font-black text-amber-600 mt-2 uppercase">Pack 10 Annonces (100F/u)</p>
                        </button>
                     </div>
                  </div>
                )}

                <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                   <Info className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                   <p className="text-[11px] font-medium text-amber-900 leading-relaxed italic">
                      {hasCredits 
                        ? `Vous utilisez 1 crédit d'annonce. Votre parution sera immédiatement visible dans l'onglet "Opportunités".`
                        : "Gérant, votre annonce sera visible pendant 7 jours. Choisissez le forfait qui vous convient le mieux."
                      }
                   </p>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-brand-900 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all">
                   {loading ? <Loader2 className="animate-spin" /> : hasCredits ? <Zap className="w-5 h-5 text-amber-500" /> : <CheckCircle2 className="w-5 h-5 text-amber-500" />} 
                   {hasCredits ? "Publier immédiatement (1 crédit)" : "Valider mon annonce"}
                </button>
             </form>
          </div>
        ) : step === 'payment' ? (
          <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl text-center animate-in zoom-in-95">
             <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <Clock className="w-12 h-12" />
             </div>
             <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Paiement en attente</h2>
             <p className="text-slate-500 text-lg mb-12 leading-relaxed max-w-xl mx-auto">
                Votre annonce est enregistrée. Pour l'activer, réglez <strong>{paymentOption === 'single' ? '200 F CFA' : '1 000 F CFA'}</strong> via Wave au <strong>{COACH_KITA_WAVE_NUMBER}</strong>.
             </p>
             <button onClick={() => {
                const text = `Bonjour Coach Kita, je souhaite activer mon annonce "${formData.title}" (${paymentOption === 'single' ? '200F' : 'Pack 1000F'}) pour mon salon "${user.establishmentName}".`;
                window.open(`https://wa.me/${COACH_KITA_PHONE.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                navigate('/dashboard');
             }} className="w-full bg-emerald-500 text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all">
                <MessageCircle className="w-6 h-6" /> Confirmer sur WhatsApp
             </button>
          </div>
        ) : (
          <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl text-center animate-in zoom-in-95">
             <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <Check className="w-12 h-12" />
             </div>
             <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Annonce Publiée !</h2>
             <p className="text-slate-500 text-lg mb-12 leading-relaxed max-w-xl mx-auto">
                Félicitations gérant ! Votre annonce est en ligne. Vous pouvez la consulter dans l'onglet <strong>Opportunités</strong> de l'annuaire public.
             </p>
             <button onClick={() => navigate('/nos-gerants')} className="w-full bg-brand-900 text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-4 hover:bg-black transition-all">
                Voir l'annuaire public
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishAd;
