import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, 
  Menu, 
  X, 
  Home, 
  TrendingUp, 
  Users, 
  Lock, 
  BookOpen, 
  Settings,
  LogOut,
  User
} from 'lucide-react';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
}

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  navigationItems: NavigationItem[];
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  navigationItems 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Home,
      TrendingUp,
      Users,
      Lock,
      BookOpen,
      Settings,
      Building2,
    };
    const IconComponent = icons[iconName] || Home;
    return <IconComponent className="w-5 h-5" />;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-500';
      case 'nominee':
        return 'bg-green-500';
      case 'admin':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isMobile ? 'z-50' : 'z-10'}
        w-64 bg-primary-600 text-white transition-transform duration-300 ease-in-out
        ${!isMobile ? 'translate-x-0' : ''}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          <h1 className="text-xl font-bold">LifeVault</h1>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  sidebar-item ${isActive ? 'active' : ''}
                  ${isMobile ? 'mb-2' : ''}
                `}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                {getIcon(item.icon)}
                <span className="ml-3">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full ${getRoleColor(user?.role || 'user')} flex items-center justify-center`}>
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-primary-200 truncate">
                {user?.role === 'owner' ? 'Asset Owner' : 
                 user?.role === 'nominee' ? 'Nominee' : 
                 user?.role === 'admin' ? 'Admin' : 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="mt-3 w-full flex items-center text-sm text-primary-200 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        {isMobile && (
          <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">LifeVault</h1>
            <div className="w-9 h-9" /> {/* Spacer for centering */}
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
