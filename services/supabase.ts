
import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

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
  if (!supabase) throw new Error("Supabase non initialisé");
  const { error } = await supabase.from('profiles').upsert(profile);
  if (error) throw new Error(error.message);
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('profiles').select('*').order('createdAt', { ascending: false });
  return error ? [] : data as UserProfile[];
};

export const deleteUserProfile = async (uid: string) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { error } = await supabase.from('profiles').delete().eq('uid', uid);
  if (error) throw error;
};

export const grantModuleAccess = async (uid: string, moduleId: string) => {
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const updatedIds = [...new Set([...(profile.purchasedModuleIds || []), moduleId])];
  await saveUserProfile({ uid, purchasedModuleIds: updatedIds, isActive: true });
};

export const updateQuizAttempts = async (uid: string, moduleId: string, attempts: number) => {
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const updatedAttempts = { ...(profile.attempts || {}), [moduleId]: attempts };
  await saveUserProfile({ uid, attempts: updatedAttempts });
};

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const fileName = `${userId}_${Date.now()}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return publicUrl;
};

export const getKitaTransactions = async (userId: string): Promise<KitaTransaction[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
  return error ? [] : data.map(t => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    label: t.label,
    category: t.category,
    paymentMethod: t.payment_method,
    date: t.date,
    staffName: t.staff_name,
    commissionRate: t.commission_rate
  }));
};

export const addKitaTransaction = async (userId: string, transaction: Omit<KitaTransaction, 'id'>) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { data, error } = await (supabase as any).from('kita_transactions').insert({
    user_id: userId,
    type: transaction.type,
    amount: transaction.amount,
    label: transaction.label,
    category: transaction.category,
    payment_method: transaction.paymentMethod,
    date: transaction.date,
    staff_name: transaction.staffName,
    commission_rate: transaction.commissionRate
  }).select().single();
  if (error) throw error;
  return data;
};

export const updateKitaTransaction = async (id: string, transaction: Partial<KitaTransaction>) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { error } = await supabase.from('kita_transactions').update({
    type: transaction.type,
    amount: transaction.amount,
    label: transaction.label,
    category: transaction.category,
    payment_method: transaction.paymentMethod,
    date: transaction.date,
    staff_name: transaction.staffName,
    commission_rate: transaction.commissionRate
  }).eq('id', id);
  if (error) throw error;
};

export const deleteKitaTransaction = async (id: string) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { error } = await supabase.from('kita_transactions').delete().eq('id', id);
  if (error) throw error;
};

export const getKitaStaff = async (userId: string): Promise<any[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_staff').select('*').eq('user_id', userId);
  return error ? [] : data;
};

export const addKitaStaff = async (userId: string, staff: { name: string, commission_rate: number, specialty: string }) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { data, error } = await (supabase as any).from('kita_staff').insert({
    user_id: userId,
    name: staff.name,
    commission_rate: staff.commission_rate,
    specialty: staff.specialty
  }).select().single();
  if (error) throw error;
  return data;
};

export const deleteKitaStaff = async (id: string) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { error } = await supabase.from('kita_staff').delete().eq('id', id);
  if (error) throw error;
};

export const getKitaClients = async (userId: string): Promise<any[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_clients').select('*').eq('user_id', userId);
  return error ? [] : data;
};
