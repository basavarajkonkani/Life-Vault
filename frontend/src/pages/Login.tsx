import React, { useState } from 'react';
import { Shield, User, Users, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginProps {
  onLogin?: (authenticated: boolean, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'role' | 'phone' | 'otp' | 'pin'>('role');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'nominee' | 'admin' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signInWithDemo } = useAuth();

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

  const normalizePhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with 91, remove it
    if (digits.startsWith('91') && digits.length === 12) {
      return digits.substring(2);
    }
    
    // If it's 10 digits, return as is
    if (digits.length === 10) {
      return digits;
    }
    
    return digits;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Normalize the phone number for comparison
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      // For demo purposes, accept both +91 9876543210 and 9876543210
      if (normalizedPhone === '9876543210') {
        setStep('otp');
      } else {
        setError('Invalid phone number. Use +91 9876543210 or 9876543210 for demo.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // For demo purposes, accept any 6-digit OTP
      if (otp.length === 6) {
        setStep('pin');
      } else {
        setError('Please enter a valid 6-digit OTP.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPIN = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // For demo purposes, accept PIN 1234
      if (pin === '1234') {
        // Create a demo user object with the selected role
        const demoUser = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Demo User',
          phone: '+91 9876543210',
          email: 'demo@lifevault.com',
          address: '123 Demo Street, Demo City',
          role: selectedRole || 'owner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Use the new authentication system
        await signInWithDemo();
        onLogin?.(true, demoUser);
      } else {
        setError('Invalid PIN. Use 1234 for demo.');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Failed to verify PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'phone') {
      setStep('role');
    } else if (step === 'otp') {
      setStep('phone');
    } else if (step === 'pin') {
      setStep('otp');
    }
  };

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to LifeVault</h2>
        <p className="text-gray-600">Select your role to continue</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roleOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => handleRoleSelection(option.value as 'owner' | 'nominee' | 'admin')}
              className={`p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 transition-colors text-left ${option.color} bg-opacity-10 hover:bg-opacity-20`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${option.color} mr-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderPhoneInput = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Phone Number</h2>
        <p className="text-gray-600">We'll send you a verification code</p>
      </div>

      <form onSubmit={handleSendOTP} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91 9876543210"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderOTPInput = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
        <p className="text-gray-600">Enter the 6-digit code sent to {phoneNumber}</p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OTP Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-lg tracking-widest"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPINInput = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter PIN</h2>
        <p className="text-gray-600">Enter your 4-digit PIN to complete login</p>
      </div>

      <form onSubmit={handleVerifyPIN} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PIN
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="1234"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-lg tracking-widest"
            maxLength={4}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'role' && renderRoleSelection()}
          {step === 'phone' && renderPhoneInput()}
          {step === 'otp' && renderOTPInput()}
          {step === 'pin' && renderPINInput()}
        </div>
      </div>
    </div>
  );
};

export default Login;
