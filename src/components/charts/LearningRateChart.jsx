import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import { decimateLTTB } from '../../utils/dataProcessor';
import { getBaseChartOptions, createDataset, getEnhancedTooltipCallbacks } from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function LearningRateChart() {
  const { trainingData, trainingMetadata } = useDashboard();
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    if (!trainingData?.log_history) return null;

    const lrData = trainingData.log_history.filter(
      (entry) => entry.learning_rate !== undefined
    );
    if (lrData.length === 0) return null;

    const learningRates = lrData.map((entry) => entry.learning_rate);
    const labels = lrData.map((entry) => entry.step);

    // Build full-resolution table data using non-decimated series
    const tableColumns = ['Learning Rate'];
    const tableRows = labels.map((step, index) => ({
      step,
      values: {
        'Learning Rate': learningRates[index],
      },
    }));

    // Apply decimation to reduce rendering load
    const { data: decimatedLRs, labels: decimatedLabels } = decimateLTTB(
      learningRates,
      labels
    );

    return {
      labels: decimatedLabels,
      learningRates: decimatedLRs,
      tableColumns,
      tableRows,
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
    datasets: [
      createDataset('Learning Rate', chartData.learningRates, [255, 200, 0], true),
    ],
  };

  // Prepare table data for accessibility (uses raw, non-decimated series)
  const tableData = {
    columns: chartData.tableColumns,
    rows: chartData.tableRows,
  };

  return (
    <ChartContainer
      title="Learning Rate Schedule"
      chartRef={chartRef}
      exportFilename="learning-rate.png"
      tableData={tableData}
      dataDescription="learning rate over training steps"
    >
      <Line ref={chartRef} data={data} options={options} />
    </ChartContainer>
  );
}
