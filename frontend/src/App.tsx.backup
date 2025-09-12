import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ResponsiveLayout from './components/ResponsiveLayout';
import Login from './pages/Login';
import './App.css';

// Lazy load components for better performance with error boundaries
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const NomineeDashboard = lazy(() => import('./pages/NomineeDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Assets = lazy(() => import('./pages/Assets'));
const Nominees = lazy(() => import('./pages/Nominees'));
const Vault = lazy(() => import('./pages/Vault'));
const ClaimGuides = lazy(() => import('./pages/ClaimGuides'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const TradingAccounts = lazy(() => import('./pages/TradingAccounts'));

// Create a client with optimized settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
// Memoized navigation items for better performance
const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { path: '/', label: 'Dashboard', icon: 'Home' },
    { path: '/assets', label: 'Assets', icon: 'TrendingUp' },
    { path: '/nominees', label: 'Nominees', icon: 'Users' },
    { path: '/vault', label: 'Vault', icon: 'Lock' },
    { path: '/trading-accounts', label: 'Trading Accounts', icon: 'Building2' },
  ];

  const roleSpecificItems = {
    owner: [
      ...baseItems,
      { path: '/claim-guides', label: 'Claim Guides', icon: 'BookOpen' },
      { path: '/reports', label: 'Reports', icon: 'TrendingUp' },
      { path: '/settings', label: 'Settings', icon: 'Settings' },
    ],
    nominee: [
      { path: '/', label: 'Dashboard', icon: 'Home' },
      { path: '/vault', label: 'Vault', icon: 'Lock' },
      { path: '/claim-guides', label: 'Claim Guides', icon: 'BookOpen' },
    ],
    admin: [
      ...baseItems,
      { path: '/reports', label: 'Reports', icon: 'TrendingUp' },
      { path: '/settings', label: 'Settings', icon: 'Settings' },
    ],
  };

  return roleSpecificItems[userRole as keyof typeof roleSpecificItems] || baseItems;
};

// Memoized main app component
const MainApp = memo(() => {
  const { user, signOut } = useAuth();
  const navigationItems = getNavigationItems(user?.role || 'owner');

  return (
    <ResponsiveLayout user={user} onLogout={signOut} navigationItems={navigationItems}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            user?.role === 'owner' ? <OwnerDashboard /> :
            user?.role === 'nominee' ? <NomineeDashboard /> :
            user?.role === 'admin' ? <AdminDashboard /> :
            <OwnerDashboard />
          } 
        />
        <Route path="/assets" element={<Assets />} />
        <Route path="/nominees" element={<Nominees />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/trading-accounts" element={<TradingAccounts />} />
        <Route path="/claim-guides" element={<ClaimGuides />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </ResponsiveLayout>
  );
});

// Memoized app wrapper
const AppContent = memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <MainApp />
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
});

// Main App component with performance optimizations
const App: React.FC = () => {
  // Clear query cache on app start for fresh data
  React.useEffect(() => {
    queryClient.clear();
  }, []);

  return (
    <Router>
      <div className="App optimize-rendering">
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
