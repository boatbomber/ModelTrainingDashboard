const STORAGE_KEYS = {
  SMOOTHING_LEVEL: 'mtd_smoothing_level',
};

export function getSavedSmoothingLevel() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SMOOTHING_LEVEL);
    return saved !== null ? Number(saved) : 0.3; // Default 30% (0.3 in 0-1 range)
  } catch (error) {
    console.warn('Failed to read smoothing level from localStorage:', error);
    return 0.3;
  }
}

export function saveSmoothingLevel(level) {
  try {
    localStorage.setItem(STORAGE_KEYS.SMOOTHING_LEVEL, String(level));
  } catch (error) {
    console.warn('Failed to save smoothing level to localStorage:', error);
  }
}
