// Debug utility functions for development
export const debugAuth = () => {
  console.log('=== AUTH DEBUG ===');
  console.log('localStorage user:', localStorage.getItem('user'));
  console.log('localStorage authToken:', localStorage.getItem('authToken'));
  
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('Parsed user:', user);
      console.log('User ID:', user.id);
      console.log('User Role:', user.role);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  console.log('==================');
};

export const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  console.log('Auth data cleared');
  window.location.reload();
};

// DISABLED: Demo user creation removed for production
export const createDemoUser = () => {
  console.warn('Demo user creation is disabled in production');
  return null;
};

// Make debug functions available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAuth = clearAuth;
  (window as any).createDemoUser = createDemoUser;
  
  console.log('🔧 Debug utilities available:');
  console.log('- debugAuth() - Check authentication state');
  console.log('- clearAuth() - Clear authentication and reload');
  console.log('- createDemoUser() - DISABLED in production');
}