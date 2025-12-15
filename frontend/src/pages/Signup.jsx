import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { signup, initiateGoogleSignIn } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const password = watch('password', '');

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
      <div className="auth-card w-[95vw] lg:w-[60vw] xl:w-[50vw] max-w-[1000px] h-auto max-h-[95vh] glass-panel rounded-3xl shadow-2xl fluid-p relative flex flex-col justify-center">

        {/* Top decoration dot - hidden on very small screens */}
        <div className="absolute top-2 sm:top-6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse-custom hidden min-[375px]:block"></div>

        {/* Login Link */}
        <div className="absolute top-4 right-4 z-10">
          <Link
            to="/login"
            className="flex items-center gap-1 px-3 py-1 bg-white/80 border border-teal-400 rounded-full text-teal-700 font-bold hover:bg-white transition-transform hover:scale-105"
            style={{ fontSize: 'var(--fluid-text-sm)' }}
          >
            <span>🔓 Sign In</span>
          </Link>
        </div>

        {/* Header - Compact */}
        <div className="text-center mt-2 sm:mt-2 mb-2 sm:mb-3 md:mb-4 lg:mb-6 shrink-0">
          <div style={{ width: 'clamp(2.5rem, 8vw, 5rem)', height: 'clamp(2.5rem, 8vw, 5rem)' }} className="theme-green-blue rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 shadow-lg">
            <span className="fluid-h1 font-black text-white">JS</span>
          </div>
          <h1 className="fluid-h1 font-bold title-color leading-tight mb-0.5 sm:mb-1 lg:mb-2">Create Account</h1>
          <p className="fluid-h2 text-gray-600 font-medium leading-tight">Join Risqa today</p>
        </div>

        {/* Content Container - fits remaining space */}
        <div className="flex-1 flex flex-col justify-center min-h-0">

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="fluid-button w-full bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 flex items-center justify-center gap-2 sm:gap-3 fluid-text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-teal-400 transition-all shrink-0 mb-2 sm:mb-3 md:mb-4 lg:mb-5"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 'clamp(1.25rem, 2vw, 1.75rem)', height: 'clamp(1.25rem, 2vw, 1.75rem)' }} />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3 md:mb-4 lg:mb-5 shrink-0">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="fluid-text-sm text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 rounded-lg text-center font-semibold animate-shake shrink-0 fluid-mb fluid-text-sm flex items-center justify-center" style={{ height: 'var(--fluid-input-height)' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col fluid-gap w-full">

            {/* Name Fields */}
            <div className="grid grid-cols-2 fluid-gap">
              <div>
                <input
                  {...register("firstName", { required: "Required" })}
                  type="text"
                  className="fluid-input w-full px-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="First Name"
                />
                {errors.firstName && <p className="text-red-500 mt-0.5 ml-1" style={{ fontSize: '0.7em' }}>⚠️ {errors.firstName.message}</p>}
              </div>
              <div>
                <input
                  {...register("lastName", { required: "Required" })}
                  type="text"
                  className="fluid-input w-full px-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="Last Name"
                />
                {errors.lastName && <p className="text-red-500 mt-0.5 ml-1" style={{ fontSize: '0.7em' }}>⚠️ {errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-2 fluid-gap">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 fluid-text-sm">📧</span>
                <input
                  {...register("email", { required: "Required" })}
                  type="email"
                  className="fluid-input w-full pl-8 pr-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-sm focus:outline-none focus:border-teal-500 transition-all"
                  placeholder="Email"
                />
                {errors.email && <p className="text-red-500 mt-0.5 ml-1 absolute right-0 top-0" style={{ fontSize: '0.7em' }}>⚠️</p>}
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 fluid-text-sm">📱</span>
                <input
                  {...register("phone", { required: "Required" })}
                  type="tel"
                  className="fluid-input w-full pl-8 pr-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-sm focus:outline-none focus:border-teal-500 transition-all"
                  placeholder="Phone"
                />
                {errors.phone && <p className="text-red-500 mt-0.5 ml-1 absolute right-0 top-0" style={{ fontSize: '0.7em' }}>⚠️</p>}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 fluid-gap">
              <div>
                <input
                  {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6" } })}
                  type="password"
                  className="fluid-input w-full px-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="Password"
                />
                {errors.password && <p className="text-red-500 mt-0.5 ml-1" style={{ fontSize: '0.7em' }}>⚠️ {errors.password.message}</p>}
              </div>

              <div>
                <input
                  {...register("confirmPassword", { required: "Required" })}
                  type="password"
                  className="fluid-input w-full px-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 fluid-text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && <p className="text-red-500 mt-0.5 ml-1" style={{ fontSize: '0.7em' }}>⚠️ {errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Role Selection - Very compact */}
            <div className="grid grid-cols-2 fluid-gap">
              <label style={{ padding: 'var(--fluid-spacing-sm)' }} className="flex items-center gap-1.5 sm:gap-2 md:gap-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 transition-all justify-center">
                <input
                  {...register("role", { required: true })}
                  type="radio"
                  value="user"
                  className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="fluid-text-sm font-semibold text-gray-700">Job Seeker</span>
              </label>
              <label style={{ padding: 'var(--fluid-spacing-sm)' }} className="flex items-center gap-1.5 sm:gap-2 md:gap-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 transition-all justify-center">
                <input
                  {...register("role", { required: true })}
                  type="radio"
                  value="admin"
                  className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="fluid-text-sm font-semibold text-gray-700">Employer</span>
              </label>
            </div>
            {errors.role && <p className="text-red-500 text-xs sm:text-xs text-center -mt-0.5">⚠️ Select a role</p>}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="fluid-button w-full rounded-xl font-bold fluid-text-base text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
