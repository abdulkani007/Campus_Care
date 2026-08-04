// src/pages/LoginPage.jsx
import React, { useEffect, useState } from 'react';
import RotatingText from '../components/RotatingText';
import SpecularButton from '../components/SpecularButton';
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
import g1 from '../assets/g1.jpg';

const LoginPage = ({ onBackToHome, onBackToWebsite, onLoginSuccess }) => {
  const handleBackNavigation = onBackToHome || onBackToWebsite;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student'); // 'student', 'warden', 'worker', 'management'
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Signup states
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [block, setBlock] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hostelType, setHostelType] = useState('');

  const trimmedEmail = email.trim().toLowerCase();
  const isEmailValid = role === 'student' ? trimmedEmail.endsWith('@sece.ac.in') : true;
  const showEmailStatus = role === 'student' && email.length > 0;

  const slides = [h1, h2, h3, h4, h5, h6, h7, h8, g1];

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

  const [signupBlocks, setSignupBlocks] = useState([]);

  useEffect(() => {
    if (!hostelType) {
      setSignupBlocks([]);
      return;
    }
    const fetchSignupBlocks = async () => {
      try {
        const res = await fetch(`/api/blocks?hostelType=${encodeURIComponent(hostelType)}`);
        if (res.ok) {
          const data = await res.json();
          setSignupBlocks(data.map(b => b.blockName));
        }
      } catch (err) {
        console.error('Error fetching signup blocks:', err);
      }
    };
    fetchSignupBlocks();
  }, [hostelType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cleanEmail = email.trim().toLowerCase();
    const isEmailValid = role === 'student' ? cleanEmail.endsWith('@sece.ac.in') : true;

    if (role === 'student' && !isEmailValid) {
      if (isSignupMode) {
        alert("Please register using your official college email (@sece.ac.in).");
      } else {
        alert("Only official Sri Eshwar College email addresses (@sece.ac.in) are allowed.");
      }
      return;
    }
    
    if (isSignupMode) {
      if (role !== 'student') {
        alert("Registration is restricted to Students only. Warden and Management accounts are predefined.");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (phoneNo.length < 10) {
        alert("Please enter a valid 10-digit phone number.");
        return;
      }
      if (role === 'student' && !hostelType) {
        alert("Please select your Hostel Type (Boys Hostel or Girls Hostel).");
        return;
      }

      try {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, rollNo, phoneNo, roomNo, block, password, role, hostelType }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("Account created successfully! Please login with your credentials.");
          setIsSignupMode(false);
          setConfirmPassword('');
          setName('');
          setRollNo('');
          setPhoneNo('');
          setRoomNo('');
          setBlock('');
          setHostelType('');
        } else {
          alert(data.error || "Signup failed");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to connect to backend server. Please make sure the server is running.");
      }
    } else {
      // Login flow
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, role }),
        });

        const data = await res.json();

        if (res.ok) {
          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          }
        } else {
          alert(data.error || "Login failed");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to connect to backend server. Please make sure the server is running.");
      }
    }
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
          onClick={handleBackNavigation}
          className="back-home-btn"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: 'rotate(180deg)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Back to Website
        </button>

        {/* Login Card */}
        <div 
          className={`login-card ${isSignupMode ? 'signup-card-expanded' : ''}`}
        >
          {/* Logo Image */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <img 
              src={logo} 
              alt="Campus Care Logo" 
              style={{ width: '64px', height: '64px', objectFit: 'contain' }} 
            />
          </div>
          
          {isSignupMode ? (
            <>
              <h2 className="login-title" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
                Create Account
              </h2>
              <p className="login-subtitle">Register to manage campus hostel requests</p>
            </>
          ) : (
            <>
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
                  role="heading"
                />
              </h2>
              <p className="login-subtitle">
                Sign in to continue to {
                  role === 'student' ? 'Student Dashboard' :
                  role === 'management' ? 'Management Panel' :
                  role === 'worker' ? 'Worker Console' : 'Warden Console'
                }
              </p>
            </>
          )}

          {/* TOP ROLE SELECTOR BUTTONS */}
          {!isSignupMode && (
            <div className="top-role-selection-wrapper" style={{ marginBottom: '1.25rem' }}>
              <div className="role-section-title">LOGIN AS</div>
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
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {isSignupMode ? (
              /* Signup fields in responsive grid */
              <div className="signup-grid-layout">
                {/* Hostel Type (Boys/Girls) Selection cards */}
                <div className="hostel-type-selection-wrapper" style={{ gridColumn: 'span 2', marginBottom: '0.5rem' }}>
                  <label className="input-label" style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Hostel Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="hostel-type-segmented-control">
                    <div 
                      className={`hostel-type-segment ${hostelType === 'Boys Hostel' ? 'active' : ''}`}
                      onClick={() => { setHostelType('Boys Hostel'); setBlock(''); }}
                    >
                      <svg className="hostel-segment-icon" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479L12 21l-6.825-3.943a12.084 12.084 0 01.665-6.48l6.16 3.423z" />
                      </svg>
                      <span>Boys Hostel</span>
                    </div>
                    <div 
                      className={`hostel-type-segment ${hostelType === 'Girls Hostel' ? 'active' : ''}`}
                      onClick={() => { setHostelType('Girls Hostel'); setBlock(''); }}
                    >
                      <svg className="hostel-segment-icon" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span>Girls Hostel</span>
                    </div>
                    <div className={`hostel-segment-indicator ${hostelType === 'Boys Hostel' ? 'left' : hostelType === 'Girls Hostel' ? 'right' : 'hidden'}`} />
                  </div>
                </div>
                {/* Name */}
                <div className="input-wrapper" style={{ marginBottom: 0 }}>
                  <span className="input-icon-left" style={{ left: '0.75rem' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="login-input"
                    style={{ paddingLeft: '2.1rem', paddingRight: '0.5rem' }}
                  />
                </div>

                {/* Official Mail id */}
                <div className="input-wrapper" style={{ marginBottom: 0 }}>
                  <span className="input-icon-left" style={{ left: '0.75rem' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abdulkani.b2024it@sece.ac.in"
                    required
                    className={`login-input ${showEmailStatus ? (isEmailValid ? 'valid' : 'invalid') : ''}`}
                    style={{ paddingLeft: '3.2rem', paddingRight: showEmailStatus ? '2.5rem' : '0.5rem' }}
                  />
                  {showEmailStatus && (
                    <span 
                      className="input-icon-right" 
                      style={{ 
                        right: '0.5rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        pointerEvents: 'none' 
                      }}
                    >
                      {isEmailValid ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
                <div style={{ color: showEmailStatus ? (isEmailValid ? '#22c55e' : '#ef4444') : '#64748b', fontSize: '0.72rem', marginTop: '-1rem', marginBottom: '1.25rem', fontWeight: '600', lineHeight: '1.3', textAlign: 'left', gridColumn: 'span 2' }}>
                  {showEmailStatus ? (isEmailValid ? 'Valid college email' : 'Please register using your official college email (@sece.ac.in).') : 'Use your official Sri Eshwar College email.'}
                </div>

                {/* Roll No */}
                <div className="input-wrapper" style={{ marginBottom: 0 }}>
                  <span className="input-icon-left" style={{ left: '0.75rem' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8h2m-2 2h2m2-4h2m-2 2h2" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder={role === 'warden' ? "Employee ID" : role === 'management' ? "Manager ID" : "Roll No"}
                    required
                    className="login-input"
                    style={{ paddingLeft: '3.2rem', paddingRight: '0.5rem' }}
                  />
                </div>

                {/* Phone no */}
                <div className="input-wrapper" style={{ marginBottom: 0 }}>
                  <span className="input-icon-left" style={{ left: '0.75rem' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <input
                    type="tel"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    placeholder="Phone Number"
                    required
                    className="login-input"
                    style={{ paddingLeft: '3.2rem', paddingRight: '0.5rem' }}
                  />
                </div>

                {/* Room No */}
                <div className="input-wrapper" style={{ marginBottom: 0 }}>
                  <span className="input-icon-left" style={{ left: '0.75rem' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder={role === 'warden' || role === 'management' ? "Office Room" : "Room No"}
                    required
                    className="login-input"
                    style={{ paddingLeft: '3.2rem', paddingRight: '0.5rem' }}
                  />
                </div>

                {/* Block */}
                <div className="input-wrapper" style={{ marginBottom: 0 }}>
                  <span className="input-icon-left" style={{ left: '0.75rem' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    required
                    className="login-input"
                    style={{ paddingLeft: '3.2rem', paddingRight: '0.5rem', color: block ? '#1e293b' : '#94a3b8' }}
                  >
                    <option value="" disabled hidden>Hostel Block</option>
                    {signupBlocks.map(b => (
                      <option key={b} value={hostelType === 'Girls Hostel' ? `${b} Block` : b}>
                        {b} Block
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div className="input-wrapper" style={{ marginBottom: 0 }}>
                  <span className="input-icon-left" style={{ left: '0.75rem' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="login-input"
                    style={{ paddingLeft: '3.2rem', paddingRight: '0.5rem' }}
                  />
                </div>

                {/* Confirm Password */}
                <div className="input-wrapper" style={{ marginBottom: 0 }}>
                  <span className="input-icon-left" style={{ left: '0.75rem' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Pass"
                    required
                    className="login-input"
                    style={{ paddingLeft: '3.2rem', paddingRight: '0.5rem' }}
                  />
                </div>
              </div>
            ) : (
              /* Login fields */
              <>
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
                    placeholder={role === 'student' ? 'abdulkani.b2024it@sece.ac.in' : 'Official Mail ID'}
                    required
                    className={`login-input ${showEmailStatus ? (isEmailValid ? 'valid' : 'invalid') : ''}`}
                    style={{ paddingRight: showEmailStatus ? '2.5rem' : '1rem' }}
                  />
                  {showEmailStatus && (
                    <span 
                      className="input-icon-right" 
                      style={{ 
                        right: '1.15rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        pointerEvents: 'none' 
                      }}
                    >
                      {isEmailValid ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
                {role === 'student' && (
                  <div style={{ color: showEmailStatus ? (isEmailValid ? '#22c55e' : '#ef4444') : '#64748b', fontSize: '0.78rem', marginTop: '-1rem', marginBottom: '1.25rem', fontWeight: '600', textAlign: 'left', lineHeight: '1.3' }}>
                    {showEmailStatus ? (isEmailValid ? 'Valid college email' : 'Only official Sri Eshwar College email addresses (@sece.ac.in) are allowed.') : 'Use your official Sri Eshwar College email.'}
                  </div>
                )}

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
              </>
            )}

            {/* Submit Button */}
            <SpecularButton
              type="submit"
              size="lg"
              radius={12}
              tint="#2563eb"
              tintOpacity={1}
              textColor="#ffffff"
              lineColor="#ffffff"
              baseColor="#1d4ed8"
              className="signin-btn"
            >
              <span>{isSignupMode ? 'Sign Up' : 'Sign In'}</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </SpecularButton>

            {/* Bottom Signup Toggle */}
            <div className="signup-helper" style={{ textAlign: 'center', marginTop: '1.75rem' }}>
              {isSignupMode ? (
                <>
                  Already have an account?{' '}
                  <a 
                    href="#login" 
                    className="signup-link"
                    onClick={(e) => { e.preventDefault(); setIsSignupMode(false); }}
                  >
                    Sign In
                  </a>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <a 
                    href="#signup" 
                    className="signup-link"
                    onClick={(e) => { e.preventDefault(); setIsSignupMode(true); }}
                  >
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
};

export default LoginPage;
