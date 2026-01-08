
import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction, KitaDebt, KitaProduct } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- PROFILES ---
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

export const deleteUserProfile = async (uid: string) => {
  if (!supabase) return;
  await supabase.from('profiles').delete().eq('uid', uid);
};

export const grantModuleAccess = async (uid: string, moduleId: string) => {
  if (!supabase) return;
  const profile = await getUserProfile(uid);
  if (profile) {
    const updatedModules = [...new Set([...(profile.purchasedModuleIds || []), moduleId])];
    await supabase.from('profiles').update({ 
      purchasedModuleIds: updatedModules,
      isActive: true 
    }).eq('uid', uid);
  }
};

export const updateQuizAttempts = async (uid: string, moduleId: string, attempts: number) => {
  if (!supabase) return;
  const profile = await getUserProfile(uid);
  if (profile) {
    const updatedAttempts = { ...(profile.attempts || {}), [moduleId]: attempts };
    await supabase.from('profiles').update({ attempts: updatedAttempts }).eq('uid', uid);
  }
};

// --- KITA COMPTABILITÉ ---

export const getKitaTransactions = async (userId: string): Promise<KitaTransaction[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('kita_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) return [];
  return data.map(t => ({
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
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('kita_transactions')
    .insert([{ 
      user_id: userId,
      type: transaction.type,
      amount: transaction.amount,
      label: transaction.label,
      category: transaction.category,
      payment_method: transaction.paymentMethod,
      date: transaction.date,
      staff_name: transaction.staffName,
      commission_rate: transaction.commissionRate
    }])
    .select()
    .single();
  
  if (error) throw error;
  return {
    ...data,
    paymentMethod: data.payment_method,
    staffName: data.staff_name,
    commissionRate: data.commission_rate
  } as KitaTransaction;
};

export const deleteKitaTransaction = async (id: string) => {
  if (!supabase) return;
  await supabase.from('kita_transactions').delete().eq('id', id);
};

// --- PACK PERFORMANCE : STAFF ---

export const getKitaStaff = async (userId: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_staff').select('*').eq('user_id', userId);
  return error ? [] : data;
};

export const addKitaStaff = async (userId: string, staff: { name: string, commission_rate: number, specialty: string }) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('kita_staff').insert([{ user_id: userId, ...staff }]).select().single();
  if (error) throw error;
  return data;
};

export const deleteKitaStaff = async (id: string) => {
  if (!supabase) return;
  await supabase.from('kita_staff').delete().eq('id', id);
};

// --- PACK PERFORMANCE : CLIENTS ---

export const getKitaClients = async (userId: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_clients').select('*').eq('user_id', userId).order('last_visit', { ascending: false });
  return error ? [] : data;
};

export const addKitaClient = async (userId: string, client: { name: string, phone: string }) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('kita_clients').insert([{ user_id: userId, ...client }]).select().single();
  if (error) throw error;
  return data;
};

// --- STOCKS & DETTES (EXISTANT) ---

export const getKitaDebts = async (userId: string): Promise<KitaDebt[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_debts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return error ? [] : data.map(d => ({ id: d.id, personName: d.person_name, amount: d.amount, type: d.type, dueDate: d.due_date, isPaid: d.is_paid, createdAt: d.created_at }));
};

export const getKitaProducts = async (userId: string): Promise<KitaProduct[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_products').select('*').eq('user_id', userId).order('name', { ascending: true });
  return error ? [] : data.map(p => ({ id: p.id, name: p.name, quantity: p.quantity, purchasePrice: p.purchase_price, alertThreshold: p.alert_threshold }));
};

export const uploadProfilePhoto = async (file: File, uid: string): Promise<string> => {
  if (!supabase) return "";
  const fileExt = file.name.split('.').pop();
  const fileName = `${uid}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};
