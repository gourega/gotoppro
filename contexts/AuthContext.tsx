
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, saveUserProfile, getProfileByPhone } from '../services/supabase';
import { UserProfile } from '../types';
import { COACH_KITA_AVATAR, SUPER_ADMIN_PHONE_NUMBER, BADGES } from '../constants';

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
    const initAuth = async () => {
      setLoading(true);
      
      // 1. Check Supabase Session (for Admins)
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleUserSetup(session.user);
          setLoading(false);
          return;
        }
      }

      // 2. Check Manual Session (for Clients)
      const savedPhone = localStorage.getItem('gotop_manual_phone');
      if (savedPhone) {
        const profile = await getProfileByPhone(savedPhone);
        if (profile && profile.isActive) {
          setUser(profile);
        } else {
          localStorage.removeItem('gotop_manual_phone');
        }
      }
      
      setLoading(false);
    };

    initAuth();

    // Listener for Supabase Auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        handleUserSetup(session.user);
      } else if (event === 'SIGNED_OUT') {
        if (!localStorage.getItem('gotop_manual_phone')) {
          setUser(null);
        }
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSetup = async (authUser: any) => {
    const uid = authUser.id;
    const phone = authUser.phone || '';
    const email = (authUser.email || '').toLowerCase();
    const isMaster = email === MASTER_ADMIN_EMAIL.toLowerCase() || phone === SUPER_ADMIN_PHONE_NUMBER;

    if (isMaster) {
      const adminProfile: UserProfile = {
        uid,
        phoneNumber: phone,
        email: email,
        firstName: 'Coach',
        lastName: 'Kita',
        establishmentName: "Go'Top Pro HQ",
        photoURL: COACH_KITA_AVATAR,
        bio: "Mentor d’élite avec 25 ans d'expertise terrain en Afrique de l’Ouest, j’ai consacré ma vie à l’émancipation des professionnels de la beauté. Héritier direct de l’aventure APB lancée en 2014, je fusionne aujourd'hui l'exigence des traditions d'excellence avec la puissance de l'IA. Ma mission est claire : transformer votre talent brut en un empire structuré, rentable et prestigieux.",
        role: 'SUPER_ADMIN',
        isActive: true,
        isAdmin: true,
        badges: BADGES.map(b => b.id), // Tous les trophées activés pour le Super Admin
        purchasedModuleIds: [],
        pendingModuleIds: [],
        actionPlan: [],
        createdAt: new Date().toISOString()
      };
      setUser(adminProfile);
      
      getUserProfile(uid).then(dbProfile => {
        if (!dbProfile) saveUserProfile(adminProfile);
        else {
          // On s'assure que même si chargé de la DB, le Super Admin garde ses badges et sa bio par défaut
          setUser({
            ...dbProfile,
            badges: BADGES.map(b => b.id),
            role: 'SUPER_ADMIN',
            isAdmin: true
          });
        }
      });
      return;
    }

    const profile = await getUserProfile(uid);
    if (profile) setUser(profile);
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
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
