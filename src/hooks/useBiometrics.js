import { useCallback } from "react";
import { Preferences } from "@capacitor/preferences";
import { BiometricAuth } from "@aparajita/capacitor-biometric-auth";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export const useBiometrics = () => {

  const checkAvailability = useCallback(async () => {
    try {
      // ✅ V9 Change: checkBiometry returns a more detailed object
      const result = await BiometricAuth.checkBiometry();
      return result.isAvailable && result.deviceIsSecure; 
    } catch {
      return false;
    }
  }, []);

  /**
   * Securely saves credentials in the OS-level Keystore/Keychain.
   */
  const enrollBiometrics = useCallback(async (email, password) => {
    try {
      // 1. Authenticate first to verify the user owns the biometric profile
      const auth = await BiometricAuth.authenticate({
        reason: "Confirm identity to enable biometric login",
        cancelTitle: "Cancel",
      });

      // auth returns { result: true } or throws an error if cancelled
      if (auth) {
        // 2. Encrypted storage (Keystore on Android 16 / Keychain on iOS)
        await BiometricAuth.setBiometrySecret({
          secret: JSON.stringify({ email, password }),
          key: "vinpro_secure_creds"
        });

        // 3. Set a simple flag for UI conditional rendering
        await Preferences.set({
          key: "biometrics_enrolled",
          value: "true",
        });

        await Haptics.impact({ style: ImpactStyle.Medium });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Enrollment failed:", err);
      await Haptics.notification({ type: 'error' });
      return false;
    }
  }, []);

  /**
   * Retrieves and decrypts credentials using a biometric challenge.
   */
  const loginWithBiometrics = useCallback(async () => {
    try {
      const isAvailable = await checkAvailability();
      if (!isAvailable) return null;

      // This triggers the native prompt and returns the decrypted string
      const result = await BiometricAuth.getBiometrySecret({
        reason: "Log in to VinPro",
        key: "vinpro_secure_creds"
      });

      if (result.secret) {
        const creds = JSON.parse(result.secret);
        await Haptics.impact({ style: ImpactStyle.Light });
        return creds;
      }

      return null;
    } catch (err) {
      // User likely cancelled or authentication failed
      console.warn("Biometric login aborted:", err);
      return null;
    }
  }, [checkAvailability]);

  return {
    checkAvailability,
    enrollBiometrics,
    loginWithBiometrics,
  };
};