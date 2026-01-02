
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, saveUserProfile } from '../services/supabase';
import { UserProfile } from '../types';
import { SUPER_ADMIN_PHONE_NUMBER } from '../constants';

const MASTER_ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshProfile: async () => {},
  logout: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) setUser(profile);
      }
    } catch (e) {
      console.error("Refresh profile failed:", e);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserSetup(session.user);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleUserSetup(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSetup = async (authUser: any) => {
    const uid = authUser.id;
    const phone = authUser.phone;
    const email = authUser.email;

    let profile = await getUserProfile(uid);
    
    const isSuperAdminByIdentifier = isSuperAdminNumber(phone, email);

    if (!profile) {
      profile = {
        uid,
        phoneNumber: phone || '',
        email: email || '',
        firstName: isSuperAdminByIdentifier ? 'Super' : '',
        lastName: isSuperAdminByIdentifier ? 'Admin' : '',
        establishmentName: isSuperAdminByIdentifier ? "Go'Top Pro HQ" : '',
        role: isSuperAdminByIdentifier ? 'SUPER_ADMIN' : 'CLIENT',
        isActive: isSuperAdminByIdentifier ? true : false, 
        isAdmin: isSuperAdminByIdentifier ? true : false,
        badges: [],
        purchasedModuleIds: [],
        pendingModuleIds: [],
        actionPlan: [],
        createdAt: new Date().toISOString()
      };
      
      try {
        await saveUserProfile(profile);
      } catch (err) {
        console.error("Erreur création profil auto:", err);
      }
    } else if (isSuperAdminByIdentifier && profile.role !== 'SUPER_ADMIN') {
      const updatedProfile = { 
        ...profile, 
        role: 'SUPER_ADMIN' as const, 
        isAdmin: true, 
        isActive: true 
      };
      await saveUserProfile(updatedProfile);
      profile = updatedProfile;
    }
    
    setUser(profile);
    setLoading(false);
  };

  const isSuperAdminNumber = (phone: string | undefined, email: string | undefined) => {
    return phone === SUPER_ADMIN_PHONE_NUMBER || email === MASTER_ADMIN_EMAIL;
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
