// src/pages/SplashScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/CC.png';
import RotatingText from '../components/RotatingText';
import '../styles/SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Particle mesh animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Calculate number of particles based on screen size
    const particleCount = Math.min(50, Math.floor((width * height) / 30000));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35, // Slow, premium floating speeds
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1, // Subtle, small sizes
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections (mesh wires)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Only connect nearby particles
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Dynamic opacity based on distance
            const alpha = 0.12 * (1 - dist / 130);
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Bounce back from boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Timer to initiate fade-out and then final navigation
  useEffect(() => {
    // Wait 3 seconds of active display
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3000);

    // Let the 800ms CSS transition complete before switching routes
    const completionTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-container ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Background canvas for mesh/particles */}
      <canvas ref={canvasRef} className="particles-canvas" />

      {/* Main Content */}
      <div className="splash-content">
        <div className="logo-container">
          <div className="logo-glow"></div>
          <img src={logo} alt="Campus Care Logo" className="logo-img" />
        </div>

        <div className="text-group">
          <h1 className="title-text">
            <RotatingText
              texts={['Campus Care', 'Hostel Portal', 'Operations Platform']}
              mainClassName="text-rotate"
              staggerFrom="last"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
              splitBy="characters"
              auto
              loop
            />
          </h1>
          <p className="subtitle-text">
            Intelligent Hostel Operations &amp; Maintenance Platform
          </p>
        </div>

        <div className="loader-container">
          <div className="loader-spinner"></div>
          <span className="loading-text">Initializing Campus Care...</span>
        </div>
      </div>

    </div>
  );
};

export default SplashScreen;
