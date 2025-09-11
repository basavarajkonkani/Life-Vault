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

export const createDemoUser = () => {
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
  window.location.reload();
  return demoUser;
};

// Make debug functions available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAuth = clearAuth;
  (window as any).createDemoUser = createDemoUser;
  
  console.log('🔧 Debug utilities available:');
  console.log('- debugAuth() - Check authentication state');
  console.log('- clearAuth() - Clear authentication and reload');
  console.log('- createDemoUser() - Create demo user and reload');
}
