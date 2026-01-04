
import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase configuration manquante.");
}

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

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  
  // Correction: On laisse Supabase identifier la clé de conflit (uid) automatiquement
  const { error } = await supabase
    .from('profiles')
    .upsert(profile);
  
  if (error) {
    console.error("Détails Erreur Save Profile:", error);
    throw new Error(error.message || "Erreur de base de données");
  }
};

export const uploadProfilePhoto = async (file: File, uid: string): Promise<string> => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  
  const bucketName = 'avatars';
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${uid}/avatar_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, { 
      cacheControl: '3600',
      upsert: true,
      contentType: file.type 
    });

  if (uploadError) {
    console.error("Détails Erreur Storage:", uploadError);
    throw new Error(uploadError.message || "Erreur de stockage");
  }

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
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
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const { error } = await supabase
    .from('profiles')
    .update({ role, isAdmin })
    .eq('uid', uid);

  if (error) throw error;
};

export const deleteUserProfile = async (uid: string) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('uid', uid);

  if (error) throw error;
};
