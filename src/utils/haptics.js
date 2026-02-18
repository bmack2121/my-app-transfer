import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const canHaptic = () => Capacitor.isNativePlatform();

// --- Core Impact Styles ---

export const hapticImpactLight = async () => {
  if (!canHaptic()) return;
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
};

export const hapticImpactMedium = async () => {
  if (!canHaptic()) return;
  try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
};

export const hapticImpactHeavy = async () => {
  if (!canHaptic()) return;
  try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) {}
};

// --- Notification Styles ---

export const hapticSuccess = async () => {
  if (!canHaptic()) return;
  try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {}
};

export const hapticWarning = async () => {
  if (!canHaptic()) return;
  try { await Haptics.notification({ type: NotificationType.Warning }); } catch (e) {}
};

export const hapticError = async () => {
  if (!canHaptic()) return;
  try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) {}
};

/* -----------------------------------------------------------
 * 🔗 ALIASES: Fixing the "Not Found" errors in existing pages
 * --------------------------------------------------------- */
export const hapticLight = hapticImpactLight;
export const hapticMedium = hapticImpactMedium;
export const hapticHeavy = hapticImpactHeavy;
export const hapticImpact = hapticImpactMedium;