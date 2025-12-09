import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error("Failed to log out");
    }
  }

  const isAdmin = userProfile?.role === 'admin';

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Navigation Bar */}
      <nav style={{
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '0 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              JS
            </div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              JobScout
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                color: '#4a5568',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {userProfile?.name || currentUser.displayName || currentUser.email}
              </div>
              {isAdmin && (
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  marginTop: '2px'
                }}>
                  ADMIN
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '48px'
          }}>
            {isAdmin ? '👑' : '🎉'}
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '16px'
          }}>
            Welcome to JobScout, {userProfile?.name || currentUser.displayName?.split(' ')[0] || 'User'}!
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#718096',
            marginBottom: '32px'
          }}>
            {isAdmin
              ? "You're logged in as an Administrator. You have full access to manage the platform."
              : "You're successfully logged in. Your dashboard content will appear here."}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '40px'
          }}>
            {isAdmin ? (
              <>
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                  borderRadius: '12px',
                  border: '2px solid #667eea40'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '8px'
                  }}>
                    Manage Users
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096' }}>
                    View and manage all user accounts
                  </p>
                </div>
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                  borderRadius: '12px',
                  border: '2px solid #667eea40'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>💼</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '8px'
                  }}>
                    Manage Jobs
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096' }}>
                    Post and manage job listings
                  </p>
                </div>
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                  borderRadius: '12px',
                  border: '2px solid #667eea40'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '8px'
                  }}>
                    Analytics
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096' }}>
                    View platform statistics
                  </p>
                </div>
              </>
            ) : (
              <>
                <div
                  onClick={() => navigate('/chatbot')}
                  style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                    borderRadius: '12px',
                    border: '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    AI Job Assistant
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                    Chat with AI to find your perfect job
                  </p>
                </div>
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                  borderRadius: '12px',
                  border: '2px solid #667eea40'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>💼</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '8px'
                  }}>
                    Browse Jobs
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096' }}>
                    Discover thousands of opportunities
                  </p>
                </div>
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                  borderRadius: '12px',
                  border: '2px solid #667eea40'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '8px'
                  }}>
                    Track Applications
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096' }}>
                    Manage your job applications
                  </p>
                </div>
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                  borderRadius: '12px',
                  border: '2px solid #667eea40'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔔</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '8px'
                  }}>
                    Get Alerts
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096' }}>
                    Never miss an opportunity
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
