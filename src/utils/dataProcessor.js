/**
 * Data processing utilities for training metrics
 */

/**
 * Convert smoothing level (0-1) to sigma value for Gaussian smoothing
 */
function getSmoothingSigma(smoothingLevel, dataLength) {
  const minSigma = 0.1;
  const maxSigma = Math.max(3, dataLength / 50);
  return minSigma + (maxSigma - minSigma) * smoothingLevel;
}

/**
 * Generate Gaussian kernel for smoothing
 */
function generateGaussianKernel(sigma) {
  const kernelSize = Math.ceil(sigma * 6) | 1;
  const kernel = new Array(kernelSize);
  const center = Math.floor(kernelSize / 2);
  let sum = 0;

  for (let i = 0; i < kernelSize; i++) {
    const x = i - center;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }

  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum;
  }

  return kernel;
}

/**
 * Apply Gaussian smoothing to data array
 */
export function gaussianSmooth(data, smoothingLevel = 0.5) {
  if (!data || data.length === 0) return [];
  if (data.length === 1) return data.slice();

  const sigma = getSmoothingSigma(smoothingLevel, data.length);
  const kernel = generateGaussianKernel(sigma);
  const kernelRadius = Math.floor(kernel.length / 2);
  const smoothed = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (let j = 0; j < kernel.length; j++) {
      const dataIndex = i - kernelRadius + j;

      if (dataIndex >= 0 && dataIndex < data.length) {
        const value = data[dataIndex];
        if (value !== null && value !== undefined && isFinite(value)) {
          weightedSum += value * kernel[j];
          totalWeight += kernel[j];
        }
      }
    }

    smoothed[i] = totalWeight > 0 ? weightedSum / totalWeight : data[i];
  }

  return smoothed;
}

/**
 * Calculate percentile for outlier handling
 */
export function calculatePercentile(arr, percentile) {
  const sorted = arr.filter((v) => v !== null && v !== undefined);
  if (sorted.length === 0) return 0;

  sorted.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Get Y-axis limits based on smoothed data (ignores raw data outliers)
 */
export function getSmoothedDataLimits(rawData, smoothedData, padding = 0.05) {
  const smoothedValidData = smoothedData.filter(
    (v) => v !== null && v !== undefined && isFinite(v)
  );
  const rawValidData = rawData.filter(
    (v) => v !== null && v !== undefined && isFinite(v)
  );

  if (smoothedValidData.length === 0) return { min: undefined, max: undefined };
  if (rawValidData.length === 0) return { min: undefined, max: undefined };

  const minSmoothed = Math.min(...smoothedValidData);
  const maxSmoothed = Math.max(...smoothedValidData);
  const minRaw = Math.min(...rawValidData);
  const maxRaw = Math.max(...rawValidData);

  // min and max are smoothed lerped 10% towards raw
  const min = minSmoothed + (minRaw - minSmoothed) * 0.1;
  const max = maxSmoothed + (maxRaw - maxSmoothed) * 0.1;
  const range = max - min;
  const paddingAmount = range * padding;

  return {
    min: min - paddingAmount,
    max: max + paddingAmount,
  };
}

/**
 * Extract individual reward function keys from log history
 */
export function extractRewardFunctions(logHistory) {
  const rewardKeys = new Set();
  const sampleSize = Math.min(10, logHistory.length);

  for (let i = 0; i < sampleSize; i++) {
    const entry = logHistory[i];
    if (!entry) continue;

    for (const key in entry) {
      if (key.startsWith('rewards/') && key.endsWith('/mean')) {
        rewardKeys.add(key);
      }
    }
  }

  return Array.from(rewardKeys);
}

/**
 * Get display name for a reward function key
 */
export function getRewardDisplayName(key) {
  const name = key.replace('rewards/', '').replace('/mean', '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Check if log history has specific data types
 */
export function hasRewardData(logHistory) {
  return logHistory.some(
    (entry) => entry.reward !== undefined && entry.reward !== null
  );
}

export function hasIndividualRewardData(logHistory) {
  return extractRewardFunctions(logHistory).length > 0;
}

export function hasCompletionLengthData(logHistory) {
  return logHistory.some(
    (entry) =>
      entry['completions/mean_length'] !== undefined &&
      entry['completions/mean_length'] !== null
  );
}

export function hasKLData(logHistory) {
  return logHistory.some(
    (entry) => entry.kl !== undefined && entry.kl !== null
  );
}
