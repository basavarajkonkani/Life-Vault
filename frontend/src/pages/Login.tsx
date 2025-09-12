// Simplified SPA fix: 2025-09-12T10:22:31.987Z
// Force SPA routing deployment: 2025-09-12T10:20:02.227Z
// Force rebuild: 2025-09-12T10:17:28.801Z
import React, { useState } from "react";
import { Shield, Users, UserCheck, Settings, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<"owner" | "nominee" | "admin" | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
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
        showSuccess("OTP Sent", "Please check your phone for the verification code");
        // No direct OTP verification in this flow, Supabase handles it internally
        // For phone sign-in, Supabase sends OTP and then user is redirected or session is set
        // Assuming a successful OTP send means the user can proceed or is already logged in
        navigate("/"); // Or to an OTP verification page if needed
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900">
            LifeVault
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Secure Digital Inheritance Platform
          </p>
        </div>

        {!showAuthForm ? (
          <>
            <div className="text-center mt-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Select your role</h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Asset Owner */}
                <button
                  onClick={() => handleRoleSelect("owner")}
                  className="flex items-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 border-2 border-blue-200"
                >
                  <div className="flex-shrink-0 bg-blue-600 p-3 rounded-full">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="text-xl font-semibold text-blue-800">Asset Owner</p>
                    <p className="text-sm text-gray-600">Manage your assets and nominees.</p>
                  </div>
                </button>

                {/* Nominee */}
                <button
                  onClick={() => handleRoleSelect("nominee")}
                  className="flex items-center p-6 bg-green-50 hover:bg-green-100 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 border-2 border-green-200"
                >
                  <div className="flex-shrink-0 bg-green-600 p-3 rounded-full">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="text-xl font-semibold text-green-800">Nominee</p>
                    <p className="text-sm text-gray-600">Access assigned assets when needed.</p>
                  </div>
                </button>

                {/* Admin */}
                <button
                  onClick={() => handleRoleSelect("admin")}
                  className="flex items-center p-6 bg-purple-50 hover:bg-purple-100 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 border-2 border-purple-200"
                >
                  <div className="flex-shrink-0 bg-purple-600 p-3 rounded-full">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="text-xl font-semibold text-purple-800">Admin</p>
                    <p className="text-sm text-gray-600">Review and approve vault requests.</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8">
            <button
              onClick={() => setShowAuthForm(false)}
              className="mb-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to role selection
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login as {selectedRole}</h3>

            <form className="space-y-6" onSubmit={authMethod === "email" ? handleEmailSignIn : handlePhoneSignIn}>
              {/* Auth Method Toggle */}
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
                  <Mail className="inline h-4 w-4 mr-2" />
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
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone
                </button>
              </div>

              {/* Email Login */}
              {authMethod === "email" && (
                <>
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Phone Login */}
              {authMethod === "phone" && (
                <div>
                  <label htmlFor="phone" className="sr-only">
                    Phone number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Secured with 256-bit encryption
        </div>
      </div>
    </div>
  );
};

export default Login;