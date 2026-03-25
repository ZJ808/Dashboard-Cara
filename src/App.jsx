import { useState } from 'react';
import { LanguageProvider, useT } from './i18n/LanguageContext';
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

const TAB_IDS = ['executive', 'scenarios', 'impact', 'risks', 'documents', 'assumptions'];

function AppInner() {
  const { t, lang, setLang } = useT();
  const [activeTab, setActiveTab] = useState('executive');
  const [assumptions, setAssumptions] = useState(defaultAssumptions);
  const [scenarios, setScenarios] = useState(defaultScenarios);
  const [documents, setDocuments] = useState(defaultDocuments);

  const tabs = TAB_IDS.map(id => ({ id, label: t(`tabs.${id}`) }));

  function updateScenario(id, updates) {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }
  function addScenario() {
    const id = `s${Date.now()}`;
    setScenarios(prev => [...prev, createBlankScenario(id, lang)]);
  }
  function deleteScenario(id) {
    setScenarios(prev => prev.filter(s => s.id !== id));
  }
  function duplicateScenario(id) {
    const source = scenarios.find(s => s.id === id);
    if (!source) return;
    const newId = `s${Date.now()}`;
    const suffix = t('sb.copy.suffix');
    // name may be a bilingual object or a plain string
    const name = typeof source.name === 'object'
      ? { fr: `${source.name.fr} ${suffix}`, en: `${source.name.en} ${suffix}` }
      : `${source.name} ${suffix}`;
    setScenarios(prev => [...prev, { ...source, id: newId, name }]);
  }
  function updateDocument(id, updates) {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }

  const sharedProps = { assumptions, scenarios, documents };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 pt-4 pb-0 flex items-center justify-between">
          {/* Left: title */}
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight leading-tight">
              {t('app.title')}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{t('app.subtitle')}</p>
          </div>

          {/* Right: lang toggle + badge */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language toggle */}
            <div className="flex items-center bg-slate-800 rounded-full p-0.5 border border-slate-700">
              {['fr', 'en'].map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    lang === l
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Private badge */}
            <span className="text-[11px] font-mono tracking-widest bg-red-900/40 text-red-300 border border-red-700/50 px-2 py-0.5 rounded">
              {t('app.badge')}
            </span>
          </div>
        </div>

        {/* Tab navigation */}
        <TabNav tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-6 py-6">
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

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
