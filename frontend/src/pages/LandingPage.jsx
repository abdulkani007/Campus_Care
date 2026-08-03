// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import RotatingText from '../components/RotatingText';
import SpecularButton from '../components/SpecularButton';
import Shuffle from '../components/Shuffle';
import LogoLoop from '../components/LogoLoop';
import BlurText from '../components/BlurText';
import TextPressure from '../components/TextPressure';
import CountUp from '../components/CountUp';
import '../styles/LandingPage.css';

// Import assets
import logo from '../assets/CC.png';
import h1 from '../assets/h1.jpg';
import h2 from '../assets/h2.jpg';
import h3 from '../assets/h3.jpg';
import h4 from '../assets/h4.jpg';
import h5 from '../assets/h5.jpg';
import h6 from '../assets/h6.jpg';
import h7 from '../assets/h7.jpg';
import h8 from '../assets/h8.jpg';

// Custom Section Heading with Blue + Yellow text and dashes underline
const SectionHeadingBlueYellow = ({ label, titleBlue, titleYellow }) => (
  <div className="custom-two-tone-header">
    {label && <span className="custom-section-label">{label}</span>}
    <h2 className="custom-two-tone-title">
      <span className="title-blue-part">{titleBlue}</span>{' '}
      <span className="title-yellow-part">{titleYellow}</span>
    </h2>
    <div className="custom-yellow-underline">
      <span className="line-dash-long"></span>
      <span className="line-dash-short"></span>
      <span className="line-dash-dot"></span>
    </div>
  </div>
);

