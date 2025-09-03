import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="nominees" element={<Nominees />} />
          <Route path="vault" element={<Vault />} />
          <Route path="claim-guides" element={<ClaimGuides />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
