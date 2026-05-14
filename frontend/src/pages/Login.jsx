import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf } from 'react-icons/fa';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const LOGIN_QUOTES = [
  {
    title: <>Unlock Your <br/><span className="text-transparent bg-clip-text font-extrabold" style={{ backgroundImage: 'linear-gradient(135deg, #34e89e, #1aad72)' }}>Career Potential</span></>,
    text: "Welcome back to Rizqa AI — your intelligent career companion. Sign in to explore personalized opportunities tailored to your expertise."
  },
  {
    title: <>Discover <br/><span className="text-transparent bg-clip-text font-extrabold" style={{ backgroundImage: 'linear-gradient(135deg, #34e89e, #1aad72)' }}>New Opportunities</span></>,
    text: "Our AI engine continuously scans the market to match you with roles perfectly aligned to your unique skill set and ambitions."
  },
  {
    title: <>Accelerate Your <br/><span className="text-transparent bg-clip-text font-extrabold" style={{ backgroundImage: 'linear-gradient(135deg, #34e89e, #1aad72)' }}>Professional Growth</span></>,
    text: "From tailored job insights to interview preparation — everything you need to take the next step in your career, all in one place."
  }
];

// Carousel component isolated so interval doesn't re-render the forms
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
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ background: '#34e89e', opacity: 0.15 }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" style={{ background: '#0f3443', opacity: 0.5 }}></div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-center p-16 max-w-xl h-full w-full">
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
            <FaLeaf className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Rizqa AI</span>
        </div>

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

const SplitScreenLayout = ({ children, isResetFlow = false }) => (
  <div className="min-h-screen max-h-screen w-full flex overflow-hidden" style={{ background: '#0f3443' }}>
    {/* Left Panel */}
    <HeroCarousel quotes={LOGIN_QUOTES} />

    {/* Right Panel - Form Area */}
    <div className="w-full lg:w-3/5 flex flex-col p-6 sm:p-10 relative overflow-y-auto custom-scrollbar" style={{ background: '#0a1e2e' }}>
      <div className="w-full max-w-md mx-auto my-auto animate-fade-in-up py-4 min-h-[540px] flex flex-col justify-center">
        {children}
      </div>
    </div>
  </div>
);

export default function Login() {
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();
  const { login, initiateGoogleSignIn, resetPassword, currentUser, userProfile } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
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

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      await login(data.email, data.password);
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

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(resetEmail)) {
      setError('Please enter a valid email address (e.g., name@example.com).');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setResetSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <SplitScreenLayout isResetFlow={true}>
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
            <FaLeaf className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#e2f8f0' }}>Rizqa AI</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: '#e2f8f0' }}>Reset Password</h2>
          <p className="text-sm" style={{ color: 'rgba(226,248,240,0.55)' }}>Enter your email to receive a secure reset link.</p>
        </div>

        {resetSuccess ? (
          <div className="rounded-xl p-8 text-center border" style={{ background: 'rgba(52,232,158,0.08)', borderColor: 'rgba(52,232,158,0.25)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl" style={{ background: 'rgba(52,232,158,0.15)', color: '#34e89e' }}>✓</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#34e89e' }}>Check your inbox</h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(226,248,240,0.65)' }}>We've sent a password reset link to your email address.</p>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-2.5 text-sm font-semibold rounded-lg transition-colors" style={{ color: '#34e89e', background: 'rgba(52,232,158,0.1)' }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-5 w-full">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <span className="font-bold">!</span> {error}
              </div>
            )}
            
            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                  <FiMail className="w-5 h-5"/>
                </div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0', outlineColor: '#34e89e' }}
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-70 flex justify-center items-center mt-2 text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
            <button
               onClick={() => {
                 setError('');
                 setShowForgotPassword(false);
               }}
              className="w-full py-2.5 text-sm font-semibold transition-colors mt-2" style={{ color: 'rgba(226,248,240,0.5)' }}
            >
              Cancel
            </button>
          </div>
        )}
      </SplitScreenLayout>
    );
  }

  return (
    <SplitScreenLayout>
      {/* Mobile Header */}
      <div className="lg:hidden mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
          <FaLeaf className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold" style={{ color: '#e2f8f0' }}>Rizqa AI</h1>
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="flex p-1 rounded-xl mb-8 border" style={{ background: 'rgba(7,24,37,0.6)', borderColor: 'rgba(52,232,158,0.15)' }}>
          <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-bold rounded-lg shadow-sm transition-all" style={{ background: '#34e89e', color: '#071825' }}>
            Log In
          </Link>
          <Link to="/signup" className="flex-1 text-center py-2.5 text-sm font-bold rounded-lg transition-all" style={{ color: 'rgba(226,248,240,0.5)' }}>
            Sign Up
          </Link>
        </div>

        <h2 className="text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight" style={{ color: '#e2f8f0' }}>Login to your account</h2>
        <p className="text-sm font-medium" style={{ color: 'rgba(226,248,240,0.5)' }}>Welcome back! Please enter your details.</p>
      </div>

      <div className="w-full flex flex-col space-y-4 sm:space-y-6">
        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            <span className="font-bold">!</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 sm:space-y-5">
          {/* Email Field */}
          <div className="group">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                <FiMail className="w-5 h-5"/>
              </div>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Please enter a valid email address"
                  }
                })}
                type="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="group">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold" style={{ color: 'rgba(226,248,240,0.8)' }}>Password</label>
              <button
                type="button"
                onClick={() => {
                  const currentEmail = getValues('email');
                  if (currentEmail) setResetEmail(currentEmail);
                  setShowForgotPassword(true);
                }}
                className="text-xs font-semibold transition-colors" style={{ color: '#34e89e' }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                <FiLock className="w-5 h-5"/>
              </div>
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-1 sm:mt-2 rounded-lg font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
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
          className="w-full rounded-lg px-4 py-2.5 flex items-center justify-center gap-3 font-semibold transition-colors disabled:opacity-70 text-sm" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
        >
          <FcGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

      </div>
    </SplitScreenLayout>
  );
}
