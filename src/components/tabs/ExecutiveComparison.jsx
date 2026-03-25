import { useState } from 'react';
import SectionCard from '../layout/SectionCard';
import ScoreRadar from '../shared/ScoreRadar';
import HeatCell from '../shared/HeatCell';
import RedFlagBox from '../shared/RedFlagBox';
import {
  calculateScores, calculateWeightedScore, calculateImpact,
  SCORE_DIMENSIONS, BADGE_CRITERIA,
} from '../../data/scoring';
import { TRANSACTION_TYPES } from '../../data/scenarios';

function fmt(n) {
  return n?.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) ?? '—';
}

function txLabel(value) {
  return TRANSACTION_TYPES.find(t => t.value === value)?.label ?? value;
}

export default function ExecutiveComparison({ assumptions, scenarios }) {
  const [sortBy, setSortBy] = useState('weighted');

  // Compute all scores and impacts
  const enriched = scenarios.map(s => {
    const scores = calculateScores(s, assumptions);
    const weighted = calculateWeightedScore(scores, assumptions.scoringWeights);
    const impact = calculateImpact(s, assumptions);
    return { scenario: s, scores, weighted, impact };
  });

  // Sorted list
  const sorted = [...enriched].sort((a, b) => {
    if (sortBy === 'weighted') return b.weighted - a.weighted;
    return (b.scores[sortBy] ?? 0) - (a.scores[sortBy] ?? 0);
  });

  // Score map for radar
  const scoreMap = {};
  enriched.forEach(({ scenario, scores }) => { scoreMap[scenario.id] = scores; });

  // Best-in-class badges
  const badges = {};
  BADGE_CRITERIA.forEach(({ key, label, icon }) => {
    const best = enriched.reduce((acc, e) => {
      const val = key === 'weighted' ? e.weighted : e.scores[key];
      if (!acc || val > (key === 'weighted' ? acc.weighted : acc.scores[key])) return e;
      return acc;
    }, null);
    if (best) {
      badges[best.scenario.id] = badges[best.scenario.id] ?? [];
      badges[best.scenario.id].push({ key, label, icon });
    }
  });

  return (
    <div className="space-y-5">
      {/* Top ranked summary */}
      <SectionCard
        title="Tableau de bord exécutif — Classement des scénarios"
        subtitle="Triez par n'importe quelle dimension. Les scores sont calculés automatiquement à partir des hypothèses."
      >
        <div className="flex items-center gap-2 mb-4">
          <label className="text-xs text-slate-500">Trier par :</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="weighted">Score pondéré global</option>
            {SCORE_DIMENSIONS.map(d => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-3 font-semibold text-slate-500 w-6">#</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-500 min-w-[160px]">Scénario</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-500">Type</th>
                <th className="text-right py-2 pr-4 font-semibold text-slate-500">Financement</th>
                <th className="text-right py-2 pr-4 font-semibold text-slate-500">Coûts setup</th>
                <th className="text-right py-2 pr-4 font-semibold text-slate-500">Mensualité</th>
                <th className="text-right py-2 pr-4 font-semibold text-slate-500">Ownership</th>
                {SCORE_DIMENSIONS.map(d => (
                  <th key={d.key} className={`text-center py-2 px-1 font-semibold min-w-[64px] ${
                    sortBy === d.key ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    <span className="text-[10px] leading-tight block">{d.label}</span>
                  </th>
                ))}
                <th className={`text-center py-2 px-2 font-semibold min-w-[72px] ${
                  sortBy === 'weighted' ? 'text-blue-600' : 'text-slate-500'
                }`}>Score global</th>
                <th className="text-left py-2 pl-3 font-semibold text-slate-500">Badges</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ scenario, scores, weighted, impact }, i) => (
                <tr
                  key={scenario.id}
                  className={`border-b border-slate-50 hover:bg-slate-50 ${i === 0 ? 'bg-emerald-50/40' : ''}`}
                >
                  <td className="py-3 pr-3">
                    <span className={`font-bold ${i === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-slate-800">{scenario.name}</div>
                    <div className="text-slate-400 truncate max-w-[150px] mt-0.5">{scenario.description}</div>
                  </td>
                  <td className="py-3 pr-4 text-slate-500">
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{txLabel(scenario.transactionType)}</span>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-700 font-medium">€{fmt(impact.totalFunding)}</td>
                  <td className="py-3 pr-4 text-right text-slate-600">€{fmt(impact.totalSetupCost)}</td>
                  <td className="py-3 pr-4 text-right text-slate-600">
                    {impact.monthlyDebtService > 0 ? `€${fmt(impact.monthlyDebtService)}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`font-medium ${impact.ownershipResult.you >= 80 ? 'text-emerald-600' : 'text-orange-500'}`}>
                      {impact.ownershipResult.you.toFixed(1)}%
                    </span>
                  </td>
                  {SCORE_DIMENSIONS.map(d => (
                    <td key={d.key} className="py-2 px-1 text-center">
                      <HeatCell score={scores[d.key]} />
                    </td>
                  ))}
                  <td className="py-2 px-2 text-center">
                    <span className={`inline-block px-2 py-1 rounded font-bold text-sm ${
                      weighted >= 4 ? 'bg-emerald-100 text-emerald-700'
                      : weighted >= 3 ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                    }`}>{weighted}</span>
                  </td>
                  <td className="py-2 pl-3">
                    <div className="flex flex-wrap gap-1">
                      {(badges[scenario.id] ?? []).map(b => (
                        <span
                          key={b.key}
                          title={b.label}
                          className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded whitespace-nowrap"
                        >
                          {b.icon} {b.label}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Radar Chart */}
      <SectionCard title="Comparaison radar — tous scénarios" subtitle="Superposition des profils de score par dimension">
        <ScoreRadar scenarios={scenarios} scoreMap={scoreMap} />
      </SectionCard>

      {/* Red flag summary */}
      <SectionCard title="Synthèse des signaux d'alerte" subtitle="Résumé des points de vigilance par scénario">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map(s => (
            <div key={s.id} className="border border-slate-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-700 mb-2">{s.name}</p>
              <RedFlagBox flags={s.redFlags} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Recommendation matrix */}
      <SectionCard title="Matrice de recommandation" subtitle="Classification rapide par objectif">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 font-semibold text-slate-500">Objectif prioritaire</th>
                <th className="text-left py-2 font-semibold text-slate-500">Scénario(s) recommandé(s)</th>
              </tr>
            </thead>
            <tbody>
              {BADGE_CRITERIA.map(({ key, label, icon }) => {
                const top2 = [...enriched]
                  .sort((a, b) => (b.scores[key] ?? 0) - (a.scores[key] ?? 0))
                  .slice(0, 2);
                return (
                  <tr key={key} className="border-b border-slate-50">
                    <td className="py-2 pr-4 font-medium text-slate-600">{icon} {label}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {top2.map(({ scenario, scores }) => (
                          <span key={scenario.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {scenario.name}
                            <span className="text-slate-400 ml-1">({scores[key]}/5)</span>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
