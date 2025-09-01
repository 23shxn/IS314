import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/LandingPage.css"; // keep your existing stylesheet

const SLIDE_INTERVAL_MS = 5000; // auto-advance every 5s
const TRANSITION_MS = 800;      // fade duration

export default function HeroSlideshow({
  images = [],
  overlay = true,
  heading,
  subheading,
  ctaText,
  onCtaClick,
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);

  // Auto-advance
  useEffect(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % safeImages.length);
    }, SLIDE_INTERVAL_MS);
    return stopTimer;
  }, [safeImages.length]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const goTo = (i) => {
    stopTimer();
    setIndex(((i % safeImages.length) + safeImages.length) % safeImages.length);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  if (!safeImages.length) return null;

  return (
    <section className="hero">
      {/* Slides */}
      <div className="hero__slides" aria-live="polite">
        {safeImages.map((src, i) => (
          <img
            key={src + i}
            src={src}
            className={`hero__slide ${i === index ? "is-active" : ""}`}
            alt=""
            role="presentation"
            draggable="false"
          />
        ))}
        {overlay && <div className="hero__overlay" />}
      </div>

      {/* Content */}
      {(heading || subheading || ctaText) && (
        <div className="hero__content">
          {heading && <h1 className="hero__title">{heading}</h1>}
          {subheading && <p className="hero__subtitle">{subheading}</p>}
          {ctaText && (
            <button className="hero__cta" onClick={onCtaClick}>
              {ctaText}
            </button>
          )}
        </div>
      )}

      {/* Controls */}
      <button className="hero__nav hero__nav--prev" onClick={prev} aria-label="Previous slide">‹</button>
      <button className="hero__nav hero__nav--next" onClick={next} aria-label="Next slide">›</button>

      {/* Dots */}
      <div className="hero__dots" role="tablist" aria-label="Slide dots">
        {safeImages.map((_, i) => (
          <button
            key={i}
            className={`hero__dot ${i === index ? "is-active" : ""}`}
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
