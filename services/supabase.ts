import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction, KitaDebt, KitaProduct, KitaSupplier, KitaService, UserRole } from '../types';

/**
 * Robust polyfill for process.env in browser environments.
 */
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}
if (typeof (window as any).process.env === 'undefined') {
  (window as any).process.env = {};
}

// Safely get globals defined by build tool
// @ts-ignore
const definedUrl = typeof __KITA_URL__ !== 'undefined' ? __KITA_URL__ : "";
// @ts-ignore
const definedKey = typeof __KITA_KEY__ !== 'undefined' ? __KITA_KEY__ : "";
// @ts-ignore
const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toLocaleString();

const getSafeEnv = (key: string): string => {
  if (key === 'VITE_SUPABASE_URL' && definedUrl) return definedUrl;
  if (key === 'VITE_SUPABASE_ANON_KEY' && definedKey) return definedKey;
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
      return (process.env as any)[key];
    }
  } catch (e) {}
  return "";
};

const supabaseUrl = getSafeEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getSafeEnv('VITE_SUPABASE_ANON_KEY');

export const BUILD_CONFIG = {
  hasUrl: !!supabaseUrl && supabaseUrl.length > 5,
  hasKey: !!supabaseAnonKey && supabaseAnonKey.length > 20,
  urlSnippet: supabaseUrl ? (supabaseUrl.substring(0, 12) + '...') : 'MANQUANT',
  keySnippet: supabaseAnonKey ? (supabaseAnonKey.substring(0, 8) + '***') : 'MANQUANT',
  buildTime,
  version: "2.9.2-STABLE"
};

const getSafeSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (e) {
    console.error("Supabase Initialization Error:", e);
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

/**
 * STRATÉGIE DE DOUBLE ÉCRITURE :
 * On écrit systématiquement dans les deux formats (CamelCase et SnakeCase)
 * pour garantir la compatibilité avec le schéma réel de la base Supabase.
 */
const mapProfileToDB = (profile: Partial<UserProfile>): any => {
  const db: any = {};
  
  if (profile.uid !== undefined) db.uid = profile.uid;
  
  if (profile.phoneNumber !== undefined) {
    db.phoneNumber = profile.phoneNumber;
    db.phone_number = profile.phoneNumber;
  }
  
  if (profile.pinCode !== undefined) {
    db.pinCode = profile.pinCode;
    db.phone_code = profile.pinCode;
  }
  
  if (profile.email !== undefined) db.email = profile.email;
  
  if (profile.firstName !== undefined) {
    db.firstName = profile.firstName;
    db.first_name = profile.firstName;
  }
  
  if (profile.lastName !== undefined) {
    db.lastName = profile.lastName;
    db.last_name = profile.lastName;
  }
  
  if (profile.establishmentName !== undefined) {
    db.establishmentName = profile.establishmentName;
    db.establishment_name = profile.establishmentName;
  }
  
  if (profile.photoURL !== undefined) {
    db.photoURL = profile.photoURL;
    db.photo_url = profile.photoURL;
  }
  
  if (profile.bio !== undefined) db.bio = profile.bio;
  
  if (profile.adminNotes !== undefined) {
    db.adminNotes = profile.adminNotes;
    db.admin_notes = profile.adminNotes;
  }
  
  if (profile.employeeCount !== undefined) {
    db.employeeCount = profile.employeeCount;
    db.employee_count = profile.employeeCount;
  }
  
  if (profile.openingYear !== undefined) {
    db.openingYear = profile.openingYear;
    db.opening_year = profile.openingYear;
  }
  
  if (profile.role !== undefined) db.role = profile.role;
  
  if (profile.isActive !== undefined) {
    db.isActive = profile.isActive;
    db.is_active = profile.isActive;
  }
  
  if (profile.isAdmin !== undefined) {
    db.isAdmin = profile.isAdmin;
    db.is_admin = profile.isAdmin;
  }
  
  if (profile.isPublic !== undefined) {
    db.isPublic = profile.isPublic;
    db.is_public = profile.isPublic;
  }
  
  if (profile.isKitaPremium !== undefined) {
    db.isKitaPremium = profile.isKitaPremium;
    db.is_kita_premium = profile.isKitaPremium;
  }
  
  if (profile.kitaPremiumUntil !== undefined) {
    db.kitaPremiumUntil = profile.kitaPremiumUntil;
    db.kita_premium_until = profile.kitaPremiumUntil;
  }
  
  if (profile.hasPerformancePack !== undefined) {
    db.hasPerformancePack = profile.hasPerformancePack;
    db.has_performance_pack = profile.hasPerformancePack;
  }
  
  if (profile.hasStockPack !== undefined) {
    db.hasStockPack = profile.hasStockPack;
    db.has_stock_pack = profile.hasStockPack;
  }
  
  if (profile.crmExpiryDate !== undefined) {
    db.crmExpiryDate = profile.crmExpiryDate;
    db.crm_expiry_date = profile.crmExpiryDate;
  }
  
  if (profile.strategicAudit !== undefined) {
    db.strategicAudit = profile.strategicAudit;
    db.strategic_audit = profile.strategicAudit;
  }
  
  if (profile.marketingCredits !== undefined) {
    db.marketingCredits = profile.marketingCredits;
    db.marketing_credits = profile.marketingCredits;
  }
  
  if (profile.gmbStatus !== undefined) {
    db.gmbStatus = profile.gmbStatus;
    db.gmb_status = profile.gmbStatus;
  }
  
  if (profile.gmbUrl !== undefined) {
    db.gmbUrl = profile.gmbUrl;
    db.gmb_url = profile.gmbUrl;
  }
  
  if (profile.gmbContractSignedAt !== undefined) {
    db.gmbContractSignedAt = profile.gmbContractSignedAt;
    db.gmb_contract_signed_at = profile.gmbContractSignedAt;
  }
  
  if (profile.badges !== undefined) db.badges = profile.badges;
  if (profile.purchasedModuleIds !== undefined) {
    db.purchasedModuleIds = profile.purchasedModuleIds;
    db.purchased_module_ids = profile.purchasedModuleIds;
  }
  if (profile.pendingModuleIds !== undefined) {
    db.pendingModuleIds = profile.pendingModuleIds;
    db.pending_module_ids = profile.pendingModuleIds;
  }
  if (profile.actionPlan !== undefined) {
    db.actionPlan = profile.actionPlan;
    db.action_plan = profile.actionPlan;
  }
  
  if (profile.referredBy !== undefined) {
    db.referredBy = profile.referredBy;
    db.referred_by = profile.referredBy;
  }
  
  if (profile.referralCount !== undefined) {
    db.referralCount = profile.referralCount;
    db.referral_count = profile.referralCount;
  }
  
  if (profile.createdAt !== undefined) {
    db.createdAt = profile.createdAt;
    db.created_at = profile.createdAt;
  }
  
  if (profile.progress !== undefined) db.progress = profile.progress;
  if (profile.attempts !== undefined) db.attempts = profile.attempts;
  
  return db;
};

const mapProfileFromDB = (data: any): UserProfile | null => {
  if (!data) return null;
  const actualUid = data.uid || data.id;
  
  return {
    uid: actualUid,
    phoneNumber: data.phoneNumber || data.phone_number || '',
    pinCode: data.pinCode || data.phone_code || '1234',
    email: data.email,
    firstName: data.firstName || data.first_name || '',
    lastName: data.lastName || data.last_name || '',
    establishmentName: data.establishmentName || data.establishment_name || '',
    photoURL: data.photoURL || data.photo_url || '',
    bio: data.bio || '',
    adminNotes: data.adminNotes || data.admin_notes || '',
    employeeCount: data.employeeCount || data.employee_count || 0,
    yearsOfExistence: data.yearsOfExistence || data.years_of_existence || 0,
    openingYear: data.openingYear || data.opening_year || 0,
    role: (data.role || 'CLIENT') as UserRole,
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
    gmbStatus: data.gmbStatus || data.gmb_status || 'NONE',
    gmbUrl: data.gmbUrl || data.gmb_url || '',
    gmbContractSignedAt: data.gmbContractSignedAt || data.gmb_contract_signed_at || '',
    badges: Array.isArray(data.badges) ? data.badges : [],
    purchasedModuleIds: Array.isArray(data.purchasedModuleIds || data.purchased_module_ids) ? (data.purchasedModuleIds || data.purchased_module_ids) : [],
    pendingModuleIds: Array.isArray(data.pendingModuleIds || data.pending_module_ids) ? (data.pendingModuleIds || data.pending_module_ids) : [],
    actionPlan: Array.isArray(data.actionPlan || data.action_plan) ? (data.actionPlan || data.action_plan) : [],
    referralCount: data.referralCount || data.referral_count || 0,
    referredBy: data.referredBy || data.referred_by || '',
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    progress: data.progress || {},
    attempts: data.attempts || {}
  } as UserProfile;
};

export const getProfileByPhone = async (phoneNumber: string) => {
  if (!supabase) return null;
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const last10 = digitsOnly.slice(-10);
  if (!last10) return null;
  try {
    const { data, error } = await supabase.from('profiles').select('*').or(`phoneNumber.eq.${digitsOnly},phone_number.eq.${digitsOnly},phoneNumber.ilike.*${last10},phone_number.ilike.*${last10}`).maybeSingle();
    if (error) return null;
    return mapProfileFromDB(data);
  } catch (err) { return null; }
};

export const getUserProfile = async (uid: string) => {
  if (!supabase || !uid) return null;
  try {
    const { data, error } = await supabase.from('profiles').select('*').or(`uid.eq.${uid}`).maybeSingle();
    if (error) {
        const { data: fallback, error: fbError } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (fbError) throw fbError;
        return mapProfileFromDB(fallback);
    }
    return mapProfileFromDB(data);
  } catch (e) { return null; }
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) return { success: true };
  try {
    const dbData = mapProfileToDB(profile);
    const { error } = await supabase.from('profiles').upsert(dbData, { onConflict: 'uid' });
    if (error) throw error;
    return { success: true };
  } catch (err) { 
    console.error("Save Error:", err);
    throw err; 
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!supabase || !uid) return;
  try {
    const dbData = mapProfileToDB(updates);
    const { error } = await supabase.from('profiles').update(dbData).eq('uid', uid);
    if (error) {
        await supabase.from('profiles').update(dbData).eq('id', uid);
    }
  } catch (err) {
    console.error("Update Error:", err);
  }
};

