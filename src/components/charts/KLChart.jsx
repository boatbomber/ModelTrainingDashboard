import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import {
  gaussianSmooth,
  getSmoothedDataLimits,
  hasKLData,
} from '../../utils/dataProcessor';
import { getBaseChartOptions, createDataset } from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function KLChart() {
  const { trainingData, smoothingLevel } = useDashboard();
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

    return {
      labels,
      rawKLs,
      smoothedKLs,
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

    opts.plugins.tooltip.callbacks = {
      label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`,
    };

    return opts;
  }, [chartData]);

  if (!chartData) return null;

  const data = {
    labels: chartData.labels,
    datasets: [
      createDataset('KL Divergence', chartData.smoothedKLs, [255, 165, 0], true),
      createDataset('KL Divergence (Raw)', chartData.rawKLs, [255, 165, 0], false),
    ],
  };

  return (
    <ChartContainer
      title="KL Divergence"
      chartRef={chartRef}
      exportFilename="kl-divergence.png"
    >
      <Line ref={chartRef} data={data} options={options} />
    </ChartContainer>
  );
}
