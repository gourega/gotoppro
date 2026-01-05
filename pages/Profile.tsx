
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
  Database, 
  Users, 
  History, 
  Search, 
  Handshake, 
  Copy,
  Check,
  ChevronRight
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

  // Helper to show notifications with auto-hide functionality
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
      const data = await getReferrals(user.uid);
      setFilleuls(data);
    }
  };

  const fetchSponsors = async () => {
    const data = await getAllUsers();
    setAllPotentialSponsors(data.filter(u => u.uid !== user?.uid && !u.isAdmin));
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
      // Using showNotification instead of manual state management for consistency
      showNotification("Profil mis à jour !");
      setIsEditing(false);
    } catch (err: any) {
      showNotification(err.message || "Erreur sauvegarde", "error");
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

  const filteredSponsors = allPotentialSponsors.filter(s => 
    s.firstName?.toLowerCase().includes(sponsorSearch.toLowerCase()) || 
    s.phoneNumber.includes(sponsorSearch)
  ).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
          <div className="relative -mt-20 mb-8 flex flex-col md:flex-row items-center md:items-end gap-8">
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
            <div className="pb-4 flex-grow">
              <h1 className="text-3xl font-serif font-bold text-slate-900">{user.firstName} {user.lastName}</h1>
              <p className="text-brand-600 font-black tracking-widest text-sm">{user.phoneNumber}</p>
              
              <button 
                onClick={copyRefLink}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-50 hover:text-brand-600 transition-all"
              >
                {copying ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copying ? 'Lien copié !' : 'Mon lien de parrainage'}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Configuration Business</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-brand-600 font-black text-[10px] uppercase tracking-widest bg-brand-50 px-4 py-2 rounded-xl">Modifier</button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <input type="text" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" />
                    <input type="text" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" />
                  </div>

                  {/* Recherche de Parrain */}
                  {!user.referredBy && (
                    <div className="p-6 bg-brand-50/50 rounded-3xl border border-brand-100">
                      <label className="block text-[9px] font-black text-brand-600 uppercase tracking-widest mb-3">Rechercher mon parrain</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                        <input 
                          type="text" 
                          placeholder="Nom ou Téléphone..." 
                          value={sponsorSearch}
                          onChange={e => setSponsorSearch(e.target.value)}
                          className="w-full pl-12 pr-6 py-3 rounded-xl bg-white border border-brand-200 text-sm font-bold"
                        />
                      </div>
                      {sponsorSearch && (
                        <div className="mt-3 space-y-2">
                          {filteredSponsors.map(s => (
                            <button 
                              key={s.uid}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, referredBy: s.uid});
                                setSponsorSearch('');
                                // Fixed error by defining showNotification in the component scope
                                showNotification(`Parrain sélectionné : ${s.firstName}`);
                              }}
                              className="w-full flex items-center justify-between p-3 bg-white hover:bg-brand-500 hover:text-white rounded-xl transition-all border border-brand-100 group"
                            >
                              <span className="text-xs font-bold">{s.firstName} {s.lastName}</span>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <input type="text" placeholder="Nom du Salon" value={formData.establishmentName} onChange={e => setFormData({...formData, establishmentName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" />
                  
                  <div className="flex gap-4">
                    <button type="submit" disabled={loading} className="bg-brand-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase">Sauvegarder</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 font-black text-[10px] uppercase">Annuler</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="bg-slate-50/50 p-8 rounded-[2.5rem] grid grid-cols-2 gap-8 border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Établissement</p>
                      <p className="font-bold text-slate-900">{user.establishmentName || 'Cantic'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Équipe</p>
                      <p className="font-black text-brand-600 flex items-center gap-2"><Users className="w-4 h-4" /> {user.employeeCount || 3} pers.</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Expérience</p>
                      <p className="font-bold text-slate-900">{user.yearsOfExistence || 3} ans</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Statut Compte</p>
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">Actif</span>
                    </div>
                  </div>

                  {/* Bande Horizontale des Filleuls (Ambassadeurs) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-amber-500" />
                        Mes Ambassadeurs ({filleuls.length})
                      </h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                      {filleuls.length > 0 ? filleuls.map(f => (
                        <div key={f.uid} className="flex-shrink-0 group text-center space-y-2">
                          <div className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-brand-500 transition-all shadow-sm">
                            {f.photoURL ? (
                              <img src={f.photoURL} className="w-full h-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-slate-100 flex items-center justify-center font-black text-slate-400">{f.firstName?.[0]}</div>
                            )}
                          </div>
                          <p className="text-[8px] font-black uppercase text-slate-500 truncate w-14">{f.firstName}</p>
                        </div>
                      )) : (
                        <p className="text-[10px] text-slate-400 italic">Aucun filleul pour le moment.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Trophées</h2>
              <div className="grid grid-cols-2 gap-4">
                {BADGES.map(badge => (
                  <div key={badge.id} className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center ${user.badges.includes(badge.id) ? 'bg-brand-50 border-brand-100 opacity-100' : 'bg-slate-50 border-transparent opacity-20 grayscale'}`}>
                    <span className="text-3xl mb-2">{badge.icon}</span>
                    <p className="text-[8px] font-black uppercase tracking-tight">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
