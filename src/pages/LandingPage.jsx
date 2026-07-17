// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import RotatingText from '../components/RotatingText';
import ScrollVelocity from '../components/ScrollVelocity';
import SpecularButton from '../components/SpecularButton';
import Shuffle from '../components/Shuffle';
import BlurText from '../components/BlurText';
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
    { icon: '⚡', title: 'Electrical Faults', desc: 'Report short circuits, non-functional fans, tube lights, or power outlet issues.' },
    { icon: '🔧', title: 'Plumbing Issues', desc: 'Submit requests for leaking taps, broken pipes, clogged drains, or flush issues.' },
    { icon: '💧', title: 'Water Supply', desc: 'Raise alerts for drinking water shortages, hot water issues, or water tank cleaning.' },
    { icon: '🍽️', title: 'Mess & Food', desc: 'Send feedback regarding food quality, hygiene standards, or dietary requirements.' },
    { icon: '📶', title: 'Internet & Wi-Fi', desc: 'Report slow bandwidth, router connection failures, or LAN port damages.' },
    { icon: '🚪', title: 'Room Damages', desc: 'Request repairs for cupboard locks, window panes, door hinges, or study desks.' },
    { icon: '🧹', title: 'Cleaning Requests', desc: 'Schedule corridor, washroom, or room cleaning with the housekeeping staff.' },
    { icon: '🔍', title: 'Lost & Found', desc: 'Post notices for misplaced belongings or claim items recovered on campus.' },
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
        <ScrollVelocity
          texts={[
            <span key={0}>
              <strong style={{ color: '#f8b400', fontWeight: '700' }}>Campus Care</strong> digitizes the hostel complaint management lifecycle
              <span style={{ margin: '0 2.5rem', color: '#f8b400', opacity: 0.8 }}>★</span>
              Empowering students, wardens, and maintenance teams with <strong style={{ color: '#38bdf8', fontWeight: '700' }}>real-time status tracking</strong>, auto-duplicate groupings, and seamless communication
              <span style={{ margin: '0 2.5rem', color: '#f8b400', opacity: 0.8 }}>★</span>
            </span>
          ]}
          velocity={60}
          className="custom-scroll-text"
          numCopies={1}
        />
      </div>

      {/* Stats Bar */}
      <section ref={statsRef} className="stats-bar">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">Resolution Rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">&lt; 3 Hrs</span>
            <span className="stat-label">Avg Repair Time</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.7 / 5</span>
            <span className="stat-label">Student Feedback</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">65%</span>
            <span className="stat-label">Manual Effort Saved</span>
          </div>
        </div>
      </section>

      {/* Complaint Types Grid Section */}
      <section ref={featuresRef} className="section-container">
        <div className="section-header">
          <span className="section-label">Categorized Operations</span>
          <h3 className="section-title">Support &amp; Maintenance Scope</h3>
        </div>

        <div className="features-grid">
          {features.map((feat, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">{feat.icon}</div>
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
    </div>
  );
};

export default LandingPage;
