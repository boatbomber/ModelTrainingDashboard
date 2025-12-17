import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import {
  gaussianSmooth,
  getSmoothedDataLimits,
  hasKLData,
  decimateDatasets,
} from '../../utils/dataProcessor';
import { getBaseChartOptions, createDataset, getEnhancedTooltipCallbacks } from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function KLChart() {
  const { trainingData, trainingMetadata, smoothingLevel } = useDashboard();
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    if (!trainingData?.log_history) return null;
    if (!hasKLData(trainingData.log_history)) return null;

    const klData = trainingData.log_history.filter(
      (entry) => entry.kl !== undefined
    );
    if (klData.length === 0) return null;

    const rawKLs = klData.map((entry) => entry.kl);
    const smoothedKLs = gaussianSmooth(rawKLs, smoothingLevel);
    const labels = klData.map((entry) => entry.step);

    // Apply decimation to reduce rendering load (use raw data as reference so it doesn't change with smoothing)
    const { datasets: decimated, labels: decimatedLabels } = decimateDatasets(
      { raw: rawKLs, smoothed: smoothedKLs },
      labels,
      'raw'
    );

    return {
      labels: decimatedLabels,
      rawKLs: decimated.raw,
      smoothedKLs: decimated.smoothed,
    };
  }, [trainingData, smoothingLevel]);

  const options = useMemo(() => {
    if (!chartData) return null;

    const opts = getBaseChartOptions();
    opts.scales.y.title = {
      display: true,
      text: 'KL DIVERGENCE',
      color: 'rgba(255, 255, 255, 0.8)',
    };

    const yLimits = getSmoothedDataLimits(chartData.rawKLs, chartData.smoothedKLs);
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
    datasets: [
      createDataset('KL Divergence', chartData.smoothedKLs, [255, 165, 0], true),
      createDataset('KL Divergence (Raw)', chartData.rawKLs, [255, 165, 0], false),
    ],
  };

  // Prepare table data for accessibility
  const tableData = chartData.labels.map((step, index) => ({
    step,
    value: chartData.smoothedKLs[index],
  }));

  return (
    <ChartContainer
      title="KL Divergence"
      chartRef={chartRef}
      exportFilename="kl-divergence.png"
      tableData={tableData}
      dataDescription="KL divergence over training steps"
    >
      <Line ref={chartRef} data={data} options={options} />
    </ChartContainer>
  );
}
