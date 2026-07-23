// =============================================================================
// src/hooks/useRazorpay.js
// =============================================================================
// Dynamically loads the Razorpay checkout script from their CDN.
// Returns a boolean indicating whether the script is ready.
// =============================================================================

import { useState, useEffect } from "react";

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if already loaded
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload  = () => setIsLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay script");
    document.body.appendChild(script);

    return () => {
      // Don't remove the script on unmount — keep it loaded for the session
    };
  }, []);

  return isLoaded;
};