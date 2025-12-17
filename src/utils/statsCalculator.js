import { extractRewardFunctions, getRewardDisplayName } from './dataProcessor';

/**
 * Calculate basic statistics for an array
 */
function calculateStats(arr) {
  if (arr.length === 0) return null;

  const sorted = [...arr].sort((a, b) => a - b);
  const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
  const variance =
    arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    stdDev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)],
    p25: sorted[Math.floor(sorted.length * 0.25)],
    p75: sorted[Math.floor(sorted.length * 0.75)],
  };
}

/**
 * Calculate improvement percentage between start and end of training
 */
function calculateImprovement(arr) {
  if (arr.length < 2) return null;
  const windowSize = Math.min(500, Math.floor(arr.length * 0.05));
  if (windowSize < 1) return null;

  const start =
    arr.slice(0, windowSize).reduce((sum, val) => sum + val, 0) / windowSize;
  const end =
    arr.slice(-windowSize).reduce((sum, val) => sum + val, 0) / windowSize;

  if (Math.abs(start) < 1e-8) return null;
  return ((end - start) / Math.abs(start)) * 100;
}

/**
 * Calculate advanced statistics from training data
 */
export function calculateAdvancedStats(data) {
  if (!data.log_history || data.log_history.length === 0) return {};

  const logHistory = data.log_history;
  const lossData = logHistory
    .filter((entry) => entry.loss !== undefined)
    .map((entry) => entry.loss);
  const rewardData = logHistory
    .filter((entry) => entry.reward !== undefined)
    .map((entry) => entry.reward);
  const gradData = logHistory
    .filter((entry) => entry.grad_norm !== undefined)
    .map((entry) => entry.grad_norm);

  return {
    loss: calculateStats(lossData),
    reward: calculateStats(rewardData),
    gradNorm: calculateStats(gradData),
    lossImprovement: calculateImprovement(lossData),
    rewardImprovement: calculateImprovement(rewardData),
  };
}

/**
 * Generate training insights based on data analysis
 */
export function generateTrainingInsights(data, advancedStats) {
  const insights = [];

  // Training progress assessment
  if (
    advancedStats.lossImprovement !== null &&
    isFinite(advancedStats.lossImprovement)
  ) {
    const lossChange = advancedStats.lossImprovement;
    if (lossChange < -10) {
      insights.push({
        type: 'success',
        message: `Excellent loss reduction (${Math.abs(lossChange).toFixed(1)}%) - Model is learning effectively.`,
      });
    } else if (lossChange < -2) {
      insights.push({
        type: 'good',
        message: `Good loss reduction (${Math.abs(lossChange).toFixed(1)}%) - Training is progressing well.`,
      });
    } else if (lossChange < 2) {
      insights.push({
        type: 'warning',
        message: 'Loss is relatively stable - Consider adjusting learning rate or checking for convergence.',
      });
    } else {
      insights.push({
        type: 'error',
        message: `Loss is increasing (${lossChange.toFixed(1)}%) - May indicate learning rate too high or training instability.`,
      });
    }
  }

  // Gradient norm assessment
  if (advancedStats.gradNorm && data.log_history) {
    const currentGradNorm =
      data.log_history[data.log_history.length - 1]?.grad_norm;
    if (currentGradNorm) {
      if (currentGradNorm > 10) {
        insights.push({
          type: 'error',
          message: `High gradient norm (${currentGradNorm.toFixed(2)}) - Consider gradient clipping to stabilize training.`,
        });
      } else if (currentGradNorm < 0.001) {
        insights.push({
          type: 'warning',
          message: `Very low gradient norm (${currentGradNorm.toFixed(4)}) - May indicate vanishing gradients or convergence.`,
        });
      } else {
        insights.push({
          type: 'success',
          message: `Healthy gradient norm (${currentGradNorm.toFixed(3)}) - Gradients are in good range for stable learning.`,
        });
      }
    }
  }

  // Reward improvement assessment
  if (
    advancedStats.rewardImprovement !== null &&
    isFinite(advancedStats.rewardImprovement)
  ) {
    const rewardChange = advancedStats.rewardImprovement;
    if (rewardChange > 10) {
      insights.push({
        type: 'success',
        message: `Excellent reward improvement (${rewardChange.toFixed(1)}%) - Model performance is increasing significantly.`,
      });
    } else if (rewardChange > 2) {
      insights.push({
        type: 'good',
        message: `Good reward improvement (${rewardChange.toFixed(1)}%) - Model is improving steadily.`,
      });
    } else if (rewardChange > -2) {
      insights.push({
        type: 'warning',
        message: 'Reward is relatively stable - Model may be reaching plateau.',
      });
    }
  }

  // Training stability assessment
  if (
    advancedStats.loss &&
    advancedStats.loss.stdDev &&
    data.log_history.length > 20
  ) {
    const cv = advancedStats.loss.stdDev / Math.abs(advancedStats.loss.mean);
    if (cv < 0.05) {
      insights.push({
        type: 'success',
        message: 'Very stable training - Consistent loss reduction with low variance.',
      });
    } else if (cv > 0.3) {
      insights.push({
        type: 'warning',
        message: `Training shows some instability - Loss variance is ${(cv * 100).toFixed(1)}%. Consider learning rate scheduling.`,
      });
    }
  }

  // Training duration insight - only warn if dataset is small
  if (data.log_history && data.log_history.length > 0 && data.log_history.length <= 1000) {
    insights.push({
      type: 'info',
      message: `Training log contains ${data.log_history.length.toLocaleString()} data points - Consider longer training for better insights.`,
    });
  }

  return insights;
}

