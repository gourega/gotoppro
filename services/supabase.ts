
import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction, KitaDebt, KitaProduct, KitaSupplier, KitaService } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * GÉNÉRATION & VALIDATION UUID
 */
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const isValidUUID = (uuid: any): boolean => {
  if (typeof uuid !== 'string') return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

/**
 * PROFILS
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!supabase || !uid) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
  return error ? null : data as UserProfile;
};

// Utilisé pour les pages de profil partagées publiquement
export const getPublicProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!supabase || !uid) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('uid', uid)
    .eq('isPublic', true)
    .maybeSingle();
  return error ? null : data as UserProfile;
};

export const getProfileByPhone = async (phoneNumber: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('phoneNumber', phoneNumber).maybeSingle();
  return error ? null : data as UserProfile;
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  if (!profile.uid) {
    throw new Error("Identifiant requis.");
  }
  const { error } = await supabase.from('profiles').upsert(profile);
  if (error) throw new Error(error.message);
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  if (!uid) return;
  const { error } = await supabase.from('profiles').update(updates).eq('uid', uid);
  if (error) throw new Error(error.message);
};

export const getReferrals = async (uid: string): Promise<UserProfile[]> => {
  if (!supabase || !uid) return [];
  const { data, error } = await supabase.from('profiles').select('*').eq('referredBy', uid);
  return error ? [] : data as UserProfile[];
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('profiles').select('*').order('createdAt', { ascending: false });
  return error ? [] : data as UserProfile[];
};

export const deleteUserProfile = async (uid: string) => {
  if (!supabase || !uid) return;
  const { error } = await supabase.from('profiles').delete().eq('uid', uid);
  if (error) throw error;
};

/**
 * MODULES & ACCÈS
 */
export const grantModuleAccess = async (uid: string, moduleId: string) => {
  if (!uid) return;
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const updatedIds = [...new Set([...(profile.purchasedModuleIds || []), moduleId])];
  const updatedAttempts = { ...(profile.attempts || {}), [moduleId]: 0 };
  await updateUserProfile(uid, { 
    purchasedModuleIds: updatedIds, 
    attempts: updatedAttempts,
    isActive: true 
  });
};

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  if (!supabase || !userId) throw new Error("ID Invalide");
  const fileName = `${userId}_${Date.now()}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return publicUrl;
};

/**
 * KITA SERVICES (CATALOGUE)
 */
export const getKitaServices = async (userId: string): Promise<KitaService[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_services').select('*').eq('user_id', userId).order('name', { ascending: true });
  return error ? [] : data.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category,
    defaultPrice: s.default_price,
    isActive: s.is_active,
    userId: s.user_id
  }));
};

export const bulkAddKitaServices = async (userId: string, services: Omit<KitaService, 'id' | 'userId'>[]) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  if (!userId) throw new Error("Identifiant invalide");
  
  const payload = services.map(s => ({
    user_id: userId,
    name: s.name,
    category: s.category,
    default_price: s.defaultPrice,
    is_active: s.isActive
  }));
  const { error } = await supabase.from('kita_services').insert(payload);
  if (error) throw error;
};

export const addKitaService = async (userId: string, service: Omit<KitaService, 'id' | 'userId'>) => {
  if (!supabase || !userId) throw new Error("ID Invalide");
  const { data, error } = await (supabase as any).from('kita_services').insert({
    user_id: userId,
    name: service.name,
    category: service.category,
    default_price: service.defaultPrice,
    is_active: service.isActive
  }).select().single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    defaultPrice: data.default_price,
    isActive: data.is_active,
    userId: data.user_id
  } as KitaService;
};

export const updateKitaService = async (id: string, service: Partial<KitaService>) => {
  if (!supabase) return;
  const updates: any = {};
  if (service.name !== undefined) updates.name = service.name;
  if (service.category !== undefined) updates.category = service.category;
  if (service.defaultPrice !== undefined) updates.default_price = service.defaultPrice;
  if (service.isActive !== undefined) updates.is_active = service.isActive;
  await supabase.from('kita_services').update(updates).eq('id', id);
};

export const deleteKitaService = async (id: string) => {
  if (!supabase) return;
  await supabase.from('kita_services').delete().eq('id', id);
};

/**
 * KITA TRANSACTIONS
 */
export const getKitaTransactions = async (userId: string): Promise<KitaTransaction[]> => {
  if (!supabase || !userId) return [];
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
  if (!supabase || !userId) throw new Error("ID Invalide");
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
  
  return {
    id: data.id,
    type: data.type,
    amount: data.amount,
    label: data.label,
    category: data.category,
    paymentMethod: data.payment_method,
    date: data.date,
    staffName: data.staff_name,
    commissionRate: data.commission_rate,
    isCredit: data.is_credit
  } as KitaTransaction;
};

export const deleteKitaTransaction = async (id: string) => {
  if (supabase) await supabase.from('kita_transactions').delete().eq('id', id);
};

/**
 * KITA DETTES
 */
export const getKitaDebts = async (userId: string): Promise<KitaDebt[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_debts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return error ? [] : data.map(d => ({
    id: d.id,
    personName: d.person_name,
    amount: d.amount,
    phone: d.phone,
    isPaid: d.is_paid,
    createdAt: d.created_at,
    paidAt: d.paid_at
  }));
};

export const addKitaDebt = async (userId: string, debt: Omit<KitaDebt, 'id'>) => {
  if (!supabase || !userId) throw new Error("ID Invalide");
  const { data, error } = await (supabase as any).from('kita_debts').insert({
    user_id: userId,
    person_name: debt.personName,
    amount: debt.amount,
    phone: debt.phone,
    is_paid: debt.isPaid,
    created_at: debt.createdAt
  }).select().single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    personName: data.person_name,
    amount: data.amount,
    phone: data.phone,
    isPaid: data.is_paid,
    createdAt: data.created_at
  } as KitaDebt;
};

export const markDebtAsPaid = async (debtId: string) => {
  if (supabase) await supabase.from('kita_debts').update({ is_paid: true, paid_at: new Date().toISOString() }).eq('id', debtId);
};

/**
 * KITA STOCK
 */
export const getKitaProducts = async (userId: string): Promise<KitaProduct[]> => {
  if (!supabase || !userId) return [];
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
  if (!supabase || !userId) throw new Error("ID Invalide");
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
  
  return {
    id: data.id,
    name: data.name,
    quantity: data.quantity,
    purchasePrice: data.purchase_price,
    sellPrice: data.sell_price,
    alertThreshold: data.alert_threshold,
    category: data.category,
    supplierId: data.supplier_id
  } as KitaProduct;
};

export const updateKitaProduct = async (id: string, product: Partial<KitaProduct>) => {
  if (!supabase) return;
  const updates: any = {};
  if (product.name !== undefined) updates.name = product.name;
  if (product.quantity !== undefined) updates.quantity = product.quantity;
  if (product.purchasePrice !== undefined) updates.purchase_price = product.purchasePrice;
  if (product.sellPrice !== undefined) updates.sell_price = product.sellPrice;
  if (product.alertThreshold !== undefined) updates.alert_threshold = product.alertThreshold;
  if (product.category !== undefined) updates.category = product.category;
  if (product.supplierId !== undefined) updates.supplier_id = product.supplierId;
  await supabase.from('kita_products').update(updates).eq('id', id);
};

/**
 * KITA FOURNISSEURS
 */
export const getKitaSuppliers = async (userId: string): Promise<KitaSupplier[]> => {
  if (!supabase || !userId) return [];
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
  if (!supabase || !userId) throw new Error("ID Invalide");
  const { data, error } = await (supabase as any).from('kita_suppliers').insert({
    user_id: userId,
    name: supplier.name,
    phone: supplier.phone,
    category: supplier.category
  }).select().single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    category: data.category,
    userId: data.user_id
  } as KitaSupplier;
};

export const deleteKitaSupplier = async (id: string) => {
  if (supabase) await supabase.from('kita_suppliers').delete().eq('id', id);
};

/**
 * KITA STAFF & CLIENTS
 */
export const getKitaStaff = async (userId: string): Promise<any[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_staff').select('*').eq('user_id', userId);
  return error ? [] : data;
};

export const addKitaStaff = async (userId: string, staff: { name: string, commission_rate: number, specialty: string }) => {
  if (!supabase || !userId) throw new Error("ID Invalide");
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
  if (supabase) await supabase.from('kita_staff').delete().eq('id', id);
};

export const getKitaClients = async (userId: string): Promise<any[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_clients').select('*').eq('user_id', userId).order('total_spent', { ascending: false });
  return error ? [] : data;
};

export const addKitaClient = async (userId: string, client: { name: string, phone: string }) => {
  if (!supabase || !userId) throw new Error("ID Invalide");
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
