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
      className="relative overflow-hidden rounded-sm bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-6 mb-5 shadow-cyber focus:outline-none"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent" />

      <h2 className="text-cyber-primary text-xl font-light mb-5 uppercase tracking-wider">
        Training Progress
      </h2>

      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Training progress: ${progress.toFixed(1)}% complete. ${epochInfo}. ${stepInfo}.`}
        className="relative h-8 bg-black/50 border border-cyber-border rounded-sm overflow-hidden mb-2"
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0, 255, 255, 0.03) 10px, rgba(0, 255, 255, 0.03) 20px)',
          }}
        />

        {/* Progress bar */}
        <div
          className="h-full flex items-center justify-center text-white font-light tracking-wider relative overflow-hidden transition-all duration-300"
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

      <div className="text-center mt-3 text-sm">
        <span className="text-cyber-primary">{epochInfo}</span>
        <span className="text-gray-600 mx-3">|</span>
        <span className="text-cyber-primary">{stepInfo}</span>
      </div>
    </div>
  );
}
