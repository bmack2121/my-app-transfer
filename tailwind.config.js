/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // High-performance primary palette
        midnight: "#0A0F1F",
        electric: "#1E90FF",
        carbon: "#111111",
        performance: "#FF3B30",
        softgray: "#F5F7FA",

        // ✅ Dealership Pro Surfaces (Refined for 2026 contrast)
        app: {
          bg: "#05060A",
          surface: "#10121A",
          surfaceSoft: "#171925",
          border: "#262938",
          accent: "#3B82F6",
          accentSoft: "#1D4ED8",
          success: "#22C55E",
          warning: "#FACC15",
          danger: "#EF4444",
        },

        // ✅ Calendar & Scheduling overrides
        calendar: {
          text: "#FFFFFF",
          bg: "#10121A",
          today: "#3B82F6",
          selected: "#1D4ED8",
        },
      },

      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },

      boxShadow: {
        glow: "0 0 15px rgba(59, 130, 246, 0.4)",
        card: "0 4px 20px rgba(0, 0, 0, 0.3)",
        pro: "0 22px 60px -12px rgba(0, 0, 0, 0.7)",
        // Subtle inner glow for inputs
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },

      backgroundImage: {
        "hero-gradient": "linear-gradient(to bottom right, #0A0F1F, #111111)",
        "pro-metal": "linear-gradient(145deg, #10121A 0%, #1A1C27 100%)",
        "accent-gradient": "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
        "scanner-gradient": "linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.2), transparent)",
      },

      borderRadius: {
        card: "14px",
        xl2: "1.25rem",
        vin: "2rem",
      },

      // ✅ Enhanced Scanner Animation for various device heights
      keyframes: {
        scan: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        }
      },
      animation: {
        "scan-line": "scan 2.5s linear infinite",
        "pulse-slow": "pulseSlow 3s ease-in-out infinite",
      },
      
      // ✅ Essential for Capacitor 8 "Edge-to-Edge" support
      spacing: {
        'safe-top': 'var(--safe-area-top)',
        'safe-bottom': 'var(--safe-area-bottom)',
        'safe-left': 'var(--safe-area-left)',
        'safe-right': 'var(--safe-area-right)',
      }
    },
  },
  plugins: [
    // Adds utilities like .pt-safe and .pb-safe
    function ({ addUtilities }) {
      addUtilities({
        '.pt-safe': {
          paddingTop: 'var(--safe-area-top)',
        },
        '.pb-safe': {
          paddingBottom: 'var(--safe-area-bottom)',
        },
        '.pl-safe': {
          paddingLeft: 'var(--safe-area-left)',
        },
        '.pr-safe': {
          paddingRight: 'var(--safe-area-right)',
        },
        '.mt-safe': {
          marginTop: 'var(--safe-area-top)',
        },
        '.mb-safe': {
          marginBottom: 'var(--safe-area-bottom)',
        },
      });
    },
  ],
};