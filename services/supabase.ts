
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
  return error ? null : data as UserProfile;
};

export const getProfileByPhone = async (phoneNumber: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('phoneNumber', phoneNumber).maybeSingle();
  return error ? null : data as UserProfile;
};

export const getReferrals = async (uid: string): Promise<UserProfile[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('profiles').select('*').eq('referredBy', uid);
  return error ? [] : data as UserProfile[];
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Supabase error");
  const { uid, referredBy, ...dataToUpdate } = profile;
  if (referredBy) {
    const parrain = await getUserProfile(referredBy);
    if (parrain) {
      const newCount = (parrain.referralCount || 0) + 1;
      await supabase.from('profiles').update({ referralCount: newCount }).eq('uid', parrain.uid);
    }
  }
  const { error } = await supabase.from('profiles').update(dataToUpdate).eq('uid', uid);
  if (error) throw new Error(error.message);
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('profiles').select('*').order('createdAt', { ascending: false });
  return error ? [] : data as UserProfile[];
};

export const grantModuleAccess = async (uid: string, moduleId: string) => {
  if (!supabase) return;
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const newPurchased = [...new Set([...(profile.purchasedModuleIds || []), moduleId])];
  await supabase.from('profiles').update({ purchasedModuleIds: newPurchased, isActive: true }).eq('uid', uid);
};

export const updateQuizAttempts = async (uid: string, moduleId: string, attempts: number) => {
  if (!supabase) return;
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const newAttempts = { ...(profile.attempts || {}), [moduleId]: attempts };
  await supabase.from('profiles').update({ attempts: newAttempts }).eq('uid', uid);
};

export const deleteUserProfile = async (uid: string) => {
  if (!supabase) return;
  await supabase.from('profiles').delete().eq('uid', uid);
};

export const uploadProfilePhoto = async (file: File, uid: string): Promise<string> => {
  if (!supabase) return "";
  const filePath = `${uid}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
  await supabase.storage.from('avatars').upload(filePath, file);
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};

export const createAdminAccount = async (email: string, firstName: string, phone: string) => {
  if (!supabase) return;
  const newProfile = {
    uid: `admin_${Date.now()}`,
    phoneNumber: phone,
    email: email,
    firstName: firstName,
    lastName: 'Admin',
    role: 'ADMIN',
    isAdmin: true,
    isActive: true,
    isKitaPremium: true,
    badges: [],
    purchasedModuleIds: [],
    pendingModuleIds: [],
    actionPlan: [],
    createdAt: new Date().toISOString()
  };
  await supabase.from('profiles').insert(newProfile);
  return newProfile;
};
