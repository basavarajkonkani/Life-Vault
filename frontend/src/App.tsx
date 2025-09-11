import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import Login from './pages/Login';
import OwnerDashboard from './pages/OwnerDashboard';
import NomineeDashboard from './pages/NomineeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Assets from './pages/Assets';
import Nominees from './pages/Nominees';
import Vault from './pages/Vault';
import ClaimGuides from './pages/ClaimGuides';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import TradingAccounts from './pages/TradingAccounts';
import './App.css';

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
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

// Navigation items for different user roles
const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { path: '/', label: 'Dashboard', icon: 'Home' },
    { path: '/assets', label: 'Assets', icon: 'TrendingUp' },
    { path: '/nominees', label: 'Nominees', icon: 'Users' },
    { path: '/vault', label: 'Vault', icon: 'Lock' },
    { path: '/trading-accounts', label: 'Trading Accounts', icon: 'Building2' },
  ];

  if (userRole === 'admin' || userRole === 'super-admin') {
    return [
      ...baseItems,
      { path: '/claim-guides', label: 'Claim Guides', icon: 'BookOpen' },
      { path: '/reports', label: 'Reports', icon: 'TrendingUp' },
      { path: '/settings', label: 'Settings', icon: 'Settings' },
    ];
  }

  return [
    ...baseItems,
    { path: '/claim-guides', label: 'Claim Guides', icon: 'BookOpen' },
    { path: '/settings', label: 'Settings', icon: 'Settings' },
  ];
};

// Main App Content Component
const AppContent: React.FC = () => {
  const { user, loading, signOut, signInWithDemo } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear all cached queries on logout
      queryClient.clear();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleDemoLogin = async () => {
    try {
      await signInWithDemo();
    } catch (error) {
      console.error('Error during demo login:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleDemoLogin} />;
  }

  const navigationItems = getNavigationItems(user.role || 'owner');

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout} navigationItems={navigationItems}>
        <Routes>
          <Route path="/" element={
            user.role === 'owner' ? <OwnerDashboard /> :
            user.role === 'nominee' ? <NomineeDashboard /> :
            user.role === 'admin' || user.role === 'super-admin' ? <AdminDashboard /> :
            <OwnerDashboard />
          } />
          <Route path="/assets" element={<Assets />} />
          <Route path="/nominees" element={<Nominees />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/trading-accounts" element={<TradingAccounts />} />
          <Route path="/claim-guides" element={<ClaimGuides />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
