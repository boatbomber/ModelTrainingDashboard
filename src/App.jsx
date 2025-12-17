import { useEffect } from 'react';
import { useDashboard } from './context/DashboardContext';
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

      {/* Two-column chart layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RewardChart />
        <IndividualRewardsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LossChart />
        <KLChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LearningRateChart />
        <GradientNormChart />
      </div>

      <CompletionLengthChart />
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
