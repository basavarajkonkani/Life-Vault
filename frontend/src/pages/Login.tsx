// Updated: 2025-09-12T09:59:08.635Z
import React, { useState } from "react";
import { Shield, Users, UserCheck, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<"owner" | "nominee" | "admin" | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signInWithOtp, verifyOtp } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleRoleSelect = (role: "owner" | "nominee" | "admin") => {
    setSelectedRole(role);
    setShowAuthForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setError(error.message);
        showError("Login Failed", error.message);
      } else {
        showSuccess("Login Successful", "Welcome back!");
        navigate("/");
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      showError("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithOtp(formData.phone);
      
      if (error) {
        setError(error.message);
        showError("OTP Send Failed", error.message);
      } else {
        setShowAuthForm(false);
        showSuccess("OTP Sent", "Please check your phone for the verification code");
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      showError("OTP Send Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await verifyOtp(formData.phone, otp);
      
      if (error) {
        setError(error.message);
        showError("OTP Verification Failed", error.message);
      } else {
        showSuccess("Login Successful", "Welcome back!");
        navigate("/");
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      showError("OTP Verification Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (showAuthForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to LifeVault
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {selectedRole === 'owner' && 'Asset Owner Authentication'}
              {selectedRole === 'nominee' && 'Nominee Authentication'}
              {selectedRole === 'admin' && 'Admin Authentication'}
            </p>
          </div>

          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setAuthMethod("email")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border ${
                authMethod === "email"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("phone")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border-t border-r border-b ${
                authMethod === "phone"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Phone
            </button>
          </div>

          {authMethod === "email" && (
            <form className="mt-8 space-y-6" onSubmit={handleEmailSignIn}>
              <div className="space-y-4">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Email address"
                />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowAuthForm(false)}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  ← Back to role selection
                </button>
              </div>
            </form>
          )}

          {authMethod === "phone" && (
            <form className="mt-8 space-y-6" onSubmit={handlePhoneSignIn}>
              <input
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Phone number"
              />

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowAuthForm(false)}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  ← Back to role selection
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LifeVault</h1>
          <p className="mt-2 text-sm text-gray-600">Secure Digital Inheritance Platform</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 text-center">Select your role</h2>
          
          <button
            onClick={() => handleRoleSelect("owner")}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-medium text-gray-900">Asset Owner</h3>
                <p className="text-sm text-gray-600">Manage your assets and nominees.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("nominee")}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-medium text-gray-900">Nominee</h3>
                <p className="text-sm text-gray-600">Access assigned assets when needed.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("admin")}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-medium text-gray-900">Admin</h3>
                <p className="text-sm text-gray-600">Review and approve vault requests.</p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">Secured with 256-bit encryption</p>
        </div>
      </div>
    </div>
  );
};

export default Login;