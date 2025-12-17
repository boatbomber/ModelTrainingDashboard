/**
 * Data processing utilities for training metrics
 */

const DECIMATION_THRESHOLD = 1000;

/**
 * Largest-Triangle-Three-Buckets (LTTB) decimation algorithm
 * Reduces data points while preserving visual shape
 * @param {number[]} data - Array of y values
 * @param {number[]} labels - Array of x values (step numbers)
 * @param {number} threshold - Target number of points
 * @returns {{ data: number[], labels: number[] }} Decimated data and labels
 */
export function decimateLTTB(data, labels, threshold = DECIMATION_THRESHOLD) {
  if (!data || data.length <= threshold) {
    return { data, labels };
  }

  const dataLength = data.length;
  const sampledData = [];
  const sampledLabels = [];

  // Always keep the first point
  sampledData.push(data[0]);
  sampledLabels.push(labels[0]);

  // Bucket size (excluding first and last points)
  const bucketSize = (dataLength - 2) / (threshold - 2);

  let prevSelectedIndex = 0;

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate bucket boundaries
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const bucketEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, dataLength - 1);

    // Calculate average point of next bucket for triangle area calculation
    const nextBucketStart = bucketEnd;
    const nextBucketEnd = Math.min(Math.floor((i + 3) * bucketSize) + 1, dataLength);

    let avgX = 0;
    let avgY = 0;
    let avgCount = 0;

    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      if (data[j] !== null && data[j] !== undefined && isFinite(data[j])) {
        avgX += labels[j];
        avgY += data[j];
        avgCount++;
      }
    }

    if (avgCount > 0) {
      avgX /= avgCount;
      avgY /= avgCount;
    } else {
      // Fallback to last point if next bucket is empty
      avgX = labels[dataLength - 1];
      avgY = data[dataLength - 1];
    }

    // Find point in current bucket with largest triangle area
    let maxArea = -1;
    let selectedIndex = bucketStart;

    const prevX = labels[prevSelectedIndex];
    const prevY = data[prevSelectedIndex];

    for (let j = bucketStart; j < bucketEnd; j++) {
      const currY = data[j];
      if (currY === null || currY === undefined || !isFinite(currY)) {
        continue;
      }

      const currX = labels[j];

      // Calculate triangle area using cross product
      const area = Math.abs(
        (prevX - avgX) * (currY - prevY) -
        (prevX - currX) * (avgY - prevY)
      );

      if (area > maxArea) {
        maxArea = area;
        selectedIndex = j;
      }
    }

    sampledData.push(data[selectedIndex]);
    sampledLabels.push(labels[selectedIndex]);
    prevSelectedIndex = selectedIndex;
  }

  // Always keep the last point
  sampledData.push(data[dataLength - 1]);
  sampledLabels.push(labels[dataLength - 1]);

  return { data: sampledData, labels: sampledLabels };
}

/**
 * Decimate multiple data arrays with the same labels
 * Useful for charts with raw + smoothed + envelope data
 * @param {Object} datasets - Object with named data arrays
 * @param {number[]} labels - Array of x values (step numbers)
 * @param {string} primaryKey - Key of the primary dataset to use for decimation selection
 * @param {number} threshold - Target number of points
 * @returns {{ datasets: Object, labels: number[] }} Decimated datasets and labels
 */
export function decimateDatasets(datasets, labels, primaryKey, threshold = DECIMATION_THRESHOLD) {
  if (!labels || labels.length <= threshold) {
    return { datasets, labels };
  }

  // Use primary dataset (usually smoothed) to determine which points to keep
  const primaryData = datasets[primaryKey];
  if (!primaryData) {
    return { datasets, labels };
  }

  // Get indices to keep using LTTB on primary dataset
  const { labels: sampledLabels } = decimateLTTB(primaryData, labels, threshold);
  const labelSet = new Set(sampledLabels);

  // Build index map for efficient lookup
  const indicesToKeep = [];
  for (let i = 0; i < labels.length; i++) {
    if (labelSet.has(labels[i])) {
      indicesToKeep.push(i);
    }
  }

  // Apply same indices to all datasets
  const decimatedDatasets = {};
  for (const key in datasets) {
    decimatedDatasets[key] = indicesToKeep.map(i => datasets[key][i]);
  }

  return { datasets: decimatedDatasets, labels: sampledLabels };
}

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
