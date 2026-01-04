
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

/**
 * Sauvegarde le profil utilisateur.
 * Utilise 'update' au lieu de 'upsert' pour éviter les erreurs de droits RLS (Row Level Security)
 * car le profil est déjà créé lors de la phase de diagnostic.
 */
export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  
  // On retire les champs potentiellement problématiques ou inutiles à renvoyer tel quel
  const { uid, ...dataToUpdate } = profile;

  // On effectue une mise à jour directe sur la ligne correspondant à l'UID
  const { error } = await supabase
    .from('profiles')
    .update(dataToUpdate)
    .eq('uid', uid);
  
  if (error) {
    console.error("Erreur de mise à jour Supabase :", error);
    // Si l'erreur est liée à une ligne inexistante (rare ici), on pourrait tenter un insert,
    // mais dans notre flux, le profil existe TOUJOURS avant d'arriver au module.
    throw new Error(error.message);
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data as UserProfile[];
};

export const toggleUserStatus = async (uid: string, isActive: boolean) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const { error } = await supabase
    .from('profiles')
    .update({ isActive })
    .eq('uid', uid);
  if (error) throw error;
};

export const updateUserRole = async (uid: string, role: UserRole) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const { error } = await supabase
    .from('profiles')
    .update({ 
      role, 
      isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN' 
    })
    .eq('uid', uid);
  if (error) throw error;
};

export const validateUserPurchases = async (uid: string) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  
  const { data: user } = await supabase
    .from('profiles')
    .select('purchasedModuleIds, pendingModuleIds')
    .eq('uid', uid)
    .single();

  if (!user) return;

  const newPurchased = [...new Set([...(user.purchasedModuleIds || []), ...(user.pendingModuleIds || [])])];
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      purchasedModuleIds: newPurchased,
      pendingModuleIds: [],
      isActive: true
    })
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
