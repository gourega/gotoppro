
import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';

/**
 * World-class configuration handling:
 * We use process.env to retrieve keys, injected by the Cloudflare environment.
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase is not configured. Some features (Auth, Database) will be unavailable.");
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
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as UserProfile;
  } catch (err) {
    return null;
  }
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { error } = await supabase
    .from('profiles')
    .upsert(profile);
  
  if (error) throw error;
};

export const uploadProfilePhoto = async (file: File, uid: string): Promise<string> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${uid}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { 
      upsert: true,
      contentType: file.type 
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

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
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { error } = await supabase
    .from('profiles')
    .update({ isActive })
    .eq('uid', uid);

  if (error) throw error;
};

export const updateUserRole = async (uid: string, role: UserRole) => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const { error } = await supabase
    .from('profiles')
    .update({ role, isAdmin })
    .eq('uid', uid);

  if (error) throw error;
};

export const deleteUserProfile = async (uid: string) => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('uid', uid);

  if (error) throw error;
};

export const createTestUser = async (): Promise<UserProfile> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const testId = Math.random().toString(36).substr(2, 6).toUpperCase();
  const testNames = ["Awa", "Koffi", "Moussa", "Yao", "Fatou", "Bakary"];
  const randomName = testNames[Math.floor(Math.random() * testNames.length)];
  
  const testProfile: UserProfile = {
    uid: crypto.randomUUID(), 
    phoneNumber: `+22500000${Math.floor(10000 + Math.random() * 90000)}`,
    firstName: randomName,
    lastName: "Test-" + testId,
    establishmentName: "Salon de Test " + testId,
    role: 'CLIENT',
    isActive: false,
    isAdmin: false,
    badges: [],
    purchasedModuleIds: ['mod_accueil_tel'],
    pendingModuleIds: [],
    actionPlan: [],
    createdAt: new Date().toISOString()
  };

  const { error } = await supabase.from('profiles').insert(testProfile);
  if (error) throw error;
  return testProfile;
};
