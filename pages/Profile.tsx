
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, uploadProfilePhoto, getAllUsers, getReferrals } from '../services/supabase';
import { BADGES } from '../constants';
import { 
  Loader2, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Users, 
  Search, 
  Handshake, 
  Copy,
  Check,
  ChevronRight,
  UserPlus,
  Info,
  Quote
} from 'lucide-react';
import { UserProfile } from '../types';

const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  
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
    yearsOfExistence: user?.yearsOfExistence || 0,
    referredBy: user?.referredBy || ''
  });

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
        console.warn("Impossible de charger les filleuls (colonne peut-être manquante)");
      }
    }
  };

  const fetchSponsors = async () => {
    try {
      const data = await getAllUsers();
      // On filtre pour ne pas se parrainer soi-même et ne pas proposer les admins
      setAllPotentialSponsors(data.filter(u => u.uid !== user?.uid && !u.isAdmin));
    } catch (err) {
      console.error("Erreur chargement parrains", err);
    }
  };

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await saveUserProfile({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        ...formData
      });
      await refreshProfile();
      showNotification("Profil mis à jour !");
      setIsEditing(false);
    } catch (err: any) {
      if (err.message?.includes('referredBy')) {
        showNotification("Erreur base de données : La colonne 'referredBy' est manquante.", "error");
      } else {
        showNotification(err.message || "Erreur sauvegarde", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyRefLink = () => {
    const link = `${window.location.origin}/#/login?ref=${user.phoneNumber}`;
    navigator.clipboard.writeText(link);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  // On nettoie la recherche pour être plus flexible
  const filteredSponsors = allPotentialSponsors.filter(s => {
    const search = sponsorSearch.toLowerCase().replace(/\s/g, '');
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase().replace(/\s/g, '');
    const phone = (s.phoneNumber || '').replace(/\s/g, '');
    
    return fullName.includes(search) || phone.includes(search);
  }).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Notifications */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3">
        {error && (
          <div className="bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
            <AlertCircle className="w-5 h-5" />
            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-[10px] font-black uppercase tracking-widest">{success}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="h-40 bg-brand-900 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        
        <div className="px-8 pb-12">
          {/* Avatar & Header Profile */}
          <div className="relative -mt-20 mb-12 flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="h-40 w-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl overflow-hidden border-4 border-white group relative">
              <div className="h-full w-full rounded-[2rem] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-slate-300">{user.firstName?.[0] || 'U'}</span>
                )}
                <label className="absolute inset-0 bg-brand-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                  <Camera className="w-6 h-6 text-white mb-2" />
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadProfilePhoto(file, user.uid);
                      await saveUserProfile({ uid: user.uid, photoURL: url });
                      refreshProfile();
                    }
                  }} />
                </label>
              </div>
            </div>
            <div className="pb-4 flex-grow text-center md:text-left">
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-1">{user.firstName} {user.lastName}</h1>
              <p className="text-brand-600 font-black tracking-widest text-sm mb-4">{user.phoneNumber}</p>
              
              <button 
                onClick={copyRefLink}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-50 text-brand-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-100 transition-all shadow-sm border border-brand-200"
              >
                {copying ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copying ? 'Lien copié !' : 'Mon lien de parrainage'}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-12">
            {/* Colonne Principale */}
            <div className="md:col-span-8 space-y-12">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Configuration Business</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-brand-600 font-black text-[10px] uppercase tracking-widest bg-brand-50 px-5 py-2.5 rounded-xl border border-brand-100 hover:bg-brand-100 transition-all">Modifier le profil</button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Prénom</label>
                      <input type="text" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nom</label>
                      <input type="text" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" />
                    </div>
                  </div>

                  {/* Barre de Recherche de Parrain */}
                  {!user.referredBy && (
                    <div className="p-8 bg-brand-50/30 rounded-[2.5rem] border border-brand-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Handshake className="w-20 h-20" /></div>
                      <label className="block text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-4">Parrainage : Qui vous a invité ?</label>
                      <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                        <input 
                          type="text" 
                          placeholder="Rechercher par nom ou numéro..." 
                          value={sponsorSearch}
                          onChange={e => setSponsorSearch(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-brand-200 text-sm font-bold shadow-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                        />
                      </div>
                      
                      {sponsorSearch && (
                        <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                          {filteredSponsors.map(s => (
                            <button 
                              key={s.uid}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, referredBy: s.uid});
                                setSponsorSearch('');
                                showNotification(`Parrain sélectionné : ${s.firstName}`);
                              }}
                              className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-500 hover:text-white rounded-2xl transition-all border border-brand-100 group shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center font-black text-brand-600 text-[10px] group-hover:bg-white/20 group-hover:text-white">
                                  {s.firstName?.[0]}
                                </div>
                                <span className="text-xs font-bold">{s.firstName} {s.lastName}</span>
                              </div>
                              <UserPlus className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                            </button>
                          ))}
                          {filteredSponsors.length === 0 && (
                            <div className="bg-white/50 p-4 rounded-xl text-center space-y-2">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aucun gérant trouvé</p>
                              <p className="text-[8px] text-slate-400 italic">Astuce : Vous ne pouvez pas vous parrainer vous-même.</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {formData.referredBy && !sponsorSearch && (
                         <div className="mt-4 flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Parrain sélectionné avec succès</p>
                            <button type="button" onClick={() => setFormData({...formData, referredBy: ''})} className="text-[10px] font-black text-rose-500 uppercase">Annuler</button>
                         </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Établissement</label>
                    <input type="text" placeholder="Nom du Salon" value={formData.establishmentName} onChange={e => setFormData({...formData, establishmentName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Ma Bio / Mon Histoire</label>
                    <textarea 
                      placeholder="Racontez votre parcours ou votre vision..." 
                      value={formData.bio} 
                      onChange={e => setFormData({...formData, bio: e.target.value})} 
                      rows={4}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-brand-500/20 outline-none resize-none" 
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={loading} className="flex-grow bg-brand-600 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-3">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Sauvegarder les modifications
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-5 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-50 transition-all">Annuler</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-12 animate-in fade-in duration-500">
                  {/* Bio Display Section */}
                  {user.bio && (
                    <div className="relative p-10 bg-brand-50/20 rounded-[3rem] border border-brand-100/30 overflow-hidden group">
                      <div className="absolute top-6 left-6 opacity-10 text-brand-500 pointer-events-none group-hover:scale-110 transition-transform">
                        <Quote className="w-12 h-12" />
                      </div>
                      <p className="text-xl font-serif italic text-slate-700 leading-relaxed pl-6 relative z-10">
                        {user.bio}
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-50/80 p-10 rounded-[3rem] grid grid-cols-2 gap-10 border border-slate-100 shadow-sm">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Établissement</p>
                      <p className="font-bold text-slate-900 text-lg">{user.establishmentName || 'Non défini'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Taille Équipe</p>
                      <p className="font-black text-brand-600 flex items-center gap-2 text-lg"><Users className="w-5 h-5" /> {user.employeeCount || 0} employés</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Expérience Salon</p>
                      <p className="font-bold text-slate-900 text-lg">{user.yearsOfExistence || 0} ans</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut Compte</p>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                        {user.isActive ? 'ACTIF' : 'SUSPENDU'}
                      </span>
                    </div>
                  </div>

                  {/* Bande Horizontale des Ambassadeurs (Filleuls) */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <Handshake className="w-4 h-4 text-brand-500" />
                        Mes Ambassadeurs ({filleuls.length})
                      </h3>
                      {filleuls.length > 0 && <span className="text-[9px] font-bold text-slate-400 italic">Faites glisser pour voir tout le monde</span>}
                    </div>
                    
                    <div className="flex gap-6 overflow-x-auto pb-6 pt-2 custom-scrollbar no-scrollbar scroll-smooth">
                      {filleuls.length > 0 ? filleuls.map(f => (
                        <div key={f.uid} className="flex-shrink-0 group text-center space-y-3 w-20">
                          <div className="h-20 w-20 rounded-[1.8rem] overflow-hidden border-2 border-slate-100 group-hover:border-brand-500 group-hover:scale-105 transition-all shadow-md bg-white p-1">
                            {f.photoURL ? (
                              <img src={f.photoURL} className="w-full h-full object-cover rounded-[1.4rem]" alt={f.firstName} />
                            ) : (
                              <div className="h-full w-full bg-slate-50 flex items-center justify-center font-black text-slate-300 rounded-[1.4rem] text-xl">
                                {f.firstName?.[0]}
                              </div>
                            )}
                          </div>
                          <p className="text-[9px] font-black uppercase text-slate-600 truncate w-full group-hover:text-brand-600">{f.firstName}</p>
                        </div>
                      )) : (
                        <div className="w-full py-12 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aucun ambassadeur pour le moment</p>
                          <button onClick={copyRefLink} className="text-[9px] font-black text-brand-500 uppercase tracking-widest bg-brand-50 px-4 py-2 rounded-xl">Partager mon lien</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Trophées */}
            <div className="md:col-span-4 space-y-10">
              <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-4 mb-8">Tableau des trophées</h2>
                <div className="grid grid-cols-2 gap-4">
                  {BADGES.map(badge => (
                    <div 
                      key={badge.id} 
                      title={badge.description}
                      className={`p-5 rounded-[2rem] border-2 flex flex-col items-center text-center transition-all duration-700 ${
                        user.badges.includes(badge.id) 
                          ? 'bg-white border-brand-100 shadow-lg shadow-brand-500/5 opacity-100 scale-100' 
                          : 'bg-slate-100 border-transparent opacity-30 grayscale scale-90'
                      }`}
                    >
                      <span className="text-4xl mb-3">{badge.icon}</span>
                      <p className="text-[9px] font-black uppercase tracking-tight text-slate-600">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {user.referredBy && (
                <div className="p-8 bg-brand-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform"><Handshake className="w-16 h-16"/></div>
                   <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-4">Mon Mentor</p>
                   <p className="text-lg font-serif italic mb-2">Inscrit grâce à un expert du réseau Go'Top Pro.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
