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
      navigate('/');
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
      navigate(result.isNewUser ? '/complete-profile' : (result.profile?.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center app-bg p-2 py-4 overflow-hidden">

      {/* Main Card */}
      <div className="w-full max-w-[95vw] sm:max-w-lg lg:max-w-3xl xl:max-w-5xl glass-panel rounded-xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 lg:p-12 xl:p-16 relative flex flex-col justify-center max-h-screen">

        {/* Top decoration dot - hidden on very small screens */}
        <div className="absolute top-2 sm:top-6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse-custom hidden min-[375px]:block"></div>

        {/* Login Link */}
        <div className="absolute top-2 sm:top-6 right-2 sm:right-6">
          <Link
            to="/login"
            className="flex items-center gap-1 sm:gap-2 px-2 py-1 bg-white/80 border border-teal-400 rounded-full text-teal-700 text-[9px] sm:text-xs font-bold hover:bg-white transition-transform hover:scale-105"
          >
            <span>🔓 Sign In</span>
          </Link>
        </div>

        {/* Header - Compact */}
        <div className="text-center mt-4 sm:mt-0 mb-2 sm:mb-4 md:mb-6 lg:mb-8 shrink-0">
          <div className="w-8 h-8 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 theme-green-blue rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-4 shadow-lg">
            <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white">JS</span>
          </div>
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold title-color leading-tight mb-1 lg:mb-2">Create Account</h1>
          <p className="text-[9px] sm:text-sm md:text-sm lg:text-base text-gray-600 font-medium leading-tight">Join Risqa today</p>
        </div>

        {/* Content Container - fits remaining space */}
        <div className="flex-1 flex flex-col justify-center min-h-0">

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl py-2 sm:py-3 md:py-3.5 lg:py-4 px-3 sm:px-4 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base lg:text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-teal-400 transition-all shrink-0 mb-3 sm:mb-4 md:mb-5 lg:mb-6"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4 lg:mb-6 shrink-0">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[8px] sm:text-xs lg:text-sm text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:py-3 rounded-lg text-xs sm:text-sm mb-3 sm:mb-4 lg:mb-6 text-center font-semibold animate-shake shrink-0">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 sm:gap-4 md:gap-5 lg:gap-6">

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  {...register("firstName", { required: "Required" })}
                  type="text"
                  className="w-full px-3 py-2 sm:py-2.5 md:py-3 lg:py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-xs sm:text-sm md:text-base lg:text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="First Name"
                />
                {errors.firstName && <p className="text-red-500 text-[8px] sm:text-xs mt-0.5 ml-1">⚠️ {errors.firstName.message}</p>}
              </div>
              <div>
                <input
                  {...register("lastName", { required: "Required" })}
                  type="text"
                  className="w-full px-3 py-2 sm:py-2.5 md:py-3 lg:py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-xs sm:text-sm md:text-base lg:text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="Last Name"
                />
                {errors.lastName && <p className="text-red-500 text-[8px] sm:text-xs mt-0.5 ml-1">⚠️ {errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email & Phone Grid for compactness on mobile if needed, but stacked is safer for width. Let's keep stacked but small padding. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-sm">📧</span>
                <input
                  {...register("email", { required: "Required" })}
                  type="email"
                  className="w-full pl-6 sm:pl-8 pr-2 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-md sm:rounded-lg text-gray-900 placeholder-gray-400 text-[10px] sm:text-sm focus:outline-none focus:border-teal-500 transition-all"
                  placeholder="Email"
                />
                {errors.email && <p className="text-red-500 text-[8px] sm:text-xs mt-0.5 ml-1 absolute right-0 top-0">⚠️</p>}
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-sm">📱</span>
                <input
                  {...register("phone", { required: "Required" })}
                  type="tel"
                  className="w-full pl-6 sm:pl-8 pr-2 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-md sm:rounded-lg text-gray-900 placeholder-gray-400 text-[10px] sm:text-sm focus:outline-none focus:border-teal-500 transition-all"
                  placeholder="Phone"
                />
                {errors.phone && <p className="text-red-500 text-[8px] sm:text-xs mt-0.5 ml-1 absolute right-0 top-0">⚠️</p>}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6" } })}
                  type="password"
                  className="w-full px-3 py-2 sm:py-3 lg:py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-xs sm:text-sm lg:text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="Password"
                />
                {errors.password && <p className="text-red-500 text-[8px] sm:text-xs mt-0.5 ml-1">⚠️ {errors.password.message}</p>}
              </div>

              <div>
                <input
                  {...register("confirmPassword", { required: "Required" })}
                  type="password"
                  className="w-full px-3 py-2 sm:py-3 lg:py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-xs sm:text-sm lg:text-base focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-[8px] sm:text-xs mt-0.5 ml-1">⚠️ {errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Role Selection - Very compact */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 transition-all justify-center">
                <input
                  {...register("role", { required: true })}
                  type="radio"
                  value="user"
                  className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs sm:text-sm lg:text-base font-semibold text-gray-700">Job Seeker</span>
              </label>
              <label className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 transition-all justify-center">
                <input
                  {...register("role", { required: true })}
                  type="radio"
                  value="admin"
                  className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs sm:text-sm lg:text-base font-semibold text-gray-700">Employer</span>
              </label>
            </div>
            {errors.role && <p className="text-red-500 text-[8px] sm:text-xs text-center -mt-1">⚠️ Select a role</p>}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 md:py-4 lg:py-5 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg lg:text-lg text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 mt-2 md:mt-3 lg:mt-4"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