/**
 * Calculate statistics for display cards
 */
export function calculateDisplayStats(data) {
  if (!data.log_history || data.log_history.length === 0) return [];

  const logHistory = data.log_history;
  const advancedStats = calculateAdvancedStats(data);
  const stats = [];

  // Loss Change
  if (
    advancedStats.lossImprovement !== null &&
    isFinite(advancedStats.lossImprovement)
  ) {
    stats.push({
      label: 'Loss Change',
      value: advancedStats.lossImprovement,
      isPositiveGood: false,
    });
  }

  // Reward Change
  if (
    advancedStats.rewardImprovement !== null &&
    isFinite(advancedStats.rewardImprovement)
  ) {
    stats.push({
      label: 'Reward Change',
      value: advancedStats.rewardImprovement,
      isPositiveGood: true,
    });
  }

  // Grad Norm Change
  if (advancedStats.gradNorm) {
    const gradNormData = logHistory
      .filter((entry) => entry.grad_norm !== undefined)
      .map((entry) => entry.grad_norm);

    if (gradNormData.length > 10) {
      const improvement = calculateImprovement(gradNormData);
      if (improvement !== null) {
        stats.push({
          label: 'Grad Norm Change',
          value: improvement,
          isNeutral: true,
        });
      }
    }
  }

  // KL Change
  const klData = logHistory
    .filter((entry) => entry.kl !== undefined)
    .map((entry) => entry.kl);

  if (klData.length > 10) {
    const improvement = calculateImprovement(klData);
    if (improvement !== null) {
      stats.push({
        label: 'KL Change',
        value: improvement,
        isNeutral: true,
      });
    }
  }

  // Individual reward function changes
  const rewardKeys = extractRewardFunctions(logHistory);
  rewardKeys.forEach((rewardKey) => {
    const rewardName = getRewardDisplayName(rewardKey);
    const rewardData = logHistory
      .filter((entry) => entry[rewardKey] !== undefined)
      .map((entry) => entry[rewardKey]);

    if (rewardData.length > 10) {
      const improvement = calculateImprovement(rewardData);
      if (improvement !== null) {
        stats.push({
          label: `${rewardName} Change`,
          value: improvement,
          isPositiveGood: true,
        });
      }
    }
  });

  return stats;
}
