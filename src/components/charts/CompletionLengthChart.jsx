import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import {
  gaussianSmooth,
  getSmoothedDataLimits,
  hasCompletionLengthData,
  decimateDatasets,
} from '../../utils/dataProcessor';
import {
  getBaseChartOptions,
  createDataset,
  createEnvelopeDatasets,
  getEnhancedTooltipCallbacks,
} from '../../utils/chartConfig';
import ChartContainer from '../ChartContainer';

export default function CompletionLengthChart() {
  const { trainingData, trainingMetadata, smoothingLevel } = useDashboard();
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    if (!trainingData?.log_history) return null;
    if (!hasCompletionLengthData(trainingData.log_history)) return null;

    const completionData = trainingData.log_history.filter(
      (entry) => entry['completions/mean_length'] !== undefined
    );
    if (completionData.length === 0) return null;

    const rawLengths = completionData.map(
      (entry) => entry['completions/mean_length']
    );
    const rawMaxLengths = completionData.map(
      (entry) =>
        entry['completions/max_length'] || entry['completions/mean_length']
    );
    const rawMinLengths = completionData.map(
      (entry) =>
        entry['completions/min_length'] || entry['completions/mean_length']
    );

    const smoothedLengths = gaussianSmooth(rawLengths, smoothingLevel);
    const smoothedMaxLengths = gaussianSmooth(rawMaxLengths, smoothingLevel);
    const smoothedMinLengths = gaussianSmooth(rawMinLengths, smoothingLevel);

    const labels = completionData.map((entry) => entry.step);

    // Apply decimation to reduce rendering load (use raw data as reference so it doesn't change with smoothing)
    const { datasets: decimated, labels: decimatedLabels } = decimateDatasets(
      { raw: rawLengths, smoothed: smoothedLengths, max: smoothedMaxLengths, min: smoothedMinLengths },
      labels,
      'raw'
    );

    return {
      labels: decimatedLabels,
      rawLengths: decimated.raw,
      smoothedLengths: decimated.smoothed,
      smoothedMaxLengths: decimated.max,
      smoothedMinLengths: decimated.min,
    };
  }, [trainingData, smoothingLevel]);

  const options = useMemo(() => {
    if (!chartData) return null;

    const opts = getBaseChartOptions();
    opts.scales.y.title = {
      display: true,
      text: 'COMPLETION LENGTH',
      color: 'rgba(255, 255, 255, 0.8)',
    };

    const allSmoothedData = [
      ...chartData.smoothedLengths,
      ...chartData.smoothedMaxLengths,
      ...chartData.smoothedMinLengths,
    ];
    const yLimits = getSmoothedDataLimits(chartData.rawLengths, allSmoothedData);
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
    chartData.smoothedMaxLengths,
    chartData.smoothedMinLengths,
    [153, 102, 255]
  );

  const data = {
    labels: chartData.labels,
    datasets: [
      ...envelopeDatasets,
      createDataset(
        'Completion Length',
        chartData.smoothedLengths,
        [153, 102, 255],
        true
      ),
      createDataset(
        'Completion Length (Raw)',
        chartData.rawLengths,
        [153, 102, 255],
        false
      ),
    ],
  };

  // Prepare table data for accessibility
  const tableData = chartData.labels.map((step, index) => ({
    step,
    value: chartData.smoothedLengths[index],
  }));

  return (
    <ChartContainer
      title="Completion Length"
      chartRef={chartRef}
      exportFilename="completion-length.png"
      tableData={tableData}
      dataDescription="completion length over time with min/max range"
    >
      <Line ref={chartRef} data={data} options={options} />
    </ChartContainer>
  );
}
