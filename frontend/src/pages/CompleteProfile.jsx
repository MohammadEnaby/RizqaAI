import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';

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
      await completeGoogleProfile(currentUser.uid, fullName, data.role, data.password);
      navigate('/chatbot');
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
    <div className="min-h-screen flex items-center justify-center p-5 py-10" style={{ background: 'linear-gradient(135deg, #071825 0%, #0f3443 50%, #071825 100%)' }}>
      <div className="w-full max-w-2xl p-8 sm:p-10 rounded-2xl shadow-2xl border" style={{ background: 'rgba(10,30,46,0.97)', borderColor: 'rgba(52,232,158,0.2)' }}>
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-lg" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
            ✨
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#e2f8f0' }}>
            Complete Your Profile
          </h2>
          <p className="text-sm" style={{ color: 'rgba(226,248,240,0.55)' }}>
            Welcome! Please provide a few more details
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg mb-5 text-sm font-medium border" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(226,248,240,0.8)' }}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("firstName", {
                  required: "First name is required",
                  minLength: { value: 2, message: "Must be at least 2 characters" }
                })}
                type="text"
                defaultValue={defaultFirstName}
                placeholder="John"
                className="w-full px-4 py-3 border-2 rounded-lg text-sm focus:outline-none transition-colors" style={{ background: 'rgba(7,24,37,0.7)', borderColor: 'rgba(52,232,158,0.2)', color: '#e2f8f0' }}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1.5">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(226,248,240,0.8)' }}>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: { value: 2, message: "Must be at least 2 characters" }
                })}
                type="text"
                defaultValue={defaultLastName}
                placeholder="Doe"
                className="w-full px-4 py-3 border-2 rounded-lg text-sm focus:outline-none transition-colors" style={{ background: 'rgba(7,24,37,0.7)', borderColor: 'rgba(52,232,158,0.2)', color: '#e2f8f0' }}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1.5">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email (Read-only from Google) */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(226,248,240,0.8)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-lg text-sm cursor-not-allowed"
              style={{ background: 'rgba(7,24,37,0.4)', border: '1px solid rgba(52,232,158,0.1)', color: 'rgba(226,248,240,0.5)' }}
            />
            <p className="text-xs mt-1.5" style={{ color: 'rgba(226,248,240,0.5)' }}>
              This email is from your Google account
            </p>
          </div>



          {/* Account Type */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(226,248,240,0.8)' }}>
              Account Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 p-3 rounded-lg cursor-pointer flex items-center gap-3 hover:border-[#34e89e] transition-colors group" style={{ border: '2px solid rgba(52,232,158,0.2)', background: 'rgba(7,24,37,0.4)' }}>
                <input
                  {...register("role", { required: "Please select an account type" })}
                  type="radio"
                  value="user"
                  defaultChecked
                  className="w-4 h-4 text-[#34e89e] focus:ring-[#34e89e] cursor-pointer"
                />
                <div>
                  <div className="font-semibold text-sm text-white group-hover:text-[#34e89e] transition-colors">User</div>
                  <div className="text-xs" style={{ color: 'rgba(226,248,240,0.5)' }}>Browse & apply for jobs</div>
                </div>
              </label>

              <label className="flex-1 p-3 rounded-lg cursor-pointer flex items-center gap-3 hover:border-[#34e89e] transition-colors group" style={{ border: '2px solid rgba(52,232,158,0.2)', background: 'rgba(7,24,37,0.4)' }}>
                <input
                  {...register("role")}
                  type="radio"
                  value="admin"
                  className="w-4 h-4 text-[#34e89e] focus:ring-[#34e89e] cursor-pointer"
                />
                <div>
                  <div className="font-semibold text-sm text-white group-hover:text-[#34e89e] transition-colors">Admin</div>
                  <div className="text-xs" style={{ color: 'rgba(226,248,240,0.5)' }}>Manage the platform</div>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1.5">{errors.role.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(226,248,240,0.8)' }}>
              Create a Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                  validate: {
                    hasUpperCase: v => /[A-Z]/.test(v) || "Must contain uppercase letter",
                    hasLowerCase: v => /[a-z]/.test(v) || "Must contain lowercase letter",
                    hasNumber: v => /[0-9]/.test(v) || "Must contain a number",
                    hasSpecialChar: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || "Must contain special character"
                  }
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password for your account"
                className="w-full px-4 pr-12 py-3 rounded-lg text-sm focus:outline-none transition-colors"
                style={{ background: 'rgba(7,24,37,0.7)', border: '2px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
            )}
            <p className="text-xs mt-1.5" style={{ color: 'rgba(226,248,240,0.5)' }}>
              This will be your RizqaAI password (separate from Google)
            </p>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="rounded-lg p-4" style={{ background: 'rgba(7,24,37,0.4)', border: '1px solid rgba(52,232,158,0.2)' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold" style={{ color: 'rgba(226,248,240,0.8)' }}>
                  Password Strength
                </span>
                <span className={`text-xs font-bold ${passwordStrength >= 4 ? 'text-green-500' : passwordStrength >= 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {passwordStrength >= 4 ? 'Strong' : passwordStrength >= 3 ? 'Medium' : 'Weak'}
                </span>
              </div>
              <div className="grid gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {hasMinLength ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasMinLength ? 'text-green-500' : 'text-gray-400'}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasUpperCase ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasUpperCase ? 'text-green-500' : 'text-gray-400'}>One uppercase letter (A-Z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasLowerCase ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasLowerCase ? 'text-green-500' : 'text-gray-400'}>One lowercase letter (a-z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasNumber ? 'text-green-500' : 'text-gray-400'}>One number (0-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasSpecialChar ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                  <span className={hasSpecialChar ? 'text-green-500' : 'text-gray-400'}>One special character (!@#$%...)</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(226,248,240,0.8)' }}>
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
                className="w-full px-4 pr-12 py-3 rounded-lg text-sm focus:outline-none transition-colors"
                style={{ background: 'rgba(7,24,37,0.7)', border: '2px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-lg font-semibold text-base transition-all shadow-lg ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'hover:-translate-y-0.5'
            }`}
            style={!loading ? { background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' } : {}}
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
