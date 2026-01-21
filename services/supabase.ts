
import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction, KitaDebt, KitaProduct, KitaSupplier, KitaService } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

/**
 * Mappe les données de la DB vers l'interface UserProfile de l'application (Frontend).
 */
const mapProfileFromDB = (data: any): UserProfile | null => {
  if (!data) return null;
  return {
    uid: data.uid,
    phoneNumber: data.phoneNumber || data.phone_number || '',
    pinCode: data.pinCode || data.pin_code || '1234',
    email: data.email,
    firstName: data.firstName || data.first_name || '',
    lastName: data.lastName || data.last_name || '',
    establishmentName: data.establishmentName || data.establishment_name || '',
    photoURL: data.photoURL || data.photo_url || '',
    bio: data.bio || '',
    employeeCount: data.employeeCount || data.employee_count || 0,
    openingYear: data.openingYear || data.opening_year || 0,
    role: data.role || 'CLIENT',
    isActive: data.isActive ?? data.is_active ?? false,
    isAdmin: data.isAdmin ?? data.is_admin ?? false,
    isPublic: data.isPublic ?? data.is_public ?? true,
    isKitaPremium: data.isKitaPremium ?? data.is_kita_premium ?? false,
    kitaPremiumUntil: data.kitaPremiumUntil || data.kita_premium_until,
    hasPerformancePack: data.hasPerformancePack ?? data.has_performance_pack ?? false,
    hasStockPack: data.hasStockPack ?? data.has_stock_pack ?? false,
    crmExpiryDate: data.crmExpiryDate || data.crm_expiry_date,
    strategicAudit: data.strategicAudit || data.strategic_audit || '',
    badges: Array.isArray(data.badges) ? data.badges : [],
    purchasedModuleIds: Array.isArray(data.purchasedModuleIds || data.purchased_module_ids) ? (data.purchasedModuleIds || data.purchased_module_ids) : [],
    pendingModuleIds: Array.isArray(data.pendingModuleIds || data.pending_module_ids) ? (data.pendingModuleIds || data.pending_module_ids) : [],
    actionPlan: Array.isArray(data.actionPlan || data.action_plan) ? (data.actionPlan || data.action_plan) : [],
    referralCount: data.referralCount || data.referral_count || 0,
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    progress: data.progress || {},
    attempts: data.attempts || {}
  } as UserProfile;
};

/**
 * Mappe les champs Frontend (CamelCase) vers les colonnes Database (snake_case).
 */
const mapProfileToDB = (profile: Partial<UserProfile>) => {
  const dbData: any = {};
  
  // Mapping explicite pour assurer la compatibilité Supabase
  if (profile.uid !== undefined) dbData.uid = profile.uid;
  if (profile.phoneNumber !== undefined) dbData.phone_number = profile.phoneNumber;
  if (profile.pinCode !== undefined) dbData.pin_code = profile.pinCode;
  if (profile.email !== undefined) dbData.email = profile.email;
  if (profile.firstName !== undefined) dbData.first_name = profile.firstName;
  if (profile.lastName !== undefined) dbData.last_name = profile.lastName;
  if (profile.establishmentName !== undefined) dbData.establishment_name = profile.establishmentName;
  if (profile.photoURL !== undefined) dbData.photo_url = profile.photoURL;
  if (profile.bio !== undefined) dbData.bio = profile.bio;
  if (profile.employeeCount !== undefined) dbData.employee_count = profile.employeeCount;
  if (profile.openingYear !== undefined) dbData.opening_year = profile.openingYear;
  if (profile.role !== undefined) dbData.role = profile.role;
  if (profile.isActive !== undefined) dbData.is_active = profile.isActive;
  if (profile.isAdmin !== undefined) dbData.is_admin = profile.isAdmin;
  if (profile.isPublic !== undefined) dbData.is_public = profile.isPublic;
  if (profile.isKitaPremium !== undefined) dbData.is_kita_premium = profile.isKitaPremium;
  if (profile.kitaPremiumUntil !== undefined) dbData.kita_premium_until = profile.kitaPremiumUntil;
  if (profile.hasPerformancePack !== undefined) dbData.has_performance_pack = profile.hasPerformancePack;
  if (profile.hasStockPack !== undefined) dbData.has_stock_pack = profile.hasStockPack;
  if (profile.crmExpiryDate !== undefined) dbData.crm_expiry_date = profile.crmExpiryDate;
  if (profile.strategicAudit !== undefined) dbData.strategic_audit = profile.strategicAudit;
  if (profile.badges !== undefined) dbData.badges = profile.badges;
  if (profile.purchasedModuleIds !== undefined) dbData.purchased_module_ids = profile.purchasedModuleIds;
  if (profile.pendingModuleIds !== undefined) dbData.pending_module_ids = profile.pendingModuleIds;
  if (profile.actionPlan !== undefined) dbData.action_plan = profile.actionPlan;
  if (profile.referralCount !== undefined) dbData.referral_count = profile.referralCount;
  if (profile.createdAt !== undefined) dbData.created_at = profile.createdAt;
  if (profile.progress !== undefined) dbData.progress = profile.progress;
  if (profile.attempts !== undefined) dbData.attempts = profile.attempts;

  return dbData;
};

