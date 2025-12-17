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
    <div className="relative overflow-hidden rounded-sm bg-cyber-bg/80 backdrop-blur-xl border border-cyber-border p-6 mb-5 shadow-cyber">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent" />

      <h3 className="text-cyber-primary text-xl font-light mb-5 uppercase tracking-wider">
        Smoothing Control
      </h3>

      <div className="flex items-center gap-5">
        <div className="flex-1 min-w-[300px]">
          <div className="flex justify-between mb-3 text-cyber-primary text-xs uppercase tracking-wider opacity-60">
            <span>Raw Data</span>
            <span>Smooth Trends</span>
          </div>

          <div className="relative">
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
              className="w-full h-1 bg-cyber-primary/10 rounded-none appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:bg-cyber-primary
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-cyber-bg
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:rotate-45
                [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(0,255,255,0.8)]
                [&::-webkit-slider-thumb]:hover:shadow-[0_0_30px_rgba(0,255,255,1)]
                [&::-webkit-slider-thumb]:active:scale-90
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:bg-cyber-primary
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-cyber-bg
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:rotate-45
                [&::-moz-range-thumb]:shadow-[0_0_20px_rgba(0,255,255,0.8)]"
              style={{
                background: `linear-gradient(to right, rgba(0, 255, 255, 0.6) 0%, rgba(0, 255, 255, 0.6) ${
                  localValue * 100
                }%, rgba(0, 255, 255, 0.1) ${localValue * 100}%, rgba(0, 255, 255, 0.1) 100%)`,
              }}
            />
          </div>

          <div className="text-cyber-muted text-xs mt-3 text-center uppercase tracking-wider opacity-60">
            {getDescription()}
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            aria-label="Smoothing percentage"
            className="bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary py-2.5 pl-5 pr-8 rounded-sm font-light w-[100px] text-xl font-mono tracking-wider shadow-[0_0_20px_rgba(0,255,255,0.2)] text-right focus:outline-none focus:border-cyber-primary focus:shadow-[0_0_30px_rgba(0,255,255,0.4)]"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-primary text-xl font-mono pointer-events-none">%</span>
        </div>
      </div>
    </div>
  );
}
