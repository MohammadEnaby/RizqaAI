import React, { useState, useEffect } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      const { profile } = await login(data.email, data.password);
      
      if (profile && profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('Failed to log in. Please check your credentials.');
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
        if (result.profile && result.profile.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
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
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="h-screen flex items-center justify-center bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#0f172a_100%)] p-4 overflow-hidden relative">
        <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(6,182,212,0.15)_0%,transparent_70%)] rounded-full blur-[40px] animate-pulse-custom" />
        
        <div className="max-w-[400px] w-full bg-[rgba(30,41,59,0.8)] backdrop-blur-[20px] p-[30px] rounded-[20px] border border-[rgba(148,163,184,0.1)] shadow-[0_25px_50px_rgba(0,0,0,0.5)] relative z-10 animate-[fadeInUp_0.6s_ease-out]">
          <div className="text-center mb-6">
            <div className="text-[40px] mb-3 animate-bounce-custom">🔐</div>
            <h2 className="text-[22px] font-bold text-slate-100 mb-1.5">Reset Password</h2>
            <p className="text-[13px] text-slate-400">Enter your email to receive a reset link</p>
          </div>

          {resetSuccess ? (
            <div className="bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded-xl p-5 text-center animate-scale-in">
              <div className="text-4xl mb-2.5 animate-[bounce_1s]">✅</div>
              <p className="text-emerald-500 mb-3.5">Reset email sent!</p>
              <button 
                onClick={() => setShowForgotPassword(false)} 
                className="bg-transparent text-cyan-500 border-none text-sm font-semibold cursor-pointer hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-400 p-2.5 rounded-lg mb-4 text-xs animate-shake">
                  {error}
                </div>
              )}
              
              <input 
                type="email" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                placeholder="Enter your email" 
                className="w-full p-3 bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-sm text-slate-100 outline-none transition-all duration-300
                  focus:bg-[rgba(6,182,212,0.1)] focus:border-cyan-500 focus:shadow-[0_0_25px_rgba(6,182,212,0.3)]
                  hover:bg-[rgba(6,182,212,0.05)]"
              />
              
              <button 
                onClick={handleForgotPassword} 
                disabled={loading}
                className="w-full p-3 mt-4 bg-[linear-gradient(135deg,#06b6d4_0%,#8b5cf6_100%)] text-white rounded-xl text-sm font-semibold border-none cursor-pointer
                  transition-all duration-300 shadow-lg shadow-cyan-500/20
                  hover:scale-[1.02] hover:-translate-y-0.5
                  disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <button 
                onClick={() => { setShowForgotPassword(false); setError(''); }}
                className="w-full p-3 mt-2.5 bg-transparent text-slate-400 border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-[13px] font-semibold cursor-pointer
                  transition-all duration-300
                  hover:border-[rgba(148,163,184,0.5)] hover:text-slate-300"
              >
                ← Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#0f172a_100%)] p-4 overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute top-[5%] left-[5%] w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_70%)] rounded-full blur-[40px] animate-float1" />
      <div className="absolute bottom-[5%] right-[5%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] rounded-full blur-[40px] animate-float2" />
      <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(236,72,153,0.08)_0%,transparent_70%)] rounded-full blur-[30px] animate-float3 -translate-x-1/2 -translate-y-1/2" />

      <div 
        className={`max-w-[420px] w-full bg-[rgba(30,41,59,0.85)] backdrop-blur-[20px] p-8 pb-7 rounded-[24px] border border-[rgba(148,163,184,0.1)] shadow-[0_25px_60px_rgba(0,0,0,0.5)] relative z-10
          transition-all duration-[800ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
          ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
      >
        
        {/* Navigation to Signup */}
        <div className="flex justify-end mb-4">
          <Link 
            to="/signup"
            className="group flex items-center gap-2 px-5 py-2.5 bg-[rgba(6,182,212,0.1)] border-2 border-[rgba(6,182,212,0.3)] rounded-full text-cyan-500 text-[13px] font-bold no-underline
              transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
              hover:bg-[linear-gradient(135deg,#06b6d4_0%,#8b5cf6_100%)] hover:border-transparent hover:text-white hover:scale-[1.08] hover:translate-x-[5px] hover:shadow-[0_10px_30px_rgba(6,182,212,0.4)]"
          >
            <span className="text-base transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-[1.2]">✨</span>
            <span>Create Account</span>
            <span className="transition-transform duration-300 group-hover:translate-x-[5px]">→</span>
          </Link>
        </div>

        {/* Logo with pulse animation */}
        <div className="text-center mb-5">
          <div className="group w-[65px] h-[65px] bg-[linear-gradient(135deg,#06b6d4_0%,#8b5cf6_100%)] rounded-[18px] flex items-center justify-center mx-auto mb-3.5 text-[28px] text-white font-bold cursor-pointer
            transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] animate-pulse-logo
            hover:scale-[1.15] hover:rotate-[5deg] hover:shadow-[0_15px_40px_rgba(6,182,212,0.5),0_0_60px_rgba(139,92,246,0.3)]">
            JS
          </div>
          <h1 className="text-2xl font-extrabold bg-[linear-gradient(135deg,#f1f5f9_0%,#06b6d4_50%,#8b5cf6_100%)] bg-[length:200%_200%] bg-clip-text text-transparent mb-1.5 animate-gradient">
            Welcome Back
          </h1>
          <p className="text-[13px] text-slate-500">
            Sign in to continue to JobScout
          </p>
        </div>

        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-400 px-3.5 py-2.5 rounded-[10px] mb-4 text-xs flex items-center gap-2 animate-shake">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="group w-full p-3 bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-sm font-semibold text-slate-200 cursor-pointer flex items-center justify-center gap-2.5
            transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
            hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(6,182,212,0.5)] hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-[360deg]" viewBox="0 0 20 20">
            <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
            <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
            <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
            <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
          </svg>
          Continue with Google
        </button>

        {/* Animated Divider */}
        <div className="flex items-center gap-3.5 my-4.5">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[rgba(6,182,212,0.3)] to-transparent animate-shimmer" />
          <span className="text-slate-500 text-[11px] font-semibold px-2.5 py-1 bg-[rgba(6,182,212,0.1)] rounded-full">or</span>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent animate-shimmer" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* Email Input */}
          <div className="group">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 transition-all duration-300 group-focus-within:text-cyan-500 group-focus-within:translate-x-[5px]">
              ✉️ Email Address
            </label>
            <input
              {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" } })}
              type="email"
              placeholder="you@example.com"
              className="w-full p-3 px-4 bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-sm text-slate-100 outline-none
                transition-all duration-300
                focus:bg-[rgba(6,182,212,0.08)] focus:border-cyan-500 focus:shadow-[0_0_25px_rgba(6,182,212,0.3),inset_0_0_20px_rgba(6,182,212,0.05)] focus:-translate-y-[2px] focus:scale-[1.02]
                hover:bg-[rgba(6,182,212,0.04)] hover:border-[rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.15),0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] hover:scale-[1.01]"
            />
            {errors.email && <p className="text-red-400 text-[11px] mt-1.5">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div className="group">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 transition-all duration-300 group-focus-within:text-cyan-500 group-focus-within:translate-x-[5px]">
              🔒 Password
            </label>
            <div className="relative">
              <input
                {...register("password", { required: "Password is required" })}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 px-4 pr-[45px] bg-[rgba(15,23,42,0.6)] border-2 border-[rgba(148,163,184,0.2)] rounded-xl text-sm text-slate-100 outline-none
                  transition-all duration-300
                  focus:bg-[rgba(6,182,212,0.08)] focus:border-cyan-500 focus:shadow-[0_0_25px_rgba(6,182,212,0.3),inset_0_0_20px_rgba(6,182,212,0.05)] focus:-translate-y-[2px] focus:scale-[1.02]
                  hover:bg-[rgba(6,182,212,0.04)] hover:border-[rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.15),0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] hover:scale-[1.01]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 border-none cursor-pointer p-1 flex items-center justify-center
                  transition-all duration-300 rounded-md hover:scale-[1.2]
                  ${showPassword ? 'text-cyan-500' : 'text-slate-500 hover:text-cyan-500'}`}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-[11px] mt-1.5">{errors.password.message}</p>}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="border-none text-cyan-500 text-xs font-semibold cursor-pointer px-2 py-1 rounded-md
                transition-all duration-300
                hover:bg-[rgba(6,182,212,0.1)] hover:text-violet-500"
            >
              Forgot password? 🔑
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`group w-full p-3.5 bg-[linear-gradient(135deg,#06b6d4_0%,#8b5cf6_100%)] bg-[length:200%_200%] text-white border-none rounded-[14px] text-[15px] font-bold cursor-pointer
              transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] relative overflow-hidden
              shadow-[0_10px_30px_rgba(6,182,212,0.3)]
              hover:shadow-[0_20px_40px_rgba(6,182,212,0.4),0_0_60px_rgba(139,92,246,0.2)] hover:scale-[1.03] hover:-translate-y-[3px]
              disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 disabled:hover:translate-y-0
              ${!loading ? 'animate-gradient' : ''}`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span className="transition-transform duration-300 group-hover:translate-x-[5px]">→</span>}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
