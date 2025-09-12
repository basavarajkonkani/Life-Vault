// Force SPA routing deployment: 2025-09-12T10:22:20.088Z
import React, { Suspense, lazy, memo, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import ResponsiveLayout from "./components/ResponsiveLayout";
import Login from "./pages/Login";
import "./App.css";

// Lazy load components
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

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple navigation items
const getNavigationItems = (userRole = "owner") => {
  return [
    { path: "/", label: "Dashboard", icon: "Home" },
    { path: "/assets", label: "Assets", icon: "TrendingUp" },
    { path: "/nominees", label: "Nominees", icon: "Users" },
    { path: "/vault", label: "Vault", icon: "Lock" },
    { path: "/trading-accounts", label: "Trading Accounts", icon: "Building2" },
    { path: "/reports", label: "Reports", icon: "BarChart3" },
    { path: "/settings", label: "Settings", icon: "Settings" },
  ];
};

// Login page component
const LoginPage = memo(() => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user && userProfile) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
});

// Main app component
const MainApp = memo(() => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  const navigationItems = getNavigationItems(userProfile?.role);

  return (
    <ResponsiveLayout user={userProfile} navigationItems={navigationItems}>
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

// App content
const AppContent = memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Router>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/*" element={<MainApp />} />
                </Routes>
              </Router>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
});

// Main App component
const App = () => {
  return (
    <div className="App">
      <AppContent />
    </div>
  );
};

export default App;