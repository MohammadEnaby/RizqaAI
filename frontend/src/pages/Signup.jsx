import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Signup() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { signup, initiateGoogleSignIn } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const passwordStrength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await signup(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role
      });
      navigate('/chatbot');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Failed to create account. Please try again.');
      }
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

  return (
    <div className="h-screen w-screen flex items-center justify-center app-bg overflow-hidden relative">

      {/* Main Card - strictly limited height, no scroll */}
      <div className="auth-card w-[95vw] lg:w-[60vw] xl:w-[50vw] max-w-[1000px] h-auto max-h-[95vh] glass-panel rounded-3xl shadow-2xl relative flex flex-col justify-center overflow-y-auto" style={{ padding: 'clamp(12px, 3vh, 40px)' }}>

        {/* Top decoration dot - hidden on very small screens */}
        <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse-custom hidden min-[375px]:block"></div>

        {/* Login Link */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="flex items-center gap-1 px-2 py-1 bg-white/80 border border-teal-400 rounded-full text-teal-700 font-bold hover:bg-white transition-transform hover:scale-105 text-[0.7em] sm:text-[0.75em]"
            >
              <span>🔓 Sign In</span>
            </Link>
          </div>
        </div>

        {/* Header - Compact */}
        <div className="text-center mb-2 sm:mb-3 shrink-0">
          <div style={{ width: 'clamp(2rem, 6vw, 4rem)', height: 'clamp(2rem, 6vw, 4rem)' }} className="theme-green-blue rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-lg">
            <span className="fluid-h1 font-black text-white">JS</span>
          </div>
          <h1 className="fluid-h1 font-bold title-color leading-tight mb-0.5">Create Account</h1>
          <p className="fluid-h2 text-gray-600 font-medium leading-tight">Join Risqa today</p>
        </div>

        {/* Content Container - fits remaining space */}
        <div className="flex-1 flex flex-col justify-center min-h-0">

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="fluid-button w-full bg-white border-2 border-gray-300 rounded-lg px-3 flex items-center justify-center gap-2 fluid-text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-teal-400 transition-all shrink-0 mb-2 sm:mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 'clamp(1rem, 2vw, 1.5rem)', height: 'clamp(1rem, 2vw, 1.5rem)' }} />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3 shrink-0">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="fluid-text-sm text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 rounded-lg text-center font-semibold shrink-0 mb-2 sm:mb-3 fluid-text-sm flex items-center justify-center" style={{ minHeight: 'var(--fluid-input-height)' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full" style={{ gap: 'clamp(6px, 1.5vh, 16px)' }}>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  {...register("firstName", {
                    required: "First name required",
                    minLength: { value: 2, message: "Min 2 chars" }
                  })}
                  type="text"
                  className="fluid-input w-full px-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="First Name"
                />
                {errors.firstName && <p className="text-red-500 mt-0.5 ml-1" style={{ fontSize: '0.7em' }}>⚠️ {errors.firstName.message}</p>}
              </div>
              <div>
                <input
                  {...register("lastName", {
                    required: "Last name required",
                    minLength: { value: 2, message: "Min 2 chars" }
                  })}
                  type="text"
                  className="fluid-input w-full px-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="Last Name"
                />
                {errors.lastName && <p className="text-red-500 mt-0.5 ml-1" style={{ fontSize: '0.7em' }}>⚠️ {errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 fluid-text-sm">📧</span>
                <input
                  {...register("email", {
                    required: "Email required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email"
                    }
                  })}
                  type="email"
                  className="fluid-input w-full pl-8 pr-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-sm focus:outline-none focus:border-teal-500 transition-all"
                  placeholder="Email"
                />
                {errors.email && <p className="text-red-500 mt-0.5 ml-1 text-[0.7em]">⚠️ {errors.email.message}</p>}
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 fluid-text-sm">📱</span>
                <input
                  {...register("phone", {
                    required: "Phone required",
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: "Invalid phone"
                    },
                    minLength: { value: 9, message: "Min 9 digits" }
                  })}
                  type="tel"
                  className="fluid-input w-full pl-8 pr-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-sm focus:outline-none focus:border-teal-500 transition-all"
                  placeholder="Phone"
                />
                {errors.phone && <p className="text-red-500 mt-0.5 ml-1 text-[0.7em]">⚠️ {errors.phone.message}</p>}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password required",
                    minLength: { value: 8, message: "Min 8 chars" },
                    validate: {
                      hasUpperCase: v => /[A-Z]/.test(v) || "Need uppercase",
                      hasLowerCase: v => /[a-z]/.test(v) || "Need lowercase",
                      hasNumber: v => /[0-9]/.test(v) || "Need number",
                      hasSpecialChar: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || "Need special char"
                    }
                  })}
                  type={showPassword ? "text" : "password"}
                  className="fluid-input w-full px-3 pr-10 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  style={{ fontSize: 'var(--fluid-text-sm)' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
                {errors.password && <p className="text-red-500 mt-0.5 ml-1" style={{ fontSize: '0.7em' }}>⚠️ {errors.password.message}</p>}
              </div>

              <div className="relative">
                <input
                  {...register("confirmPassword", {
                    required: "Confirm password",
                    validate: value => value === password || "Passwords don't match"
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  className="fluid-input w-full px-3 pr-10 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  style={{ fontSize: 'var(--fluid-text-sm)' }}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
                {errors.confirmPassword && <p className="text-red-500 mt-0.5 ml-1" style={{ fontSize: '0.7em' }}>⚠️ {errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Password Strength Indicator - Ultra Compact */}
            {password && passwordStrength < 5 && (
              <div className="bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 rounded-lg px-2 py-1">
                <div className="flex items-center justify-between text-[0.6em] sm:text-[0.65em]">
                  <span className="font-semibold text-gray-600">Strength:</span>
                  <div className="flex gap-1.5">
                    <span className={hasMinLength ? 'text-green-600' : 'text-gray-400'}>{hasMinLength ? '✓' : '○'}8+</span>
                    <span className={hasUpperCase ? 'text-green-600' : 'text-gray-400'}>{hasUpperCase ? '✓' : '○'}A</span>
                    <span className={hasLowerCase ? 'text-green-600' : 'text-gray-400'}>{hasLowerCase ? '✓' : '○'}a</span>
                    <span className={hasNumber ? 'text-green-600' : 'text-gray-400'}>{hasNumber ? '✓' : '○'}#</span>
                    <span className={hasSpecialChar ? 'text-green-600' : 'text-gray-400'}>{hasSpecialChar ? '✓' : '○'}!</span>
                    <span className={passwordsMatch ? 'text-green-600' : 'text-gray-400'}>{passwordsMatch ? '✓' : '○'}=</span>
                  </div>
                </div>
              </div>
            )}

            {/* Role Selection - Very compact */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 transition-all justify-center py-2 px-2">
                <input
                  {...register("role", { required: true })}
                  type="radio"
                  value="user"
                  defaultChecked
                  className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="fluid-text-sm font-semibold text-gray-700">Job Seeker</span>
              </label>
              <label className="flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 transition-all justify-center py-2 px-2">
                <input
                  {...register("role", { required: true })}
                  type="radio"
                  value="admin"
                  className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="fluid-text-sm font-semibold text-gray-700">Employer</span>
              </label>
            </div>
            {errors.role && <p className="text-red-500 text-xs text-center -mt-1">⚠️ Select a role</p>}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="fluid-button w-full rounded-xl font-bold fluid-text-base text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
