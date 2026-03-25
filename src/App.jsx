import { useState } from 'react';
import { defaultAssumptions } from './data/assumptions';
import { defaultScenarios, createBlankScenario } from './data/scenarios';
import { defaultDocuments } from './data/documents';
import TabNav from './components/layout/TabNav';
import Assumptions from './components/tabs/Assumptions';
import ScenarioBuilder from './components/tabs/ScenarioBuilder';
import ImpactAnalysis from './components/tabs/ImpactAnalysis';
import RisksBlockers from './components/tabs/RisksBlockers';
import Documents from './components/tabs/Documents';
import ExecutiveComparison from './components/tabs/ExecutiveComparison';

const TABS = [
  { id: 'executive',   label: 'Comparaison exécutive' },
  { id: 'scenarios',   label: 'Scénarios' },
  { id: 'impact',      label: 'Analyse d\'impact' },
  { id: 'risks',       label: 'Risques & blocages' },
  { id: 'documents',   label: 'Documents requis' },
  { id: 'assumptions', label: 'Hypothèses' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('executive');
  const [assumptions, setAssumptions] = useState(defaultAssumptions);
  const [scenarios, setScenarios] = useState(defaultScenarios);
  const [documents, setDocuments] = useState(defaultDocuments);

  function updateScenario(id, updates) {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  function addScenario() {
    const id = `s${Date.now()}`;
    setScenarios(prev => [...prev, createBlankScenario(id)]);
  }

  function deleteScenario(id) {
    setScenarios(prev => prev.filter(s => s.id !== id));
  }

  function duplicateScenario(id) {
    const source = scenarios.find(s => s.id === id);
    if (!source) return;
    const newId = `s${Date.now()}`;
    setScenarios(prev => [
      ...prev,
      { ...source, id: newId, name: `${source.name} (copie)` },
    ]);
  }

  function updateDocument(id, updates) {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }

  const sharedProps = { assumptions, scenarios, documents };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 pt-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">
              SCI / OBO — Tableau de bord structuration
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Outil interne d'aide à la décision — confidentiel</p>
          </div>
          <span className="text-xs bg-red-50 text-red-400 border border-red-200 px-2 py-0.5 rounded font-mono tracking-wide">
            PRIVÉ
          </span>
        </div>
        <TabNav tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {activeTab === 'executive'   && <ExecutiveComparison {...sharedProps} />}
        {activeTab === 'scenarios'   && (
          <ScenarioBuilder
            {...sharedProps}
            onUpdate={updateScenario}
            onAdd={addScenario}
            onDelete={deleteScenario}
            onDuplicate={duplicateScenario}
          />
        )}
        {activeTab === 'impact'      && <ImpactAnalysis {...sharedProps} />}
        {activeTab === 'risks'       && <RisksBlockers {...sharedProps} />}
        {activeTab === 'documents'   && (
          <Documents {...sharedProps} onUpdateDocument={updateDocument} />
        )}
        {activeTab === 'assumptions' && (
          <Assumptions assumptions={assumptions} onUpdate={setAssumptions} />
        )}
      </main>
    </div>
  );
}
