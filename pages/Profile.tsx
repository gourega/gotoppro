
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, uploadProfilePhoto } from '../services/supabase';
import { BADGES } from '../constants';
import { Loader2, Camera, AlertCircle, CheckCircle2, X, Database } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRLSHint, setShowRLSHint] = useState(false);
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
    setError(null);
    setShowRLSHint(false);
    try {
      // CRITIQUE: On inclut le phoneNumber pour satisfaire les contraintes DB lors de l'upsert
      await saveUserProfile({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        ...formData
      });
      await refreshProfile();
      setSuccess("Profil mis à jour !");
      setTimeout(() => setSuccess(null), 3000);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Erreur Save Profile:", err);
      const isRLS = err.message?.includes('row-level security') || err.message?.includes('policy');
      setError(err.message || "Erreur lors de la sauvegarde");
      if (isRLS) setShowRLSHint(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("La photo est trop lourde (max 2Mo)");
      return;
    }

    setLoading(true);
    setError(null);
    setShowRLSHint(false);
    try {
      const url = await uploadProfilePhoto(file, user.uid);
      // On inclut aussi le phoneNumber ici par sécurité
      await saveUserProfile({ 
        uid: user.uid, 
        phoneNumber: user.phoneNumber,
        photoURL: url 
      });
      await refreshProfile();
      setSuccess("Photo mise à jour !");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Erreur Upload Process:", err);
      const isRLS = err.message?.includes('row-level security') || err.message?.includes('policy');
      setError(err.message || "Erreur lors de l'upload");
      if (isRLS) setShowRLSHint(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Notifications Flottantes */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 max-w-xs md:max-w-md">
        {error && (
          <div className="bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-col gap-3 animate-in slide-in-from-right duration-300 border border-rose-400">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4 opacity-50" /></button>
            </div>
            {showRLSHint && (
              <div className="bg-rose-900/30 p-3 rounded-xl border border-rose-400/30">
                <p className="text-[9px] leading-relaxed font-medium">
                  <Database className="w-3 h-3 inline mr-1" />
                  <b>Configuration Supabase :</b> Votre politique RLS semble bloquer l'écriture.
                  Vérifiez le SQL Editor.
                </p>
              </div>
            )}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 border border-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-[10px] font-black uppercase tracking-widest">{success}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
        <div className="h-40 bg-gradient-to-r from-brand-900 to-brand-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        
        <div className="px-8 pb-12">
          <div className="relative -mt-20 mb-8 flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="h-40 w-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl overflow-hidden border-4 border-white group relative">
              <div className="h-full w-full rounded-[2rem] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className={`w-full h-full object-cover transition-opacity ${loading ? 'opacity-30' : 'opacity-100'}`} />
                ) : (
                  <span className="text-5xl font-black text-slate-300">{user.firstName?.[0] || 'U'}</span>
                )}
                
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                  </div>
                )}

                <label className="absolute inset-0 bg-brand-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                  <Camera className="w-6 h-6 text-white mb-2" />
                  <span className="text-white text-[8px] font-black uppercase tracking-[0.2em]">Changer</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={loading} />
                </label>
              </div>
            </div>
            <div className="pb-4 text-center md:text-left">
              <h1 className="text-3xl font-serif font-bold text-slate-900 leading-tight">
                {user.firstName || 'Utilisateur'} {user.lastName}
              </h1>
              <p className="text-brand-600 font-black tracking-widest text-sm mt-1">{user.phoneNumber}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Configuration Business</h2>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="text-brand-600 font-black text-[10px] uppercase tracking-widest bg-brand-50 px-4 py-2 rounded-xl hover:bg-brand-100 transition-all"
                  >
                    Modifier le profil
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Prénom</label>
                      <input 
                        type="text" 
                        value={formData.firstName} 
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-slate-900"
                        placeholder="Ex: Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Nom</label>
                      <input 
                        type="text" 
                        value={formData.lastName} 
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-slate-900"
                        placeholder="Ex: Kouassi"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Enseigne du Salon / Institut</label>
                    <input 
                      type="text" 
                      value={formData.establishmentName} 
                      onChange={e => setFormData({...formData, establishmentName: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-slate-900"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={loading} className="px-10 py-5 bg-brand-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-700 disabled:opacity-50 shadow-xl shadow-brand-100 flex items-center gap-2">
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Sauvegarder
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-10 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">Annuler</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50/50 p-10 rounded-[2.5rem] grid grid-cols-1 sm:grid-cols-2 gap-10 border border-slate-100 shadow-inner">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Établissement</p>
                      <p className="font-bold text-slate-900 text-xl">{user.establishmentName || 'Non renseigné'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut Elite</p>
                      <p className="font-black text-brand-600 text-xl flex items-center gap-2">
                        {user.role}
                        {user.role !== 'CLIENT' && <CheckCircle2 className="w-5 h-5" />}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vérification</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {user.isActive ? 'Compte Actif' : 'En attente'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscription</p>
                      <p className="font-bold text-slate-600">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Tableau des Trophées</h2>
              <div className="grid grid-cols-2 gap-4">
                {BADGES.map(badge => {
                  const hasBadge = user.badges.includes(badge.id);
                  return (
                    <div key={badge.id} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center text-center transition-all duration-700 relative group ${hasBadge ? 'bg-brand-50 border-brand-100 scale-100 shadow-lg shadow-brand-500/5' : 'bg-slate-50 border-transparent opacity-20 grayscale scale-95'}`}>
                      <span className="text-4xl mb-3">{badge.icon}</span>
                      <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest leading-tight">{badge.name}</p>
                      {hasBadge && (
                         <div className="absolute top-2 right-2 h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                           <CheckCircle2 className="w-2 h-2 text-white" />
                         </div>
                      )}
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
