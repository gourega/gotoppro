
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
 * Sauvegarde le profil utilisateur avec gestion de secours si des colonnes sont manquantes.
 */
export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  
  const { uid, ...dataToUpdate } = profile;

  // Tentative de mise à jour complète
  const { error } = await supabase
    .from('profiles')
    .update(dataToUpdate)
    .eq('uid', uid);
  
  if (error) {
    console.warn("Erreur Supabase (Tentative 1) :", error.message);
    
    // Si la colonne 'attempts' ou une autre manque (Code 42703), on tente une sauvegarde restreinte
    if (error.code === '42703' || error.message.includes('column')) {
      console.log("Tentative de sauvegarde de secours sans les colonnes optionnelles...");
      
      const essentialData = {
        progress: profile.progress,
        badges: profile.badges,
        isActive: profile.isActive,
        actionPlan: profile.actionPlan,
        firstName: profile.firstName,
        lastName: profile.lastName,
        establishmentName: profile.establishmentName
      };

      // Supprimer les champs undefined pour éviter d'autres erreurs
      Object.keys(essentialData).forEach(key => 
        (essentialData as any)[key] === undefined && delete (essentialData as any)[key]
      );

      const { error: retryError } = await supabase
        .from('profiles')
        .update(essentialData)
        .eq('uid', uid);

      if (retryError) throw new Error(retryError.message);
    } else {
      throw new Error(error.message);
    }
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
