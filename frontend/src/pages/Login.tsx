import React, { useState } from 'react';
import { Shield, Phone } from 'lucide-react';
import { authAPI } from '../services/api';

interface LoginProps {
  onLogin: (authenticated: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'pin'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.sendOtp(phoneNumber);
      if (response.data.success) {
        setUserId(response.data.userId);
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
      const response = await authAPI.verifyOtp(phoneNumber, otp);
      if (response.data.success) {
        setUserId(response.data.userId);
        setStep('pin');
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
      if (response.data.success) {
        // Store auth data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLogin(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">LifeVault</h1>
          <p className="text-gray-600">Secure Digital Inheritance Platform</p>
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
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
            <button type="submit" className="w-full btn-primary">
              Send OTP
            </button>
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center mb-4">
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
            <button type="submit" className="w-full btn-primary">
              Verify OTP
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

        {/* PIN Verification Step */}
        {step === 'pin' && (
          <form onSubmit={handleVerifyPIN} className="space-y-6">
            <div className="text-center mb-4">
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
            <button type="submit" className="w-full btn-primary">
              Access Vault
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

        {/* Footer */}
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