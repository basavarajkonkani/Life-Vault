import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Nominees from './pages/Nominees';
import Vault from './pages/Vault';
import ClaimGuides from './pages/ClaimGuides';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/nominees" element={<Nominees />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/claim-guides" element={<ClaimGuides />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
