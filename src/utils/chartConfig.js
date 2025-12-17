import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  formatValue,
  calculateProgress,
  calculateChange,
} from './formatters';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

// Background color plugin for chart exports
const backgroundColorPlugin = {
  id: 'backgroundColor',
  beforeDraw: (chart) => {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  },
};

ChartJS.register(backgroundColorPlugin);

// Set global defaults
ChartJS.defaults.color = 'rgba(255, 255, 255, 0.8)';
ChartJS.defaults.borderColor = 'rgba(0, 255, 255, 0.1)';
ChartJS.defaults.font.family = "'SF Mono', monospace";
ChartJS.defaults.font.size = 12;

/**
 * Get base chart options
 */
export function getBaseChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'STEP',
          color: 'rgba(255, 255, 255, 0.8)',
        },
        grid: { color: 'rgba(0, 255, 255, 0.1)', drawBorder: false },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
      y: {
        display: true,
        grid: { color: 'rgba(0, 255, 255, 0.1)', drawBorder: false },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
    },
    layout: {
      padding: 0,
    },
    plugins: {
      backgroundColor: true,
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { family: "'SF Mono', monospace", size: 11 },
          filter: function (legendItem) {
            return (
              !legendItem.text.includes('Upper') &&
              !legendItem.text.includes('Lower') &&
              !legendItem.text.includes('Raw')
            );
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: 'rgba(0, 255, 255, 0.3)',
        borderWidth: 1,
        titleColor: '#00ffff',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
      },
      zoom: {
        zoom: {
          drag: {
            enabled: true,
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            borderColor: 'rgba(0, 255, 255, 0.5)',
            borderWidth: 1,
          },
          mode: 'x',
          onZoomComplete: ({ chart }) => {
            // Auto-fit Y axis to visible data
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            const xMin = xScale.min;
            const xMax = xScale.max;

            // Store original Y limits on first zoom
            if (chart._originalYMin === undefined) {
              chart._originalYMin = yScale.options.min;
              chart._originalYMax = yScale.options.max;
            }

            let yMin = Infinity;
            let yMax = -Infinity;

            chart.data.datasets.forEach((dataset) => {
              // Skip envelope datasets (upper/lower bounds)
              if (dataset.label?.includes('Upper') || dataset.label?.includes('Lower')) {
                return;
              }

              dataset.data.forEach((point, index) => {
                const x = chart.data.labels[index];
                if (x >= xMin && x <= xMax) {
                  const y = typeof point === 'object' ? point.y : point;
                  if (y !== null && y !== undefined && !isNaN(y)) {
                    yMin = Math.min(yMin, y);
                    yMax = Math.max(yMax, y);
                  }
                }
              });
            });

            if (yMin !== Infinity && yMax !== -Infinity) {
              // Add 5% padding
              const padding = (yMax - yMin) * 0.05;
              yScale.options.min = yMin - padding;
              yScale.options.max = yMax + padding;
              chart.update('none');
            }
          },
        },
        limits: {
          x: { min: 'original', max: 'original' },
        },
      },
    },
  };
}

/**
 * Create enhanced tooltip callbacks with epoch, progress, and change information
 * @param {object} trainingMetadata - Metadata about the training run
 * @param {object} chartData - Chart data containing raw values for change calculation
 * @returns {object} - Tooltip callbacks configuration
 */
