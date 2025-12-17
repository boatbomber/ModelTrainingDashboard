import { createContext, useContext, useState, useCallback } from 'react';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [trainingData, setTrainingData] = useState(null);
  const [smoothingLevel, setSmoothingLevel] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  const loadFile = useCallback((file) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setTrainingData(data);
        setIsLoading(false);
      } catch (err) {
        setError(`Error parsing JSON file: ${err.message}`);
        setTrainingData(null);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setTrainingData(null);
      setIsLoading(false);
    };

    reader.readAsText(file);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    trainingData,
    smoothingLevel,
    setSmoothingLevel,
    isLoading,
    error,
    fileName,
    loadFile,
    clearError,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
