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
  Filler
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
