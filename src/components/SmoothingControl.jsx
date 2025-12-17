import { useState, useCallback, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';

export default function SmoothingControl() {
  const { trainingData, smoothingLevel, setSmoothingLevel } = useDashboard();
  const [localValue, setLocalValue] = useState(smoothingLevel);
  const [inputValue, setInputValue] = useState(Math.round(smoothingLevel * 100).toString());
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLocalValue(smoothingLevel);
    setInputValue(Math.round(smoothingLevel * 100).toString());
  }, [smoothingLevel]);

  const applyValue = useCallback(
    (value) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setSmoothingLevel(value);
      }, 150);
    },
    [setSmoothingLevel]
  );

  const handleSliderChange = useCallback(
    (e) => {
      const value = parseFloat(e.target.value);
      setLocalValue(value);
      setInputValue(Math.round(value * 100).toString());
      applyValue(value);
    },
    [applyValue]
  );

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputBlur = useCallback(() => {
    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) numValue = 0;
    numValue = Math.max(0, Math.min(100, numValue));
    const normalizedValue = numValue / 100;
    setLocalValue(normalizedValue);
    setInputValue(numValue.toString());
    applyValue(normalizedValue);
  }, [inputValue, applyValue]);

  const handleInputKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.target.blur();
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getDescription = () => {
    if (localValue === 0) return 'RAW DATA - NO SMOOTHING';
    if (localValue < 0.3) return 'LIGHT SMOOTHING - HIGH DETAIL';
    if (localValue < 0.7) return 'MODERATE SMOOTHING - BALANCED';
    return 'HEAVY SMOOTHING - TREND FOCUS';
  };

  if (!trainingData) return null;

  const percentage = Math.round(localValue * 100);

  return (
    <div className="relative overflow-hidden rounded-sm bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-4 mb-5 shadow-cyber">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent" />

      <div className="flex items-center gap-4">
        <h3 className="text-cyber-primary text-sm font-light uppercase tracking-wider flex-shrink-0">
          Smoothing
        </h3>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={localValue}
          onChange={handleSliderChange}
          aria-label="Chart smoothing level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          aria-valuetext={`${percentage}% smoothing - ${getDescription()}`}
          className="flex-1 h-1 bg-cyber-primary/10 rounded-none appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:bg-cyber-primary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,255,0.8)]
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:bg-cyber-primary
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-none
            [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(0,255,255,0.8)]"
          style={{
            background: `linear-gradient(to right, rgba(0, 255, 255, 0.6) 0%, rgba(0, 255, 255, 0.6) ${
              localValue * 100
            }%, rgba(0, 255, 255, 0.1) ${localValue * 100}%, rgba(0, 255, 255, 0.1) 100%)`,
          }}
        />

        <div className="relative flex-shrink-0">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            aria-label="Smoothing percentage"
            className="bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary py-1 pl-2 pr-6 rounded-sm font-light w-[60px] text-sm font-mono tracking-wider text-right focus:outline-none focus:border-cyber-primary"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-cyber-primary text-sm font-mono pointer-events-none">%</span>
        </div>
      </div>
    </div>
  );
}
