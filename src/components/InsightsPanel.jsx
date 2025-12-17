import { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  calculateAdvancedStats,
  generateTrainingInsights,
} from '../utils/statsCalculator';

const typeStyles = {
  success: 'text-cyber-success',
  good: 'text-green-400',
  warning: 'text-cyber-warning',
  error: 'text-cyber-error',
  info: 'text-blue-400',
};

const typeIcons = {
  success: '\u2713',
  good: '\u2713',
  warning: '\u26A0',
  error: '\u26A0',
  info: '\u2139',
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
    <div className="relative overflow-hidden rounded-sm bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-6 mb-5 shadow-cyber">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent" />

      <h2 className="text-cyber-primary text-xl font-light mb-5 uppercase tracking-wider">
        Training Insights
      </h2>

      <ul className="m-0 pl-5 text-gray-200 leading-relaxed">
        {insights.map((insight, index) => (
          <li key={index} className="mb-2">
            <span className={typeStyles[insight.type]}>
              {typeIcons[insight.type]}{' '}
            </span>
            <span className={typeStyles[insight.type]}>
              {insight.message.split(' - ')[0]}
            </span>
            {insight.message.includes(' - ') && (
              <span className="text-gray-400">
                {' - '}
                {insight.message.split(' - ')[1]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
