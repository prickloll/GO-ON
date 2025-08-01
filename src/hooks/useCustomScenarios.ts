import { useState, useEffect } from 'react';
import { Scenario } from '../types';

const STORAGE_KEY = 'lingualife_custom_scenarios';

export const useCustomScenarios = () => {
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomScenarios(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse custom scenarios:', error);
      }
    }
  }, []);

  const saveCustomScenario = (scenario: Scenario) => {
    const updated = [...customScenarios, scenario];
    setCustomScenarios(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteCustomScenario = (scenarioId: string) => {
    const updated = customScenarios.filter(s => s.id !== scenarioId);
    setCustomScenarios(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateCustomScenario = (scenarioId: string, updates: Partial<Scenario>) => {
    const updated = customScenarios.map(s => 
      s.id === scenarioId ? { ...s, ...updates } : s
    );
    setCustomScenarios(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    customScenarios,
    saveCustomScenario,
    deleteCustomScenario,
    updateCustomScenario
  };
};
