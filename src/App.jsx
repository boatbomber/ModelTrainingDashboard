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
  const { trainingData, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="text-center text-cyber-primary text-lg my-5 font-light uppercase tracking-wider opacity-70">
        Processing Training Data...
      </div>
    );
  }

  if (!trainingData) {
    return null;
  }

  return (
    <>
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
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-cyber-bg bg-cyber-gradient p-5 text-gray-200 font-mono">
      <div className="max-w-[1400px] mx-auto relative z-[2]">
        <Header />
        <Dashboard />
      </div>
    </div>
  );
}
