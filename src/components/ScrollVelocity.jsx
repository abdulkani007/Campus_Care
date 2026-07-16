// src/components/ScrollVelocity.jsx
import React, { useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from 'motion/react';
import './ScrollVelocity.css';

export const ScrollVelocity = ({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 8,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName = 'parallax',
  scrollerClassName = 'scroller',
  parallaxStyle,
  scrollerStyle
}) => {
  function VelocityText({
    children,
    baseVelocity = velocity,
    scrollContainerRef,
    className = '',
    damping,
    stiffness,
    numCopies,
    velocityMapping,
    parallaxClassName,
    scrollerClassName,
    parallaxStyle,
    scrollerStyle
  }) {
    const baseX = useMotionValue(0);
    const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
    const { scrollY } = useScroll(scrollOptions);
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: damping ?? 50,
      stiffness: stiffness ?? 400
    });
    const velocityFactor = useTransform(
      smoothVelocity,
      velocityMapping?.input || [0, 1000],
      velocityMapping?.output || [0, 5],
      { clamp: false }
    );

    const containerRef = useRef(null);
    const copyRef = useRef(null);
    const copyWidthRef = useRef(0);
    const containerWidthRef = useRef(0);
    const lastT = useRef(0);

    function wrap(min, max, v) {
      const range = max - min;
      if (range === 0) return min;
      const mod = (((v - min) % range) + range) % range;
      return mod + min;
    }

    const x = useTransform(baseX, v => {
      const width = copyWidthRef.current;
      const containerWidth = containerWidthRef.current || window.innerWidth;
      if (width === 0) return '0px';
      
      // If we only have 1 copy (News Ticker mode), wrap from -width (off-screen left) to containerWidth (off-screen right)
      if (numCopies === 1) {
        return `${wrap(-width, containerWidth, v)}px`;
      }
      
      // Otherwise, default infinite tiling wrap
      return `${wrap(-width, 0, v)}px`;
    });

    const directionFactor = useRef(1);
    
    useAnimationFrame((t, delta) => {
      // Direct high-performance measure inside the animation loop
      if (copyRef.current && copyRef.current.offsetWidth > 0) {
        copyWidthRef.current = copyRef.current.offsetWidth;
      }
      if (containerRef.current) {
        containerWidthRef.current = containerRef.current.offsetWidth;
      }

      // Safeguard: Calculate delta manually if it is undefined or NaN in this Framer Motion version
      let actualDelta = delta;
      if (actualDelta === undefined || isNaN(actualDelta)) {
        if (lastT.current !== 0) {
          actualDelta = t - lastT.current;
        } else {
          actualDelta = 16.67; // Fallback for 60fps first frame
        }
      }
      lastT.current = t;

      // Further guard against zero/negative jumps
      if (actualDelta <= 0 || isNaN(actualDelta)) {
        actualDelta = 16.67;
      }

      let moveBy = directionFactor.current * baseVelocity * (actualDelta / 1000);

      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get();
      
      const currentX = baseX.get();
      if (!isNaN(currentX) && !isNaN(moveBy)) {
        baseX.set(currentX + moveBy);
      } else {
        baseX.set(0);
      }
    });

    const spans = [];
    for (let i = 0; i < numCopies; i++) {
      spans.push(
        <span className={className} key={i} ref={i === 0 ? copyRef : null}>
          {children}&nbsp;&nbsp;&nbsp;&nbsp;
        </span>
      );
    }

    return (
      <div className={parallaxClassName} style={parallaxStyle} ref={containerRef}>
        <motion.div className={scrollerClassName} style={{ x, ...scrollerStyle }}>
          {spans}
        </motion.div>
      </div>
    );
  }

  return (
    <section className="scroll-velocity-section">
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {text}
        </VelocityText>
      ))}
    </section>
  );
};

export default ScrollVelocity;
