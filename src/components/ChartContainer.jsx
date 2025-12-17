import { useCallback } from 'react';
import { exportChartAsPNG } from '../utils/chartConfig';

export default function ChartContainer({
  title,
  chartRef,
  exportFilename,
  children,
  tableData,
  dataDescription = 'chart data',
}) {
  const handleExport = useCallback(() => {
    exportChartAsPNG(chartRef, exportFilename);
  }, [chartRef, exportFilename]);

  return (
    <div className="relative overflow-hidden rounded-sm bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-6 mb-5 shadow-cyber">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent" />

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-cyber-primary text-xl font-light uppercase tracking-wider opacity-90">
          {title}
        </h2>
        <button
          onClick={handleExport}
          aria-label={`Export ${title} as PNG image`}
          title="Export chart as PNG"
          className="bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary px-3 py-1.5 rounded-sm cursor-pointer text-xs font-light uppercase tracking-wider transition-all duration-200 hover:bg-cyber-primary/20 hover:border-cyber-primary hover:shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:-translate-y-px active:translate-y-0"
        >
          Export PNG
        </button>
      </div>

      <div
        className="relative h-[400px] bg-black/30 border border-cyber-primary/5 p-px rounded-sm"
        role="img"
        aria-label={`${title} chart showing ${dataDescription}`}
      >
        {children}
      </div>

      {/* Data table alternative for screen readers */}
      {tableData && tableData.length > 0 && (
        <details className="mt-4">
          <summary className="text-cyber-muted text-sm cursor-pointer hover:text-cyber-primary transition-colors">
            View {title} data as table
          </summary>
          <div className="mt-3 max-h-[300px] overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-cyber-border">
                  <th className="text-left text-cyber-primary p-2">Step</th>
                  <th className="text-left text-cyber-primary p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((point, index) => (
                  <tr
                    key={index}
                    className="border-b border-cyber-border/30 hover:bg-cyber-primary/5"
                  >
                    <td className="p-2 text-cyber-muted">{point.step}</td>
                    <td className="p-2 text-gray-200">{point.value.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
