import React, { useState } from 'react';
import { Shield, Phone, User, Users, Settings } from 'lucide-react';
import { authAPI } from '../services/api';

interface LoginProps {
  onLogin: (authenticated: boolean, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'role' | 'phone' | 'otp' | 'pin'>('role');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'nominee' | 'admin' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    {
      value: 'owner',
      label: 'Asset Owner',
      description: 'Manage your assets and nominees',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      value: 'nominee',
      label: 'Nominee',
      description: 'Access assigned assets when needed',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Review and approve vault requests',
      icon: Settings,
      color: 'bg-purple-500'
    }
  ];

  const handleRoleSelection = (role: 'owner' | 'nominee' | 'admin') => {
    setSelectedRole(role);
    setStep('phone');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.sendOtp(phoneNumber, selectedRole!);
      if (response.success) {
        setUserId(response.userId);
        setStep('otp');
      } else {
        alert('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.verifyOtp(phoneNumber, otp, selectedRole!);
      if (response.success) {
        setUserId(response.userId);
        
        if (response.requiresPin) {
          setStep('pin');
        } else {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          onLogin(response.user, response.token);
        }
      } else {
        alert('Invalid OTP. Use 123456 for demo');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Error verifying OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPIN = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.verifyPin(userId, pin);
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLogin(response.user, response.token);
      } else {
        alert('Invalid PIN. Use 1234 for demo');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      alert('Error verifying PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = () => {
    return roleOptions.find(option => option.value === selectedRole);
  };

  const renderIcon = (IconComponent: React.ComponentType<any>) => {
    return <IconComponent className="w-6 h-6 text-white" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">LifeVault</h1>
          <p className="text-gray-600">Secure Digital Inheritance Platform</p>
        </div>

        {step === 'role' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">
              Select your role
            </h2>
            {roleOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleRoleSelection(option.value as any)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${option.color} rounded-full flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{option.label}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${getRoleInfo()?.color} rounded-full mb-2`}>
                {getRoleInfo() && renderIcon(getRoleInfo()!.icon)}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {getRoleInfo()?.label} Login
              </h2>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 9876543210"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="w-full btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('role')}
              className="w-full btn-secondary"
            >
              Back to Role Selection
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${getRoleInfo()?.color} rounded-full mb-2`}>
                {getRoleInfo() && renderIcon(getRoleInfo()!.icon)}
              </div>
              <p className="text-sm text-gray-600">
                Enter the 6-digit OTP sent to
              </p>
              <p className="font-medium text-gray-900">{phoneNumber}</p>
            </div>
            
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="input-field text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>
            
            <button type="submit" className="w-full btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full btn-secondary"
            >
              Change Phone Number
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Demo: Use OTP 123456
            </p>
          </form>
        )}

        {step === 'pin' && (
          <form onSubmit={handleVerifyPIN} className="space-y-6">
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${getRoleInfo()?.color} rounded-full mb-2`}>
                {getRoleInfo() && renderIcon(getRoleInfo()!.icon)}
              </div>
              <p className="text-sm text-gray-600">
                Enter your 4-digit security PIN
              </p>
            </div>
            
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                Security PIN
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="input-field text-center text-lg tracking-widest"
                maxLength={4}
                required
              />
            </div>
            
            <button type="submit" className="w-full btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Vault'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('otp')}
              className="w-full btn-secondary"
            >
              Back
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Demo: Use PIN 1234
            </p>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Secured with 256-bit encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