export const getProfileByPhone = async (phoneNumber: string) => {
  if (!supabase) return null;
  const cleanSearch = phoneNumber.replace(/[^\d+]/g, '').slice(-8);
  if (!cleanSearch) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('phone_number', `%${cleanSearch}`)
      .maybeSingle();
    
    return mapProfileFromDB(data);
  } catch {
    return null;
  }
};

export const getUserProfile = async (uid: string) => {
  if (!supabase || !uid) return null;
  const { data } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
  return mapProfileFromDB(data);
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Supabase non connecté.");
  const dbData = mapProfileToDB(profile);
  const { error } = await supabase.from('profiles').upsert(dbData, { onConflict: 'uid' });
  if (error) {
    console.error("Supabase Upsert Error:", error);
    throw error;
  }
  return { success: true };
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!supabase || !uid) return;
  const dbData = mapProfileToDB(updates);
  const { error } = await supabase.from('profiles').update(dbData).eq('uid', uid);
  if (error) {
    console.error("Supabase Update Error:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  if (!supabase) return [];
  const { data } = await supabase.from('profiles').select('*');
  return (data || []).map(mapProfileFromDB) as UserProfile[];
};

export const deleteUserProfile = async (uid: string) => {
  if (!supabase) return;
  await supabase.from('kita_transactions').delete().eq('user_id', uid);
  await supabase.from('kita_staff').delete().eq('user_id', uid);
  await supabase.from('kita_clients').delete().eq('user_id', uid);
  await supabase.from('kita_services').delete().eq('user_id', uid);
  await supabase.from('kita_products').delete().eq('user_id', uid);
  await supabase.from('kita_suppliers').delete().eq('user_id', uid);
  const { error } = await supabase.from('profiles').delete().eq('uid', uid);
  if (error) throw new Error(error.message);
};

export const getKitaTransactions = async (userId: string): Promise<KitaTransaction[]> => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
  return (data || []).map(t => ({
    id: t.id, type: t.type, amount: t.amount, label: t.label, category: t.category,
    paymentMethod: t.payment_method, date: t.date, staff_name: t.staff_name,
    commission_rate: t.commission_rate, is_credit: t.is_credit, client_id: t.client_id, product_id: t.product_id
  }));
};

export const addKitaTransaction = async (userId: string, transaction: Omit<KitaTransaction, 'id'>) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_transactions').insert({
    id: newId, user_id: userId, type: transaction.type, amount: transaction.amount,
    label: transaction.label, category: transaction.category, payment_method: transaction.paymentMethod,
    date: transaction.date, staff_name: transaction.staffName, commission_rate: transaction.commissionRate,
    is_credit: transaction.isCredit, client_id: transaction.clientId, product_id: transaction.productId
  });
  return error ? null : { ...transaction, id: newId } as KitaTransaction;
};

export const deleteKitaTransaction = async (id: string) => {
  if (supabase) await supabase.from('kita_transactions').delete().eq('id', id);
};

export const getKitaStaff = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_staff').select('*').eq('user_id', userId);
  return (data || []).map(s => ({
    id: s.id, name: s.name, phone: s.phone, commissionRate: s.commission_rate,
    specialty: s.specialty, isActive: s.is_active, userId: s.user_id
  }));
};

export const addKitaStaff = async (userId: string, staff: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_staff').insert({
    id: newId, user_id: userId, name: staff.name, phone: staff.phone,
    commission_rate: staff.commissionRate || staff.commission_rate, specialty: staff.specialty
  });
  return error ? null : { id: newId, ...staff, user_id: userId };
};

