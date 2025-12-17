import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import {
  gaussianSmooth,
  getSmoothedDataLimits,
  hasRewardData,
  decimateDatasets,
} from '../../utils/dataProcessor';
import {
  getBaseChartOptions,
  createDataset,
  createEnvelopeDatasets,
  getEnhancedTooltipCallbacks,
} from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function RewardChart() {
  const { trainingData, trainingMetadata, smoothingLevel } = useDashboard();
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    if (!trainingData?.log_history) return null;
    if (!hasRewardData(trainingData.log_history)) return null;

    const rewardData = trainingData.log_history.filter(
      (entry) => entry.reward !== undefined
    );
    if (rewardData.length === 0) return null;

    const rawRewards = rewardData.map((entry) => entry.reward);
    const rawStds = rewardData.map((entry) => entry.reward_std || 0);
    const smoothedRewards = gaussianSmooth(rawRewards, smoothingLevel);
    const smoothedStds = gaussianSmooth(rawStds, smoothingLevel);

    const upperBound = smoothedRewards.map((val, i) => val + smoothedStds[i]);
    const lowerBound = smoothedRewards.map((val, i) => val - smoothedStds[i]);
    const labels = rewardData.map((entry) => entry.step);

    // Build full-resolution table data using non-decimated series
    const tableColumns = ['Overall Reward'];
    const tableRows = labels.map((step, index) => ({
      step,
      values: {
        'Overall Reward': rawRewards[index],
      },
    }));

    // Apply decimation to reduce rendering load (use raw data as reference so it doesn't change with smoothing)
    const { datasets: decimated, labels: decimatedLabels } = decimateDatasets(
      { raw: rawRewards, smoothed: smoothedRewards, upper: upperBound, lower: lowerBound },
      labels,
      'raw'
    );

    return {
      labels: decimatedLabels,
      rawRewards: decimated.raw,
      smoothedRewards: decimated.smoothed,
      upperBound: decimated.upper,
      lowerBound: decimated.lower,
      tableColumns,
      tableRows,
    };
  }, [trainingData, smoothingLevel]);

  const options = useMemo(() => {
    if (!chartData) return null;

    const opts = getBaseChartOptions();
    opts.scales.y.title = {
      display: true,
      text: 'REWARD',
      color: 'rgba(255, 255, 255, 0.8)',
    };

    const allSmoothedData = [
      ...chartData.smoothedRewards,
      ...chartData.upperBound,
      ...chartData.lowerBound,
    ];
    const yLimits = getSmoothedDataLimits(chartData.rawRewards, allSmoothedData);
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

  const envelopeDatasets = createEnvelopeDatasets(
    chartData.upperBound,
    chartData.lowerBound,
    [0, 255, 128]
  );

  const data = {
    labels: chartData.labels,
    datasets: [
      ...envelopeDatasets,
      createDataset('Overall Reward', chartData.smoothedRewards, [0, 255, 128], true),
      createDataset('Overall Reward (Raw)', chartData.rawRewards, [0, 255, 128], false),
    ],
  };

  // Prepare table data for accessibility (uses raw, non-decimated series)
  const tableData = {
    columns: chartData.tableColumns,
    rows: chartData.tableRows,
  };

  return (
    <ChartContainer
      title="Overall Reward"
      chartRef={chartRef}
      exportFilename="overall-reward.png"
      tableData={tableData}
      dataDescription="overall reward over time with standard deviation"
    >
      <Line ref={chartRef} data={data} options={options} />
    </ChartContainer>
  );
}
