import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './App.css';

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

  const handleLogin = (authenticated: boolean, userData: any) => {
    setIsAuthenticated(authenticated);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Role-based dashboard routing
  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'owner':
        return <OwnerDashboard />;
      case 'nominee':
        return <NomineeDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <OwnerDashboard />;
    }
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/', label: 'Dashboard', icon: 'Home' },
    ];

    switch (user?.role) {
      case 'owner':
        return [
          ...baseItems,
          { path: '/assets', label: 'Assets', icon: 'TrendingUp' },
          { path: '/nominees', label: 'Nominees', icon: 'Users' },
          { path: '/vault', label: 'Vault', icon: 'Lock' },
          { path: '/reports', label: 'Reports', icon: 'BookOpen' },
          { path: '/settings', label: 'Settings', icon: 'Settings' },
        ];
      case 'nominee':
        return [
          ...baseItems,
          { path: '/vault', label: 'Vault Requests', icon: 'Lock' },
          { path: '/claim-guides', label: 'Claim Guides', icon: 'BookOpen' },
        ];
      case 'admin':
        return [
          ...baseItems,
          { path: '/vault', label: 'Vault Management', icon: 'Lock' },
          { path: '/settings', label: 'Admin Settings', icon: 'Settings' },
        ];
      default:
        return baseItems;
    }
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout} navigationItems={getNavigationItems()}>
        <Routes>
          <Route path="/" element={getDashboardComponent()} />
          <Route path="/dashboard" element={getDashboardComponent()} />
          
          {/* Owner-only routes */}
          {user?.role === 'owner' && (
            <>
              <Route path="/assets" element={<Assets />} />
              <Route path="/nominees" element={<Nominees />} />
              <Route path="/reports" element={<Reports />} />
            </>
          )}
          
          {/* Nominee-only routes */}
          {user?.role === 'nominee' && (
            <Route path="/claim-guides" element={<ClaimGuides />} />
          )}
          
          {/* Shared routes */}
          <Route path="/vault" element={<Vault />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
