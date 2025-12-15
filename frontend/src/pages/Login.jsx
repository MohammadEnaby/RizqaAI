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
      navigate('/chatbot');
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
      navigate('/chatbot');
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
      <div className="h-screen w-screen flex items-center justify-center app-bg overflow-hidden relative">
        <div className="auth-card w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] max-w-[600px] h-auto max-h-[95vh] glass-panel rounded-3xl shadow-2xl fluid-p relative flex flex-col justify-center">

          {/* Header */}
          <div className="text-center fluid-mb shrink-0">
            <div style={{ width: 'clamp(40px, 10vmin, 90px)', height: 'clamp(40px, 10vmin, 90px)' }} className="theme-green-blue rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg fluid-mb-sm">
              <span className="fluid-h1">🔐</span>
            </div>
            <h2 className="fluid-h2 font-bold text-[#0f172a] fluid-mb-sm">Reset Password</h2>
            <p className="text-gray-600 fluid-text-sm">Enter your email to receive a reset link</p>
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
              <div className="flex flex-col fluid-gap w-full">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 rounded-lg fluid-text-sm font-medium flex items-center justify-center" style={{ height: 'var(--fluid-input-height)' }}>
                    ⚠️ {error}
                  </div>
                )}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0f172a] mb-1 sm:mb-2">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="fluid-input w-full px-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 hover:border-gray-400 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="fluid-button w-full rounded-xl font-semibold fluid-text-base text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full fluid-text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors mt-2"
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
    <div className="h-screen w-screen flex items-center justify-center app-bg overflow-hidden relative">

      {/* Main Card */}
      <div className="auth-card w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] xl:w-[40vw] max-w-[700px] h-auto max-h-[95vh] glass-panel rounded-3xl shadow-2xl fluid-p relative flex flex-col justify-center">

        {/* Top decoration dot */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-500 rounded-full animate-pulse-custom hidden min-[375px]:block"></div>

        {/* Create Account Button */}
        <div className="absolute top-4 right-4 z-10">
          <Link
            to="/signup"
            className="flex items-center gap-2 px-3 py-1 theme-green-blue border border-teal-400/30 rounded-full text-white font-bold hover:shadow-lg hover:brightness-110 transition-all transform hover:scale-105"
            style={{ fontSize: 'var(--fluid-text-sm)' }}
          >
            <span>✨ Create Account</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center shrink-0 fluid-mb">
          <div style={{ width: 'clamp(50px, 12vmin, 100px)', height: 'clamp(50px, 12vmin, 100px)' }} className="theme-green-blue rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg fluid-mb-sm">
            <span className="fluid-h1 font-black text-white leading-none">JS</span>
          </div>
          <h1 className="fluid-h1 font-bold title-color leading-tight fluid-mb-sm">Welcome Back</h1>
          <p className="fluid-h2 text-gray-600 font-medium leading-tight">Sign in to continue to Risqa</p>
        </div>

        {/* Content Container */}
        <div className="w-full flex-1 flex flex-col justify-center min-h-0">

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="fluid-button w-full bg-white border-2 border-gray-300 rounded-xl px-4 flex items-center justify-center gap-3 fluid-text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-teal-400 hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] fluid-mb shrink-0"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '1.2em', height: '1.2em' }} />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-3 sm:mb-4 md:mb-5 lg:mb-6 shrink-0">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-[10px] sm:text-xs lg:text-sm text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 rounded-lg text-center font-semibold animate-shake shrink-0 fluid-mb fluid-text-sm flex items-center justify-center" style={{ height: 'var(--fluid-input-height)' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col fluid-gap w-full">

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm lg:text-base font-bold text-[#0f172a] mb-1 sm:mb-1.5 lg:mb-2">
                <span className="text-sm sm:text-lg lg:text-xl">📧</span>
                <span>Email Address</span>
              </label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                className="fluid-input w-full px-3 sm:px-4 bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-400 font-medium fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 hover:border-gray-400 hover:shadow-md transition-all"
                placeholder="name@example.com"
              />
              {errors.email && <p className="text-red-500 text-[10px] sm:text-xs mt-1 ml-1 font-semibold">⚠️ {errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1 sm:mb-1.5 lg:mb-2">
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
                className="fluid-input w-full px-3 sm:px-4 bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-400 font-medium fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 hover:border-gray-400 hover:shadow-md transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-[10px] sm:text-xs mt-1 ml-1 font-semibold">⚠️ {errors.password.message}</p>}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="fluid-button w-full rounded-xl font-bold fluid-text-base text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] mt-2 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
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
