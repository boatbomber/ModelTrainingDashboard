import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import { getBaseChartOptions, createDataset } from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function LearningRateChart() {
  const { trainingData } = useDashboard();
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    if (!trainingData?.log_history) return null;

    const lrData = trainingData.log_history.filter(
      (entry) => entry.learning_rate !== undefined
    );
    if (lrData.length === 0) return null;

    const learningRates = lrData.map((entry) => entry.learning_rate);
    const labels = lrData.map((entry) => entry.step);

    return {
      labels,
      learningRates,
    };
  }, [trainingData]);

  const options = useMemo(() => {
    if (!chartData) return null;

    const opts = getBaseChartOptions();
    opts.scales.y.title = {
      display: true,
      text: 'LEARNING RATE',
      color: 'rgba(255, 255, 255, 0.8)',
    };
    opts.scales.y.type = 'logarithmic';
    opts.scales.y.ticks = {
      color: 'rgba(255, 255, 255, 0.7)',
      callback: function (value) {
        if (value === 0) return '0';
        if (value < 0.0001) return value.toExponential(0);
        if (value >= 0.01) return value.toFixed(2);
        if (value >= 0.001) return value.toFixed(3);
        return value.toFixed(4);
      },
      maxTicksLimit: 8,
      autoSkip: true,
      autoSkipPadding: 10,
    };

    opts.plugins.tooltip.callbacks = {
      label: (context) => {
        const value = context.parsed.y;
        if (value === 0) return 'LR: 0';
        if (value >= 0.01) return `LR: ${value.toFixed(4)}`;
        if (value >= 0.0001) return `LR: ${value.toFixed(6)}`;
        return `LR: ${value.toExponential(2)}`;
      },
    };

    return opts;
  }, [chartData]);

  if (!chartData) return null;

  const data = {
    labels: chartData.labels,
    datasets: [
      createDataset('Learning Rate', chartData.learningRates, [255, 200, 0], true),
    ],
  };

  return (
    <ChartContainer
      title="Learning Rate Schedule"
      chartRef={chartRef}
      exportFilename="learning-rate.png"
    >
      <Line ref={chartRef} data={data} options={options} />
    </ChartContainer>
  );
}
