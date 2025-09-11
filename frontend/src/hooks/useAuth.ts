import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { getUserId } from '../lib/supabase';

export const useAuth = () => {
  const auth = useAuthContext();
  
  // Get user ID with fallback to localStorage for demo mode
  const getUserIdSafe = () => {
    if (auth.user?.id) {
      return auth.user.id;
    }
    
    // Fallback to localStorage for demo mode
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      console.error('Error getting user ID from localStorage:', error);
    }
    
    return null;
  };

  const isAuthenticated = () => {
    return !!(auth.user || localStorage.getItem('user'));
  };

  const getUserRole = () => {
    if (auth.user?.user_metadata?.role) {
      return auth.user.user_metadata.role;
    }
    
    // Fallback to localStorage for demo mode
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.role;
      }
    } catch (error) {
      console.error('Error getting user role from localStorage:', error);
    }
    
    return 'owner';
  };

  return {
    ...auth,
    getUserId: getUserIdSafe,
    isAuthenticated: isAuthenticated(),
    getUserRole,
  };
};
