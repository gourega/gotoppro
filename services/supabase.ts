
import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase configuration manquante. Vérifiez vos variables d'environnement.");
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', uid)
      .maybeSingle();

    if (error) {
      console.error("Erreur profil:", error);
      return null;
    }
    return data as UserProfile;
  } catch (err) {
    return null;
  }
};

/**
 * Récupère un profil par numéro de téléphone (Utile pour le login manuel sans SMS)
 */
export const getProfileByPhone = async (phoneNumber: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('phoneNumber', phoneNumber)
    .maybeSingle();
    
  if (error) return null;
  return data as UserProfile;
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const { error } = await supabase
    .from('profiles')
    .upsert(profile);
  
  if (error) throw error;
};

export const uploadProfilePhoto = async (file: File, uid: string): Promise<string> => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  
  // Bucket "avatars" attendu. Assurez-vous qu'il existe et est PUBLIC.
  const bucketName = 'avatars';
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${uid}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, { 
      upsert: true,
      contentType: file.type 
    });

  if (uploadError) {
    console.error("Supabase Storage Error:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Impossible de générer l'URL publique de la photo.");
  }

  return `${data.publicUrl}?t=${Date.now()}`;
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
