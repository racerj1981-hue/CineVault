// Application Settings & Local Storage Utility

export const DEFAULT_SETTINGS = {
  defaultPlaybackMode: 'direct',
  cinemaLightsDefault: false,
};

export function getStoredSettings() {
  try {
    const raw = localStorage.getItem('unblocked_movies_settings');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(newSettings) {
  try {
    localStorage.setItem('unblocked_movies_settings', JSON.stringify(newSettings));
  } catch {
    // ignore
  }
}
