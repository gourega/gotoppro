
/**
 * ATTENTION : Pour activer le parrainage, exécutez ce SQL dans Supabase :
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "referredBy" TEXT;
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "referralCount" INTEGER DEFAULT 0;
 */

import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', uid)
      .maybeSingle();

    if (error) return null;
    return data as UserProfile;
  } catch (err) {
    return null;
  }
};

export const getProfileByPhone = async (phoneNumber: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phoneNumber', phoneNumber)
      .maybeSingle();
      
    if (error) return null;
    return data as UserProfile;
  } catch (err) {
    return null;
  }
};

export const getReferrals = async (uid: string): Promise<UserProfile[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('referredBy', uid);
    
    if (error) {
      console.warn("Colonne referredBy absente ou erreur:", error.message);
      return [];
    }
    return data as UserProfile[];
  } catch (err) {
    return [];
  }
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  
  const { uid, ...dataToUpdate } = profile;

  // Si on met à jour le parrain, on incrémente aussi le compteur du parrain
  if (dataToUpdate.referredBy) {
    try {
      const parrain = await getUserProfile(dataToUpdate.referredBy);
      if (parrain) {
        const newCount = (parrain.referralCount || 0) + 1;
        await supabase.from('profiles').update({ referralCount: newCount }).eq('uid', parrain.uid);
      }
    } catch (e) {
      console.warn("Impossible de mettre à jour le compteur du parrain (colonne peut-être absente)");
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update(dataToUpdate)
    .eq('uid', uid);
  
  if (error) throw new Error(error.message);
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data as UserProfile[];
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs:", err);
    return [];
  }
};

export const grantModuleAccess = async (uid: string, moduleId: string) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const newPurchased = [...new Set([...(profile.purchasedModuleIds || []), moduleId])];
  const { error } = await supabase
    .from('profiles')
    .update({ purchasedModuleIds: newPurchased, isActive: true })
    .eq('uid', uid);
  
  if (error) throw error;
};

export const updateQuizAttempts = async (uid: string, moduleId: string, attempts: number) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const newAttempts = { ...(profile.attempts || {}), [moduleId]: attempts };
  const { error } = await supabase
    .from('profiles')
    .update({ attempts: newAttempts })
    .eq('uid', uid);
  
  if (error) throw error;
};

export const deleteUserProfile = async (uid: string) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const { error } = await supabase.from('profiles').delete().eq('uid', uid);
  if (error) throw error;
};

export const uploadProfilePhoto = async (file: File, uid: string): Promise<string> => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const bucketName = 'avatars';
  const filePath = `${uid}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
  const { error } = await supabase.storage.from(bucketName).upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

export const createAdminAccount = async (email: string, firstName: string, phone: string) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const newProfile = {
    uid: `admin_${Date.now()}`,
    phoneNumber: phone,
    email: email,
    firstName: firstName,
    lastName: 'Admin',
    role: 'ADMIN',
    isAdmin: true,
    isActive: true,
    badges: [],
    purchasedModuleIds: [],
    pendingModuleIds: [],
    actionPlan: [],
    createdAt: new Date().toISOString()
  };
  const { error } = await supabase.from('profiles').insert(newProfile);
  if (error) throw error;
  return newProfile;
};
