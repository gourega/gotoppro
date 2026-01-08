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

// --- KITA COMPTABILITÉ (SERVICES DÉDIÉS) ---

// Transactions
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
    date: t.date
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
      date: transaction.date
    }])
    .select()
    .single();
  
  if (error) throw error;
  return {
    ...data,
    paymentMethod: data.payment_method
  } as KitaTransaction;
};

export const deleteKitaTransaction = async (id: string) => {
  if (!supabase) return;
  await supabase.from('kita_transactions').delete().eq('id', id);
};

// Dettes
export const getKitaDebts = async (userId: string): Promise<KitaDebt[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('kita_debts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data.map(d => ({
    id: d.id,
    personName: d.person_name,
    amount: d.amount,
    type: d.type,
    dueDate: d.due_date,
    isPaid: d.is_paid,
    createdAt: d.created_at
  }));
};

export const addKitaDebt = async (userId: string, debt: Omit<KitaDebt, 'id' | 'createdAt'>) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('kita_debts')
    .insert([{ 
      user_id: userId,
      person_name: debt.personName,
      amount: debt.amount,
      type: debt.type,
      due_date: debt.dueDate,
      is_paid: debt.isPaid
    }])
    .select()
    .single();
  
  if (error) throw error;
  return {
    ...data,
    personName: data.person_name,
    dueDate: data.due_date,
    isPaid: data.is_paid,
    createdAt: data.created_at
  } as KitaDebt;
};

export const updateKitaDebt = async (id: string, updates: Partial<KitaDebt>) => {
  if (!supabase) return;
  const dbUpdates: any = {};
  if (updates.personName !== undefined) dbUpdates.person_name = updates.personName;
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
  if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  
  await supabase.from('kita_debts').update(dbUpdates).eq('id', id);
};

// Stocks
export const getKitaProducts = async (userId: string): Promise<KitaProduct[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('kita_products')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });
  
  if (error) return [];
  return data.map(p => ({
    id: p.id,
    name: p.name,
    quantity: p.quantity,
    purchasePrice: p.purchase_price,
    alertThreshold: p.alert_threshold
  }));
};

export const addKitaProduct = async (userId: string, product: Omit<KitaProduct, 'id'>) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('kita_products')
    .insert([{ 
      user_id: userId,
      name: product.name,
      quantity: product.quantity,
      purchase_price: product.purchasePrice,
      alert_threshold: product.alertThreshold
    }])
    .select()
    .single();
  
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    quantity: data.quantity,
    purchasePrice: data.purchase_price,
    alertThreshold: data.alert_threshold
  } as KitaProduct;
};

export const updateKitaProduct = async (id: string, updates: Partial<KitaProduct>) => {
  if (!supabase) return;
  const dbUpdates: any = {};
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.alertThreshold !== undefined) dbUpdates.alert_threshold = updates.alertThreshold;
  
  await supabase.from('kita_products').update(dbUpdates).eq('id', id);
};

export const uploadProfilePhoto = async (file: File, uid: string): Promise<string> => {
  if (!supabase) return "";
  const fileExt = file.name.split('.').pop();
  const fileName = `${uid}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};