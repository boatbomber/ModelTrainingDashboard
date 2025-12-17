import { useDashboard } from '../context/DashboardContext';
import DropZone from './DropZone';

export default function Header() {
  const { fileName, error, clearError } = useDashboard();

  return (
    <div className="relative overflow-hidden rounded bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-8 mb-8 shadow-cyber">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/80 to-transparent" />

      <h1 className="text-cyber-primary text-4xl font-light mb-6 tracking-wider uppercase drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
        AI Training Monitor
      </h1>

      {fileName && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-cyber-muted text-sm font-mono">
            Loaded file:
          </span>
          <span className="text-cyber-primary text-sm font-mono">
            {fileName}
          </span>
        </div>
      )}

      <DropZone />

      <p className="mt-4 text-cyber-muted/70 text-xs font-mono">
        All processing happens locally in your browser. No data ever leaves your device.
      </p>

      {error && (
        <div
          className="mt-5 p-4 bg-red-500/10 border border-red-500/30 text-cyber-error rounded-sm font-mono text-sm cursor-pointer"
          onClick={clearError}
        >
          {error}
        </div>
      )}
    </div>
  );
}
