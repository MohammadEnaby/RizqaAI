import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf } from 'react-icons/fa';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const SIGNUP_QUOTES = [
  {
    title: <>Start Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-300 font-extrabold">Future Today</span></>,
    text: "Join Rizqa AI and discover opportunities that match your unique profile. Set up your account in seconds."
  },
  {
    title: <>Stand Out <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-300 font-extrabold">To Employers</span></>,
    text: "Showcase your skills using our dynamic profile builder and let the right companies come directly to you."
  },
  {
    title: <>Your Personal <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-300 font-extrabold">Career Coach</span></>,
    text: "It's not just a job board. We provide you with the tools you need to prepare for interviews and grow your potential."
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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse delay-1000"></div>
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

const SplitScreenLayout = ({ children }) => (
  <div className="min-h-screen max-h-screen w-full flex bg-white dark:bg-gray-900 overflow-hidden">
    {/* Left Panel */}
    <HeroCarousel quotes={SIGNUP_QUOTES} />

    {/* Right Panel - Form Area */}
    <div className="w-full lg:w-1/2 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      <div className="w-full flex justify-end mb-4 shrink-0">
         <div className="flex items-center gap-3">
           <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">Already have an account?</span>
           <Link
            to="/login"
            className="px-5 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold transition-all text-sm border border-gray-200 dark:border-gray-700"
          >
            Log in
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[420px] mx-auto my-auto animate-fade-in-up pb-8">
        {children}
      </div>
    </div>
  </div>
);

export default function Signup() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ defaultValues: { role: 'user' } });
  const { signup, initiateGoogleSignIn } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  // Password strength checks
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
        phone: data.phone,
        role: data.role
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

  return (
    <SplitScreenLayout>
      {/* Mobile Header (Only visible on small screens) */}
      <div className="lg:hidden mb-6 flex items-center gap-3 mt-4">
        <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-md">
          <FaLeaf className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rizqa AI</h1>
      </div>

      <div className="mb-5 sm:mb-6">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-1 lg:mb-2 tracking-tight">Create an account</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Join us today to launch your career.</p>
      </div>

      <div className="w-full flex flex-col space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="font-bold">!</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-3 lg:space-y-4">
          
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="group">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">
                  <FiUser className="w-4 h-4"/>
                </div>
                <input
                  {...register("firstName", { required: "Required", minLength: { value: 2, message: "Min 2 chars" } })}
                  type="text"
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm hover:border-gray-400 dark:hover:border-gray-600 font-medium"
                  placeholder="First"
                />
              </div>
              {errors.firstName && <p className="text-red-500 text-[10px] mt-0.5 font-medium">{errors.firstName.message}</p>}
            </div>
            <div className="group">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">
                  <FiUser className="w-4 h-4"/>
                </div>
                <input
                  {...register("lastName", { required: "Required", minLength: { value: 2, message: "Min 2 chars" } })}
                  type="text"
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm hover:border-gray-400 dark:hover:border-gray-600 font-medium"
                  placeholder="Last"
                />
              </div>
              {errors.lastName && <p className="text-red-500 text-[10px] mt-0.5 font-medium">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email Drop */}
          <div className="group">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">
                <FiMail className="w-4 h-4"/>
              </div>
              <input
                {...register("email", {
                  required: "Required",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                })}
                type="email"
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm hover:border-gray-400 dark:hover:border-gray-600 font-medium"
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 mt-0.5 text-[10px] font-medium">{errors.email.message}</p>}
          </div>
          
          {/* Phone Drop */}
          <div className="group">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">
                <FiPhone className="w-4 h-4"/>
              </div>
              <input
                {...register("phone", {
                  required: "Required",
                  pattern: { value: /^[0-9+\-\s()]+$/, message: "Invalid phone" },
                  minLength: { value: 9, message: "Min 9 digits" }
                })}
                type="tel"
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm hover:border-gray-400 dark:hover:border-gray-600 font-medium"
                placeholder="(555) 123-4567"
              />
            </div>
            {errors.phone && <p className="text-red-500 mt-0.5 text-[10px] font-medium">{errors.phone.message}</p>}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="group">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">
                  <FiLock className="w-4 h-4"/>
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
                  className="w-full pl-8 pr-9 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm hover:border-gray-400 dark:hover:border-gray-600 font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-[10px] font-semibold"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 mt-0.5 text-[10px] font-medium">{errors.password.message}</p>}
            </div>

            <div className="group">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">
                  <FiLock className="w-4 h-4"/>
                </div>
                <input
                  {...register("confirmPassword", {
                    required: "Required",
                    validate: value => value === password || "Passwords don't match"
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-8 pr-9 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm hover:border-gray-400 dark:hover:border-gray-600 font-medium"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 mt-0.5 text-[10px] font-medium">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && passwordStrength < 5 && (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 mt-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-gray-600 dark:text-gray-400">Strength:</span>
                <div className="flex gap-1.5">
                  <span className={`font-semibold ${hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>{hasMinLength ? '✓' : '○'} 8+</span>
                  <span className={`font-semibold ${hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>{hasUpperCase ? '✓' : '○'} A</span>
                  <span className={`font-semibold ${hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>{hasLowerCase ? '✓' : '○'} a</span>
                  <span className={`font-semibold ${hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>{hasNumber ? '✓' : '○'} #</span>
                  <span className={`font-semibold ${hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>{hasSpecialChar ? '✓' : '○'} !</span>
                  <span className={`font-semibold ${passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>{passwordsMatch ? '✓' : '○'} =</span>
                </div>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-teal-400 dark:hover:border-teal-500 transition-all py-1.5 px-3">
              <input
                {...register("role", { required: true })}
                type="radio"
                value="user"
                className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-gray-600"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Job Seeker</span>
            </label>
            <label className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-teal-400 dark:hover:border-teal-500 transition-all py-1.5 px-3">
              <input
                {...register("role", { required: true })}
                type="radio"
                value="admin"
                className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-gray-600"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Employer</span>
            </label>
          </div>
          {errors.role && <p className="text-red-500 text-[10px] text-center font-medium">Please select a role</p>}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-1 rounded-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 flex items-center justify-center gap-3 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:bg-gray-100 dark:active:bg-gray-600 disabled:opacity-70 text-sm"
        >
          <FcGoogle className="w-4 h-4" />
          <span>Continue with Google</span>
        </button>

      </div>
    </SplitScreenLayout>
  );
}
