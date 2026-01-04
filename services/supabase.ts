
/**
 * 🛠 CONFIGURATION REQUISE DANS SUPABASE (SQL EDITOR) :
 * 
 * -- 1. Autoriser l'accès aux profils (Lecture/Écriture pour le login manuel)
 * ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
 * DROP POLICY IF EXISTS "Accès Public Total" ON profiles;
 * CREATE POLICY "Accès Public Total" ON profiles FOR ALL TO anon USING (true) WITH CHECK (true);
 * 
 * -- 2. Autoriser la gestion des photos dans le bucket 'avatars'
 * DROP POLICY IF EXISTS "Gestion Avatars Public" ON storage.objects;
 * CREATE POLICY "Gestion Avatars Public" ON storage.objects 
 * FOR ALL TO anon USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
 */

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
  
  // Utilisation de upsert pour gérer création et mise à jour en un seul appel
  const { error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'uid' });
  
  if (error) {
    console.error("Erreur Save Profile:", error);
    throw error;
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
    console.error("Supabase Storage Error:", uploadError);
    throw uploadError;
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
