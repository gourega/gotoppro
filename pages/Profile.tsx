import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, uploadProfilePhoto } from '../services/supabase';
import { BADGES } from '../constants';

const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    establishmentName: user?.establishmentName || '',
    email: user?.email || ''
  });

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveUserProfile({
        uid: user.uid,
        ...formData
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      alert("Erreur lors de la sauvegarde du profil");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadProfilePhoto(file, user.uid);
      await saveUserProfile({ uid: user.uid, photoURL: url });
      await refreshProfile();
    } catch (err) {
      alert("Erreur lors de l'upload de la photo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
        <div className="h-40 bg-gradient-to-r from-brand-600 to-brand-400"></div>
        <div className="px-8 pb-12">
          <div className="relative -mt-20 mb-8 flex items-end gap-8">
            <div className="h-40 w-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl overflow-hidden border-4 border-white">
              <div className="h-full w-full rounded-[2rem] bg-slate-50 flex items-center justify-center relative group overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-slate-200">{user.firstName?.[0] || 'U'}</span>
                )}
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Modifier</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={loading} />
                </label>
              </div>
            </div>
            <div className="pb-4">
              <h1 className="text-3xl font-serif font-bold text-slate-900">{user.firstName || 'Utilisateur'} {user.lastName}</h1>
              <p className="text-brand-600 font-bold">{user.phoneNumber}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Informations Pro</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-brand-600 font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Modifier mon profil</button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Prénom</label>
                      <input 
                        type="text" 
                        value={formData.firstName} 
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nom</label>
                      <input 
                        type="text" 
                        value={formData.lastName} 
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nom de l'établissement</label>
                    <input 
                      type="text" 
                      value={formData.establishmentName} 
                      onChange={e => setFormData({...formData, establishmentName: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={loading} className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-700 disabled:opacity-50 shadow-xl shadow-brand-100">Enregistrer</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Annuler</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50/50 p-8 rounded-[2.5rem] grid grid-cols-2 gap-10 border border-slate-100 shadow-inner">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Salon / Institut</p>
                      <p className="font-bold text-slate-900 text-lg">{user.establishmentName || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Niveau</p>
                      <p className="font-bold text-brand-600 text-lg">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Statut Compte</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {user.isActive ? 'Vérifié' : 'Attente validation'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Trophées obtenus</h2>
              <div className="grid grid-cols-2 gap-4">
                {BADGES.map(badge => {
                  const hasBadge = user.badges.includes(badge.id);
                  return (
                    <div key={badge.id} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center text-center transition-all duration-500 ${hasBadge ? 'bg-brand-50 border-brand-100 scale-100' : 'bg-slate-50 border-transparent opacity-20 grayscale scale-95'}`}>
                      <span className="text-4xl mb-3">{badge.icon}</span>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{badge.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;