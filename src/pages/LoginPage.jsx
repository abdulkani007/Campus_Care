// src/pages/LoginPage.jsx
import React, { useEffect, useState } from 'react';
import RotatingText from '../components/RotatingText';
import logo from '../assets/CC.png';
import '../styles/LoginPage.css';

// Import assets
import h1 from '../assets/h1.jpg';
import h2 from '../assets/h2.jpg';
import h3 from '../assets/h3.jpg';
import h4 from '../assets/h4.jpg';
import h5 from '../assets/h5.jpg';
import h6 from '../assets/h6.jpg';
import h7 from '../assets/h7.jpg';
import h8 from '../assets/h8.jpg';

const LoginPage = ({ onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student'); // 'student', 'warden', 'worker', 'management'
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [h1, h2, h3, h4, h5, h6, h7, h8];

  // Auto-slideshow timer for hostel photos (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(fadeTimer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', { role, email });
    alert(`Success! Logging in as ${role.toUpperCase()}: ${email}`);
  };

  return (
    <div className="login-page-container" style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.6s ease-out' }}>
      
      {/* LEFT PANEL: Only Hostel Photos Slideshow */}
      <div className="login-visual-panel">
        <div className="login-slider">
          {slides.map((image, index) => (
            <div
              key={index}
              className={`login-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img src={image} alt={`Hostel View ${index + 1}`} className="login-slide-img" />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Form Panel */}
      <div className="login-form-panel">
        {/* Floating Back to Website Button */}
        <button
          onClick={onBackToHome}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid rgba(15, 61, 122, 0.12)',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.2s ease',
            zIndex: 20,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: 'rotate(180deg)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Back to Website
        </button>

        {/* Login Card (Mimics third screenshot exactly) */}
        <div className="login-card">
          {/* Logo Image */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <img 
              src={logo} 
              alt="Campus Care Logo" 
              style={{ width: '64px', height: '64px', objectFit: 'contain' }} 
            />
          </div>
          <h2 className="login-title" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
            <RotatingText
              texts={['Campus Care', 'Student Hub', 'Warden Console', 'Staff Portal']}
              mainClassName="login-rotating-text"
              staggerFrom="last"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2500}
              splitBy="characters"
              auto
              loop
            />
          </h2>
          <p className="login-subtitle">Sign in to continue to Campus Care</p>

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {/* Email field */}
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="login-input"
              />
            </div>

            {/* Password field */}
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="login-input"
              />
              <span className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </span>
            </div>

            {/* Checkbox and Forgot Password link */}
            <div className="login-options">
              <label className="remember-me-label">
                <input type="checkbox" style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                Remember me
              </label>
              <a href="#forgot" className="forgot-password-link">
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button type="submit" className="signin-btn">
              <span>Sign In</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Divider */}
            <div className="login-divider">OR</div>

            {/* Role Select Header */}
            <div className="role-section-title">Login as</div>

            {/* Role Select Grid */}
            <div className="role-grid">
              {/* Student button */}
              <button
                type="button"
                className={`role-card-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                <svg className="role-card-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479L12 21l-6.825-3.943a12.084 12.084 0 01.665-6.48l6.16 3.423z" />
                </svg>
                <span className="role-card-label">Student</span>
              </button>

              {/* Warden button */}
              <button
                type="button"
                className={`role-card-btn ${role === 'warden' ? 'active' : ''}`}
                onClick={() => setRole('warden')}
              >
                <svg className="role-card-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="role-card-label">Warden</span>
              </button>

              {/* Staff / Worker button */}
              <button
                type="button"
                className={`role-card-btn ${role === 'worker' ? 'active' : ''}`}
                onClick={() => setRole('worker')}
              >
                <svg className="role-card-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="role-card-label">Worker</span>
              </button>

              {/* Management button */}
              <button
                type="button"
                className={`role-card-btn ${role === 'management' ? 'active' : ''}`}
                onClick={() => setRole('management')}
              >
                <svg className="role-card-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="role-card-label">Management</span>
              </button>
            </div>

            {/* Bottom Signup */}
            <div className="signup-helper" style={{ textAlign: 'center' }}>
              Don't have an account?{' '}
              <a href="#signup" className="signup-link">
                Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
};

export default LoginPage;
