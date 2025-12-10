import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, initiateGoogleSignIn, resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      const { profile } = await login(data.email, data.password);
      navigate(profile?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      console.error(err);
      const errorMap = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
      };
      setError(errorMap[err.code] || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await initiateGoogleSignIn();
      navigate(result.isNewUser ? '/complete-profile' : (result.profile?.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setError(err.code === 'auth/user-not-found' ? 'No account found with this email.' : 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="h-screen flex items-center justify-center app-bg p-2 py-4 overflow-hidden">
        <div className="w-full max-w-[95vw] sm:max-w-md lg:max-w-xl xl:max-w-2xl glass-panel rounded-xl sm:rounded-[2.5rem] shadow-2xl p-4 sm:p-8 lg:p-12 relative flex flex-col justify-center max-h-screen">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 theme-green-blue rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <span className="text-2xl sm:text-3xl">🔐</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] mb-1 sm:mb-2">Reset Password</h2>
            <p className="text-gray-600 text-[10px] sm:text-sm">Enter your email to receive a reset link</p>
          </div>

          {/* Content */}
          <div className="w-full flex-1 flex flex-col justify-center min-h-0">
            {resetSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-6 text-center">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">✅</div>
                <p className="text-emerald-700 text-sm sm:text-base font-semibold mb-3 sm:mb-4">Check your inbox!</p>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium">
                    ⚠️ {error}
                  </div>
                )}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0f172a] mb-1 sm:mb-2">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 hover:border-gray-400 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center app-bg p-2 py-4 overflow-hidden">

      {/* Main Card */}
      <div className="w-full max-w-[95vw] sm:max-w-md lg:max-w-xl xl:max-w-2xl glass-panel rounded-xl sm:rounded-[2.5rem] shadow-2xl p-4 sm:p-8 lg:p-12 relative flex flex-col justify-center max-h-screen">

        {/* Top decoration dot */}
        <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full animate-pulse-custom hidden min-[375px]:block"></div>

        {/* Create Account Button */}
        <div className="absolute top-4 sm:top-8 right-4 sm:right-8">
          <Link
            to="/signup"
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 theme-green-blue border border-teal-400/30 rounded-full text-white text-[10px] sm:text-xs font-bold hover:shadow-lg hover:brightness-110 transition-all transform hover:scale-105"
          >
            <span>✨ Create Account</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mt-8 sm:mt-0 mb-6 sm:mb-8 md:mb-10 lg:mb-12 shrink-0">
          <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 theme-green-blue rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-5 lg:mb-6 shadow-lg">
            <span className="text-2xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-black text-white">JS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold title-color mb-1 sm:mb-2 lg:mb-3 leading-tight">Welcome Back</h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-base font-medium">Sign in to continue to Risqa</p>
        </div>

        {/* Content Container */}
        <div className="w-full flex-1 flex flex-col justify-center min-h-0">

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl py-2.5 sm:py-3.5 md:py-4 lg:py-5 px-4 flex items-center justify-center gap-3 font-semibold text-sm sm:text-base md:text-lg lg:text-lg text-gray-700 hover:bg-gray-50 hover:border-teal-400 hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] mb-4 sm:mb-6 md:mb-7 lg:mb-8 shrink-0"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 sm:w-6 sm:h-6 md:w-6.5 md:h-6.5 lg:w-7 lg:h-7" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-4 sm:mb-6 lg:mb-8 shrink-0">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-[10px] sm:text-xs lg:text-sm text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base mb-4 lg:mb-6 text-center font-semibold animate-shake shrink-0">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-5 md:space-y-6 lg:space-y-7">

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm lg:text-base font-bold text-[#0f172a] mb-1 sm:mb-2 lg:mb-3">
                <span className="text-sm sm:text-lg lg:text-xl">📧</span>
                <span>Email Address</span>
              </label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 md:py-4 lg:py-5 bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base md:text-lg lg:text-lg focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 hover:border-gray-400 hover:shadow-md transition-all"
                placeholder="name@example.com"
              />
              {errors.email && <p className="text-red-500 text-[10px] sm:text-xs mt-1 ml-1 font-semibold">⚠️ {errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1 sm:mb-2 lg:mb-3">
                <label className="flex items-center gap-2 text-xs sm:text-sm lg:text-base font-bold text-[#0f172a]">
                  <span className="text-sm sm:text-lg lg:text-xl">🔒</span>
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[10px] sm:text-xs lg:text-sm text-teal-600 hover:text-teal-700 hover:underline font-bold flex items-center gap-1 transition-all"
                >
                  Forgot password? <span>🔑</span>
                </button>
              </div>
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 md:py-4 lg:py-5 bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base md:text-lg lg:text-lg focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 hover:border-gray-400 hover:shadow-md transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-[10px] sm:text-xs mt-1 ml-1 font-semibold">⚠️ {errors.password.message}</p>}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 md:py-5 lg:py-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg lg:text-xl text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] mt-4 sm:mt-6 md:mt-7 lg:mt-8 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
