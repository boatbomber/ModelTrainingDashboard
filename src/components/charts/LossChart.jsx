import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import { gaussianSmooth, getSmoothedDataLimits } from '../../utils/dataProcessor';
import { getBaseChartOptions, createDataset, getEnhancedTooltipCallbacks } from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function LossChart() {
  const { trainingData, trainingMetadata, smoothingLevel } = useDashboard();
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    if (!trainingData?.log_history) return null;

    const lossData = trainingData.log_history.filter(
      (entry) => entry.loss !== undefined
    );
    if (lossData.length === 0) return null;

    const rawLosses = lossData.map((entry) => entry.loss);
    const smoothedLosses = gaussianSmooth(rawLosses, smoothingLevel);
    const labels = lossData.map((entry) => entry.step);

    return {
      labels,
      rawLosses,
      smoothedLosses,
    };
  }, [trainingData, smoothingLevel]);

  const options = useMemo(() => {
    if (!chartData) return null;

    const opts = getBaseChartOptions();
    opts.scales.y.title = {
      display: true,
      text: 'LOSS',
      color: 'rgba(255, 255, 255, 0.8)',
    };

    const yLimits = getSmoothedDataLimits(
      chartData.rawLosses,
      chartData.smoothedLosses
    );
    if (yLimits.min !== undefined && yLimits.max !== undefined) {
      opts.scales.y.min = 0;
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
    datasets: [
      createDataset('Training Loss', chartData.smoothedLosses, [0, 255, 255], true),
      createDataset('Training Loss (Raw)', chartData.rawLosses, [0, 255, 255], false),
    ],
  };

  // Prepare table data for accessibility
  const tableData = chartData.labels.map((step, index) => ({
    step,
    value: chartData.smoothedLosses[index],
  }));

  return (
    <ChartContainer
      title="Loss Trajectory"
      chartRef={chartRef}
      exportFilename="loss-trajectory.png"
      tableData={tableData}
      dataDescription="training loss over time"
    >
      <Line ref={chartRef} data={data} options={options} />
    </ChartContainer>
  );
}
