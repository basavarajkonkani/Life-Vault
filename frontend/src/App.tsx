import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  // Check for existing authentication on app load
  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData: any, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', token);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  if (!isAuthenticated) {
    return (
      <NotificationProvider>
        <Login onLogin={handleLogin} />
      </NotificationProvider>
    );
  }

  const navigationItems = getNavigationItems(user?.role || 'owner');

  return (
    <NotificationProvider>
      <Router>
        <Layout user={user} onLogout={handleLogout} navigationItems={navigationItems}>
          <Routes>
            <Route path="/" element={
              user?.role === 'owner' ? <OwnerDashboard /> :
              user?.role === 'nominee' ? <NomineeDashboard /> :
              user?.role === 'admin' || user?.role === 'super-admin' ? <AdminDashboard /> :
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
    </NotificationProvider>
  );
}

export default App;
