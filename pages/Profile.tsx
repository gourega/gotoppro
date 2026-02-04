import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, uploadProfilePhoto, getAllUsers, getReferrals } from '../services/supabase';
import { 
  BADGES, 
  COACH_KITA_SLOGAN, 
  COACH_KITA_TITLE, 
  COACH_KITA_ADDRESS,
  COACH_KITA_EMAIL
} from '../constants';
import { 
  Loader2, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Copy,
  Check,
  UserPlus,
  Quote,
  Cloud,
  ShieldCheck,
  Lock,
  Calendar,
  Briefcase,
  Sparkles,
  Award,
  MapPin,
  Mail,
  Phone,
  Eye,
  EyeOff,
  UserCircle,
  Crown,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  Globe
} from 'lucide-react';
import { UserProfile } from '../types';

const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copying, setCopying] = useState<'collab' | 'owner' | null>(null);
  
  const [filleuls, setFilleuls] = useState<UserProfile[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    establishmentName: user?.establishmentName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    openingYear: user?.openingYear || new Date().getFullYear(),
    referredBy: user?.referredBy || '',
    isPublic: user?.isPublic ?? true
  });

  const isElite = useMemo(() => user?.isKitaPremium || (user?.purchasedModuleIds?.length || 0) >= 16, [user]);
  
  const isCloudActive = useMemo(() => {
    if (isElite) return true;
    if (user?.kitaPremiumUntil) {
      return new Date(user.kitaPremiumUntil) > new Date();
    }
    return false;
  }, [user, isElite]);

  const actualStaffCount = useMemo(() => {
    return filleuls.filter(f => f.role === 'STAFF_ELITE' || f.role === 'STAFF_ADMIN').length;
  }, [filleuls]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        establishmentName: user?.establishmentName || '',
        email: user?.email || '',
        bio: user?.bio || '',
        openingYear: user?.openingYear || new Date().getFullYear(),
        referredBy: user?.referredBy || '',
        isPublic: user?.isPublic ?? true
      });
      fetchFilleuls();
    }
  }, [user]);

  const fetchFilleuls = async () => {
    if (user) {
      try {
        const data = await getReferrals(user.uid);
        setFilleuls(data);
        if (data.length !== user.employeeCount) {
           await saveUserProfile({ uid: user.uid, employeeCount: data.length });
        }
      } catch (err) {
        console.warn("Erreur chargement filleuls");
      }
    }
  };

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await saveUserProfile({ uid: user.uid, phoneNumber: user.phoneNumber, ...formData });
      await refreshProfile();
      showNotification("Profil mis à jour !");
      setIsEditing(false);
    } catch (err: any) {
      showNotification(err.message || "Erreur sauvegarde", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyRefLink = (type: 'collab' | 'owner') => {
    let link = "";
    if (type === 'collab') {
      link = `${window.location.origin}/#/results?ref=${user.phoneNumber}&pack=collaborateur`;
    } else {
      link = `${window.location.origin}/#/quiz?ref=${user.phoneNumber}`;
    }
    navigator.clipboard.writeText(link);
    setCopying(type);
    setTimeout(() => setCopying(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3">
        {error && <div className="bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 font-black text-[10px] uppercase tracking-widest"><AlertCircle className="w-5 h-5" />{error}</div>}
        {success && <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 font-black text-[10px] uppercase tracking-widest"><CheckCircle2 className="w-5 h-5" />{success}</div>}
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="h-40 bg-brand-900 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          {isCloudActive && (
            <div className="absolute top-6 right-8 flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-emerald-400">
               <ShieldCheck className="w-4 h-4" /> Cloud Protégé
            </div>
          )}
          {user.isAdmin && (
            <div className="absolute top-6 left-8 flex items-center gap-2 bg-amber-500 text-brand-900 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-amber-400">
               <Award className="w-4 h-4" /> Mentor Officiel
            </div>
          )}
        </div>
        
        <div className="px-8 pb-12">
          <div className="relative -mt-20 mb-12 flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="h-40 w-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl overflow-hidden border-4 border-white group relative">
              <div className="h-full w-full rounded-[2rem] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-5xl font-black text-slate-300">{user.firstName?.[0] || 'U'}</span>}
                {!user.isAdmin && (
                  <label className="absolute inset-0 bg-brand-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"><Camera className="w-6 h-6 text-white mb-2" /><input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadProfilePhoto(file, user.uid);
                        await saveUserProfile({ uid: user.uid, photoURL: url });
                        refreshProfile();
                      }
                    }} /></label>
                )}
              </div>
            </div>
            <div className="pb-4 flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h1 className="text-4xl font-serif font-bold text-slate-900">{user.firstName} {user.lastName}</h1>
                {user.isAdmin && <Sparkles className="text-amber-500 w-6 h-6 fill-current" />}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-6">
                 <p className="text-brand-600 font-black tracking-widest text-sm">{user.isAdmin ? COACH_KITA_TITLE : user.phoneNumber}</p>
                 {!user.isAdmin && (
                   <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.isPublic ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                        {user.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {user.isPublic ? 'Profil Public' : 'Profil Privé'}
                    </div>
                 )}
              </div>

              {!user.isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto md:mx-0">
                  <button onClick={() => copyRefLink('collab')} className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${copying === 'collab' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'}`}>
                    {copying === 'collab' ? <Check className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                    {copying === 'collab' ? 'Lien copié !' : 'Parrainage Collaborateur'}
                  </button>
                  <button onClick={() => copyRefLink('owner')} className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${copying === 'owner' ? 'bg-brand-900 text-white border-brand-900' : 'bg-white text-brand-900 border-brand-100 hover:bg-brand-50'}`}>
                    {copying === 'owner' ? <Check className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                    {copying === 'owner' ? 'Lien copié !' : 'Parrainer un Propriétaire'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-8 space-y-12">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Configuration Business</h2>
                {(!isEditing && !user.isAdmin) && <button onClick={() => setIsEditing(true)} className="text-brand-600 font-black text-[10px] uppercase tracking-widest bg-brand-50 px-5 py-2.5 rounded-xl border border-brand-100 hover:bg-brand-100 transition-all">Modifier</button>}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Prénom</label>
                      <input type="text" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Nom</label>
                      <input type="text" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                     <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${formData.isPublic ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'}`}>
                        {formData.isPublic ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                     </div>
                     <div className="flex-grow">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visibilité Publique</p>
                        <p className="text-xs font-bold text-slate-600 leading-tight">Autoriser Coach Kita à afficher mon profil dans l'annuaire de l'Excellence.</p>
                     </div>
                     <button 
                        type="button" 
                        onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isPublic ? 'bg-emerald-500' : 'bg-slate-300'}`}
                     >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                     </button>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Nom du Salon</label>
                    <input type="text" placeholder="Nom du Salon" value={formData.establishmentName} onChange={e => setFormData({...formData, establishmentName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="opacity-60 grayscale">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Équipe Élite (Verrouillé)</label>
                      <div className="relative">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="number" readOnly value={actualStaffCount} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-100 border border-slate-200 font-black cursor-not-allowed" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Année d'ouverture</label>
                      <div className="relative">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="number" placeholder="Ex: 2020" value={formData.openingYear} onChange={e => setFormData({...formData, openingYear: Number(e.target.value)})} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Bio Professionnelle</label>
                    <textarea 
                      placeholder="Ex: Gérant passionné avec 10 ans d'expérience..." 
                      value={formData.bio} 
                      onChange={e => setFormData({...formData, bio: e.target.value})} 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none min-h-[150px] resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={loading} className="flex-grow bg-brand-600 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-3">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Sauvegarder</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-5 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-50 transition-all">Annuler</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-12">
                  {/* BLOC VISIBILITÉ GOOGLE - PRIORITÉ HAUTE */}
                  <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-xl relative overflow-hidden group hover:border-brand-500 transition-all">
                     <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform">
                        <Globe className="w-32 h-32 text-brand-900" />
                     </div>
                     <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                           <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${user.gmbStatus === 'ACTIVE' ? 'bg-emerald-500 text-white' : user.gmbStatus === 'PENDING' ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <MapPin className="w-8 h-8" />
                           </div>
                           <div>
                              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Visibilité Google</h3>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className={`w-2 h-2 rounded-full ${user.gmbStatus === 'ACTIVE' ? 'bg-emerald-500' : user.gmbStatus === 'PENDING' ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'}`}></div>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {user.gmbStatus === 'ACTIVE' ? 'Répertorié sur Maps' : user.gmbStatus === 'PENDING' ? 'En cours de création' : 'Non répertorié'}
                                 </span>
                              </div>
                           </div>
                        </div>
                        {user.gmbStatus === 'ACTIVE' ? (
                           <a href={user.gmbUrl} target="_blank" rel="noreferrer" className="bg-brand-50 text-brand-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-100 transition-all">
                              <ExternalLink className="w-4 h-4" /> Voir ma fiche
                           </a>
                        ) : (
                           <button onClick={() => navigate('/services/google-my-business')} className="bg-brand-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand-950 transition-all flex items-center gap-3">
                              {user.gmbStatus === 'PENDING' ? 'Suivre ma demande' : 'Créer ma fiche GMB'}
                              <ChevronRight className="w-4 h-4" />
                           </button>
                        )}
                     </div>
                  </div>

                  {user.bio && (
                    <div className={`relative p-10 rounded-[3rem] border group ${user.isAdmin ? 'bg-brand-900 border-amber-500/30 shadow-2xl' : 'bg-brand-50/20 border-brand-100/30'}`}>
                      <Quote className={`absolute top-6 left-6 opacity-10 w-12 h-12 ${user.isAdmin ? 'text-amber-500' : 'text-brand-500'}`} />
                      <p className={`text-xl font-serif italic leading-relaxed pl-6 relative z-10 ${user.isAdmin ? 'text-slate-200' : 'text-slate-700'}`}>
                        {user.bio}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:bg-white transition-all">
                      <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Établissement</p>
                        <p className="font-bold text-slate-900 text-lg">{user.establishmentName || 'Non défini'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:bg-white transition-all">
                      <div className={`h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${actualStaffCount > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {actualStaffCount > 0 ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Collaborateurs Élite</p>
                        <p className="font-bold text-slate-900 text-lg">{actualStaffCount} actif(s)</p>
                      </div>
                    </div>
                  </div>

                  {user.isAdmin && (
                    <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group shadow-2xl">
                       <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><MapPin className="w-32 h-32 text-white" /></div>
                       <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] mb-8">Siège Social & Contact</h3>
                       <div className="space-y-6 relative z-10">
                          <div className="flex items-start gap-4">
                             <MapPin className="w-5 h-5 text-brand-500 mt-1 shrink-0" />
                             <p className="text-slate-300 font-medium leading-relaxed">{COACH_KITA_ADDRESS}</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <Mail className="w-5 h-5 text-brand-500 shrink-0" />
                             <p className="text-slate-300 font-medium">{COACH_KITA_EMAIL}</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                             <p className="text-slate-300 font-medium">Tél : {user.phoneNumber}</p>
                          </div>
                       </div>
                    </div>
                  )}

                  {!user.isAdmin && (
                    <div className={`p-8 rounded-[2.5rem] border ${isCloudActive ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} relative overflow-hidden shadow-sm`}>
                       <div className="flex items-start gap-6 relative z-10">
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${isCloudActive ? 'bg-white text-emerald-500' : 'bg-white text-amber-500'}`}>{isCloudActive ? <Cloud className="w-7 h-7" /> : <Lock className="w-7 h-7" />}</div>
                          <div>
                             <h3 className={`text-lg font-black uppercase tracking-widest mb-1 ${isCloudActive ? 'text-emerald-900' : 'text-amber-900'}`}>{isCloudActive ? 'Sauvegarde Cloud Active' : 'Sauvegarde Cloud Inactive'}</h3>
                             <p className={`text-sm font-medium leading-relaxed ${isCloudActive ? 'text-emerald-700' : 'text-amber-700'}`}>
                               {isElite 
                                 ? "Protection Cloud illimitée (Statut Membre Élite acquis à vie)." 
                                 : isCloudActive 
                                   ? `Vos chiffres sont sécurisés jusqu'au ${new Date(user.kitaPremiumUntil!).toLocaleDateString('fr-FR')}.` 
                                   : "Vos données de caisse sont sur ce téléphone uniquement. Passez à l'Élite pour les protéger."
                               }
                             </p>
                             {(!isCloudActive) && <button onClick={() => navigate('/results')} className="mt-4 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all">Activer ma protection</button>}
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-4 space-y-10">
              <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-4 mb-8">Trophées</h2>
                <div className="grid grid-cols-2 gap-4">
                  {BADGES.map(badge => {
                    const isUnlocked = user.isAdmin || (Array.isArray(user.badges) && user.badges.includes(badge.id));
                    return (
                      <div 
                        key={badge.id} 
                        title={badge.description} 
                        className={`p-5 rounded-[2rem] border-2 flex flex-col items-center text-center transition-all ${
                          isUnlocked 
                            ? user.isAdmin 
                               ? 'bg-amber-50 border-amber-400 shadow-xl scale-105' 
                               : 'bg-white border-brand-100 shadow-lg scale-100'
                            : 'bg-slate-100 border-transparent opacity-30 grayscale scale-90'
                        }`}
                      >
                        <span className="text-4xl mb-3">{badge.icon}</span>
                        <p className={`text-[9px] font-black uppercase tracking-tight ${isUnlocked && user.isAdmin ? 'text-amber-700' : 'text-slate-600'}`}>
                          {badge.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;