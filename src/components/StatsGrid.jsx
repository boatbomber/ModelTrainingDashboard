import { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { calculateDisplayStats } from '../utils/statsCalculator';

function StatCard({ label, value, isPositiveGood, isNeutral }) {
  const formattedValue = value.toFixed(1);
  const isPositive = value > 0;

  let colorClass;
  let srStatus; // Screen reader status text

  if (isNeutral) {
    const isStable = Math.abs(value) < 10;
    colorClass = isStable ? 'text-cyber-success' : 'text-cyber-warning';
    srStatus = isStable ? '(stable)' : '(moderate change)';
  } else if (isPositiveGood) {
    colorClass = isPositive ? 'text-cyber-success' : 'text-cyber-error';
    srStatus = isPositive ? '(improved)' : '(decreased)';
  } else {
    colorClass = isPositive ? 'text-cyber-error' : 'text-cyber-success';
    srStatus = isPositive ? '(increased)' : '(improved)';
  }

  return (
    <div className="relative overflow-hidden bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border rounded-sm p-5 shadow-cyber transition-all duration-200 hover:border-cyber-primary/30 hover:translate-x-0.5 hover:shadow-cyber-hover group">
      {/* Left accent line */}
      <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-transparent via-cyber-primary to-transparent" />

      <div className="text-cyber-primary text-xs mb-2 uppercase tracking-wider opacity-70 font-light">
        {label}
      </div>
      <div className={`text-3xl font-extralight font-mono ${colorClass}`}>
        {formattedValue}%
        <span className="sr-only"> {srStatus}</span>
      </div>
    </div>
  );
}

export default function StatsGrid() {
  const { trainingData } = useDashboard();

  const stats = useMemo(() => {
    if (!trainingData) return [];
    return calculateDisplayStats(trainingData);
  }, [trainingData]);

  if (!trainingData || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          isPositiveGood={stat.isPositiveGood}
          isNeutral={stat.isNeutral}
        />
      ))}
    </div>
  );
}
