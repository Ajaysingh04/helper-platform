import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LocationContext } from "../context/LocationContext";
import "../css/Search.css";

const popularTags = ["Electrician", "Plumber", "House Cleaner", "AC Repair", "Painter", "Chef"];

function Search() {
  const { location, fetchLocation, setManualLocation } = useContext(LocationContext);
  const [locInput, setLocInput] = useState("");
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Sync input with context when location is fetched
  useEffect(() => {
    if (location && isAnalyzing) {
      setLocInput(location.address || `${location.lat?.toFixed(3) || ""}, ${location.lng?.toFixed(3) || ""}`);
      setIsAnalyzing(false);
    }
  }, [location, isAnalyzing]);

  const handleLocationClick = () => {
    if (!locInput || locInput.includes("Analyzing")) {
      setIsAnalyzing(true);
      setLocInput("Detecting location...");
      fetchLocation();
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (locInput.trim() && !locInput.includes("Detecting") && (!location || locInput !== (location.address || ""))) {
      setManualLocation(locInput);
    }
    
    if (query.trim()) {
      // Navigate to category or search results
      const sanitized = query.toLowerCase().trim().replace(/\s+/g, "-");
      navigate(`/category/${sanitized}`);
    }
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    const sanitized = tag.toLowerCase().trim().replace(/\s+/g, "-");
    navigate(`/category/${sanitized}`);
  };

  return (
    <div className={`header-search-container ${isFocused ? "focused-state" : ""}`}>
      <form className="search-box" onSubmit={handleSearch}>
        
        {/* Location Section */}
        <div className="input-wrapper location-input-wrapper" title="Click to auto-detect location">
          <span className={`search-icon ${isAnalyzing ? "pulse-pin" : ""}`}>📍</span>
          <input
            type="text"
            placeholder="Your Location..."
            className="search-input location-text"
            value={locInput}
            onClick={handleLocationClick}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onChange={(e) => setLocInput(e.target.value)}
          />
          {locInput && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={() => setLocInput("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="search-divider"></div>

        {/* Service Input Section */}
        <div className="input-wrapper service-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search electrician, plumber, chef..."
            className="search-input"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={() => setQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Submit Action Button */}
        <button type="submit" className="search-submit-btn" aria-label="Search">
          <span className="search-btn-text">Search</span>
          <span className="search-btn-icon">⚡</span>
        </button>
      </form>

      {/* Live dropdown with popular search tags when focused */}
      {isFocused && (
        <div className="search-dropdown-suggestions animate-fade-up">
          <div className="suggestions-header">
            <span>🔥 Popular Searches</span>
          </div>
          <div className="popular-tags-list">
            {popularTags.map((tag, idx) => (
              <button
                type="button"
                key={idx}
                className="search-tag-chip"
                onMouseDown={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;