import { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  calculateAdvancedStats,
  generateTrainingInsights,
} from '../utils/statsCalculator';

const pillStyles = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  good: 'bg-green-500/15 border-green-500/30 text-green-400',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  error: 'bg-red-500/15 border-red-500/30 text-red-400',
  info: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
};

const typeLabels = {
  success: 'Success',
  good: 'Good',
  warning: 'Warning',
  error: 'Issue',
  info: 'Info',
};

export default function InsightsPanel() {
  const { trainingData } = useDashboard();

  const insights = useMemo(() => {
    if (!trainingData) return [];
    const advancedStats = calculateAdvancedStats(trainingData);
    return generateTrainingInsights(trainingData, advancedStats);
  }, [trainingData]);

  if (!trainingData || insights.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-sm bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-4 mb-5 shadow-cyber">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent" />

      <div className="flex flex-wrap gap-2">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${pillStyles[insight.type]}`}
          >
            <span className="sr-only">{typeLabels[insight.type]}:</span>
            <span>{insight.message.split(' - ')[0]}</span>
            {insight.message.includes(' - ') && (
              <span className="opacity-60 text-xs hidden sm:inline">
                {insight.message.split(' - ')[1]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