export const getAllUsers = async () => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return (data || []).map(mapProfileFromDB) as UserProfile[];
  } catch (e) { return []; }
};

export const getPublicDirectory = async () => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'SUPER_ADMIN')
      .filter('isActive', 'eq', true)
      .filter('isPublic', 'eq', true)
      .order('establishmentName', { ascending: true });
        
    if (error) throw error;
    return (data || []).map(mapProfileFromDB) as UserProfile[];
  } catch (e) { 
    console.error("Erreur annuaire:", e);
    return []; 
  }
};

export const getKitaTransactions = async (userId: string): Promise<KitaTransaction[]> => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase.from('kita_transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(t => ({
      id: t.id, 
      type: t.type, 
      amount: t.amount, 
      label: t.label, 
      category: t.category,
      paymentMethod: t.payment_method, 
      date: t.date, 
      staffName: t.staff_name,
      commission_rate: t.commission_rate, 
      tipAmount: t.tip_amount || 0,
      isCredit: t.is_credit, 
      clientId: t.client_id, 
      productId: t.product_id, 
      discount: t.discount || 0, 
      originalAmount: t.original_amount || t.amount
    }));
  } catch (e) { return []; }
};

export const addKitaTransaction = async (userId: string, transaction: Omit<KitaTransaction, 'id'>) => {
  if (!supabase || !userId) throw new Error("Base de données déconnectée.");
  const newId = generateUUID();
  try {
    const { error } = await supabase.from('kita_transactions').insert({
      id: newId, user_id: userId, type: transaction.type, amount: transaction.amount,
      label: transaction.label, category: transaction.category, payment_method: transaction.paymentMethod,
      // Fix: Property 'staff_name' does not exist on type 'Omit<KitaTransaction, "id">'. Using 'staffName' instead.
      date: transaction.date, staff_name: transaction.staffName, commission_rate: transaction.commission_rate,
      tip_amount: transaction.tipAmount || 0,
      is_credit: transaction.isCredit, client_id: transaction.clientId, product_id: transaction.productId,
      original_amount: transaction.originalAmount || transaction.amount, discount: transaction.discount || 0
    });
    if (error) throw error;
    return { ...transaction, id: newId } as KitaTransaction;
  } catch (err) { throw err; }
};

