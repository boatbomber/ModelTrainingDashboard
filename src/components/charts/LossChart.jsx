import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import { gaussianSmooth, getSmoothedDataLimits, decimateDatasets } from '../../utils/dataProcessor';
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

    // Build full-resolution table data using non-decimated series
    const tableColumns = ['Training Loss'];
    const tableRows = labels.map((step, index) => ({
      step,
      values: {
        'Training Loss': rawLosses[index],
      },
    }));

    // Apply decimation to reduce rendering load (use raw data as reference so it doesn't change with smoothing)
    const { datasets: decimated, labels: decimatedLabels } = decimateDatasets(
      { raw: rawLosses, smoothed: smoothedLosses },
      labels,
      'raw'
    );

    return {
      labels: decimatedLabels,
      rawLosses: decimated.raw,
      smoothedLosses: decimated.smoothed,
      tableColumns,
      tableRows,
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

  // Prepare table data for accessibility (uses raw, non-decimated series)
  const tableData = {
    columns: chartData.tableColumns,
    rows: chartData.tableRows,
  };

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
