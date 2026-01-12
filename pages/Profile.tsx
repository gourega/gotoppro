
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, uploadProfilePhoto, getAllUsers, getReferrals, updateUserProfile } from '../services/supabase';
import { BADGES, TRAINING_CATALOG, BRAND_LOGO } from '../constants';
import { 
  Loader2, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Search, 
  Handshake, 
  Copy,
  Check,
  UserPlus,
  Quote,
  Cloud,
  ShieldCheck,
  Lock,
  Calendar,
  Briefcase,
  Eye,
  EyeOff,
  ExternalLink,
  Crown,
  X,
  ChevronRight,
  Download,
  Share2
} from 'lucide-react';
import { UserProfile } from '../types';

const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copyingExpert, setCopyingExpert] = useState(false);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  
  const [filleuls, setFilleuls] = useState<UserProfile[]>([]);
  const [allPotentialSponsors, setAllPotentialSponsors] = useState<UserProfile[]>([]);
  const [sponsorSearch, setSponsorSearch] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    establishmentName: user?.establishmentName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    employeeCount: user?.employeeCount || 0,
    openingYear: user?.openingYear || new Date().getFullYear(),
    referredBy: user?.referredBy || ''
  });

  const isElite = useMemo(() => user?.isKitaPremium || (user?.purchasedModuleIds?.length || 0) >= 16, [user]);
  
  const isCloudActive = useMemo(() => {
    if (isElite) return true;
    if (user?.kitaPremiumUntil) {
      return new Date(user.kitaPremiumUntil) > new Date();
    }
    return false;
  }, [user, isElite]);

  const certifiedModules = useMemo(() => {
    if (!user?.progress) return [];
    return TRAINING_CATALOG.filter(m => {
      const score = user.progress?.[m.id] || 0;
      return score >= 80;
    });
  }, [user]);

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
        employeeCount: user?.employeeCount || 0,
        openingYear: user?.openingYear || new Date().getFullYear(),
        referredBy: user?.referredBy || ''
      });
      fetchFilleuls();
      if (isEditing) fetchSponsors();
    }
  }, [user, isEditing]);

  const fetchFilleuls = async () => {
    if (user) {
      try {
        const data = await getReferrals(user.uid);
        setFilleuls(data);
      } catch (err) {
        console.warn("Erreur chargement filleuls");
      }
    }
  };

  const fetchSponsors = async () => {
    try {
      const data = await getAllUsers();
      setAllPotentialSponsors(data.filter(u => u.uid !== user?.uid && !u.isAdmin));
    } catch (err) {
      console.error("Erreur parrains", err);
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

  const togglePublicStatus = async () => {
    try {
      await updateUserProfile(user.uid, { isPublic: !user.isPublic });
      await refreshProfile();
      showNotification(!user.isPublic ? "Profil désormais public !" : "Profil repassé en privé.");
    } catch (err) {
      showNotification("Erreur de modification de visibilité", "error");
    }
  };

  const copyRefLink = () => {
    const link = `${window.location.origin}/#/login?ref=${user.phoneNumber}`;
    navigator.clipboard.writeText(link);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const copyExpertLink = () => {
    const link = `${window.location.origin}/#/expert/${user.uid}`;
    navigator.clipboard.writeText(link);
    setCopyingExpert(true);
    setTimeout(() => setCopyingExpert(false), 2000);
  };

  const handleDownloadCert = () => {
    window.print();
  };

  const handleShareCert = async (moduleId: string) => {
    const moduleTitle = TRAINING_CATALOG.find(m => m.id === moduleId)?.title || "Formation Go'Top Pro";
    const shareData = {
      title: "Ma Certification d'Excellence",
      text: `Fier(e) d'avoir validé avec succès le module "${moduleTitle}" chez Go'Top Pro ! Découvrez mon expertise ici :`,
      url: user.isPublic ? `${window.location.origin}/#/expert/${user.uid}` : window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyExpertLink();
        showNotification("Lien copié ! Vous pouvez le partager.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSponsors = allPotentialSponsors.filter(s => {
    const search = sponsorSearch.toLowerCase().replace(/\s/g, '');
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase().replace(/\s/g, '');
    return fullName.includes(search) || (s.phoneNumber || '').includes(search);
  }).slice(0, 3);

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
        </div>
        
        <div className="px-8 pb-12">
          <div className="relative -mt-20 mb-12 flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="h-40 w-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl overflow-hidden border-4 border-white group relative">
              <div className="h-full w-full rounded-[2rem] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-5xl font-black text-slate-300">{user.firstName?.[0] || 'U'}</span>}
                <label className="absolute inset-0 bg-brand-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"><Camera className="w-6 h-6 text-white mb-2" /><input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadProfilePhoto(file, user.uid);
                      await saveUserProfile({ uid: user.uid, photoURL: url });
                      refreshProfile();
                    }
                  }} /></label>
              </div>
            </div>
            <div className="pb-4 flex-grow text-center md:text-left">
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-1">{user.firstName} {user.lastName}</h1>
              <p className="text-brand-600 font-black tracking-widest text-sm mb-4">{user.phoneNumber}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button onClick={copyRefLink} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-50 text-brand-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-100 transition-all shadow-sm border border-brand-200">
                  {copying ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copying ? 'Copié !' : 'Lien Parrainage'}
                </button>
                {user.isPublic && (
                   <button onClick={copyExpertLink} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm border border-emerald-200">
                    {copyingExpert ? <Check className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />} {copyingExpert ? 'Lien Expert Copié !' : 'Mon Profil Expert'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-8 space-y-12">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Configuration Business</h2>
                {!isEditing && <button onClick={() => setIsEditing(true)} className="text-brand-600 font-black text-[10px] uppercase tracking-widest bg-brand-50 px-5 py-2.5 rounded-xl border border-brand-100 hover:bg-brand-100 transition-all">Modifier</button>}
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

                  {!user.referredBy && (
                    <div className="p-8 bg-brand-50/30 rounded-[2.5rem] border border-brand-100">
                      <label className="block text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-4">Qui vous a invité ?</label>
                      <input type="text" placeholder="Nom ou numéro..." value={sponsorSearch} onChange={e => setSponsorSearch(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border border-brand-200 text-sm font-bold shadow-sm outline-none" />
                      {sponsorSearch && (
                        <div className="mt-4 space-y-2">
                          {filteredSponsors.map(s => (
                            <button key={s.uid} type="button" onClick={() => { setFormData({...formData, referredBy: s.uid}); setSponsorSearch(''); }} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-500 hover:text-white rounded-2xl transition-all border border-brand-100 group shadow-sm"><span className="text-xs font-bold">{s.firstName} {s.lastName}</span><UserPlus className="w-4 h-4" /></button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Bio / Slogan</label>
                    <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none min-h-[100px]" placeholder="Ex: Expert en coloration et soins d'exception..." />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Nom du Salon</label>
                    <input type="text" placeholder="Nom du Salon" value={formData.establishmentName} onChange={e => setFormData({...formData, establishmentName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Nombre d'employés</label>
                      <div className="relative">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="number" placeholder="Nombre d'employés" value={formData.employeeCount} onChange={e => setFormData({...formData, employeeCount: Number(e.target.value)})} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" />
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

                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={loading} className="flex-grow bg-brand-600 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-3">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Sauvegarder</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-5 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-50 transition-all">Annuler</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-12">
                  <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ${user.isPublic ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                           {user.isPublic ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900">Visibilité Expert</h4>
                           <p className="text-xs text-slate-500">{user.isPublic ? "Votre profil est visible par vos clients et confrères." : "Profil privé. Seul vous pouvez voir vos trophées."}</p>
                        </div>
                     </div>
                     <button 
                        onClick={togglePublicStatus}
                        className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${user.isPublic ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      >
                        {user.isPublic ? 'Rendre Privé' : 'Rendre Public'}
                     </button>
                  </div>

                  {user.bio && (
                    <div className="relative p-10 bg-brand-50/20 rounded-[3rem] border border-brand-100/30 group">
                      <Quote className="absolute top-6 left-6 opacity-10 text-brand-500 w-12 h-12" />
                      <p className="text-xl font-serif italic text-slate-700 leading-relaxed pl-6 relative z-10">{user.bio}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                      <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Établissement</p>
                        <p className="font-bold text-slate-900 text-lg">{user.establishmentName || 'Non défini'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                      <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Taille Équipe</p>
                        <p className="font-bold text-slate-900 text-lg">{user.employeeCount || 0} employé(s)</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                      <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ouvert en</p>
                        <p className="font-bold text-slate-900 text-lg">{user.openingYear || 'Non renseigné'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                      <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Statut</p>
                        <p className="font-bold text-slate-900 text-lg">{isElite ? 'Membre Elite' : 'Standard'}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-8 rounded-[2.5rem] border ${isCloudActive ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} relative overflow-hidden`}>
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
                           {!isCloudActive && <button onClick={() => navigate('/results')} className="mt-4 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all">Activer ma protection</button>}
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-4 space-y-10">
              <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-4 mb-8">Trophées</h2>
                <div className="grid grid-cols-2 gap-4">
                  {BADGES.map(badge => (
                    <div key={badge.id} title={badge.description} className={`p-5 rounded-[2rem] border-2 flex flex-col items-center text-center transition-all ${user.badges.includes(badge.id) ? 'bg-white border-brand-100 shadow-lg scale-100' : 'bg-slate-100 border-transparent opacity-30 grayscale scale-90'}`}>
                      <span className="text-4xl mb-3">{badge.icon}</span><p className="text-[9px] font-black uppercase tracking-tight text-slate-600">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {certifiedModules.length > 0 && (
                <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
                  <h2 className="text-[11px] font-black text-brand-600 uppercase tracking-[0.2em] border-b border-slate-100 pb-4 mb-8">Mes Parchemins</h2>
                  <div className="space-y-4">
                    {certifiedModules.map(m => (
                      <button 
                        key={m.id} 
                        onClick={() => setSelectedCert(m.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-brand-50 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                           <ShieldCheck className="w-4 h-4 text-emerald-500" />
                           <span className="text-[10px] font-bold text-slate-700 text-left line-clamp-1 group-hover:text-brand-900">{m.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Certificat */}
      {selectedCert && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
           <div className="max-w-2xl w-full animate-in zoom-in-95 duration-300">
              <div className="bg-white border-[12px] border-double border-slate-100 p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden shadow-2xl print:shadow-none print:border-none print:rounded-none">
                <button onClick={() => setSelectedCert(null)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-rose-500 hover:text-white transition-all print:hidden"><X /></button>
                <div className="absolute top-0 left-0 w-full h-full border-[1px] border-slate-200 pointer-events-none rounded-[2.5rem] m-1.5 print:hidden"></div>
                <div className="relative z-10">
                  <div className="mb-10">
                    <Crown className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                    <h2 className="text-[10px] font-black text-brand-900 uppercase tracking-[0.5em] mb-3">Certificat d'Excellence Go'Top Pro</h2>
                    <div className="h-px w-20 bg-brand-200 mx-auto"></div>
                  </div>
                  <p className="text-lg font-serif text-slate-500 mb-6 italic">Ce document atteste que l'expert(e)</p>
                  <h3 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-8 tracking-tight">{user.firstName} {user.lastName}</h3>
                  <p className="text-md font-medium text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
                    A validé avec succès le module de formation magistrale :<br/>
                    <span className="text-brand-900 font-black uppercase tracking-widest text-lg mt-4 block">
                      "{TRAINING_CATALOG.find(m => m.id === selectedCert)?.title}"
                    </span>
                  </p>

                  <div className="flex justify-center gap-4 mb-12 print:hidden">
                    <button 
                      onClick={handleDownloadCert}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-brand-900/20"
                    >
                      <Download className="w-4 h-4" /> Télécharger (PDF)
                    </button>
                    <button 
                      onClick={() => handleShareCert(selectedCert)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      <Share2 className="w-4 h-4" /> Partager
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-2 opacity-30 mt-4">
                     <img src={BRAND_LOGO} alt="" className="h-8 w-8 grayscale" />
                     <p className="text-[8px] font-black uppercase tracking-widest tracking-[0.3em]">Official Certification</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
