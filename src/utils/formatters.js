/**
 * Format a value based on the metric type
 * @param {number} value - The value to format
 * @param {string} metricType - The type of metric (from dataset label)
 * @returns {string} - Formatted value
 */
export function formatValue(value, metricType) {
  if (metricType.includes('Loss')) {
    return value.toFixed(4);
  }
  if (metricType.includes('Learning Rate')) {
    return value.toExponential(2);
  }
  if (metricType.includes('Reward')) {
    return value.toFixed(3);
  }
  if (metricType.includes('Length')) {
    return Math.round(value).toLocaleString();
  }
  if (metricType.includes('KL')) {
    return value.toFixed(4);
  }
  if (metricType.includes('Gradient')) {
    return value.toFixed(4);
  }
  return value.toPrecision(4);
}

/**
 * Calculate training progress as a percentage
 * @param {number} step - The current step
 * @param {number|null} totalSteps - Total steps in training
 * @returns {string|null} - Progress percentage or null
 */
export function calculateProgress(step, totalSteps) {
  if (!totalSteps || totalSteps <= 0) return null;
  return ((step / totalSteps) * 100).toFixed(1);
}

/**
 * Calculate percentage change from previous value
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {string} - Formatted change percentage
 */
export function calculateChange(current, previous) {
  if (previous === 0) return 'N/A';
  const change = ((current - previous) / Math.abs(previous) * 100).toFixed(2);
  return `${change > 0 ? '+' : ''}${change}%`;
}
