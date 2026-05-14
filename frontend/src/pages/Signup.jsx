import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf } from 'react-icons/fa';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const SIGNUP_QUOTES = [
  {
    title: <>Start Your <br /><span style={{ backgroundImage: 'linear-gradient(135deg, #34e89e, #1aad72)' }} className="text-transparent bg-clip-text font-extrabold">Future Today</span></>,
    text: "Create your Rizqa AI profile and unlock a world of career opportunities matched precisely to your skills, experience, and aspirations."
  },
  {
    title: <>Stand Out <br /><span style={{ backgroundImage: 'linear-gradient(135deg, #34e89e, #1aad72)' }} className="text-transparent bg-clip-text font-extrabold">To Employers</span></>,
    text: "Build a dynamic professional profile that highlights your strengths — and let our AI connect you with the companies looking for exactly what you offer."
  },
  {
    title: <>Your Personal <br /><span style={{ backgroundImage: 'linear-gradient(135deg, #34e89e, #1aad72)' }} className="text-transparent bg-clip-text font-extrabold">Career Coach</span></>,
    text: "More than a job board — Rizqa AI provides personalized guidance, interview preparation, and actionable insights to accelerate your career growth."
  }
];

const HeroCarousel = ({ quotes }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setIsFading(false);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  useEffect(() => {
    if (!isFading) {
      setDisplayIndex(currentQuoteIndex);
    }
  }, [currentQuoteIndex, isFading]);

  return (
    <div className="hidden lg:flex lg:w-2/5 relative items-center justify-center overflow-hidden" style={{ background: '#071825' }}>
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ background: '#34e89e', opacity: 0.15 }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" style={{ background: '#0f3443', opacity: 0.5 }}></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center p-16 max-w-xl h-full w-full">
        <Link to="/" className="flex items-center gap-3 mb-auto hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
            <FaLeaf className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: '#e2f8f0' }}>Rizqa AI</span>
        </Link>

        <div className="my-auto" style={{ minHeight: '180px' }}>
          <div
            style={{
              animation: isFading ? 'carousel-out 0.5s ease-in-out forwards' : 'carousel-in 0.6s ease-out forwards',
            }}
          >
            <h1 className="text-5xl font-extrabold text-white mb-6 leading-[1.1]">
              {quotes[displayIndex].title}
            </h1>
            <p className="text-lg font-medium leading-relaxed max-w-md" style={{ color: 'rgba(226,248,240,0.7)' }}>
              {quotes[displayIndex].text}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center space-x-3">
          {quotes.map((_, i) => {
            const isActive = i === currentQuoteIndex;
            const isPast = i < currentQuoteIndex;
            return (
              <div
                key={i}
                style={{
                  height: '4px',
                  borderRadius: '9999px',
                  width: isActive ? '56px' : '24px',
                  background: 'rgba(52,232,158,0.15)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div
                  key={`fill-${i}-${currentQuoteIndex}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #34e89e, #4ffdb0)',
                    boxShadow: isActive ? '0 0 10px rgba(52,232,158,0.8), 0 0 20px rgba(52,232,158,0.4)' : 'none',
                    width: isActive ? '0%' : isPast ? '100%' : '0%',
                    ...(isActive && { animation: 'progress-fill 6s linear forwards' }),
                    transition: !isActive ? 'width 0.4s ease' : 'none',
                  }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SplitScreenLayout = ({ children }) => (
  <div className="min-h-screen max-h-screen w-full flex overflow-hidden" style={{ background: '#0f3443' }}>
    <HeroCarousel quotes={SIGNUP_QUOTES} />
    <div className="w-full lg:w-3/5 flex flex-col p-6 sm:p-10 relative overflow-y-auto custom-scrollbar" style={{ background: '#0a1e2e' }}>
      <div className="w-full max-w-md mx-auto my-auto animate-fade-in-up py-4 min-h-[540px] flex flex-col justify-center">
        {children}
      </div>
    </div>
  </div>
);

export default function Signup() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { signup, initiateGoogleSignIn, currentUser, userProfile } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && userProfile) {
      if (userProfile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/chatbot');
      }
    }
  }, [currentUser, userProfile, navigate]);

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const passwordStrength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      await signup(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'user'
      });
      navigate('/chatbot');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password does not meet requirements.');
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
      if (result.isNewUser) {
        navigate('/complete-profile');
      } else {
        navigate('/chatbot');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' };
  const labelStyle = { color: 'rgba(226,248,240,0.8)' };
  const iconStyle = { color: 'rgba(52,232,158,0.5)' };

  return (
    <SplitScreenLayout>
      {/* Mobile Header */}
      <Link to="/" className="lg:hidden mb-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
          <FaLeaf className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold" style={{ color: '#e2f8f0' }}>Rizqa AI</h1>
      </Link>

      <div className="mb-6 sm:mb-8">
        <div className="flex p-1 rounded-xl mb-8 border" style={{ background: 'rgba(7,24,37,0.6)', borderColor: 'rgba(52,232,158,0.15)' }}>
          <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-bold rounded-lg transition-all" style={{ color: 'rgba(226,248,240,0.5)' }}>
            Log In
          </Link>
          <Link to="/signup" className="flex-1 text-center py-2.5 text-sm font-bold rounded-lg shadow-sm transition-all" style={{ background: '#34e89e', color: '#071825' }}>
            Sign Up
          </Link>
        </div>

        <h2 className="text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight" style={{ color: '#e2f8f0' }}>Create an account</h2>
        <p className="text-sm font-medium" style={{ color: 'rgba(226,248,240,0.5)' }}>Join us today to launch your career.</p>
      </div>

      <div className="w-full flex flex-col space-y-4 sm:space-y-6">
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            <span className="font-bold">!</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 sm:space-y-5">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={iconStyle}>
                  <FiUser className="w-5 h-5" />
                </div>
                <input
                  {...register("firstName", { required: "Required", minLength: { value: 2, message: "Min 2 chars" } })}
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium"
                  style={inputStyle}
                  placeholder="First"
                />
              </div>
              {errors.firstName && <p className="text-red-400 text-[10px] mt-0.5 font-medium">{errors.firstName.message}</p>}
            </div>
            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={iconStyle}>
                  <FiUser className="w-5 h-5" />
                </div>
                <input
                  {...register("lastName", { required: "Required", minLength: { value: 2, message: "Min 2 chars" } })}
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium"
                  style={inputStyle}
                  placeholder="Last"
                />
              </div>
              {errors.lastName && <p className="text-red-400 text-[10px] mt-0.5 font-medium">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={iconStyle}>
                <FiMail className="w-5 h-5" />
              </div>
              <input
                {...register("email", {
                  required: "Required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Please enter a valid email address"
                  }
                })}
                type="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium"
                style={inputStyle}
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="text-red-400 mt-0.5 text-[10px] font-medium">{errors.email.message}</p>}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={iconStyle}>
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  {...register("password", {
                    required: "Required",
                    minLength: { value: 8, message: "Min 8 chars" },
                    validate: {
                      hasUpperCase: v => /[A-Z]/.test(v) || "Need uppercase",
                      hasLowerCase: v => /[a-z]/.test(v) || "Need lowercase",
                      hasNumber: v => /[0-9]/.test(v) || "Need number",
                      hasSpecialChar: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || "Need special char"
                    }
                  })}
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-9 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium"
                  style={inputStyle}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors text-[10px] font-semibold"
                  style={{ color: 'rgba(52,232,158,0.6)' }}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {errors.password && <p className="text-red-400 mt-0.5 text-[10px] font-medium">{errors.password.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Confirm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={iconStyle}>
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  {...register("confirmPassword", {
                    required: "Required",
                    validate: value => value === password || "Passwords don't match"
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-10 pr-9 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium"
                  style={inputStyle}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 mt-0.5 text-[10px] font-medium">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && passwordStrength < 5 && (
            <div className="rounded-lg px-2 py-1.5 mt-0.5 border" style={{ background: 'rgba(7,24,37,0.6)', borderColor: 'rgba(52,232,158,0.15)' }}>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold" style={{ color: 'rgba(226,248,240,0.6)' }}>Strength:</span>
                <div className="flex gap-1.5">
                  <span className="font-semibold" style={{ color: hasMinLength ? '#34e89e' : 'rgba(226,248,240,0.3)' }}>{hasMinLength ? '✓' : '○'} 8+</span>
                  <span className="font-semibold" style={{ color: hasUpperCase ? '#34e89e' : 'rgba(226,248,240,0.3)' }}>{hasUpperCase ? '✓' : '○'} A</span>
                  <span className="font-semibold" style={{ color: hasLowerCase ? '#34e89e' : 'rgba(226,248,240,0.3)' }}>{hasLowerCase ? '✓' : '○'} a</span>
                  <span className="font-semibold" style={{ color: hasNumber ? '#34e89e' : 'rgba(226,248,240,0.3)' }}>{hasNumber ? '✓' : '○'} #</span>
                  <span className="font-semibold" style={{ color: hasSpecialChar ? '#34e89e' : 'rgba(226,248,240,0.3)' }}>{hasSpecialChar ? '✓' : '○'} !</span>
                  <span className="font-semibold" style={{ color: passwordsMatch ? '#34e89e' : 'rgba(226,248,240,0.3)' }}>{passwordsMatch ? '✓' : '○'} =</span>
                </div>
              </div>
            </div>
          )}



          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-1 sm:mt-2 rounded-lg font-semibold disabled:opacity-70 flex items-center justify-center gap-2 text-sm shadow-sm"
            style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px" style={{ background: 'rgba(52,232,158,0.15)' }}></div>
          <span className="text-xs font-medium" style={{ color: 'rgba(226,248,240,0.4)' }}>OR</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(52,232,158,0.15)' }}></div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full rounded-lg px-4 py-2.5 flex items-center justify-center gap-3 font-semibold transition-colors disabled:opacity-70 text-sm"
          style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
        >
          <FcGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

      </div>
    </SplitScreenLayout>
  );
}
