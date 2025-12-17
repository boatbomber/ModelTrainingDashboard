import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import { gaussianSmooth, getSmoothedDataLimits } from '../../utils/dataProcessor';
import { getBaseChartOptions, createDataset, getEnhancedTooltipCallbacks } from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function GradientNormChart() {
  const { trainingData, trainingMetadata, smoothingLevel } = useDashboard();
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    if (!trainingData?.log_history) return null;

    const gradData = trainingData.log_history.filter(
      (entry) => entry.grad_norm !== undefined
    );
    if (gradData.length === 0) return null;

    const rawGradNorms = gradData.map((entry) => entry.grad_norm);
    const smoothedGradNorms = gaussianSmooth(rawGradNorms, smoothingLevel);
    const labels = gradData.map((entry) => entry.step);

    return {
      labels,
      rawGradNorms,
      smoothedGradNorms,
    };
  }, [trainingData, smoothingLevel]);

  const options = useMemo(() => {
    if (!chartData) return null;

    const opts = getBaseChartOptions();
    opts.scales.y.title = {
      display: true,
      text: 'GRADIENT NORM',
      color: 'rgba(255, 255, 255, 0.8)',
    };

    const yLimits = getSmoothedDataLimits(
      chartData.rawGradNorms,
      chartData.smoothedGradNorms
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
      createDataset(
        'Gradient Norm',
        chartData.smoothedGradNorms,
        [255, 0, 128],
        true
      ),
      createDataset(
        'Gradient Norm (Raw)',
        chartData.rawGradNorms,
        [255, 0, 128],
        false
      ),
    ],
  };

  // Prepare table data for accessibility
  const tableData = chartData.labels.map((step, index) => ({
    step,
    value: chartData.smoothedGradNorms[index],
  }));

  return (
    <ChartContainer
      title="Gradient Magnitude"
      chartRef={chartRef}
      exportFilename="gradient-norm.png"
      tableData={tableData}
      dataDescription="gradient norm over training steps"
    >
      <Line ref={chartRef} data={data} options={options} />
    </ChartContainer>
  );
}
