import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: "owner" | "nominee" | "admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: AuthError | null }>;
  signInWithOtp: (phone: string) => Promise<{ error: AuthError | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | null }>;
  getUserId: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo user profile for testing
  const demoUserProfile: UserProfile = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Demo User',
    email: 'demo@lifevault.com',
    phone: '+91 9876543210',
    address: '123 Demo Street, Demo City',
    role: 'owner',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Demo user for testing
  const demoUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'demo@lifevault.com',
    phone: '+91 9876543210',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    identities: [],
    factors: []
  };

  // Demo session for testing
  const demoSession: Session = {
    access_token: 'demo-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: demoUser
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if user is already logged in (from localStorage or session)
        const savedUser = localStorage.getItem('lifevault_user');
        const savedSession = localStorage.getItem('lifevault_session');
        
        if (savedUser && savedSession) {
          // User is already logged in
          if (mounted) {
            setSession(JSON.parse(savedSession));
            setUser(JSON.parse(savedUser));
            setUserProfile(demoUserProfile);
            setLoading(false);
          }
        } else {
          // No saved session, user needs to login
          if (mounted) {
            setUser(null);
            setUserProfile(null);
            setSession(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // For demo purposes, accept any email/password
      if (email && password) {
        setSession(demoSession);
        setUser(demoUser);
        setUserProfile(demoUserProfile);
        
        // Save to localStorage for persistence
        localStorage.setItem('lifevault_user', JSON.stringify(demoUser));
        localStorage.setItem('lifevault_session', JSON.stringify(demoSession));
        
        return { error: null };
      } else {
        return { error: { message: "Email and password are required" } as AuthError };
      }
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // For demo purposes, just sign in with demo user
      setSession(demoSession);
      setUser(demoUser);
      setUserProfile(demoUserProfile);
      
      // Save to localStorage for persistence
      localStorage.setItem('lifevault_user', JSON.stringify(demoUser));
      localStorage.setItem('lifevault_session', JSON.stringify(demoSession));
      
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signInWithOtp = async (phone: string) => {
    try {
      // For demo purposes, just return success
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      // For demo purposes, accept any OTP
      if (token) {
        setSession(demoSession);
        setUser(demoUser);
        setUserProfile(demoUserProfile);
        
        // Save to localStorage for persistence
        localStorage.setItem('lifevault_user', JSON.stringify(demoUser));
        localStorage.setItem('lifevault_session', JSON.stringify(demoSession));
        
        return { error: null };
      } else {
        return { error: { message: "OTP is required" } as AuthError };
      }
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Clear all state
      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      // Clear localStorage
      localStorage.removeItem('lifevault_user');
      localStorage.removeItem('lifevault_session');
      
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshSession = async () => {
    try {
      // For demo purposes, just return the demo session
      return demoSession;
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: { message: "No user logged in" } as AuthError };
      }

      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updates });
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const getUserId = () => {
    return user?.id || null;
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signInWithOtp,
    verifyOtp,
    signOut,
    refreshSession,
    updateProfile,
    getUserId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
