import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://iaeiiaurhafdgprvqkti.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWlpYXVyaGFmZGdwcnZxa3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4ODE2NjMsImV4cCI6MjA3MjQ1NzY2M30.1os-X1irK-gmU7N8vdK121v-EIYJtos5goA4Gk0QMsQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get current user from Supabase auth or localStorage fallback
export const getCurrentUser = async () => {
  try {
    // First try to get user from Supabase auth
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user && !error) {
      console.log('getCurrentUser - Supabase user:', user);
      return user;
    }

    // Fallback to localStorage for demo mode
    const userData = localStorage.getItem('user');
    console.log('getCurrentUser - localStorage userData:', userData);
    if (userData) {
      const user = JSON.parse(userData);
      console.log('getCurrentUser - parsed localStorage user:', user);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Helper function to get user data from users table
export const getUserData = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    // Check Supabase auth first
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return true;
    }

    // Fallback to localStorage
    const userData = localStorage.getItem('user');
    return !!userData;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Helper function to get user ID with multiple fallbacks
export const getUserId = () => {
  try {
    // First try to get from Supabase auth session
    const session = supabase.auth.getSession();
    if (session) {
      return session.then(({ data: { session } }) => session?.user?.id);
    }

    // Fallback to localStorage for demo mode
    const userData = localStorage.getItem('user');
    console.log('getUserId - localStorage userData:', userData);
    if (userData) {
      const user = JSON.parse(userData);
      console.log('getUserId - parsed user:', user);
      console.log('getUserId - returning user.id:', user.id);
      return user.id;
    }
    console.log('getUserId - no user data found, returning null');
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Helper function to get user ID synchronously (for React Query)
export const getUserIdSync = () => {
  try {
    // Try localStorage first for demo mode
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID sync:', error);
    return null;
  }
};

// Helper function to create demo user if not exists
export const ensureDemoUser = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.log('No user found, creating demo user');
      const demoUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Demo User',
        phone: '+91 9876543210',
        email: 'demo@lifevault.com',
        address: '123 Demo Street, Demo City',
        role: 'owner',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(demoUser));
      localStorage.setItem('authToken', 'demo-token');
      console.log('Demo user created:', demoUser);
      return demoUser;
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error ensuring demo user:', error);
    return null;
  }
};

// Helper function to clear authentication
export const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  supabase.auth.signOut();
};
