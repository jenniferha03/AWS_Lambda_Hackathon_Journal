/**
 * Demo tools (seed content, auto-fill profile) on production.
 * Set VITE_DEMO_UID to the same UID as Lambda DEMO_UID when using custom-token demo (often no user.email).
 */
export function isDemoUserAccount(user) {
  if (!user?.uid) return false;
  const demoEmail = String(import.meta.env.VITE_DEMO_EMAIL || "demo@empathyjournal.app").toLowerCase();
  const demoUid = String(import.meta.env.VITE_DEMO_UID || "").trim();
  const email = String(user.email || "").toLowerCase();
  if (demoUid && user.uid === demoUid) return true;
  if (email && email === demoEmail) return true;
  return false;
}
