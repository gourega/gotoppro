
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

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  
  // CRITIQUE : On récupère d'abord l'état actuel pour ne jamais perdre de données vitales
  const { data: current, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('uid', profile.uid)
    .maybeSingle();

  if (fetchError) console.error("Fetch before save error:", fetchError);

  // Fusion intelligente : on donne priorité aux nouvelles données mais on garde l'ancien si le nouveau est vide
  const mergedProfile = {
    ...current,
    ...profile,
    purchasedModuleIds: [...new Set([...(current?.purchasedModuleIds || []), ...(profile.purchasedModuleIds || [])])],
    pendingModuleIds: [...new Set([...(current?.pendingModuleIds || []), ...(profile.pendingModuleIds || [])])],
    badges: [...new Set([...(current?.badges || []), ...(profile.badges || [])])],
    progress: { ...(current?.progress || {}), ...(profile.progress || {}) },
    attempts: { ...(current?.attempts || {}), ...(profile.attempts || {}) },
    actionPlan: profile.actionPlan || current?.actionPlan || []
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(mergedProfile, { onConflict: 'uid' });
  
  if (error) {
    console.error("Détails Erreur Upsert:", error);
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

// Fix: Implement toggleUserStatus to enable/disable user accounts
export const toggleUserStatus = async (uid: string, isActive: boolean) => {
  if (!supabase) throw new Error("Client Supabase non initialisé.");
  const { error } = await supabase
    .from('profiles')
    .update({ isActive })
    .eq('uid', uid);
  if (error) throw error;
};

// Fix: Implement updateUserRole to modify user permissions
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

  // Transfert des modules en attente vers les modules achetés
  const newPurchased = [...new Set([...(user.purchasedModuleIds || []), ...(user.pendingModuleIds || [])])];
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      purchasedModuleIds: newPurchased,
      pendingModuleIds: [],
      isActive: true // On active le compte automatiquement s'il y a un achat validé
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
