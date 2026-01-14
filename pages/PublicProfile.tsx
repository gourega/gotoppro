
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicProfile } from '../services/supabase';
import { UserProfile } from '../types';
import { COACH_KITA_SLOGAN, BADGES } from '../constants';
import { 
  Loader2, 
  MapPin, 
  Briefcase, 
  Users, 
  Calendar, 
  Award, 
  Quote, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';

const PublicProfile: React.FC = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uid) {
      getPublicProfile(uid).then(data => {
        setProfile(data);
        setLoading(false);
      });
    }
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Profil Introuvable</h1>
        <p className="text-slate-500 mb-8">Ce profil n'existe pas ou n'est plus public.</p>
        <button onClick={() => navigate('/')} className="bg-brand-900 text-white px-8 py-3 rounded-xl font-black uppercase text-xs">Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-brand-900 h-64 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-white/60 hover:text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Retour
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12 border-b border-slate-50 pb-12">
            <div className="h-40 w-40 rounded-[2.5rem] bg-white p-1 shadow-2xl overflow-hidden border-4 border-white shrink-0">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.firstName} className="w-full h-full object-cover rounded-[2rem]" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-[2rem]">
                  <span className="text-5xl font-black text-slate-300">{profile.firstName?.[0] || 'U'}</span>
                </div>
              )}
            </div>
            <div className="text-center md:text-left flex-grow">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-serif font-bold text-slate-900">{profile.firstName} {profile.lastName}</h1>
                <Sparkles className="w-6 h-6 text-brand-500" />
              </div>
              <p className="text-brand-600 font-black tracking-widest text-xs uppercase mb-4">{profile.establishmentName || 'Gérant Indépendant'}</p>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                Membre Certifié Go'Top Pro
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-8 space-y-12">
              {profile.bio && (
                <div className="relative p-10 rounded-[3rem] bg-brand-50/20 border border-brand-100/30">
                  <Quote className="absolute top-6 left-6 opacity-10 w-12 h-12 text-brand-500" />
                  <p className="text-xl font-serif italic text-slate-700 leading-relaxed pl-6 relative z-10">
                    {profile.bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoBox icon={<Briefcase />} label="Etablissement" value={profile.establishmentName || 'Non défini'} color="text-brand-600" />
                <InfoBox icon={<Users />} label="Équipe" value={`${profile.employeeCount || 0} personne(s)`} color="text-emerald-600" />
                <InfoBox icon={<Calendar />} label="Depuis" value={profile.openingYear?.toString() || 'Non renseigné'} color="text-amber-600" />
                <InfoBox icon={<Award />} label="Statut" value="Expert Beauté" color="text-indigo-600" />
              </div>
            </div>

            <div className="md:col-span-4">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 h-fit">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4">Distinctions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {BADGES.map(badge => {
                    const isUnlocked = profile.badges.includes(badge.id);
                    return (
                      <div key={badge.id} className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${isUnlocked ? 'bg-white shadow-lg border-2 border-brand-100' : 'opacity-20 grayscale'}`}>
                        <span className="text-2xl mb-2">{badge.icon}</span>
                        <p className="text-[8px] font-black uppercase text-slate-600">{badge.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-12 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{COACH_KITA_SLOGAN}</p>
            <p className="text-xs text-slate-400">Profil propulsé par l'excellence Go'Top Pro.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ icon, label, value, color }: any) => (
  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
    <div className={`h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="font-bold text-slate-900 text-sm">{value}</p>
    </div>
  </div>
);

export default PublicProfile;
