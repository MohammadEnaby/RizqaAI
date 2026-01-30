import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';

export default function CompleteProfile() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { currentUser, completeGoogleProfile } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const password = watch("password", "");
  const firstName = watch("firstName", "");
  const lastName = watch("lastName", "");

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const passwordStrength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      const fullName = `${data.firstName} ${data.lastName}`;
      await completeGoogleProfile(currentUser.uid, fullName, data.role, data.password, data.phone);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill names from Google account
  const defaultFirstName = currentUser?.displayName?.split(' ')[0] || '';
  const defaultLastName = currentUser?.displayName?.split(' ').slice(1).join(' ') || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] dark:from-gray-900 dark:to-gray-800 p-5 relative">

      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl transition-all">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-lg">
            ✨
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome! Please provide a few more details
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "Must be at least 2 characters"
                  }
                })}
                type="text"
                defaultValue={defaultFirstName}
                placeholder="John"
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#667eea] dark:focus:border-[#667eea] transition-all"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1.5 font-semibold">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Must be at least 2 characters"
                  }
                })}
                type="text"
                defaultValue={defaultLastName}
                placeholder="Doe"
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#667eea] dark:focus:border-[#667eea] transition-all"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1.5 font-semibold">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email (Read-only from Google) */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              This email is from your Google account
            </p>
          </div>

          {/* Phone Number */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: "Invalid phone number"
                },
                minLength: {
                  value: 9,
                  message: "Phone number must be at least 9 digits"
                }
              })}
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#667eea] dark:focus:border-[#667eea] transition-all"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Account Type */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Account Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <label className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer flex items-center gap-2 hover:border-[#667eea] transition-all bg-white dark:bg-gray-700">
                <input
                  {...register("role", { required: "Please select an account type" })}
                  type="radio"
                  value="user"
                  defaultChecked
                  className="w-4 h-4 text-[#667eea] focus:ring-[#667eea]"
                />
                <div>
                  <div className="font-bold text-sm text-gray-800 dark:text-gray-200">User</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Browse & apply for jobs</div>
                </div>
              </label>

              <label className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer flex items-center gap-2 hover:border-[#667eea] transition-all bg-white dark:bg-gray-700">
                <input
                  {...register("role")}
                  type="radio"
                  value="admin"
                  className="w-4 h-4 text-[#667eea] focus:ring-[#667eea]"
                />
                <div>
                  <div className="font-bold text-sm text-gray-800 dark:text-gray-200">Admin</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Manage the platform</div>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Create a Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  },
                  validate: {
                    hasUpperCase: v => /[A-Z]/.test(v) || "Must contain uppercase letter",
                    hasLowerCase: v => /[a-z]/.test(v) || "Must contain lowercase letter",
                    hasNumber: v => /[0-9]/.test(v) || "Must contain a number",
                    hasSpecialChar: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || "Must contain special character"
                  }
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password for your account"
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#667eea] dark:focus:border-[#667eea] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg p-2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">
                {errors.password.message}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              This will be your JobScout password (separate from Google)
            </p>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Password Strength
                </span>
                <span className={`text-xs font-bold ${passwordStrength >= 4 ? 'text-green-500' : passwordStrength >= 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {passwordStrength >= 4 ? 'Strong' : passwordStrength >= 3 ? 'Medium' : 'Weak'}
                </span>
              </div>
              <div className="grid gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {hasMinLength ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasMinLength ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasUpperCase ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasUpperCase ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}>One uppercase letter (A-Z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasLowerCase ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasLowerCase ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}>One lowercase letter (a-z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasNumber ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}>One number (0-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasSpecialChar ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasSpecialChar ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}>One special character (!@#$%...)</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#667eea] dark:focus:border-[#667eea] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg p-2"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
