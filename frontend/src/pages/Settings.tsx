import React, { useState } from 'react';
import { User, Shield, Bell, Globe, Smartphone, Key, Download } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    address: '123 Main Street, Mumbai, Maharashtra 400001'
  });

  const [notifications, setNotifications] = useState({
    renewal: true,
    maturity: true,
    alerts: false,
    newsletter: true
  });

  const [preferences, setPreferences] = useState({
    language: 'english',
    theme: 'light',
    currency: 'INR'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Key className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Change PIN</h3>
                      <p className="text-sm text-gray-500">Update your 4-digit security PIN</p>
                    </div>
                  </div>
                  <button className="btn-secondary">Change PIN</button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button className="btn-primary">Enable 2FA</button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Download className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Download Data</h3>
                      <p className="text-sm text-gray-500">Export all your data</p>
                    </div>
                  </div>
                  <button className="btn-secondary">Download</button>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Device Log</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">MacBook Air</h3>
                    <p className="text-sm text-gray-500">Last active: 2 minutes ago</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Current
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">iPhone 14</h3>
                    <p className="text-sm text-gray-500">Last active: 1 hour ago</p>
                  </div>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Policy Renewal Reminders</h3>
                  <p className="text-sm text-gray-500">Get notified before policy expiration</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.renewal}
                  onChange={(e) => handleNotificationChange('renewal', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Maturity Alerts</h3>
                  <p className="text-sm text-gray-500">FD and investment maturity notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.maturity}
                  onChange={(e) => handleNotificationChange('maturity', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Price Alerts</h3>
                  <p className="text-sm text-gray-500">Stock and crypto price movement alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.alerts}
                  onChange={(e) => handleNotificationChange('alerts', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Newsletter</h3>
                  <p className="text-sm text-gray-500">Financial planning tips and updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.newsletter}
                  onChange={(e) => handleNotificationChange('newsletter', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="btn-primary">Save Preferences</button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">App Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="input-field"
                >
                  <option value="english">English</option>
                  <option value="hindi">हिंदी (Hindi)</option>
                  <option value="kannada">ಕನ್ನಡ (Kannada)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  className="input-field"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="input-field"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button className="btn-primary">Save Preferences</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 bg-red-50">
        <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-900">Export All Data</h3>
              <p className="text-sm text-red-700">Download a copy of all your data</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">
              Export Data
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 