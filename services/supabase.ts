
import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction, KitaDebt, KitaProduct, KitaSupplier } from '../types';

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

// --- TRANSACTIONS ---
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
    commissionRate: t.commission_rate,
    isCredit: t.is_credit
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
    commission_rate: transaction.commissionRate,
    is_credit: transaction.isCredit || false
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
    commission_rate: transaction.commissionRate,
    is_credit: transaction.isCredit
  }).eq('id', id);
  if (error) throw error;
};

export const deleteKitaTransaction = async (id: string) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { error } = await supabase.from('kita_transactions').delete().eq('id', id);
  if (error) throw error;
};

// --- DETTES ---
export const getKitaDebts = async (userId: string): Promise<KitaDebt[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_debts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return error ? [] : data;
};

export const addKitaDebt = async (userId: string, debt: Omit<KitaDebt, 'id'>) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { data, error } = await (supabase as any).from('kita_debts').insert({
    user_id: userId,
    person_name: debt.personName,
    amount: debt.amount,
    phone: debt.phone,
    is_paid: debt.isPaid,
    created_at: debt.createdAt
  }).select().single();
  if (error) throw error;
  return data;
};

export const markDebtAsPaid = async (debtId: string) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { error } = await supabase.from('kita_debts').update({
    is_paid: true,
    paid_at: new Date().toISOString()
  }).eq('id', debtId);
  if (error) throw error;
};

// --- STOCK ---
export const getKitaProducts = async (userId: string): Promise<KitaProduct[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_products').select('*').eq('user_id', userId).order('name', { ascending: true });
  return error ? [] : data.map(p => ({
    id: p.id,
    name: p.name,
    quantity: p.quantity,
    purchasePrice: p.purchase_price,
    sellPrice: p.sell_price,
    alertThreshold: p.alert_threshold,
    category: p.category,
    supplierId: p.supplier_id
  }));
};

export const addKitaProduct = async (userId: string, product: Omit<KitaProduct, 'id'>) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { data, error } = await (supabase as any).from('kita_products').insert({
    user_id: userId,
    name: product.name,
    quantity: product.quantity,
    purchase_price: product.purchasePrice,
    sell_price: product.sellPrice,
    alert_threshold: product.alertThreshold,
    category: product.category,
    supplier_id: product.supplierId
  }).select().single();
  if (error) throw error;
  return data;
};

export const updateKitaProduct = async (id: string, product: Partial<KitaProduct>) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const updates: any = {};
  if (product.name !== undefined) updates.name = product.name;
  if (product.quantity !== undefined) updates.quantity = product.quantity;
  if (product.purchasePrice !== undefined) updates.purchase_price = product.purchasePrice;
  if (product.sellPrice !== undefined) updates.sell_price = product.sellPrice;
  if (product.alertThreshold !== undefined) updates.alert_threshold = product.alertThreshold;
  if (product.category !== undefined) updates.category = product.category;
  if (product.supplierId !== undefined) updates.supplier_id = product.supplierId;

  const { error } = await supabase.from('kita_products').update(updates).eq('id', id);
  if (error) throw error;
};

// --- FOURNISSEURS ---
export const getKitaSuppliers = async (userId: string): Promise<KitaSupplier[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kita_suppliers').select('*').eq('user_id', userId).order('name', { ascending: true });
  return error ? [] : data.map(s => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    category: s.category,
    userId: s.user_id
  }));
};

export const addKitaSupplier = async (userId: string, supplier: Omit<KitaSupplier, 'id' | 'userId'>) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { data, error } = await (supabase as any).from('kita_suppliers').insert({
    user_id: userId,
    name: supplier.name,
    phone: supplier.phone,
    category: supplier.category
  }).select().single();
  if (error) throw error;
  return data;
};

export const deleteKitaSupplier = async (id: string) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { error } = await supabase.from('kita_suppliers').delete().eq('id', id);
  if (error) throw error;
};

// --- STAFF & CLIENTS ---
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
  const { data, error } = await supabase.from('kita_clients').select('*').eq('user_id', userId).order('total_spent', { ascending: false });
  return error ? [] : data;
};

export const addKitaClient = async (userId: string, client: { name: string, phone: string }) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const { data, error } = await (supabase as any).from('kita_clients').insert({
    user_id: userId,
    name: client.name,
    phone: client.phone,
    total_spent: 0,
    total_visits: 0
  }).select().single();
  if (error) throw error;
  return data;
};