const LandingPage = ({ onLoginClick }) => {
  // Slideshow state
  const slides = [h1, h2, h3, h4, h5, h6, h7, h8];
  const [currentSlide, setCurrentSlide] = useState(0);

  // References for navigation scrolling
  const overviewRef = useRef(null);
  const featuresRef = useRef(null);
  const duplicateRef = useRef(null);
  const statsRef = useRef(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top visibility toggle
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollPos > 80) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Slide changing logic - every 1.0 second automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Smooth scroll helper
  const scrollToSection = (ref, tabName) => {
    setActiveTab(tabName);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Features list mapping
  const features = [
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="#eab308" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Electrical Faults',
      desc: 'Report short circuits, non-functional fans, tube lights, or power outlet issues.',
      accent: '#eab308'
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      title: 'Plumbing Issues',
      desc: 'Submit requests for leaking taps, broken pipes, clogged drains, or flush issues.',
      accent: '#2563eb'
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="#38bdf8" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a6 6 0 006-6c0-4-6-11-6-11S6 11 6 15a6 6 0 006 6z" />
        </svg>
      ),
      title: 'Water Supply',
      desc: 'Raise alerts for drinking water shortages, hot water issues, or water tank cleaning.',
      accent: '#38bdf8'
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="#f43f5e" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v7a4 4 0 004 4h1v7h2v-7h1a4 4 0 004-4V3M7 3v4M11 3v4M18 3v18M21 3H18" />
        </svg>
      ),
      title: 'Mess & Food',
      desc: 'Send feedback regarding food quality, hygiene standards, or dietary requirements.',
      accent: '#f43f5e'
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 14a5 5 0 018 0M5 10a9 9 0 0114 0M2 6a13 13 0 0120 0" />
        </svg>
      ),
      title: 'Internet & Wi-Fi',
      desc: 'Report slow bandwidth, router connection failures, or LAN port damages.',
      accent: '#8b5cf6'
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="#f97316" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: 'Room Damages',
      desc: 'Request repairs for cupboard locks, window panes, door hinges, or study desks.',
      accent: '#f97316'
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="#0d9488" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21h2.586l.813-5.096M14.187 15.904L15 21h-2.586l-.813-5.096M3 9h18M5 9V5a2 2 0 012-2h10a2 2 0 012 2v4M4 9v6a3 3 0 003 3h10a3 3 0 003-3V9" />
        </svg>
      ),
      title: 'Cleaning Requests',
      desc: 'Schedule corridor, washroom, or room cleaning with the housekeeping staff.',
      accent: '#0d9488'
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Lost & Found',
      desc: 'Post notices for misplaced belongings or claim items recovered on campus.',
      accent: '#10b981'
    }
  ];

  const tickerItems = [
    { node: <span style={{ fontSize: '1rem', color: '#ffffff', fontFamily: "'Arvo', 'Roboto Slab', serif", fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap' }}><strong style={{ color: '#f8b400' }}>CAMPUS CARE</strong> DIGITIZES THE HOSTEL COMPLAINT MANAGEMENT LIFECYCLE</span> },
    { node: <span style={{ fontSize: '1.1rem', color: '#f8b400', fontWeight: 'bold', padding: '0 0.5rem' }}>★</span> },
    { node: <span style={{ fontSize: '1rem', color: '#ffffff', fontFamily: "'Arvo', 'Roboto Slab', serif", fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>EMPOWERING STUDENTS, WARDENS, AND MAINTENANCE TEAMS WITH <strong style={{ color: '#38bdf8' }}>REAL-TIME STATUS TRACKING</strong>, AUTO-DUPLICATE GROUPINGS, AND SEAMLESS COMMUNICATION</span> },
    { node: <span style={{ fontSize: '1.1rem', color: '#f8b400', fontWeight: 'bold', padding: '0 0.5rem' }}>★</span> }
  ];

  return (
    <div className="landing-container">
      {/* Premium College Header */}
      <header className="landing-header">
        {/* Top White Row */}
        <div className="top-header-row">
          <div className="header-logo-section">
            <img src={logo} alt="Campus Care Logo" className="header-logo-img" />
            <div className="college-brand">
              <h1 className="college-title" style={{ display: 'flex', alignItems: 'center' }}>
                <RotatingText
                  texts={['Campus Care', 'Hostel Portal', 'Operations Platform']}
                  mainClassName="logo-rotating-text"
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
              </h1>
              <span className="college-subtitle">Intelligent Hostel Portal</span>
            </div>
          </div>

          <div className="header-quick-links">
            <a href="#college" className="quick-link-item">COLLEGE HOME</a>
            <a href="#announcements" className="quick-link-item">ANNOUNCEMENTS</a>
            <a href="#helpdesk" className="quick-link-item">HELPDESK</a>
            <div className="campus-code-badge">
              <span>HOSTEL CODE:</span> <strong>SECE-H01</strong>
            </div>
          </div>

          {/* Three-line Menu/Hamburger toggle button on mobile */}
          <button 
            className="mobile-menu-toggle-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Bottom Deep Blue Row */}
        <div className="bottom-header-row">
          <div className="nav-container">
            <ul className="nav-list">
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => scrollToSection(overviewRef, 'overview')}
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'features' ? 'active' : ''}`}
                  onClick={() => scrollToSection(featuresRef, 'features')}
                >
                  Complaint Types
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'duplicate' ? 'active' : ''}`}
                  onClick={() => scrollToSection(duplicateRef, 'duplicate')}
                >
                  Smart Duplicate Detection
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => scrollToSection(statsRef, 'stats')}
                >
                  Hostel Stats
                </button>
              </li>
            </ul>

            <SpecularButton
              size="md"
              radius={8}
              tint="#f8b400"
              tintOpacity={1}
              textColor="#1e293b"
              lineColor="#ffffff"
              baseColor="#e0a300"
              onClick={onLoginClick}
            >
              Portal Login
            </SpecularButton>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer-menu" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="header-logo-section">
                <img src={logo} alt="Campus Care Logo" className="header-logo-img" style={{ height: '32px', marginRight: '0.5rem' }} />
                <div className="college-brand">
                  <h1 className="college-title" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F4FA8' }}>Campus Care</h1>
                  <span className="college-subtitle" style={{ fontSize: '0.65rem', color: '#64748b' }}>Intelligent Hostel Portal</span>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="drawer-content-blue">
              <nav className="drawer-nav">
                <button className="drawer-nav-item" onClick={() => { scrollToSection(overviewRef, 'overview'); setIsMobileMenuOpen(false); }}>
                  OVERVIEW
                </button>
                <button className="drawer-nav-item" onClick={() => { scrollToSection(featuresRef, 'features'); setIsMobileMenuOpen(false); }}>
                  COMPLAINT TYPES
                </button>
                <button className="drawer-nav-item" onClick={() => { scrollToSection(duplicateRef, 'duplicate'); setIsMobileMenuOpen(false); }}>
                  SMART DETECTION
                </button>
                <button className="drawer-nav-item" onClick={() => { scrollToSection(statsRef, 'stats'); setIsMobileMenuOpen(false); }}>
                  HOSTEL STATS
                </button>
                <button className="drawer-nav-item login-nav-item" onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}>
                  PORTAL LOGIN
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with 1s Slideshow */}
      <section ref={overviewRef} className="hero-section">
        <div className="hero-slider">
          {slides.map((image, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img src={image} alt={`Hostel View ${index + 1}`} className="hero-slide-img" />
            </div>
          ))}
        </div>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <span className="hero-badge">AI-Powered Hostel Operations</span>
          <Shuffle
            text="Streamlining Hostel Operations with Intelligence"
            tag="h2"
            className="hero-title"
            shuffleDirection="down"
            duration={0.6}
            animationMode="random"
            maxDelay={0.25}
            shuffleTimes={3}
            ease="power2.out"
            threshold={0.1}
            triggerOnce={true}
            triggerOnHover={true}
          />
          <BlurText
            text="Campus Care digitizes the hostel complaint management lifecycle. Empowering students, wardens, and maintenance teams with real-time status tracking, auto-duplicate groupings, and seamless communication."
            className="hero-desc"
            delay={35}
            animateBy="words"
            direction="bottom"
            threshold={0.15}
            stepDuration={0.45}
          />
          <div className="hero-actions">
            <SpecularButton
              size="lg"
              radius={8}
              tint="#f8b400"
              tintOpacity={1}
              textColor="#1e293b"
              lineColor="#ffffff"
              baseColor="#e0a300"
              onClick={onLoginClick}
              className="primary-hero-btn"
            >
              Access Student Portal ➔
            </SpecularButton>
            <SpecularButton
              size="lg"
              radius={8}
              tint="rgba(255,255,255,0.08)"
              tintOpacity={1}
              textColor="#ffffff"
              lineColor="#ffffff"
              baseColor="rgba(255,255,255,0.2)"
              onClick={() => scrollToSection(featuresRef, 'features')}
              className="secondary-hero-btn"
            >
              Explore Features
            </SpecularButton>
          </div>
        </div>
      </section>

      {/* ScrollVelocity Ticker */}
      <div style={{ 
        background: 'linear-gradient(90deg, #092147 0%, #0f3d7a 50%, #092147 100%)', 
        padding: '0.85rem 0', 
        width: '100%', 
        overflow: 'hidden',
        borderTop: '1px solid rgba(248, 180, 0, 0.15)',
        borderBottom: '1px solid rgba(248, 180, 0, 0.15)',
        position: 'relative',
        zIndex: 5
      }}>
        <LogoLoop
          logos={tickerItems}
          speed={45}
          direction="left"
          logoHeight={32}
          gap={32}
          hoverSpeed={0}
          pauseOnHover={true}
          scaleOnHover={false}
          fadeOut={true}
          fadeOutColor="#092147"
          ariaLabel="Platform ticker loop"
        />
      </div>

      {/* Stats Bar */}
      <section ref={statsRef} className="stats-bar">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">
              <CountUp from={0} to={24} duration={1.2} />/7
            </span>
            <span className="stat-label">Complaint Support</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              <CountUp from={0} to={100} duration={1.5} />%
            </span>
            <span className="stat-label">Digital Complaint Management</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              <CountUp from={0} to={100} duration={1.5} />%
            </span>
            <span className="stat-label" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.0" viewBox="0 0 24 24" style={{ color: '#f8b400' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Paperless Process
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              <CountUp from={0} to={5} duration={1.0} />
            </span>
            <span className="stat-label">Complaint Status</span>
          </div>
        </div>
      </section>

      {/* Complaint Types Grid Section */}
      <section ref={featuresRef} className="section-container">
        <SectionHeadingBlueYellow 
          label="Categorized Operations" 
          titleBlue="SUPPORT &" 
          titleYellow="MAINTENANCE SCOPE" 
        />

        <div className="features-grid">
          {features.map((feat, index) => (
            <div 
              key={index} 
              className="feature-card" 
              style={{ 
                '--feature-accent': feat.accent,
                '--feature-accent-shadow': `${feat.accent}1a`
              }}
            >
              <div 
                className="feature-icon-wrapper"
                style={{
                  backgroundColor: `${feat.accent}12`,
                  color: feat.accent
                }}
              >
                {feat.icon}
              </div>
              <h4 className="feature-title">{feat.title}</h4>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Intelligent Duplicate Complaint Detection Showcase */}
      <section ref={duplicateRef} style={{ backgroundColor: '#ebf2fa', width: '100%' }}>
        <div className="section-container">
          <div className="ai-module-showcase">
            <div className="ai-content">
              <span className="ai-badge">Machine Learning Module</span>
              <h3 className="ai-title">
                Smart <span>Duplicate Complaint</span> Detection
              </h3>
              <p className="ai-desc">
                Students often report the same issue (e.g., a power outage in block corridor, water leakage in a common washroom).
                Our intelligent clustering module detects and groups these related tickets.
              </p>
              <div className="ai-features-list">
                <div className="ai-feature-item">
                  <span className="ai-feature-bullet">✓</span>
                  <div className="ai-feature-text">
                    <strong>Avoids Work Duplication:</strong> Warden assigns one ticket to a worker instead of multiple.
                  </div>
                </div>
                <div className="ai-feature-item">
                  <span className="ai-feature-bullet">✓</span>
                  <div className="ai-feature-text">
                    <strong>Student Group Chat:</strong> Merged issues receive unified updates, allowing all affected students to track resolution progress together.
                  </div>
                </div>
                <div className="ai-feature-item">
                  <span className="ai-feature-bullet">✓</span>
                  <div className="ai-feature-text">
                    <strong>Urgency Boosting:</strong> Frequency of duplicate reports automatically escalates the priority level of the maintenance ticket.
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Dashboard UI Panel */}
            <div className="mock-ui-panel">
              <div className="mock-ui-header">
                <span className="mock-ui-title">Warden Console - ML Cluster #42</span>
                <span className="mock-ui-badge">AI Grouped</span>
              </div>
              <div className="mock-complaints-list">
                <div className="mock-complaint-row">
                  <div>
                    <div className="mock-complaint-desc">"No water supply in Block B, 3rd floor washroom"</div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>By Sanjay (Room 304) • 10 mins ago</span>
                  </div>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Active</span>
                </div>
                <div className="mock-complaint-row">
                  <div>
                    <div className="mock-complaint-desc">"Block B third floor taps are dry"</div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>By Rahul (Room 312) • 8 mins ago</span>
                  </div>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Merged</span>
                </div>
                <div className="mock-complaint-row" style={{ borderLeftColor: '#f8b400' }}>
                  <div>
                    <div className="mock-complaint-desc">"Water supply not working in 3rd floor bathrooms"</div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>By Vignesh (Room 309) • Just now</span>
                  </div>
                  <span style={{ color: '#f8b400', fontWeight: 'bold' }}>Merged</span>
                </div>
              </div>
              <div className="mock-ui-summary">
                <span>Confidence Match: <strong>94%</strong></span>
                <button className="mock-action-btn" onClick={onLoginClick}>
                  Assign Single Plumber
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Workflow Timeline Grid Section */}
      <section style={{ padding: '4rem 0', backgroundColor: '#ffffff', width: '100%', borderBottom: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div className="section-container">
          <SectionHeadingBlueYellow 
            label="Operational Cycle" 
            titleBlue="HOW CAMPUSCARE" 
            titleYellow="WORKS" 
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                num: '1',
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
                title: 'Submit Ticket Request',
                desc: 'Students lodge issues by choosing category, room location, priority, and attaching image proof files directly from their student dashboard.'
              },
              {
                num: '2',
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                ),
                title: 'AI Grouping & Merge',
                desc: 'The smart algorithm automatically detects and groups duplicate complaints across the hostel, preventing technician double-booking.'
              },
              {
                num: '3',
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Warden Review & Approval',
                desc: 'Block wardens review incident details, verify priority urgency, and assign duty orders to specialized campus maintenance workers.'
              },
              {
                num: '4',
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                ),
                title: 'Tech Dispatch Order',
                desc: 'Hostel maintenance workers receive push notifications with location details and room access codes to fix the issue on site.'
              },
              {
                num: '5',
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ),
                title: 'Issue Resolution Mark',
                desc: 'Technicians mark the work order completed and attach resolution photos, notifying both the student and block warden immediately.'
              },
              {
                num: '6',
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
                title: 'Student Rating Campaign',
                desc: 'Students rate the repair quality with gold stars and feedback comments, automatically compiling metrics for management.'
              }
            ].map(step => (
              <div 
                key={step.num}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '1rem', 
                  padding: '1.5rem', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step.icon}
                  </div>
                  <div style={{ backgroundColor: '#2563eb', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
                    {step.num}
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {step.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.55' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc', width: '100%', borderBottom: '1px solid #e2e8f0' }}>
        <div className="section-container" style={{ maxWidth: '800px' }}>
          <SectionHeadingBlueYellow 
            label="FAQ Directory" 
            titleBlue="FREQUENTLY ASKED" 
            titleYellow="QUESTIONS" 
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                q: "How does the duplicate detection help in resolving issues?",
                a: "When multiple students log the same issue (e.g., washroom power outage), CampusCare automatically groups them under a single master ticket. This prevents redundant work assignments for technicians and keeps all affected residents updated in a shared group chat."
              },
              {
                q: "Who handles the maintenance requests and assigns work?",
                a: "The Warden acts as the chief controller of the dashboard. They review the tickets filed by students, coordinate with available technicians (plumbers, electricians, carpenters), and assign tasks directly through the system."
              },
              {
                q: "How does the Warden collect student feedback?",
                a: "The Warden can launch custom feedback campaigns directly from their dashboard. An interactive gold-star feedback form instantly appears on all student panels. Once students submit their ratings, they are compiled into downloadable CSV summaries."
              },
              {
                q: "Can students edit or delete their chat messages?",
                a: "Yes! CampusCare provides WhatsApp-style personal chats. Both students and wardens can send, reply, edit, or delete messages in real-time with automatic unread notifications."
              }
            ].map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'border-color 0.2s' }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    style={{ width: '100%', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', outline: 'none' }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', paddingRight: '1rem', fontFamily: 'inherit' }}>
                      {faq.q}
                    </span>
                    <span style={{ color: '#2563eb', fontSize: '1.25rem', fontWeight: 'bold', transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* College Footers */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h4 className="footer-logo-title">
              Campus <span>Care</span>
            </h4>
            <p className="footer-brand-desc">
              Campus Care digitizes and automates complaint lodging, routing, worker assignments,
              and feedback collections. Operating in premium compliance with college hostel standards.
            </p>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">Portal Roles</h5>
            <ul className="footer-links-list">
              <li>
                <button
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  className="footer-link-anchor"
                  onClick={onLoginClick}
                >
                  Student Hub
                </button>
              </li>
              <li>
                <button
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  className="footer-link-anchor"
                  onClick={onLoginClick}
                >
                  Warden Console
                </button>
              </li>
              <li>
                <button
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  className="footer-link-anchor"
                  onClick={onLoginClick}
                >
                  Maintenance Team Access
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">System Support</h5>
            <ul className="footer-links-list">
              <li><a href="#faq" className="footer-link-anchor">FAQ &amp; Walkthrough</a></li>
              <li><a href="#terms" className="footer-link-anchor">Usage Guidelines</a></li>
              <li><a href="#admin" className="footer-link-anchor">Technical Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} Campus Care. All rights reserved.
          </p>
          <p className="footer-credits">
            Campus Care Operations Platform
          </p>
        </div>
      </footer>

      {/* FLOATING SCROLL TO TOP BUTTON - GUARANTEED ALWAYS VISIBLE */}
      <button
        onClick={scrollToTop}
        className="scroll-to-top-btn"
        aria-label="Scroll to top"
        title="Scroll to Top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#0b1a30">
          <path d="M12 3l-8.5 8.5h5.5v9.5h6v-9.5h5.5z" />
        </svg>
      </button>
    </div>
  );
};

export default LandingPage;
