import { useCallback, useState, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';

export default function DropZone() {
  const { loadFile } = useDashboard();
  const [dragState, setDragState] = useState('default'); // 'default' | 'active' | 'success' | 'error'
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;
    return file.type === 'application/json' || file.name.endsWith('.json');
  };

  const handleFile = useCallback(
    (file) => {
      if (!validateFile(file)) {
        setDragState('error');
        setTimeout(() => setDragState('default'), 1000);
        return;
      }

      setDragState('success');
      setTimeout(() => setDragState('default'), 500);
      loadFile(file);
    },
    [loadFile]
  );

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState('active');
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState('default');
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragState('default');

      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getBorderClass = () => {
    switch (dragState) {
      case 'active':
        return 'border-cyber-primary border-solid shadow-cyber-glow animate-pulse';
      case 'success':
        return 'border-cyber-success border-solid';
      case 'error':
        return 'border-cyber-error border-solid';
      default:
        return 'border-cyber-border/50 border-dashed';
    }
  };

  const getMessage = () => {
    switch (dragState) {
      case 'active':
        return 'Release to load file';
      case 'success':
        return 'File accepted!';
      case 'error':
        return 'Invalid file type - JSON only';
      default:
        return 'Drop trainer_state.json here or click to browse';
    }
  };

  const getIcon = () => {
    switch (dragState) {
      case 'active':
        return '⬇';
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return '📁';
    }
  };

  return (
    <div
      className={`relative border-2 rounded-sm p-4 transition-all duration-200 cursor-pointer ${getBorderClass()} ${
        dragState === 'default' ? 'hover:border-cyber-primary/40 hover:bg-cyber-primary/5' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="Upload training state JSON file"
      aria-describedby="dropzone-description"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <div className="text-2xl flex-shrink-0" aria-hidden="true">{getIcon()}</div>
        <p id="dropzone-description" className="text-cyber-muted font-mono text-xs">
          {getMessage()}
        </p>
      </div>
    </div>
  );
}
