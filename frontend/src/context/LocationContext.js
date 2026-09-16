import React, { createContext, useState, useEffect } from "react";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Try to load from localStorage first
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }
  }, []);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(coords);
        localStorage.setItem("userLocation", JSON.stringify(coords));
        setLocationError(null);
      },
      (error) => {
        setLocationError("Unable to retrieve your location");
        console.error("Error getting location", error);
      }
    );
  };

  const setManualLocation = (address) => {
    const manualLoc = { address };
    setLocation(manualLoc);
    localStorage.setItem("userLocation", JSON.stringify(manualLoc));
    setLocationError(null);
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem("userLocation");
  };

  return (
    <LocationContext.Provider value={{ location, fetchLocation, setManualLocation, locationError, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
