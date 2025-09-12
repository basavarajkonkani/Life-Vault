import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://iaeiiaurhafdgprvqkti.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWlpYXVyaGFmZGdwcnZxa3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4ODE2NjMsImV4cCI6MjA3MjQ1NzY2M30.1os-X1irK-gmU7N8vdK121v-EIYJtos5goA4Gk0QMsQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get current user from Supabase auth
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user && !error) {
      console.log('getCurrentUser - Supabase user:', user);
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
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Helper function to get user ID
export const getUserId = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Helper function to clear authentication
export const clearAuth = () => {
  supabase.auth.signOut();
};
