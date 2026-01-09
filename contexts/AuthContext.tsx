
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, saveUserProfile, getProfileByPhone } from '../services/supabase';
import { UserProfile } from '../types';
import { COACH_KITA_AVATAR, SUPER_ADMIN_PHONE_NUMBER, TRAINING_CATALOG } from '../constants';

// Sécurisation de l'email admin : priorité à l'env, sinon fallback dur sur votre email
const MASTER_ADMIN_EMAIL = (process.env.VITE_ADMIN_EMAIL && process.env.VITE_ADMIN_EMAIL.trim() !== "" 
  ? process.env.VITE_ADMIN_EMAIL 
  : "teletechnologyci@gmail.com").toLowerCase().trim();

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
    if (!authUser) {
      console.log("Auth: Aucun utilisateur authentifié");
      setUser(null);
      setLoading(false);
      return;
    }

    const uid = authUser.id;
    const email = (authUser.email || '').toLowerCase().trim();
    
    console.log("Auth: Comparaison...", {
      current: email,
      target: MASTER_ADMIN_EMAIL,
      match: email === MASTER_ADMIN_EMAIL
    });
    
    try {
      let profile = await getUserProfile(uid);
      
      // Reconnaissance forcée du Super Admin
      if (email === MASTER_ADMIN_EMAIL) {
        console.log("Auth: MASTER ADMIN RECONNU - Vérification profil...");
        
        if (!profile || !profile.isAdmin) {
          console.log("Auth: Création/Réparation du profil Admin en cours...");
          const adminProfile: UserProfile = {
            uid,
            phoneNumber: profile?.phoneNumber || SUPER_ADMIN_PHONE_NUMBER,
            email: email,
            firstName: profile?.firstName || 'Coach',
            lastName: profile?.lastName || 'Kita',
            role: 'SUPER_ADMIN',
            isActive: true,
            isAdmin: true,
            isKitaPremium: true,
            hasPerformancePack: true,
            badges: profile?.badges || [],
            purchasedModuleIds: TRAINING_CATALOG.map(m => m.id),
            pendingModuleIds: [],
            actionPlan: profile?.actionPlan || [],
            createdAt: profile?.createdAt || new Date().toISOString()
          };
          await saveUserProfile(adminProfile);
          profile = adminProfile;
        }
      }
      
      setUser(profile);
      console.log("Auth: Setup terminé. Profil chargé:", !!profile);
    } catch (err) {
      console.error("Auth: Erreur critique setup:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log("Auth: Initialisation session...");
      if (supabase) {
        try {
          const { data: { session } } = await (supabase.auth as any).getSession();
          if (session?.user) {
            await handleUserSetup(session.user);
          } else {
            setLoading(false);
          }
        } catch (e) {
          console.error("Auth: Erreur session initiale", e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initAuth();

    if (supabase) {
      const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
        console.log("Auth Event détecté:", event);
        if (session?.user) {
          await handleUserSetup(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      });
      return () => subscription.unsubscribe();
    }
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
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile, loginManually, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
