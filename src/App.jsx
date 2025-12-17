import { useEffect, useMemo } from 'react';
import { useDashboard } from './context/DashboardContext';
import { hasRewardData } from './utils/dataProcessor';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import StatsGrid from './components/StatsGrid';
import InsightsPanel from './components/InsightsPanel';
import SmoothingControl from './components/SmoothingControl';
import LossChart from './components/charts/LossChart';
import RewardChart from './components/charts/RewardChart';
import IndividualRewardsChart from './components/charts/IndividualRewardsChart';
import CompletionLengthChart from './components/charts/CompletionLengthChart';
import KLChart from './components/charts/KLChart';
import LearningRateChart from './components/charts/LearningRateChart';
import GradientNormChart from './components/charts/GradientNormChart';

function Dashboard() {
  const { trainingData, isLoading, fileName, error } = useDashboard();

  const hasRewards = useMemo(() => {
    return trainingData?.log_history && hasRewardData(trainingData.log_history);
  }, [trainingData]);

  // Focus management: move focus to progress section after data loads
  useEffect(() => {
    if (trainingData) {
      document.getElementById('progress-section')?.focus();
    }
  }, [trainingData]);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="text-center text-cyber-primary text-lg my-5 font-light uppercase tracking-wider opacity-70"
      >
        Processing Training Data...
      </div>
    );
  }

  if (!trainingData) {
    return null;
  }

  return (
    <main id="main-content">
      {/* Live region for announcing dynamic content to screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {fileName && `Loaded ${fileName}. Dashboard is now displaying training metrics.`}
        {error && `Error: ${error}`}
      </div>

      <ProgressBar />
      <StatsGrid />
      <InsightsPanel />
      <SmoothingControl />

      {/* Responsive chart grid - adapts to any number of charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {hasRewards ? (
          <>
            <div className="xl:col-span-2">
              <RewardChart />
            </div>
            <IndividualRewardsChart />
            <CompletionLengthChart />
            <KLChart />
            <GradientNormChart />
            <LearningRateChart />
            <LossChart />
          </>
        ) : (
          <>
            <div className="xl:col-span-2">
              <LossChart />
            </div>
            <CompletionLengthChart />
            <KLChart />
            <GradientNormChart />
            <LearningRateChart />
          </>
        )}
      </div>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-cyber-bg bg-cyber-gradient p-5 text-gray-200 font-mono">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="max-w-[1400px] mx-auto relative z-[2]">
        <Header />
        <Dashboard />
      </div>
    </div>
  );
}
