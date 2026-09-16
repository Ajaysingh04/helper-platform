import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import "../css/Slider.css";

const defaultSlides = [
  {
    tag: "🔥 LIMITED TIME OFFER",
    title: "Get Flat 20% OFF on Your First Service",
    desc: "Experience premier home cleaning, plumbing, repairs & electrical services with 100% verified experts.",
    btnText: "Claim Discount",
    icon: "🎁",
    actionPath: "/category/home-cleaner"
  }
];

function Slider() {
  const dataContext = useContext(DataContext);
  const slides = (dataContext?.slides || defaultSlides).filter(s => s.active !== false);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const current = slides[index];

  return (
    <div 
      className="slider-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="slider-card-modern">
        {/* Ambient Decorative Glows */}
        <div className="slider-ambient-glow"></div>

        <div className="slider-content" key={index}>
          <div className="slider-badge">
            <span className="slider-badge-icon">{current.icon}</span>
            <span>{current.tag}</span>
          </div>

          <h2 className="slider-title">{current.title}</h2>
          <p className="slider-desc">{current.desc}</p>

          <div className="slider-actions">
            <button 
              className="btn-primary-glow" 
              onClick={() => navigate(current.actionPath)}
            >
              <span>{current.btnText}</span>
              <span>→</span>
            </button>
            <button 
              className="btn-secondary-glass"
              onClick={() => navigate("/about")}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          className="slider-nav-arrow prev-arrow" 
          onClick={handlePrev}
          aria-label="Previous Slide"
        >
          ‹
        </button>
        <button 
          className="slider-nav-arrow next-arrow" 
          onClick={handleNext}
          aria-label="Next Slide"
        >
          ›
        </button>

        {/* Modern Dot Indicators with Progress */}
        <div className="slider-dots-container">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`slider-pill-dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
            >
              {i === index && !isPaused && <div className="dot-progress-bar"></div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Slider;
