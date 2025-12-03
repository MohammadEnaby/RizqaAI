import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';

export default function Signup() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { signup, initiateGoogleSignIn } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const password = watch("password", "");
  const firstName = watch("firstName", "");
  const lastName = watch("lastName", "");
  const phone = watch("phone", "");

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
      await signup(data.email, data.password, fullName, data.role, data.phone);
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please follow the requirements below.');
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        padding: '48px 40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '36px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            JS
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '8px'
          }}>
            Create Account
          </h2>
          <p style={{ fontSize: '14px', color: '#718096' }}>
            Join JobScout and start your journey
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            color: '#c33',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          style={{
            width: '100%',
            padding: '12px',
            background: 'white',
            color: '#444',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => !loading && (e.target.style.background = '#f9f9f9')}
          onMouseOut={(e) => !loading && (e.target.style.background = 'white')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
            <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
            <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
            <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          gap: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          <span style={{ color: '#718096', fontSize: '14px', fontWeight: '500' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '8px'
              }}>
                First Name <span style={{ color: '#e53e3e' }}>*</span>
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
                placeholder="John"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              {errors.firstName && (
                <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '6px' }}>
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '8px'
              }}>
                Last Name <span style={{ color: '#e53e3e' }}>*</span>
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
                placeholder="Doe"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              {errors.lastName && (
                <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '6px' }}>
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Email Address <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              type="email"
              placeholder="john.doe@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            {errors.email && (
              <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '6px' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Phone Number <span style={{ color: '#e53e3e' }}>*</span>
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
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            {errors.phone && (
              <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '6px' }}>
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Account Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Account Type <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <input
                  {...register("role", { required: "Please select an account type" })}
                  type="radio"
                  value="user"
                  defaultChecked
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>User</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>Browse & apply for jobs</div>
                </div>
              </label>

              <label style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <input
                  {...register("role")}
                  type="radio"
                  value="admin"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>Admin</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>Manage the platform</div>
                </div>
              </label>
            </div>
            {errors.role && (
              <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '6px' }}>
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Password <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
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
                placeholder="Create a strong password"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#718096',
                  fontSize: '18px',
                  padding: '8px'
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '6px' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: '#f7fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#2d3748' }}>
                  Password Strength
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: passwordStrength >= 4 ? '#10b981' : passwordStrength >= 3 ? '#f59e0b' : '#ef4444'
                }}>
                  {passwordStrength >= 4 ? 'Strong' : passwordStrength >= 3 ? 'Medium' : 'Weak'}
                </span>
              </div>
              <div style={{
                display: 'grid',
                gap: '8px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasMinLength ? <FaCheck style={{ color: '#10b981' }} /> : <FaTimes style={{ color: '#ef4444' }} />}
                  <span style={{ color: hasMinLength ? '#10b981' : '#6b7280' }}>At least 8 characters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasUpperCase ? <FaCheck style={{ color: '#10b981' }} /> : <FaTimes style={{ color: '#ef4444' }} />}
                  <span style={{ color: hasUpperCase ? '#10b981' : '#6b7280' }}>One uppercase letter (A-Z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasLowerCase ? <FaCheck style={{ color: '#10b981' }} /> : <FaTimes style={{ color: '#ef4444' }} />}
                  <span style={{ color: hasLowerCase ? '#10b981' : '#6b7280' }}>One lowercase letter (a-z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasNumber ? <FaCheck style={{ color: '#10b981' }} /> : <FaTimes style={{ color: '#ef4444' }} />}
                  <span style={{ color: hasNumber ? '#10b981' : '#6b7280' }}>One number (0-9)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasSpecialChar ? <FaCheck style={{ color: '#10b981' }} /> : <FaTimes style={{ color: '#ef4444' }} />}
                  <span style={{ color: hasSpecialChar ? '#10b981' : '#6b7280' }}>One special character (!@#$%...)</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Confirm Password <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#718096',
                  fontSize: '18px',
                  padding: '8px'
                }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '6px' }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#718096'
        }}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{
              color: '#667eea',
              fontWeight: '600',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
