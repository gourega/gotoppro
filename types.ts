
export type UserRole = 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserActionCommitment {
  moduleId: string;
  moduleTitle: string;
  action: string;
  date: string;
  isCompleted: boolean;
}

// Structures pour KITA Comptabilité
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
  commissionRate?: number;
}

export interface KitaDebt {
  id: string;
  personName: string;
  amount: number;
  type: 'CREDIT' | 'DEBT';
  dueDate?: string;
  isPaid: boolean;
  createdAt: string;
}

export interface KitaProduct {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  alertThreshold: number;
}

export interface UserProfile {
  uid: string;
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  establishmentName?: string;
  photoURL?: string;
  bio?: string;
  employeeCount?: number;
  yearsOfExistence?: number;
  role: UserRole;
  isActive: boolean;
  isAdmin: boolean;
  
  // Statut KITA
  isKitaPremium: boolean;
  kitaPremiumUntil?: string; 
  monthlyRentGoal?: number;
  hasPerformancePack: boolean; // Nouveau : Pack additionnel
  
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

export interface CoachMessage {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  content: string;
  date: string;
  isRead: boolean;
}
