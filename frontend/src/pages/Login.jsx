import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf } from 'react-icons/fa';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const LOGIN_QUOTES = [
  {
    title: <>Unlock Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-300 font-extrabold">Career Potential</span></>,
    text: "Join Rizqa AI, your intelligent career assistant. Find the perfect role tailored specifically to your skills and aspirations."
  },
  {
    title: <>Discover <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-300 font-extrabold">New Opportunities</span></>,
    text: "Our advanced AI matches you with positions you didn't even know existed, perfectly aligned with your unique skill set."
  },
  {
    title: <>Accelerate Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-300 font-extrabold">Professional Growth</span></>,
    text: "Experience seamless job hunting with tailored insights and step-by-step guidance to climb your career ladder."
  }
];

// Carousel component isolated so interval doesn't re-render the forms
const HeroCarousel = ({ quotes }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-[#064e3b] items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse delay-1000"></div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-center p-16 max-w-xl h-full w-full">
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 bg-gradient-to-tr from-green-400 to-teal-400 rounded-lg flex items-center justify-center text-white shadow-lg">
            <FaLeaf className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Rizqa AI</span>
        </div>

        <div className="my-auto transition-opacity duration-500 ease-in-out" key={currentQuoteIndex}>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-[1.1] animate-fade-in-up">
            {quotes[currentQuoteIndex].title}
          </h1>
          <p className="text-lg text-teal-100/80 font-medium leading-relaxed max-w-md animate-fade-in-up" style={{animationDelay: '100ms'}}>
            {quotes[currentQuoteIndex].text}
          </p>
        </div>
        
        <div className="mt-auto flex items-center space-x-2">
          {quotes.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentQuoteIndex ? 'w-8 bg-teal-400' : 'w-2 bg-teal-700'}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SplitScreenLayout = ({ children, isResetFlow = false }) => (
  <div className="min-h-screen max-h-screen w-full flex bg-white overflow-hidden">
    {/* Left Panel */}
    <HeroCarousel quotes={LOGIN_QUOTES} />

    {/* Right Panel - Form Area */}
    <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-10 relative overflow-y-auto custom-scrollbar">
      {!isResetFlow && (
        <div className="w-full flex justify-end mb-4 sm:mb-8 shrink-0">
           <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-gray-500 hidden sm:inline">Don't have an account?</span>
             <Link
              to="/signup"
              className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg font-semibold transition-all text-sm border border-gray-200"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}

      <div className="w-full max-w-md mx-auto my-auto animate-fade-in-up">
        {children}
      </div>
    </div>
  </div>
);

export default function Login() {
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();
  const { login, initiateGoogleSignIn, resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

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
          <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <FaLeaf className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Rizqa AI</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Reset Password</h2>
          <p className="text-gray-500 text-sm">Enter your email to receive a secure reset link.</p>
        </div>

        {resetSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">✓</div>
            <h3 className="text-lg font-bold text-green-800 mb-2">Check your inbox</h3>
            <p className="text-green-700 text-sm mb-6">We've sent a password reset link to your email address.</p>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-2.5 text-sm font-semibold text-teal-700 bg-green-100/50 hover:bg-green-100 rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-5 w-full">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                <span className="font-bold">!</span> {error}
              </div>
            )}
            
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600">
                  <FiMail className="w-5 h-5"/>
                </div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-medium hover:border-gray-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors disabled:opacity-70 flex justify-center items-center mt-2 text-sm shadow-sm"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
            <button
               onClick={() => {
                 setError('');
                 setShowForgotPassword(false);
               }}
              className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-800 font-semibold transition-colors mt-2"
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
      <div className="lg:hidden mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-md">
          <FaLeaf className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Rizqa AI</h1>
      </div>

      <div className="mb-6 sm:mb-8">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Login to your account</h2>
        <p className="text-gray-500 text-sm font-medium">Welcome back! Please enter your details.</p>
      </div>

      <div className="w-full flex flex-col space-y-4 sm:space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="font-bold">!</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 sm:space-y-5">
          {/* Email Field */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600">
                <FiMail className="w-5 h-5"/>
              </div>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-medium hover:border-gray-400"
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="group">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <button
                type="button"
                onClick={() => {
                  const currentEmail = getValues('email');
                  if (currentEmail) setResetEmail(currentEmail);
                  setShowForgotPassword(true);
                }}
                className="text-xs text-teal-600 hover:text-teal-800 font-semibold transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600">
                <FiLock className="w-5 h-5"/>
              </div>
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-medium hover:border-gray-400"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-1 sm:mt-2 rounded-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:bg-gray-100 disabled:opacity-70 text-sm"
        >
          <FcGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

      </div>
    </SplitScreenLayout>
  );
}
