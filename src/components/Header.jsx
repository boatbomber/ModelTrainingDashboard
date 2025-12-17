import { useDashboard } from '../context/DashboardContext';
import DropZone from './DropZone';

export default function Header() {
  const { trainingData, trainingMetadata, error, clearError } = useDashboard();

  const getLoadedSummary = () => {
    if (!trainingData?.log_history) return null;

    const logHistory = trainingData.log_history;
    const lastEntry = logHistory[logHistory.length - 1];
    const currentStep = lastEntry?.step || 0;
    const totalSteps = trainingMetadata.totalSteps;

    const parts = [];

    if (totalSteps > 0) {
      parts.push(`Step ${currentStep.toLocaleString()} / ${totalSteps.toLocaleString()}`);
    } else if (currentStep > 0) {
      parts.push(`Step ${currentStep.toLocaleString()}`);
    }

    parts.push(`${logHistory.length.toLocaleString()} data points`);

    return parts.join(' · ');
  };

  const loadedSummary = getLoadedSummary();

  return (
    <div className="relative overflow-hidden rounded bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-6 mb-6 shadow-cyber">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/80 to-transparent" />

      <div className="flex items-center gap-6">
        {/* Left side - text content */}
        <div className="flex-shrink-0">
          <h1 className="text-cyber-primary text-3xl font-light tracking-wider uppercase drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
            Model Training Dashboard
          </h1>

          <p className="mt-2 text-cyber-muted/70 text-xs font-mono">
            All processing happens locally in your browser.
          </p>

          {loadedSummary && (
            <div className="mt-2 text-cyber-primary text-sm font-mono">
              {loadedSummary}
            </div>
          )}
        </div>

        {/* Right side - drop zone */}
        <div className="flex-1 min-w-0">
          <DropZone />
        </div>
      </div>

      {error && (
        <div
          className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-cyber-error rounded-sm font-mono text-sm cursor-pointer"
          onClick={clearError}
        >
          {error}
        </div>
      )}
    </div>
  );
}