export const deleteKitaTransaction = async (id: string) => {
  if (supabase) await supabase.from('kita_transactions').delete().eq('id', id);
};

export const uploadProfilePhoto = async (file: File, userId: string) => {
  if (!supabase) return "";
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  try {
    const { error: uploadError } = await supabase.storage.from('kita').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('kita').getPublicUrl(filePath);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return "";
  }
};

export const getReferrals = async (userId: string) => {
  if (!supabase) return [];
  try {
    const { data: userProfile } = await supabase.from('profiles').select('phoneNumber').eq('uid', userId).maybeSingle();
    if (!userProfile) return [];
    const phone = userProfile.phoneNumber;
    const { data, error } = await supabase.from('profiles').select('*').eq('referredBy', phone);
    if (error) throw error;
    return (data || []).map(mapProfileFromDB) as UserProfile[];
  } catch (e) { return []; }
};

export const getKitaServices = async (userId: string): Promise<KitaService[]> => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase.from('kita_services').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(s => ({
      id: s.id, name: s.name, category: s.category, defaultPrice: s.default_price, isActive: s.is_active, userId: s.user_id
    }));
  } catch (e) { return []; }
};

export const addKitaService = async (userId: string, service: Omit<KitaService, 'id' | 'isActive' | 'userId'>) => {
  if (!supabase || !userId) throw new Error("Database disconnected.");
  const newId = generateUUID();
  try {
    const { error } = await supabase.from('kita_services').insert({
      id: newId, user_id: userId, name: service.name, category: service.category, default_price: service.defaultPrice, is_active: true
    });
    if (error) throw error;
    return { ...service, id: newId, isActive: true, userId } as KitaService;
  } catch (err) { throw err; }
};

export const updateKitaService = async (id: string, updates: Partial<KitaService>) => {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('kita_services').update({
      name: updates.name,
      category: updates.category,
      default_price: updates.defaultPrice
    }).eq('id', id).select().single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      defaultPrice: data.default_price,
      isActive: data.is_active,
      userId: data.user_id
    } as KitaService;
  } catch (err) { throw err; }
};

export const bulkAddKitaServices = async (userId: string, services: any[]) => {
  if (!supabase || !userId) return;
  const payload = services.map(s => ({
    id: generateUUID(),
    user_id: userId,
    name: s.name,
    category: s.category,
    default_price: s.defaultPrice,
    is_active: true
  }));
  try {
    const { error } = await supabase.from('kita_services').upsert(payload, { onConflict: 'user_id, name' });
    if (error) throw error;
  } catch (e) {
    console.warn("Import warning (might be RLS):", e);
  }
};

export const deleteKitaService = async (id: string) => {
  if (supabase) await supabase.from('kita_services').delete().eq('id', id);
};

export const getKitaStaff = async (userId: string) => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase.from('kita_staff').select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  } catch (e) { return []; }
};

