import { useCallback, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

export default function Header() {
  const { loadFile, fileName, error, clearError } = useDashboard();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) {
        loadFile(file);
      }
    },
    [loadFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.json')) {
        loadFile(file);
      }
    },
    [loadFile]
  );

  return (
    <div className="relative overflow-hidden rounded bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-8 mb-8 shadow-cyber">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/80 to-transparent" />

      <h1 className="text-cyber-primary text-4xl font-light mb-6 tracking-wider uppercase drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
        AI Training Monitor
      </h1>

      <div
        className={`flex items-center gap-5 flex-wrap ${
          isDragging ? 'opacity-50' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="relative overflow-hidden inline-block">
          <input
            type="file"
            id="fileInput"
            accept=".json"
            onChange={handleFileChange}
            className="absolute -left-[9999px]"
          />
          <label
            htmlFor="fileInput"
            className={`inline-block px-8 py-3 bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/40 rounded-sm cursor-pointer font-normal uppercase tracking-wider text-sm transition-all duration-200 hover:bg-cyber-primary/20 hover:border-cyber-primary hover:shadow-cyber-glow hover:-translate-y-px active:translate-y-0 ${
              isDragging ? 'border-cyber-primary bg-cyber-primary/20' : ''
            }`}
          >
            Load Training State
          </label>
        </div>

        <span className="text-cyber-muted text-sm font-mono ml-2">
          {fileName || 'No file selected'}
        </span>
      </div>

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
