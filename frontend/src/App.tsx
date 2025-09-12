// Force SPA routing deployment: 2025-09-12T10:20:02.227Z
// Force role selection deployment: 2025-09-12T10:17:39.440Z
// Force rebuild: 2025-09-12T10:13:04.882Z
// Updated: 2025-09-12T10:09:10.341Z
import React, { Suspense, lazy, memo, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import ResponsiveLayout from "./components/ResponsiveLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import "./App.css";

// Lazy load components for better performance with error boundaries
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const NomineeDashboard = lazy(() => import("./pages/NomineeDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Assets = lazy(() => import("./pages/Assets"));
const Nominees = lazy(() => import("./pages/Nominees"));
const Vault = lazy(() => import("./pages/Vault"));
const ClaimGuides = lazy(() => import("./pages/ClaimGuides"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const TradingAccounts = lazy(() => import("./pages/TradingAccounts"));

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
    { path: "/", label: "Dashboard", icon: "Home" },
    { path: "/assets", label: "Assets", icon: "TrendingUp" },
    { path: "/nominees", label: "Nominees", icon: "Users" },
    { path: "/vault", label: "Vault", icon: "Lock" },
    { path: "/trading-accounts", label: "Trading Accounts", icon: "Building2" },
  ];

  if (userRole === "admin") {
    return [
      ...baseItems,
      { path: "/reports", label: "Reports", icon: "BarChart3" },
      { path: "/settings", label: "Settings", icon: "Settings" },
    ];
  }

  return [
    ...baseItems,
    { path: "/reports", label: "Reports", icon: "BarChart3" },
    { path: "/settings", label: "Settings", icon: "Settings" },
  ];
};

// Login page component that redirects if already authenticated
const LoginPage = memo(() => {
  const { user, userProfile, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // If already authenticated, redirect to dashboard
  if (user && userProfile) {
    return <Navigate to="/" replace />;
  }

  // Show login page
  return <Login />;
});

// Main app component with proper routing
const MainApp = memo(() => {
  const { user, userProfile, loading } = useAuth();

  console.log("MainApp - Auth state:", { user: !!user, userProfile: !!userProfile, loading });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log("MainApp - Loading...");
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!user || !userProfile) {
    console.log("MainApp - Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("MainApp - Authenticated, showing app");
  // If authenticated, show the main app
  return <AuthenticatedApp />;
});

// Authenticated app component
const AuthenticatedApp = memo(() => {
  const { userProfile, signOut } = useAuth();
  const navigationItems = getNavigationItems(userProfile?.role || "owner");

  return (
    <ResponsiveLayout user={userProfile} onLogout={signOut} navigationItems={navigationItems}>
      <Routes>
        <Route path="/" element={<OwnerDashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/nominees" element={<Nominees />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/trading-accounts" element={<TradingAccounts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/claim-guides" element={<ClaimGuides />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
              <Router>
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/*" element={<AppWithFallback />} />
                </Routes>
              </Router>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
});

// Main App component with performance optimizations
const App: React.FC = () => {
  return (
    <div className="App optimize-rendering">
      <AppContent />
    </div>
  );
};

export default App;