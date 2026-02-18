import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vinpro.app',
  appName: 'VinPro',
  webDir: 'dist', 

  server: {
    // 🔌 LIVE RELOAD: Ensure this matches your dev machine IP
    // Note: Comment out 'url' for production builds!
    url: "http://192.168.0.73:3000", 
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: [
      '*.chase.com',
      '*.wellsfargo.com',
      '*.bankofamerica.com',
      'github.com'
    ]
  },

  android: {
    buildOptions: {
      releaseType: 'AAB',
    },
    allowMixedContent: true,
    captureInput: true,
    // Android 16 Edge-to-Edge support
    backgroundColor: "#020617"
  },

  plugins: {
    Keyboard: {
      resize: 'body', // Important: Pushes the UI up so inputs stay visible
      style: 'dark',
    },

    BiometricAuth: {
      androidBiometryDescription: "Authenticate to access VinPro CRM",
      androidBiometryTitle: "Biometric Login",
      androidBiometrySubTitle: "Fingerprint or Face ID",
      androidBiometryConfirmationRequired: false,
    },

    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#020617", // Matches your Slate-950 theme
      showSpinner: true,
      spinnerColor: "#2563eb",    // VinPro Blue
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;