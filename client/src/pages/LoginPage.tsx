import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Phone, User, Building2, Stethoscope, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext';
import logo from "../assets/Logo.png";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'hospital' | 'doctor' | null>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [credentials, setCredentials] = useState({ emailOrPhone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSendLoading, setIsSendLoading] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const handleGoogleRedirect = () => {
    window.location.href = '/auth/google';
  };

  const handleSendLink = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    setIsSendLoading(true)
    const response = await fetch('/auth/reset-request',{
      method: "POST",
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email }),
    });
    const data = await response.json();
    alert(data.message);
    setIsSendLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // BACKEND: Replace with real login API
    setTimeout(() => {
      const loginUser = {
        role: selectedRole,
        email: credentials.emailOrPhone,
        password: credentials.password
      };
      login(loginUser);
      // Redirect based on role
      if (loginUser.role === 'hospital') {
        navigate('/hospital/dashboard'); // BACKEND: change if needed
      } else {
        navigate('/dashboard');
      }
      setIsLoading(false);
    }, 1500);
  };

  // Lock scroll for forgot modal
  useEffect(() => {
    if (showForgotModal) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setShowForgotModal(false);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [showForgotModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="relative">
  {currentStep === 2 && (
    <button
      onClick={() => setCurrentStep(1)}
      className="absolute left-0 top-0 inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
    >
      <ArrowLeft className="w-4 h-4 mr-1" /> Back
    </button>
  )}

  <div className="text-center">
    <div className="flex justify-center mb-6 mt-6">
      <div className="w-16 h-16 rounded-xl flex items-center justify-center">
        <img src={logo} alt="Aarogya Mitra" className="max-h-full max-w-full object-contain" />
      </div>
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-2">
      {currentStep === 1 ? "Select your role" : t('login.welcomeBack')}
    </h2>
    <p className="text-gray-600">
      {currentStep === 1 ? "Login as a patient, hospital, or doctor" : t('login.signInToAccount')}
    </p>
  </div>
</div>


        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Role Selection */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => { setSelectedRole('patient'); setCurrentStep(2); }}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-700">Patient</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('hospital'); setCurrentStep(2); }}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-700">Hospital</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setShowComingSoonModal(true)}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-700">Doctor</span>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Login Form */}
          {currentStep === 2 && selectedRole && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Login Method Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${loginMethod === 'email'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>{t('login.email')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${loginMethod === 'phone'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('login.phone')}</span>
                </button>
              </div>

              {/* Identifier Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {loginMethod === 'email' ? t('login.emailAddress') : t('login.phoneNumber')}
                </label>
                <div className="relative">
                  {loginMethod === 'email'
                    ? <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    : <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />}
                  <input
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    required
                    value={credentials.emailOrPhone}
                    onChange={(e) => setCredentials({ ...credentials, emailOrPhone: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={loginMethod === 'email' ? t('login.emailPlaceholder') : t('login.phonePlaceholder')}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('login.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword
                      ? <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      : <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {isLoading ? t('login.signingIn') : t('login.signIn')}
              </button>

              {/* Google Sign-In */}
              {selectedRole==='patient' && <div className="mt-6 flex justify-center">
                <button
                  onClick={handleGoogleRedirect}
                  className="flex items-center border border-gray-300 rounded-lg shadow-sm px-4 py-2 bg-white hover:bg-gray-50"
                >
                  <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" className="w-5 h-5 mr-3" />
                  <span className="text-gray-700 font-medium">{t('login.googleSignIn')}</span>
                </button>
              </div>}

              {/* Signup Link */}
              <p className="mt-8 text-center text-sm text-gray-600">
                {t('login.noAccount')}{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
                  {t('login.signUpNow')}
                </Link>
              </p>
            </form>
          )}
        </div>

        {/* Coming Soon Modal */}
        {showComingSoonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowComingSoonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Doctor Login</h3>
              <p className="text-gray-600 mb-6">
                Doctor login is coming soon! We’re working on verification processes and credential validation.
              </p>
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center"
            onClick={() => setShowForgotModal(false)}
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
              <p className="text-sm text-gray-600 mb-3">Enter the email linked to your account.</p>
              <input
                type="email"
                placeholder="Enter your email"
                className="border w-full px-3 py-2 rounded mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendLink}
                  disabled={isSendLoading}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isSendLoading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