export const addKitaStaff = async (userId: string, staff: any) => {
  if (!supabase || !userId) throw new Error("Database disconnected.");
  const newId = generateUUID();
  try {
    const { data, error } = await supabase.from('kita_staff').insert({
      id: newId, user_id: userId, name: staff.name, phone: staff.phone || "", 
      commission_rate: Math.round(Number(staff.commission_rate || 0)), specialty: staff.specialty || "Coiffure"
    }).select().single();
    if (error) throw error;
    return { ...staff, id: data.id, commission_rate: Number(staff.commission_rate || 0) };
  } catch (err) { throw err; }
};

export const updateKitaStaff = async (id: string, updates: any) => {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('kita_staff').update({
      name: updates.name, phone: updates.phone || "", 
      commission_rate: Math.round(Number(updates.commission_rate || 0)), specialty: updates.specialty || "Coiffure"
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  } catch (err) { throw err; }
};

export const deleteKitaStaff = async (id: string) => {
  if (supabase) await supabase.from('kita_staff').delete().eq('id', id);
};

export const getKitaClients = async (userId: string) => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase.from('kita_clients').select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  } catch (e) { return []; }
};

export const addKitaClient = async (userId: string, client: any) => {
  if (!supabase || !userId) throw new Error("Database disconnected.");
  const newId = generateUUID();
  try {
    const { error } = await supabase.from('kita_clients').insert({
      id: newId, user_id: userId, name: client.name, phone: client.phone, notes: client.notes
    });
    if (error) throw error;
    return { ...client, id: newId };
  } catch (err) { throw err; }
};

export const updateKitaClient = async (id: string, updates: any) => {
  if (!supabase) return;
  try { await supabase.from('kita_clients').update(updates).eq('id', id); } catch (err) {}
};

export const getKitaProducts = async (userId: string): Promise<KitaProduct[]> => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase.from('kita_products').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id, name: p.name, quantity: p.quantity, purchasePrice: p.purchase_price,
      sellPrice: p.sell_price, alertThreshold: p.alert_threshold, category: p.category, supplier_id: p.supplier_id
    }));
  } catch (e) { return []; }
};

export const addKitaProduct = async (userId: string, product: Omit<KitaProduct, 'id'>) => {
  if (!supabase || !userId) throw new Error("Database disconnected.");
  const newId = generateUUID();
  try {
    const { error } = await supabase.from('kita_products').insert({
      id: newId, user_id: userId, name: product.name, quantity: product.quantity,
      purchase_price: product.purchasePrice, sell_price: product.sellPrice,
      alert_threshold: product.alertThreshold, category: product.category, supplier_id: product.supplierId
    });
    if (error) throw error;
    return { ...product, id: newId } as KitaProduct;
  } catch (err) { throw err; }
};

export const getKitaSuppliers = async (userId: string): Promise<KitaSupplier[]> => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase.from('kita_suppliers').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(s => ({
      id: s.id, name: s.name, phone: s.phone, category: s.category, userId: s.user_id
    }));
  } catch (e) { return []; }
};

export const addKitaSupplier = async (userId: string, supplier: Omit<KitaSupplier, 'id' | 'userId'>) => {
  if (!supabase || !userId) throw new Error("Database disconnected.");
  const newId = generateUUID();
  try {
    const { error } = await supabase.from('kita_suppliers').insert({
      id: newId, user_id: userId, name: supplier.name, phone: supplier.phone, category: supplier.category
    });
    if (error) throw error;
    return { ...supplier, id: newId, userId } as KitaSupplier;
  } catch (err) { throw err; }
};

export const deleteKitaSupplier = async (id: string) => {
  if (supabase) await supabase.from('kita_suppliers').delete().eq('id', id);
};

export const getPublicProfile = async (uid: string) => {
  if (!supabase || !uid) return null;
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('uid', uid).eq('isPublic', true).maybeSingle();
    if (error) throw error;
    return mapProfileFromDB(data);
  } catch (e) { return null; }
};