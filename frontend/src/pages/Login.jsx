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
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#070b14] to-[#070b14] p-4 font-sans text-slate-100 overflow-hidden relative selection:bg-cyan-500/30">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[25%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-custom mix-blend-screen" />
          <div className="absolute bottom-[10%] right-[25%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] animate-pulse-custom animation-delay-700 mix-blend-screen" />
        </div>

        <div className="w-full max-w-[440px] bg-white/[0.03] backdrop-blur-2xl p-10 rounded-[32px] border border-white/[0.08] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] relative z-10 flex flex-col items-center">
          <div className="text-center mb-10 w-full">
            <div className="text-7xl mb-6 animate-bounce-custom drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">🔐</div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-3">Reset Password</h2>
            <p className="text-slate-400 text-lg">Enter your email to receive a reset link</p>
          </div>

          {resetSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center w-full animate-scale-in">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-emerald-400 mb-6 text-xl font-semibold">Reset email sent!</p>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-cyan-400 hover:text-cyan-300 text-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <span>←</span> Back to Login
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3 animate-shake backdrop-blur-sm">
                  <span className="text-lg">⚠️</span> <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-6">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-5 text-lg bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 outline-none transition-all duration-300
                    focus:bg-slate-900/80 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)]
                    hover:border-white/20"
                />

                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full p-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-lg rounded-2xl font-bold
                    transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(6,182,212,0.4)]
                    hover:shadow-[0_20px_35px_-10px_rgba(6,182,212,0.5)] hover:scale-[1.02] hover:-translate-y-0.5
                    active:scale-95 active:translate-y-0
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>

              <button
                onClick={() => { setShowForgotPassword(false); setError(''); }}
                className="w-full p-4 text-slate-400 hover:text-white rounded-2xl text-base font-semibold transition-all duration-300 hover:bg-white/5"
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#070b14] to-[#070b14] p-4 font-sans text-slate-100 overflow-hidden relative selection:bg-cyan-500/30">
      {/* Premium ambient background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-float1" />
        <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen opacity-50 animate-float2" />
        <div className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px] mix-blend-screen opacity-50 animate-float3" />
      </div>

      <div
        className={`w-full max-w-[420px] min-h-[85vh] md:min-h-[820px] bg-white/[0.02] backdrop-blur-3xl px-8 py-10 rounded-[36px] border border-white/[0.08] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)] relative z-10 flex flex-col justify-between
          transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)]
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >

        {/* Navigation - Top Right */}
        <div className="flex justify-end mb-4">
          <Link
            to="/signup"
            className="group flex items-center gap-2.5 px-5 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-full text-cyan-400 text-sm font-bold no-underline
              transition-all duration-300
              hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:scale-105 active:scale-95"
          >
            <span className="text-lg transition-transform duration-300 group-hover:rotate-12">✨</span>
            <span>Create Account</span>
            <span className="opacity-0 -ml-2 transition-all duration-300 group-hover:opacity-100 group-hover:ml-0">→</span>
          </Link>
        </div>

        {/* Brand Header - Centered */}
        <div className="text-center mb-8 flex-shrink-0">
          <div className="relative group mx-auto mb-8 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-violet-500 rounded-[28px] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative w-28 h-28 bg-gradient-to-tr from-cyan-500 to-violet-600 rounded-[28px] flex items-center justify-center text-5xl text-white font-bold
              shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.3)]
              transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
              JS
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-sm">
            Welcome Back
          </h1>
          <p className="text-lg text-slate-400 font-medium">
            Sign in to your dashboard
          </p>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col w-full">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-shake font-medium backdrop-blur-md">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-500/20 rounded-full text-xs">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* SocialAuth */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            className="w-full p-4 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-lg font-semibold text-slate-200 cursor-pointer flex items-center justify-center gap-3
              transition-all duration-300 mb-8
              hover:bg-white/[0.1] hover:border-white/[0.2] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity="0.9" />
              <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.9" />
              <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.9" />
              <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.9" />
            </svg>
            <span className="tracking-wide">Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center mb-8">
            <div className="flex-grow border-t border-white/[0.1]"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-semibold tracking-wider uppercase">or email</span>
            <div className="flex-grow border-t border-white/[0.1]"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
            {/* Dark Modern Inputs */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-400 mb-2 pl-1 uppercase tracking-wider">Email Address</label>
              <input
                {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" } })}
                type="email"
                placeholder="name@company.com"
                className="w-full p-4 px-5 text-lg bg-slate-950/40 border border-white/10 rounded-2xl text-white placeholder-slate-600 outline-none
                  transition-all duration-300
                  focus:bg-slate-900/60 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 focus:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]
                  hover:bg-slate-900/50 hover:border-white/20"
              />
              {errors.email && <p className="text-red-400 text-sm mt-2 pl-1 font-medium">{errors.email.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-400 mb-2 pl-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  {...register("password", { required: "Password is required" })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full p-4 px-5 pr-14 text-lg bg-slate-950/40 border border-white/10 rounded-2xl text-white placeholder-slate-600 outline-none
                    transition-all duration-300
                    focus:bg-slate-900/60 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 focus:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]
                    hover:bg-slate-900/50 hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 border-none cursor-pointer p-2 rounded-lg transition-colors
                    ${showPassword ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-2 pl-1 font-medium">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-cyan-400/80 hover:text-cyan-300 text-sm font-semibold transition-colors hover:underline decoration-cyan-500/30 underline-offset-4"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex-grow" />

            {/* Gradient Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xl rounded-2xl font-bold cursor-pointer
                transition-all duration-300 mt-auto
                shadow-[0_10px_40px_-10px_rgba(6,182,212,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]
                hover:shadow-[0_20px_50px_-10px_rgba(6,182,212,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] hover:scale-[1.02] hover:-translate-y-1
                active:scale-[0.98] active:translate-y-0
                disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                ${!loading ? 'animate-gradient bg-[length:200%_200%]' : ''}`}
            >
              <span className="flex items-center justify-center gap-3 drop-shadow-md">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
