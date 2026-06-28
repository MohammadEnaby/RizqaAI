import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaLeaf, FaArrowRight, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { FiMail, FiPhone, FiUser, FiBriefcase, FiMapPin, FiList, FiStar, FiHash } from 'react-icons/fi';

const PUBLISH_QUOTES = [
  {
    title: <>Find Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-300 font-extrabold">Ideal Candidates</span></>,
    text: "Publish your job opportunities to Rizqa AI's intelligent matching network."
  },
  {
    title: <>Streamline <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-300 font-extrabold">Hiring</span></>,
    text: "Our advanced AI ensures your job listing reaches the most qualified professionals."
  },
  {
    title: <>Grow Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-300 font-extrabold">Business</span></>,
    text: "Access a wide pool of talent eager to contribute to your success."
  }
];

const HeroCarousel = ({ quotes }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="hidden lg:flex lg:w-2/5 relative items-center justify-center overflow-hidden" style={{ background: '#071825' }}>
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ background: '#34e89e', opacity: 0.15 }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" style={{ background: '#0f3443', opacity: 0.5 }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col justify-center p-16 max-w-xl h-full w-full">
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
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
              style={{ height: '6px', borderRadius: '9999px', transition: 'all 0.5s', width: i === currentQuoteIndex ? '32px' : '8px', background: i === currentQuoteIndex ? '#34e89e' : 'rgba(52,232,158,0.25)' }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SplitScreenLayout = ({ children }) => (
  <div className="min-h-screen max-h-screen w-full flex overflow-hidden" style={{ background: '#0f3443' }}>
    <HeroCarousel quotes={PUBLISH_QUOTES} />
    <div className="w-full lg:w-3/5 flex flex-col p-6 sm:p-10 relative overflow-y-auto custom-scrollbar" style={{ background: '#0a1e2e' }}>
      <div className="w-full max-w-md mx-auto my-auto animate-fade-in-up py-4">
        {children}
      </div>
    </div>
  </div>
);

export default function PublishJob() {
  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = async () => {
    const isStepValid = await trigger(['companyName', 'publisherName', 'phone', 'email']);
    if (isStepValid) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      
      await addDoc(collection(db, 'published_jobs'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting job:", err);
      setError('Failed to submit job request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SplitScreenLayout>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(52,232,158,0.1)', color: '#34e89e' }}>
            <FaCheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4" style={{ color: '#e2f8f0' }}>Request Submitted!</h2>
          <p className="mb-8" style={{ color: 'rgba(226,248,240,0.6)' }}>
            Your job publish request has been sent to our team. We will review it shortly. Once approved, it will be visible on Rizqa AI.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}
          >
            Back to Home
          </button>
        </div>
      </SplitScreenLayout>
    );
  }

  return (
    <SplitScreenLayout>
      <div className="lg:hidden mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
          <FaLeaf className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold" style={{ color: '#e2f8f0' }}>Rizqa AI</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight" style={{ color: '#e2f8f0' }}>Publish a Job</h2>
        <p className="text-sm font-medium" style={{ color: 'rgba(226,248,240,0.5)' }}>
          {step === 1 ? 'Step 1: Your Details' : 'Step 2: Job Information'}
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 mb-6 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          <span className="font-bold">!</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-5">
        
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Company Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                  <FiBriefcase className="w-5 h-5"/>
                </div>
                <input
                  {...register("companyName", { required: "Company name is required" })}
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              {errors.companyName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.companyName.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Publisher Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                  <FiUser className="w-5 h-5"/>
                </div>
                <input
                  {...register("publisherName", { required: "Publisher name is required" })}
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
                  placeholder="e.g. Jane Doe"
                />
              </div>
              {errors.publisherName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.publisherName.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                  <FiPhone className="w-5 h-5"/>
                </div>
                <input
                  {...register("phone", { required: "Phone number is required" })}
                  type="tel"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Email Address</label>
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

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full py-2.5 mt-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}
            >
              Continue <FaArrowRight />
            </button>
            
            <div className="text-center mt-4">
              <Link to="/" className="text-sm font-medium hover:underline" style={{ color: 'rgba(226,248,240,0.5)' }}>
                Cancel and return home
              </Link>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Job Title</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                  <FiBriefcase className="w-5 h-5"/>
                </div>
                <input
                  {...register("jobTitle", { required: "Job title is required" })}
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              {errors.jobTitle && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.jobTitle.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Job Address / Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                  <FiMapPin className="w-5 h-5"/>
                </div>
                <input
                  {...register("address", { required: "Address is required" })}
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
                  placeholder="e.g. Remote or City, Country"
                />
              </div>
              {errors.address && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.address.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Number of Positions</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                  <FiHash className="w-5 h-5"/>
                </div>
                <input
                  {...register("numberOfPositions", { required: "Number is required", min: 1 })}
                  type="number"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
                  placeholder="e.g. 2"
                />
              </div>
              {errors.numberOfPositions && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.numberOfPositions.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Requirements</label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                  <FiList className="w-5 h-5"/>
                </div>
                <textarea
                  {...register("requirements", { required: "Requirements are required" })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0', minHeight: '80px' }}
                  placeholder="List the required skills and experience..."
                />
              </div>
              {errors.requirements && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.requirements.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(226,248,240,0.8)' }}>Advantages / Benefits</label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'rgba(52,232,158,0.5)' }}>
                  <FiStar className="w-5 h-5"/>
                </div>
                <textarea
                  {...register("advantages")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all text-sm font-medium" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0', minHeight: '80px' }}
                  placeholder="What are the perks? (e.g., Health insurance, remote work)"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2.5 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-sm" style={{ background: 'rgba(7,24,37,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}
              >
                <FaArrowLeft /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </form>
    </SplitScreenLayout>
  );
}
