import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vinpro.app',
  appName: 'VinPro',
  // ✅ FIX: CRA uses 'build', Vite uses 'dist'
  webDir: 'build', 

  server: {
    // 🔌 LIVE RELOAD: Physical phone connects to your PC IP
    url: "http://192.168.0.73:3000", 
    cleartext: true, 
    
    // ✅ Keep as http to match your dev server protocol
    androidScheme: 'http', 
    
    allowNavigation: [
      '192.168.0.73:5000',
      '192.168.0.73:3000',
      'http://192.168.0.73/*', 
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
    // ✅ Crucial for loading vehicle photos from http://192.168.0.73:5000/uploads
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#020617"
  },

  plugins: {
    Keyboard: {
      resize: 'body', 
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
      backgroundColor: "#020617",
      showSpinner: true,
      spinnerColor: "#2563eb",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;