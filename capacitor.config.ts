import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vinpro.app',
  appName: 'VinPro',
  // ✅ FIX: Ensure this matches your local folder. CRA uses 'build', Vite uses 'dist'
  webDir: 'build', 

  server: {
    // 🔌 LIVE RELOAD: Your physical iPhone connects to your Mac/PC IP
    url: "http://192.168.0.73:3000", 
    cleartext: true, 
    
    // ✅ Match your dev server protocol for both platforms
    androidScheme: 'http',
    iosScheme: 'http', 
    
    allowNavigation: [
      '192.168.0.73', // Base IP
      '192.168.0.73:*', // All ports on that IP (3000, 5000, etc)
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
    // ✅ Crucial for loading vehicle photos/API data from local IP
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#020617"
  },

  ios: {
    // ✅ Required for Capacitor 8 / SPM to handle local networking correctly
    contentInset: 'always',
    backgroundColor: "#020617"
  },

  plugins: {
    // ✅ Added BarcodeScanner config to ensure the bridge initializes properly
    BarcodeScanner: {
      installGoogleBarcodeScannerModule: true,
    },

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