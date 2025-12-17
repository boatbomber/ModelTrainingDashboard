import { useDashboard } from '../context/DashboardContext';

export default function ProgressBar() {
  const { trainingData } = useDashboard();

  if (!trainingData) return null;

  const progress = (trainingData.global_step / trainingData.max_steps) * 100;
  const epochInfo = `Epoch ${trainingData.epoch?.toFixed(4) || 0} of ${
    trainingData.num_train_epochs || 0
  }`;
  const stepInfo = `Step ${
    trainingData.global_step?.toLocaleString() || 0
  } of ${trainingData.max_steps?.toLocaleString() || 0}`;

  return (
    <div
      id="progress-section"
      tabIndex={-1}
      className="relative overflow-hidden rounded-sm bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-4 mb-5 shadow-cyber focus:outline-none"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent" />

      <div className="flex items-center gap-4">
        <h2 className="text-cyber-primary text-sm font-light uppercase tracking-wider flex-shrink-0">
          Progress
        </h2>

        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Training progress: ${progress.toFixed(1)}% complete. ${epochInfo}. ${stepInfo}.`}
          className="relative flex-1 h-5 bg-black/50 border border-cyber-border rounded-sm overflow-hidden"
        >
          {/* Progress bar */}
          <div
            className="h-full flex items-center justify-center text-white text-xs font-light tracking-wider relative overflow-hidden transition-all duration-300"
            style={{
              width: `${progress}%`,
              background:
                'linear-gradient(90deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.6), rgba(0, 255, 255, 0.2))',
              boxShadow:
                '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.2)',
            }}
          >
            {progress.toFixed(1)}%
          </div>
        </div>

        <div className="flex-shrink-0 text-xs text-cyber-primary font-mono">
          {epochInfo} · {stepInfo}
        </div>
      </div>
    </div>
  );
}
