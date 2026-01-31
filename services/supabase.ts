
import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction, KitaDebt, KitaProduct, KitaSupplier, KitaService } from '../types';

/**
 * EXPORT POUR DIAGNOSTIC : 
 * On expose l'état (pas les clés elles-mêmes) pour l'interface de secours.
 */
export const BUILD_CONFIG = {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  version: "2.5.2-diag"
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const getSafeSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "" || supabaseAnonKey === "") {
    console.error("Go'Top Pro [Supabase]: CONFIGURATION ABSENTE AU BUILD.");
    return null;
  }
  
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (e) {
    console.error("Go'Top Pro [Supabase]: Erreur SDK.", e);
    return null;
  }
};

export const supabase = getSafeSupabaseClient();

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

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
    adminNotes: data.admin_notes || data.adminNotes || '',
    employeeCount: data.employeeCount || data.employee_count || 0,
    yearsOfExistence: data.yearsOfExistence || data.years_of_existence || 0,
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
    marketingCredits: data.marketingCredits ?? data.marketing_credits ?? 3,
    badges: Array.isArray(data.badges) ? data.badges : [],
    purchasedModuleIds: Array.isArray(data.purchasedModuleIds || data.purchased_module_ids) ? (data.purchasedModuleIds || data.purchased_module_ids) : [],
    pendingModuleIds: Array.isArray(data.pendingModuleIds || data.pending_module_ids) ? (data.pendingModuleIds || data.pending_module_ids) : [],
    actionPlan: Array.isArray(data.action_plan || data.actionPlan) ? (data.action_plan || data.actionPlan) : [],
    referralCount: data.referralCount || data.referral_count || 0,
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    progress: data.progress || {},
    attempts: data.attempts || {}
  } as UserProfile;
};

const mapProfileToDB = (profile: Partial<UserProfile>) => {
  const dbData: any = {};
  if (profile.uid !== undefined) dbData.uid = profile.uid;
  if (profile.phoneNumber !== undefined) dbData.phoneNumber = profile.phoneNumber;
  if (profile.pinCode !== undefined) dbData.pinCode = profile.pinCode;
  if (profile.email !== undefined) dbData.email = profile.email;
  if (profile.firstName !== undefined) dbData.firstName = profile.firstName;
  if (profile.lastName !== undefined) dbData.lastName = profile.lastName;
  if (profile.establishmentName !== undefined) dbData.establishmentName = profile.establishmentName;
  if (profile.photoURL !== undefined) dbData.photoURL = profile.photoURL;
  if (profile.bio !== undefined) dbData.bio = profile.bio;
  if (profile.adminNotes !== undefined) dbData.admin_notes = profile.adminNotes;
  if (profile.employeeCount !== undefined) dbData.employeeCount = profile.employeeCount;
  if (profile.yearsOfExistence !== undefined) dbData.yearsOfExistence = profile.yearsOfExistence;
  if (profile.openingYear !== undefined) dbData.openingYear = profile.openingYear;
  if (profile.role !== undefined) dbData.role = profile.role;
  if (profile.isActive !== undefined) dbData.isActive = profile.isActive;
  if (profile.isAdmin !== undefined) dbData.isAdmin = profile.isAdmin;
  if (profile.isPublic !== undefined) dbData.isPublic = profile.isPublic;
  if (profile.isKitaPremium !== undefined) dbData.isKitaPremium = profile.isKitaPremium;
  if (profile.kitaPremiumUntil !== undefined) dbData.kitaPremiumUntil = profile.kitaPremiumUntil;
  if (profile.hasPerformancePack !== undefined) dbData.hasPerformancePack = profile.hasPerformancePack;
  if (profile.hasStockPack !== undefined) dbData.hasStockPack = profile.hasStockPack;
  if (profile.crmExpiryDate !== undefined) dbData.crmExpiryDate = profile.crmExpiryDate;
  if (profile.strategicAudit !== undefined) dbData.strategicAudit = profile.strategicAudit;
  if (profile.marketingCredits !== undefined) dbData.marketing_credits = profile.marketingCredits;
  if (profile.badges !== undefined) dbData.badges = profile.badges;
  if (profile.purchasedModuleIds !== undefined) dbData.purchasedModuleIds = profile.purchasedModuleIds;
  if (profile.pendingModuleIds !== undefined) dbData.pendingModuleIds = profile.pendingModuleIds;
  if (profile.actionPlan !== undefined) dbData.action_plan = profile.actionPlan;
  if (profile.referralCount !== undefined) dbData.referralCount = profile.referralCount;
  if (profile.createdAt !== undefined) dbData.createdAt = profile.createdAt;
  if (profile.progress !== undefined) dbData.progress = profile.progress;
  if (profile.attempts !== undefined) dbData.attempts = profile.attempts;
  return dbData;
};

export const getProfileByPhone = async (phoneNumber: string) => {
  if (!supabase) {
    throw new Error("DB_CONFIG_MISSING");
  }
  
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const last10 = digitsOnly.slice(-10);
  if (!last10) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`phoneNumber.eq.${digitsOnly},phoneNumber.ilike.*${last10}`)
      .maybeSingle();
      
    if (error) throw error;
    return mapProfileFromDB(data);
  } catch (err) { 
    console.error("DB Error:", err);
    throw err; 
  }
};

export const getUserProfile = async (uid: string) => {
  if (!supabase || !uid) return null;
  const { data } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
  return mapProfileFromDB(data);
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) return { success: true, warning: "Local only" };
  const dbData = mapProfileToDB(profile);
  const { error } = await supabase.from('profiles').upsert(dbData, { onConflict: 'uid' });
  if (error) throw error;
  return { success: true };
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!supabase || !uid) return;
  const dbData = mapProfileToDB(updates);
  const { error } = await supabase.from('profiles').update(dbData).eq('uid', uid);
  if (error) throw error;
};

export const getAllUsers = async () => {
  if (!supabase) return [];
  const { data } = await supabase.from('profiles').select('*');
  return (data || []).map(mapProfileFromDB) as UserProfile[];
};

export const getKitaTransactions = async (userId: string): Promise<KitaTransaction[]> => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
  return (data || []).map(t => ({
    id: t.id, type: t.type, amount: t.amount, label: t.label, category: t.category,
    paymentMethod: t.payment_method, date: t.date, staffName: t.staff_name,
    commission_rate: t.commission_rate, is_credit: t.is_credit, client_id: t.client_id, 
    product_id: t.product_id, discount: t.discount || 0, original_amount: t.original_amount || t.amount
  }));
};

export const addKitaTransaction = async (userId: string, transaction: Omit<KitaTransaction, 'id'>) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_transactions').insert({
    id: newId, user_id: userId, type: transaction.type, amount: transaction.amount,
    label: transaction.label, category: transaction.category, payment_method: transaction.paymentMethod,
    date: transaction.date, staff_name: transaction.staffName, commission_rate: transaction.commissionRate,
    is_credit: transaction.isCredit, client_id: transaction.clientId, product_id: transaction.productId,
    original_amount: transaction.originalAmount || transaction.amount, discount: transaction.discount || 0
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
  await supabase.from('kita_clients').update(dbUpdates).eq('id', id);
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
    alert_threshold: p.alertThreshold, category: p.category, supplier_id: p.supplier_id
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
