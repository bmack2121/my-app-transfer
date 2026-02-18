import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vinpro.app',
  appName: 'VinPro',
  webDir: 'build', // Ensure this matches your Vite/React output folder (often 'dist' or 'build')

  server: {
    // Live Reload Config
    url: "http://192.168.0.73:3000",
    cleartext: true,
    androidScheme: 'https',
    // hostname: 'localhost' // Keeping this default is safest for Biometrics
  },

  android: {
    buildOptions: {
      releaseType: 'AAB',
    },
    // Required for Android 16 (Capacitor 8) to handle edge-to-edge correctly
    allowMixedContent: true,
    captureInput: true,
  },

  plugins: {
    // ✅ Updated: @aparajita/capacitor-biometric-auth (v9.0.0+)
    BiometricAuth: {
      androidBiometryDescription: "Please authenticate to log in to VinPro.",
      androidBiometryTitle: "Biometric Login",
      androidBiometrySubTitle: "Log in using your fingerprint or face",
      androidBiometryConfirmationRequired: false,
    },

    // ✅ Capacitor 8 Shift: SystemBars no longer manages margins. 
    // You must use env(safe-area-inset-top) in your CSS.
    SystemBars: {
      style: 'DARK',
    },

    // ✅ Note: @capacitor-mlkit/barcode-scanning does NOT use config here.
    // Formats are passed directly into the .scan() or .startScan() call in your TS code.

    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      showSpinner: true,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;