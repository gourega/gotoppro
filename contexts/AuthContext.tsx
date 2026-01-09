
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, saveUserProfile, getProfileByPhone } from '../services/supabase';
import { UserProfile } from '../types';
import { COACH_KITA_AVATAR, SUPER_ADMIN_PHONE_NUMBER, TRAINING_CATALOG } from '../constants';

const MASTER_ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com";

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
    const email = (authUser.email || '').toLowerCase();
    
    let profile = await getUserProfile(uid);
    
    // Auto-création du Super Admin si l'email correspond au MASTER_ADMIN_EMAIL
    if (!profile && email === MASTER_ADMIN_EMAIL.toLowerCase()) {
      const adminProfile: UserProfile = {
        uid,
        phoneNumber: SUPER_ADMIN_PHONE_NUMBER,
        email: email,
        firstName: 'Coach',
        lastName: 'Kita',
        role: 'SUPER_ADMIN',
        isActive: true,
        isAdmin: true,
        isKitaPremium: true,
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
    
    if (profile) setUser(profile);
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      if (supabase) {
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (session?.user) await handleUserSetup(session.user);
      }
      setLoading(false);
    };
    initAuth();

    let authListener: any = null;
    if (supabase) {
      const { data } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
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

  const loginManually = async (phone: string): Promise<boolean> => {
    const profile = await getProfileByPhone(phone);
    if (profile && profile.isActive) {
      setUser(profile);
      localStorage.setItem('gotop_manual_phone', phone);
      return true;
    }
    return false;
  };

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
