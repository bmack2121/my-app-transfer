import { useEffect, useState } from "react";

/**
 * useDarkMode Hook
 * Handles theme persistence and system-level synchronization for VinPro.
 */
export const useDarkMode = () => {
  // 1. Initial State Logic: Priority is LocalStorage > System Preference
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true; // Default to dark for VinPro brand
    
    const stored = window.localStorage.getItem("theme");
    if (stored) return stored === "dark";

    // Fallback to phone's system setting (iOS/Android)
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Apply classes to HTML tag for Tailwind "dark:" selector
    if (isDark) {
      root.classList.add("dark");
      // Required for Capacitor 8 to match the native background behind the webview
      root.style.backgroundColor = "#05060A"; 
      window.localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.backgroundColor = "#F5F7FA";
      window.localStorage.setItem("theme", "light");
    }

    // 2. Listen for System Theme Changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      // Only auto-switch if the user hasn't manually set a preference in this session
      const userPreference = window.localStorage.getItem("theme");
      if (!userPreference) {
        setIsDark(e.matches);
      }
    };

    // Modern listener syntax for 2026 browsers
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);

  return { isDark, setIsDark, toggleDark };
};