import React, { useState, useEffect } from 'react';
import { theme } from './theme';
import { getScenarios, resetScenario } from './api';
import ScenarioLauncher from './components/ScenarioLauncher';
import DemoFlow from './components/DemoFlow';

/**
 * Ask Others to Pay — Demo App
 *
 * Two modes:
 *   1. Scenario launcher (pick a scenario)
 *   2. Demo flow (walk the full journey for the chosen scenario)
 */
export default function App() {
  const [scenarios, setScenarios] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  async function loadScenarios() {
    try {
      setLoading(true);
      setError(null);
      const res = await getScenarios();
      setScenarios(res.data);
    } catch (e) {
      setError('Could not connect to backend. Run: cd src/backend && node server.js');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectScenario(scenario) {
    // Reset scenario state before starting
    try {
      await resetScenario(scenario.id);
      // Reload to get fresh state
      const res = await getScenarios();
      setScenarios(res.data);
      const fresh = res.data.find(s => s.id === scenario.id);
      setActiveScenario(fresh);
    } catch (e) {
      setActiveScenario(scenario);
    }
  }

  function handleBack() {
    setActiveScenario(null);
    loadScenarios();
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: theme.font }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ${theme.font}; background: ${theme.bg}; color: ${theme.text}; }
        button { font-family: inherit; cursor: pointer; border: none; transition: all 0.15s ease; }
        input, select, textarea { font-family: inherit; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.25s ease-out; }
      `}</style>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${theme.border}`, borderTopColor: theme.secondary, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: theme.textSecondary, fontSize: 14 }}>Connecting to backend...</p>
          </div>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>!</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: theme.text }}>Backend not running</h2>
            <p style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
            <button
              onClick={loadScenarios}
              style={{ padding: '10px 24px', background: theme.secondary, color: '#fff', borderRadius: theme.radius, fontSize: 14, fontWeight: 500 }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !activeScenario && scenarios && (
        <ScenarioLauncher scenarios={scenarios} onSelect={handleSelectScenario} />
      )}

      {activeScenario && (
        <DemoFlow scenario={activeScenario} onBack={handleBack} />
      )}
    </div>
  );
}
