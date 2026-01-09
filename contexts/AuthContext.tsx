
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, saveUserProfile, getProfileByPhone } from '../services/supabase';
import { UserProfile } from '../types';
import { COACH_KITA_AVATAR, SUPER_ADMIN_PHONE_NUMBER, TRAINING_CATALOG } from '../constants';

const MASTER_ADMIN_EMAIL = (window as any).process?.env?.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  loginManually: (phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshProfile: async () => {},
  loginManually: async () => false,
  logout: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user?.uid) {
      const profile = await getUserProfile(user.uid);
      if (profile) setUser(profile);
    }
  };

  const handleUserSetup = async (authUser: any) => {
    const uid = authUser.id;
    const phone = authUser.phone || '';
    const email = (authUser.email || '').toLowerCase();
    
    let profile = await getUserProfile(uid);
    
    if (!profile && email === MASTER_ADMIN_EMAIL.toLowerCase()) {
      console.log("AuthContext: Initialisation du profil SUPER_ADMIN pour", email);
      const adminProfile: UserProfile = {
        uid,
        phoneNumber: phone || SUPER_ADMIN_PHONE_NUMBER,
        email: email,
        firstName: 'Coach',
        lastName: 'Kita',
        establishmentName: "Go'Top Pro HQ",
        photoURL: COACH_KITA_AVATAR,
        role: 'SUPER_ADMIN',
        isActive: true,
        isAdmin: true,
        isKitaPremium: true,
        kitaPremiumUntil: '2099-01-01',
        hasPerformancePack: true,
        badges: [],
        purchasedModuleIds: TRAINING_CATALOG.map(m => m.id),
        pendingModuleIds: [],
        actionPlan: [],
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(adminProfile);
      profile = adminProfile;
    }
    
    if (profile) {
      setUser(profile);
    }
  };

  const loginManually = async (phone: string): Promise<boolean> => {
    const profile = await getProfileByPhone(phone);
    if (profile && profile.isActive) {
      setUser(profile);
      localStorage.setItem('gotop_manual_phone', phone);
      return true;
    }
    return false;
  };

  useEffect(() => {
    // 1. Initial Load
    const initAuth = async () => {
      setLoading(true);
      if (supabase) {
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (session?.user) {
          await handleUserSetup(session.user);
          setLoading(false);
          return;
        }
      }
      
      const savedPhone = localStorage.getItem('gotop_manual_phone');
      if (savedPhone) {
        const profile = await getProfileByPhone(savedPhone);
        if (profile && profile.isActive) setUser(profile);
        else localStorage.removeItem('gotop_manual_phone');
      }
      setLoading(false);
    };

    initAuth();

    // 2. Real-time Listen (Crucial pour la redirection immédiate après Login)
    let authListener: any = null;
    if (supabase) {
      const { data } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
        console.log("Auth Event:", event);
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserSetup(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (supabase) await (supabase.auth as any).signOut();
    localStorage.removeItem('gotop_manual_phone');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile, loginManually, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
