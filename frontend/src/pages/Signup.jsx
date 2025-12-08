import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { signup, initiateGoogleSignIn } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const password = watch('password', '');

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      if (result.isNewUser) {
        navigate('/complete-profile');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#0f172a_100%)] p-3 overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute top-[5%] right-[10%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] rounded-full blur-[40px] animate-float1" />
      <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_70%)] rounded-full blur-[40px] animate-float2" />
      <div className="absolute top-[40%] left-[30%] w-[180px] h-[180px] bg-[radial-gradient(circle,rgba(236,72,153,0.08)_0%,transparent_70%)] rounded-full blur-[30px] animate-float3" />

      <div 
        className={`max-w-[620px] w-full bg-[rgba(30,41,59,0.85)] backdrop-blur-[20px] px-6 py-5 rounded-[22px] border border-[rgba(148,163,184,0.1)] shadow-[0_25px_60px_rgba(0,0,0,0.5)] relative z-10
          transition-all duration-[800ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
          ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
      >
        {/* Navigation to Login */}
        <div className="flex justify-end mb-2.5">
          <Link 
            to="/login"
            className="group flex items-center gap-2 px-4 py-2 bg-[rgba(139,92,246,0.1)] border-2 border-[rgba(139,92,246,0.3)] rounded-full text-violet-500 text-xs font-bold no-underline
              transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
              hover:bg-[linear-gradient(135deg,#8b5cf6_0%,#06b6d4_100%)] hover:border-transparent hover:text-white hover:scale-[1.08] hover:-translate-x-[5px] hover:shadow-[0_10px_30px_rgba(139,92,246,0.4)]"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-[5px]">←</span>
            <span>Sign In</span>
            <span className="text-sm transition-transform duration-300 group-hover:rotate-[-20deg] group-hover:scale-[1.2]">👋</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="group w-[52px] h-[52px] bg-[linear-gradient(135deg,#8b5cf6_0%,#06b6d4_100%)] rounded-[15px] flex items-center justify-center mx-auto mb-2.5 text-2xl text-white font-bold cursor-pointer
            transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] animate-pulse-logo
            hover:scale-[1.15] hover:-rotate-[5deg] hover:shadow-[0_15px_40px_rgba(139,92,246,0.5),0_0_60px_rgba(6,182,212,0.3)]">
            JS
          </div>
          <h1 className="text-xl font-extrabold bg-[linear-gradient(135deg,#f1f5f9_0%,#8b5cf6_50%,#06b6d4_100%)] bg-[length:200%_200%] bg-clip-text text-transparent mb-1 animate-gradient">
            Create Account
          </h1>
          <p className="text-xs text-slate-500">
            Join JobScout and start your journey
          </p>
        </div>

        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-400 px-3 py-2 rounded-lg mb-2.5 text-[11px] flex items-center gap-1.5 animate-shake">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="group w-full p-2.5 bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-[13px] font-semibold text-slate-200 cursor-pointer flex items-center justify-center gap-2.5
            transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
            hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(139,92,246,0.5)] hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="w-4 h-4 transition-transform duration-[400ms] group-hover:rotate-[360deg]" viewBox="0 0 20 20">
            <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
            <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
            <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
            <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
          </svg>
          Continue with Google
        </button>

        {/* Animated Divider */}
        <div className="flex items-center gap-3.5 my-3">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent animate-shimmer" />
          <span className="text-slate-500 text-[10px] font-semibold px-2.5 py-1 bg-[rgba(139,92,246,0.1)] rounded-full">or</span>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[rgba(6,182,212,0.3)] to-transparent animate-shimmer" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="group">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 transition-all duration-300 group-focus-within:text-violet-500 group-focus-within:translate-x-[3px]">
                👤 First Name
              </label>
              <input
                {...register("firstName", { required: "Required" })}
                type="text"
                placeholder="John"
                className="w-full p-2.5 px-3 bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-[13px] text-slate-100 outline-none
                  transition-all duration-300
                  focus:bg-[rgba(139,92,246,0.08)] focus:border-violet-500 focus:shadow-[0_0_20px_rgba(139,92,246,0.25),inset_0_0_15px_rgba(139,92,246,0.03)] focus:-translate-y-[1px] focus:scale-[1.01]
                  hover:bg-[rgba(139,92,246,0.04)] hover:border-[rgba(139,92,246,0.5)]"
              />
              {errors.firstName && <p className="text-red-400 text-[10px] mt-1">{errors.firstName.message}</p>}
            </div>
            <div className="group">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 transition-all duration-300 group-focus-within:text-violet-500 group-focus-within:translate-x-[3px]">
                👤 Last Name
              </label>
              <input
                {...register("lastName", { required: "Required" })}
                type="text"
                placeholder="Doe"
                className="w-full p-2.5 px-3 bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-[13px] text-slate-100 outline-none
                  transition-all duration-300
                  focus:bg-[rgba(139,92,246,0.08)] focus:border-violet-500 focus:shadow-[0_0_20px_rgba(139,92,246,0.25),inset_0_0_15px_rgba(139,92,246,0.03)] focus:-translate-y-[1px] focus:scale-[1.01]
                  hover:bg-[rgba(139,92,246,0.04)] hover:border-[rgba(139,92,246,0.5)]"
              />
              {errors.lastName && <p className="text-red-400 text-[10px] mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email & Phone Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="group">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 transition-all duration-300 group-focus-within:text-cyan-500 group-focus-within:translate-x-[3px]">
                ✉️ Email
              </label>
              <input
                {...register("email", { required: "Required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid" } })}
                type="email"
                placeholder="you@example.com"
                className="w-full p-2.5 px-3 bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-[13px] text-slate-100 outline-none
                  transition-all duration-300
                  focus:bg-[rgba(6,182,212,0.08)] focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.25),inset_0_0_15px_rgba(6,182,212,0.03)] focus:-translate-y-[1px] focus:scale-[1.01]
                  hover:bg-[rgba(6,182,212,0.04)] hover:border-[rgba(6,182,212,0.5)]"
              />
              {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
            </div>
            <div className="group">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 transition-all duration-300 group-focus-within:text-cyan-500 group-focus-within:translate-x-[3px]">
                📱 Phone
              </label>
              <input
                {...register("phone", { required: "Required" })}
                type="tel"
                placeholder="+1 234 567 890"
                className="w-full p-2.5 px-3 bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-[13px] text-slate-100 outline-none
                  transition-all duration-300
                  focus:bg-[rgba(6,182,212,0.08)] focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.25),inset_0_0_15px_rgba(6,182,212,0.03)] focus:-translate-y-[1px] focus:scale-[1.01]
                  hover:bg-[rgba(6,182,212,0.04)] hover:border-[rgba(6,182,212,0.5)]"
              />
              {errors.phone && <p className="text-red-400 text-[10px] mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">⚡ Account Type</label>
            <div className="flex gap-2.5">
              {['user', 'admin'].map((type) => (
                <label
                  key={type}
                  className="flex-1 p-2.5 px-3 bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl cursor-pointer flex items-center gap-2
                    transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                    hover:border-violet-500 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.2)]
                    has-[:checked]:border-violet-500 has-[:checked]:bg-[rgba(139,92,246,0.1)]"
                >
                  <input
                    type="radio"
                    value={type}
                    {...register("role", { required: true })}
                    defaultChecked={type === 'user'}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${type === 'user' ? 'border-cyan-500' : 'border-violet-500'}`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-transform duration-300
                      ${type === 'user' ? 'bg-cyan-500' : 'bg-violet-500'}`}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-200">
                      {type === 'user' ? '👤 User' : '⚙️ Admin'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {type === 'user' ? 'Browse & apply' : 'Manage platform'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="group">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 transition-all duration-300 group-focus-within:text-violet-500 group-focus-within:translate-x-[3px]">
                🔒 Password
              </label>
              <div className="relative">
                <input
                  {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full p-2.5 px-3 pr-10 bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-[13px] text-slate-100 outline-none
                    transition-all duration-300
                    focus:bg-[rgba(139,92,246,0.08)] focus:border-violet-500 focus:shadow-[0_0_20px_rgba(139,92,246,0.25),inset_0_0_15px_rgba(139,92,246,0.03)] focus:-translate-y-[1px] focus:scale-[1.01]
                    hover:bg-[rgba(139,92,246,0.04)] hover:border-[rgba(139,92,246,0.5)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 border-none cursor-pointer p-1 flex items-center justify-center
                    transition-all duration-300 rounded-md hover:scale-[1.2]
                    ${showPassword ? 'text-violet-500' : 'text-slate-500 hover:text-violet-500'}`}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-[10px] mt-1">{errors.password.message}</p>}
            </div>
            <div className="group">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 transition-all duration-300 group-focus-within:text-violet-500 group-focus-within:translate-x-[3px]">
                🔒 Confirm
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword", { required: "Required", validate: value => value === password || "Mismatch" })}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full p-2.5 px-3 pr-10 bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-[13px] text-slate-100 outline-none
                    transition-all duration-300
                    focus:bg-[rgba(139,92,246,0.08)] focus:border-violet-500 focus:shadow-[0_0_20px_rgba(139,92,246,0.25),inset_0_0_15px_rgba(139,92,246,0.03)] focus:-translate-y-[1px] focus:scale-[1.01]
                    hover:bg-[rgba(139,92,246,0.04)] hover:border-[rgba(139,92,246,0.5)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 border-none cursor-pointer p-1 flex items-center justify-center
                    transition-all duration-300 rounded-md hover:scale-[1.2]
                    ${showConfirmPassword ? 'text-violet-500' : 'text-slate-500 hover:text-violet-500'}`}
                >
                  {showConfirmPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-[10px] mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`group w-full p-3 bg-[linear-gradient(135deg,#8b5cf6_0%,#06b6d4_100%)] bg-[length:200%_200%] text-white border-none rounded-xl text-sm font-bold cursor-pointer
              transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] relative overflow-hidden
              shadow-[0_8px_25px_rgba(139,92,246,0.3)]
              hover:shadow-[0_20px_40px_rgba(139,92,246,0.4),0_0_60px_rgba(6,182,212,0.2)] hover:scale-[1.02] hover:-translate-y-[3px]
              disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 disabled:hover:translate-y-0
              ${!loading ? 'animate-gradient' : ''}`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'Creating...' : 'Create Account'}
              {!loading && <span className="transition-transform duration-300 group-hover:scale-[1.3] group-hover:rotate-[20deg]">🚀</span>}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
