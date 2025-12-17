import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import {
  gaussianSmooth,
  getSmoothedDataLimits,
  hasRewardData,
} from '../../utils/dataProcessor';
import {
  getBaseChartOptions,
  createDataset,
  createEnvelopeDatasets,
} from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function RewardChart() {
  const { trainingData, smoothingLevel } = useDashboard();
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

    return {
      labels,
      rawRewards,
      smoothedRewards,
      upperBound,
      lowerBound,
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

    opts.plugins.tooltip.callbacks = {
      label: (context) => {
        const label = context.dataset.label || '';
        if (label.includes('Upper') || label.includes('Lower')) return null;
        return `${label}: ${context.parsed.y.toFixed(4)}`;
      },
      filter: (tooltipItem) => {
        const label = tooltipItem.dataset.label || '';
        return !label.includes('Upper') && !label.includes('Lower');
      },
    };

    return opts;
  }, [chartData]);

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

  // Prepare table data for accessibility
  const tableData = chartData.labels.map((step, index) => ({
    step,
    value: chartData.smoothedRewards[index],
  }));

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
