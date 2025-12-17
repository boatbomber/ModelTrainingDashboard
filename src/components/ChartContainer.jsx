import { useCallback } from 'react';
import { exportChartAsPNG } from '../utils/chartConfig';

export default function ChartContainer({ title, chartRef, exportFilename, children }) {
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
          className="bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary px-3 py-1.5 rounded-sm cursor-pointer text-xs font-light uppercase tracking-wider transition-all duration-200 hover:bg-cyber-primary/20 hover:border-cyber-primary hover:shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:-translate-y-px active:translate-y-0"
        >
          Export PNG
        </button>
      </div>

      <div className="relative h-[400px] bg-black/30 border border-cyber-primary/5 p-px rounded-sm">
        {children}
      </div>
    </div>
  );
}
