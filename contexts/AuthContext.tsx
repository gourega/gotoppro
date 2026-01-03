
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
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          await handleUserSetup(session.user);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Session init error:", err);
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleUserSetup(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSetup = async (authUser: any) => {
    try {
      const uid = authUser.id;
      const phone = authUser.phone || '';
      const email = authUser.email || '';

      const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() || phone === SUPER_ADMIN_PHONE_NUMBER;
      
      let profile = await getUserProfile(uid);

      if (!profile || isMaster) {
        const newProfile: UserProfile = {
          uid,
          phoneNumber: phone,
          email: email,
          firstName: profile?.firstName || (isMaster ? 'Super' : ''),
          lastName: profile?.lastName || (isMaster ? 'Admin' : ''),
          establishmentName: profile?.establishmentName || (isMaster ? "Go'Top Pro HQ" : ''),
          role: isMaster ? 'SUPER_ADMIN' : (profile?.role || 'CLIENT'),
          isActive: isMaster ? true : (profile?.isActive || false),
          isAdmin: isMaster ? true : (profile?.isAdmin || false),
          badges: profile?.badges || [],
          purchasedModuleIds: profile?.purchasedModuleIds || [],
          pendingModuleIds: profile?.pendingModuleIds || [],
          actionPlan: profile?.actionPlan || [],
          createdAt: profile?.createdAt || new Date().toISOString()
        };
        
        // On force la sauvegarde si c'est le master pour garantir ses droits
        await saveUserProfile(newProfile);
        profile = newProfile;
      }
      
      setUser(profile);
    } catch (err) {
      console.error("Critical error in handleUserSetup:", err);
    } finally {
      setLoading(false);
    }
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
