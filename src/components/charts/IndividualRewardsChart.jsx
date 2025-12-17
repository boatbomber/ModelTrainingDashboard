import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import {
  gaussianSmooth,
  getSmoothedDataLimits,
  extractRewardFunctions,
  getRewardDisplayName,
  hasIndividualRewardData,
  decimateLTTB,
} from '../../utils/dataProcessor';
import {
  getBaseChartOptions,
  createDataset,
  getRewardColor,
  getEnhancedTooltipCallbacks,
} from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function IndividualRewardsChart() {
  const { trainingData, trainingMetadata, smoothingLevel } = useDashboard();
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    if (!trainingData?.log_history) return null;
    if (!hasIndividualRewardData(trainingData.log_history)) return null;

    const logHistory = trainingData.log_history;
    const rewardKeys = extractRewardFunctions(logHistory);
    if (rewardKeys.length === 0) return null;

    const rewardData = logHistory.filter((entry) =>
      rewardKeys.some((key) => entry[key] !== undefined)
    );
    if (rewardData.length === 0) return null;

    const allSmoothedData = [];
    const allRawData = [];
    const datasets = [];

    rewardKeys.forEach((rewardKey, index) => {
      const stdKey = rewardKey.replace('/mean', '/std');
      const rawRewardData = rewardData.map((entry) => entry[rewardKey]);
      const rawStdData = rewardData.map((entry) => entry[stdKey] || 0);
      const smoothedRewardData = gaussianSmooth(rawRewardData, smoothingLevel);
      const smoothedStdData = gaussianSmooth(rawStdData, smoothingLevel);
      const color = getRewardColor(index);
      const [r, g, b] = color;

      const upperBound = smoothedRewardData.map((val, i) =>
        val !== null && val !== undefined ? val + smoothedStdData[i] : null
      );
      const lowerBound = smoothedRewardData.map((val, i) =>
        val !== null && val !== undefined ? val - smoothedStdData[i] : null
      );

      allRawData.push(
        ...rawRewardData.filter((v) => v !== null && v !== undefined && isFinite(v))
      );
      allSmoothedData.push(
        ...smoothedRewardData.filter(
          (v) => v !== null && v !== undefined && isFinite(v)
        ),
        ...upperBound.filter((v) => v !== null && v !== undefined && isFinite(v)),
        ...lowerBound.filter((v) => v !== null && v !== undefined && isFinite(v))
      );

      const displayName = getRewardDisplayName(rewardKey);

      // Envelope datasets
      datasets.push({
        label: `${displayName} Upper`,
        data: upperBound,
        borderColor: 'transparent',
        borderWidth: 0,
        pointRadius: 0,
        fill: '+1',
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
      });
      datasets.push({
        label: `${displayName} Lower`,
        data: lowerBound,
        borderColor: 'transparent',
        borderWidth: 0,
        pointRadius: 0,
        fill: false,
      });

      // Line datasets
      datasets.push(createDataset(displayName, smoothedRewardData, color, true));
      datasets.push(
        createDataset(`${displayName} (Raw)`, rawRewardData, color, false)
      );
    });

    const labels = rewardData.map((entry) => entry.step);

    // Apply decimation using first raw dataset as reference (so it doesn't change with smoothing)
    const firstRawData = datasets.find(
      (ds) => ds.label.includes('Raw')
    )?.data;

    if (!firstRawData || labels.length <= 1000) {
      return {
        labels,
        datasets,
        allRawData,
        allSmoothedData,
      };
    }

    // Get decimated indices
    const { labels: decimatedLabels } = decimateLTTB(firstRawData, labels);
    const labelSet = new Set(decimatedLabels);
    const indicesToKeep = [];
    for (let i = 0; i < labels.length; i++) {
      if (labelSet.has(labels[i])) {
        indicesToKeep.push(i);
      }
    }

    // Apply decimation to all datasets
    const decimatedDatasets = datasets.map((ds) => ({
      ...ds,
      data: indicesToKeep.map((i) => ds.data[i]),
    }));

    return {
      labels: decimatedLabels,
      datasets: decimatedDatasets,
      allRawData,
      allSmoothedData,
    };
  }, [trainingData, smoothingLevel]);

  const options = useMemo(() => {
    if (!chartData) return null;

    const opts = getBaseChartOptions();
    opts.scales.y.title = {
      display: true,
      text: 'INDIVIDUAL REWARD',
      color: 'rgba(255, 255, 255, 0.8)',
    };

    const yLimits = getSmoothedDataLimits(
      chartData.allRawData,
      chartData.allSmoothedData
    );
    if (yLimits.min !== undefined && yLimits.max !== undefined) {
      opts.scales.y.min = yLimits.min;
      opts.scales.y.max = yLimits.max;
    }

    // Use enhanced tooltips
    opts.plugins.tooltip.callbacks = getEnhancedTooltipCallbacks(
      trainingMetadata,
      chartData
    );

    return opts;
  }, [chartData, trainingMetadata]);

  if (!chartData) return null;

  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets,
  };

  // Prepare table data for accessibility - use first smoothed reward dataset
  const firstSmoothedDataset = chartData.datasets.find(
    (ds) => !ds.label.includes('Raw') && !ds.label.includes('Upper') && !ds.label.includes('Lower')
  );
  const tableData = firstSmoothedDataset
    ? chartData.labels.map((step, index) => ({
        step,
        value: firstSmoothedDataset.data[index] ?? 0,
      }))
    : [];

  return (
    <ChartContainer
      title="Individual Reward Functions"
      chartRef={chartRef}
      exportFilename="individual-rewards.png"
      tableData={tableData}
      dataDescription="individual reward functions over time"
    >
      <Line ref={chartRef} data={data} options={options} />
    </ChartContainer>
  );
}
