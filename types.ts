
export type UserRole = 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN' | 'STAFF_ELITE' | 'STAFF_ADMIN' | 'PARTNER';

export type AnnouncementType = 'RECRUTEMENT' | 'FREELANCE' | 'VENTE_MATERIEL';
export type AnnouncementStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED';

export interface KitaAnnouncement {
  id: string;
  userId: string;
  type: AnnouncementType;
  title: string;
  description: string;
  proposedPrice?: number;
  status: AnnouncementStatus;
  createdAt: string;
  expiresAt: string;
  contactPhone: string;
  establishmentName: string;
}

export interface UserActionCommitment {
  moduleId: string;
  moduleTitle: string;
  action: string;
  date: string;
  isCompleted: boolean;
}
// ... (reste du fichier identique)
export interface KitaService {
  id: string;
  name: string;
  category: string;
  defaultPrice: number;
  isActive: boolean;
  userId: string;
}

export interface KitaBasketItem {
  label: string;
  amount: number;
  category: string;
  isProduct?: boolean;
}

export interface KitaTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  label: string; 
  category: string;
  paymentMethod: string;
  date: string;
  clientId?: string;
  productId?: string;
  staffName?: string;
  commission_rate?: number;
  tipAmount?: number;
  isCredit?: boolean; 
  discount?: number;
  originalAmount?: number;
  whatsapp_sent?: boolean;
  client_phone?: string;
}

export interface KitaDebt {
  id: string;
  clientId?: string;
  personName: string;
  amount: number;
  phone?: string;
  isPaid: boolean;
  createdAt: string;
  paidAt?: string;
}

export interface KitaProduct {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  sellPrice: number;
  alertThreshold: number;
  category: string;
  supplierId?: string;
}

export interface KitaSupplier {
  id: string;
  name: string;
  phone: string;
  category: string;
  userId: string;
}

export interface UserProfile {
  uid: string;
  phoneNumber: string;
  pinCode?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  establishmentName?: string;
  photoURL?: string;
  bio?: string;
  adminNotes?: string;
  employeeCount?: number;
  yearsOfExistence?: number;
  openingYear?: number;
  role: UserRole;
  isActive: boolean;
  isAdmin: boolean;
  isPublic: boolean;
  
  isKitaPremium: boolean;
  kitaPremiumUntil?: string; 
  hasPerformancePack: boolean;
  hasStockPack: boolean;
  crmExpiryDate?: string; 
  
  strategicAudit?: string;
  marketingCredits: number;

  // Google My Business Integration
  gmbStatus?: 'NONE' | 'PENDING' | 'ACTIVE';
  gmbUrl?: string;
  gmbContractSignedAt?: string;
  
  badges: string[];
  purchasedModuleIds: string[];
  pendingModuleIds: string[];
  actionPlan: UserActionCommitment[];
  progress?: { [moduleId: string]: number };
  attempts?: { [moduleId: string]: number };
  referredBy?: string;
  referralCount?: number;
  createdAt: string;
}

export enum ModuleStatus {
  LOCKED = 'LOCKED',
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface TrainingModule {
  id: string;
  topic: string;
  title: string;
  price: number;
  description: string;
  mini_course: string;
  lesson_content: string;
  coach_tip: string;
  strategic_mantra: string;
  aiCredits: number;
  quiz_questions: QuizQuestion[];
  exercises: string[];
  tips: string[];
  status?: ModuleStatus;
  score?: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (user: UserProfile, modules: TrainingModule[]) => boolean;
}
