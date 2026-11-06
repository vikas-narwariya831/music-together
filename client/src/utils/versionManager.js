/**
 * VersionManager Utility
 * Automatically detects when a new frontend build is deployed and purges all stale
 * localStorage data across all users' browsers to guarantee a fresh, bug-free state.
 */

// Injected by Vite at build time via define in vite.config.js
export const CURRENT_BUILD_VERSION = typeof __APP_BUILD_VERSION__ !== 'undefined'
  ? __APP_BUILD_VERSION__
  : 'build_v2.2.0_init';

export function checkAndPurgeStaleStorage() {
  if (typeof window === 'undefined') return;

  try {
    const savedVersion = localStorage.getItem('musictogether_build_version');

    if (savedVersion !== CURRENT_BUILD_VERSION) {
      console.log(`🧹 [VersionManager] New frontend build detected (${CURRENT_BUILD_VERSION})! Purging old localStorage...`);
      
      // Clear entire local storage cache for all users
      localStorage.clear();

      // Store the new build version key
      localStorage.setItem('musictogether_build_version', CURRENT_BUILD_VERSION);
    }
  } catch (err) {
    console.warn('[VersionManager] LocalStorage error:', err);
  }
}

// Execute immediately when this module is evaluated before App mounts
checkAndPurgeStaleStorage();

export default checkAndPurgeStaleStorage;
