import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vinpro.app',
  appName: 'VinPro',
  // ✅ VITE USES 'dist' BY DEFAULT. If your build folder is 'build', keep it.
  // But standard React/Vite projects usually output to 'dist'.
  webDir: 'dist', 

  server: {
    // ⚠️ CAUTION: Remove the 'url' line before you do a final build for the App Store.
    // Ensure this matches your Mac's current IP if you are testing on the Mac.
    url: "http://192.168.0.73:3000", 
    cleartext: true,
    androidScheme: 'https',
    // ✅ Allow external navigation so bank portals can load
    allowNavigation: [
      '*.chase.com',
      '*.wellsfargo.com',
      '*.bankofamerica.com',
      'https://github.com/*'
    ]
  },

  android: {
    buildOptions: {
      releaseType: 'AAB',
    },
    allowMixedContent: true,
    captureInput: true,
  },

  plugins: {
    BiometricAuth: {
      androidBiometryDescription: "Please authenticate to log in to VinPro.",
      androidBiometryTitle: "Biometric Login",
      androidBiometrySubTitle: "Log in using your fingerprint or face",
      androidBiometryConfirmationRequired: false,
    },

    // ✅ Capacitor 8/Android 16 compatibility
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      showSpinner: true,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;