export const deleteKitaStaff = async (id: string) => {
  if (supabase) await supabase.from('kita_staff').delete().eq('id', id);
};

export const getKitaClients = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_clients').select('*').eq('user_id', userId);
  return (data || []).map(c => ({
    id: c.id, name: c.name, phone: c.phone, totalSpent: c.total_spent,
    totalVisits: c.total_visits, lastVisit: c.last_visit, notes: c.notes, userId: c.user_id
  }));
};

export const addKitaClient = async (userId: string, client: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_clients').insert({
    id: newId, user_id: userId, name: client.name, phone: client.phone
  });
  return error ? null : { id: newId, ...client, user_id: userId };
};

export const updateKitaClient = async (id: string, updates: any) => {
  if (!supabase) return;
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  await supabase.from('profiles').update(dbUpdates).eq('id', id);
};

export const getKitaServices = async (userId: string): Promise<KitaService[]> => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_services').select('*').eq('user_id', userId);
  return (data || []).map(s => ({
    id: s.id, name: s.name, category: s.category, defaultPrice: s.default_price,
    isActive: s.is_active, userId: s.user_id
  }));
};

export const addKitaService = async (userId: string, service: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_services').insert({
    id: newId, user_id: userId, name: service.name, category: service.category,
    default_price: service.defaultPrice || service.default_price, is_active: true
  });
  return error ? null : { id: newId, ...service, user_id: userId };
};

export const bulkAddKitaServices = async (userId: string, services: any[]) => {
  if (!supabase || !userId) return;
  const payload = services.map(s => ({
    id: generateUUID(), user_id: userId, name: s.name, category: s.category,
    default_price: s.defaultPrice || 0, is_active: true
  }));
  await supabase.from('kita_services').insert(payload);
};

export const updateKitaService = async (id: string, updates: any) => {
  if (!supabase) return;
  const dbUpdates: any = {};
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  if (updates.defaultPrice !== undefined) dbUpdates.default_price = updates.defaultPrice;
  await supabase.from('kita_services').update(dbUpdates).eq('id', id);
};

export const deleteKitaService = async (id: string) => {
  if (supabase) await supabase.from('kita_services').delete().eq('id', id);
};

export const getKitaProducts = async (userId: string): Promise<KitaProduct[]> => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_products').select('*').eq('user_id', userId);
  return (data || []).map(p => ({
    id: p.id, name: p.name, quantity: p.quantity, purchasePrice: p.purchase_price,
    sellPrice: p.sell_price, alertThreshold: p.alert_threshold, category: p.category, supplierId: p.supplier_id
  }));
};

export const addKitaProduct = async (userId: string, p: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_products').insert({
    id: newId, user_id: userId, name: p.name, quantity: p.quantity,
    purchase_price: p.purchasePrice, sell_price: p.sellPrice,
    alert_threshold: p.alertThreshold, category: p.category, supplier_id: p.supplierId
  });
  return error ? null : { id: newId, ...p };
};

export const getKitaSuppliers = async (userId: string): Promise<KitaSupplier[]> => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_suppliers').select('*').eq('user_id', userId);
  return (data || []).map(s => ({ id: s.id, name: s.name, phone: s.phone, category: s.category, userId: s.user_id }));
};

export const addKitaSupplier = async (userId: string, s: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_suppliers').insert({ id: newId, user_id: userId, name: s.name, phone: s.phone, category: s.category });
  return error ? null : { id: newId, ...s, userId };
};

export const deleteKitaSupplier = async (id: string) => {
  if (supabase) await supabase.from('kita_suppliers').delete().eq('id', id);
};

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  if (!supabase || !userId) throw new Error("ID Invalide");
  const fileName = `${userId}_${Date.now()}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return publicUrl;
};

export const getReferrals = async (uid: string) => {
  if (!supabase || !uid) return [];
  const { data } = await supabase.from('profiles').select('*').eq('referred_by', uid);
  return (data || []).map(mapProfileFromDB) as UserProfile[];
};

export const getPublicProfile = async (uid: string) => {
  if (!supabase || !uid) return null;
  const { data } = await supabase.from('profiles').select('*').eq('uid', uid).eq('is_public', true).maybeSingle();
  return mapProfileFromDB(data);
};