export function getEnhancedTooltipCallbacks(trainingMetadata, chartData) {
  const { totalSteps } = trainingMetadata || {};

  return {
    title: (items) => {
      const step = items[0].label;
      return `Step ${Number(step).toLocaleString()}`;
    },
    beforeBody: (items) => {
      const step = Number(items[0].label);
      const lines = [];

      // Add epoch information if available
      if (totalSteps > 0) {
        // Show progress even without epoch info
        const progress = calculateProgress(step, totalSteps);
        if (progress !== null) {
          lines.push(`${progress}% complete`);
        }
      }

      return lines.length > 0 ? lines : null;
    },
    label: (item) => {
      const value = item.parsed.y;
      const label = item.dataset.label || '';

      // Skip upper/lower bounds in tooltips
      if (label.includes('Upper') || label.includes('Lower')) {
        return null;
      }

      const formatted = formatValue(value, label);
      return `${label}: ${formatted}`;
    },
    afterBody: (items) => {
      const lines = [];

      // Show change for smoothed data only (not raw)
      for (const item of items) {
        const label = item.dataset.label || '';

        // Only show change for smoothed (non-raw) data
        if (label.includes('Raw') || label.includes('Upper') || label.includes('Lower')) {
          continue;
        }

        const currentIdx = item.dataIndex;
        if (currentIdx > 0 && item.dataset.data && item.dataset.data.length > currentIdx) {
          const current = item.parsed.y;
          const previousDataPoint = item.dataset.data[currentIdx - 1];
          const previous = typeof previousDataPoint === 'object' ? previousDataPoint.y : previousDataPoint;

          if (previous !== undefined && previous !== null && !isNaN(previous)) {
            const change = calculateChange(current, previous);
            lines.push(`Change: ${change}`);
          }
        }
      }

      return lines.length == 1 ? lines : null;
    },
    filter: (tooltipItem) => {
      // Filter out upper/lower bounds from tooltip
      const label = tooltipItem.dataset.label || '';
      return !label.includes('Upper') && !label.includes('Lower');
    },
  };
}

/**
 * Create a dataset configuration
 */
export function createDataset(label, data, color, isSmoothed = false) {
  const width = isSmoothed ? 2 : 1;
  const [r, g, b] = color;

  return {
    label,
    data,
    borderColor: `rgba(${r}, ${g}, ${b}, ${isSmoothed ? 1 : 0.25})`,
    borderWidth: width,
    pointRadius: 0,
    pointHoverRadius: isSmoothed ? 4 : 3,
    tension: 0,
    fill: false,
  };
}

/**
 * Create envelope dataset for standard deviation fill
 */
export function createEnvelopeDatasets(upperData, lowerData, color) {
  const [r, g, b] = color;

  return [
    {
      label: 'Upper Bound',
      data: upperData,
      borderColor: 'transparent',
      borderWidth: 0,
      pointRadius: 0,
      fill: '+1',
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
    },
    {
      label: 'Lower Bound',
      data: lowerData,
      borderColor: 'transparent',
      borderWidth: 0,
      pointRadius: 0,
      fill: false,
    },
  ];
}

/**
 * Get color for reward function by index
 */
export function getRewardColor(index) {
  const colors = [
    [255, 99, 132],
    [54, 162, 235],
    [255, 206, 86],
    [75, 192, 192],
    [153, 102, 255],
    [255, 159, 64],
    [199, 199, 199],
    [83, 102, 255],
    [255, 99, 255],
    [99, 255, 132],
  ];
  return colors[index % colors.length];
}

/**
 * Reset chart zoom including Y-axis limits
 */
export function resetChartZoom(chartRef) {
  if (!chartRef.current) return;

  const chart = chartRef.current;

  // Reset X zoom
  chart.resetZoom();

  // Restore original Y limits if they were stored
  if (chart._originalYMin !== undefined || chart._originalYMax !== undefined) {
    const yScale = chart.scales.y;
    yScale.options.min = chart._originalYMin;
    yScale.options.max = chart._originalYMax;
    delete chart._originalYMin;
    delete chart._originalYMax;
    chart.update('none');
  }
}

/**
 * Export chart as PNG
 */
export function exportChartAsPNG(chartRef, filename) {
  if (!chartRef.current) {
    console.error('Chart reference not found');
    return;
  }

  try {
    const dataURL = chartRef.current.toBase64Image('image/png', 1.0);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export chart. Please try again.');
  }
}
