
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, saveUserProfile, getProfileByPhone } from '../services/supabase';
import { UserProfile } from '../types';
import { COACH_KITA_AVATAR, SUPER_ADMIN_PHONE_NUMBER, TRAINING_CATALOG } from '../constants';

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

  const handleUserSetup = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const uid = authUser.id;
    const email = (authUser.email || '').toLowerCase().trim();
    
    console.log("Auth: Vérification Master Admin...", email);

    // LOGIQUE DE DÉBLOCAGE IMMÉDIAT
    if (email === MASTER_ADMIN_EMAIL) {
      console.log("Auth: ACCÈS MAÎTRE DÉTECTÉ - Libération de l'interface");
      
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

      // On définit l'utilisateur tout de suite pour débloquer le UI
      setUser(adminProfile);
      setLoading(false);

      // On tente de sauvegarder/vérifier en arrière-plan sans "await" bloquant
      getUserProfile(uid).then(profile => {
        if (!profile || !profile.isAdmin) {
          saveUserProfile(adminProfile).catch(e => console.error("Note: Erreur synchro DB (background)", e));
        }
      }).catch(() => {});
      
      return; // On arrête l'exécution ici pour ne pas bloquer sur le prochain await
    }

    // Flux normal pour les autres utilisateurs
    try {
      const profile = await getUserProfile(uid);
      setUser(profile);
    } catch (err) {
      console.error("Auth: Erreur profil", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (supabase) {
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (session?.user) await handleUserSetup(session.user);
        else setLoading(false);
      } else {
        setLoading(false);
      }
    };
    initAuth();

    if (supabase) {
      const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
        if (session?.user) await handleUserSetup(session.user);
        else {
          setUser(null);
          setLoading(false);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

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
