import { useState } from 'react';
import { useT } from '../../i18n/LanguageContext';
import SectionCard from '../layout/SectionCard';
import ScoreRadar from '../shared/ScoreRadar';
import HeatCell from '../shared/HeatCell';
import RedFlagBox from '../shared/RedFlagBox';
import {
  calculateScores, calculateWeightedScore, calculateImpact,
  SCORE_DIMENSIONS, BADGE_CRITERIA, dimLabel, badgeLabel,
} from '../../data/scoring';
import { TRANSACTION_TYPES, optLabel } from '../../data/scenarios';

function fmt(n) {
  return n?.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) ?? '—';
}

const TH = ({ children, right, active, className = '' }) => (
  <th className={`py-3 px-3 text-[11px] font-medium uppercase tracking-wider whitespace-nowrap
    ${right ? 'text-right' : 'text-left'}
    ${active ? 'text-blue-500' : 'text-slate-400'}
    ${className}`}
  >
    {children}
  </th>
);

export default function ExecutiveComparison({ assumptions, scenarios }) {
  const { t, lang, tf } = useT();
  const [sortBy, setSortBy] = useState('weighted');

  const enriched = scenarios.map(s => {
    const scores = calculateScores(s, assumptions);
    const weighted = calculateWeightedScore(scores, assumptions.scoringWeights);
    const impact = calculateImpact(s, assumptions);
    return { scenario: s, scores, weighted, impact };
  });

  const sorted = [...enriched].sort((a, b) =>
    sortBy === 'weighted'
      ? b.weighted - a.weighted
      : (b.scores[sortBy] ?? 0) - (a.scores[sortBy] ?? 0)
  );

  const scoreMap = {};
  enriched.forEach(({ scenario, scores }) => { scoreMap[scenario.id] = scores; });

  // Best-in-class badges
  const badges = {};
  BADGE_CRITERIA.forEach(badge => {
    const best = enriched.reduce((acc, e) => {
      const val = e.scores[badge.key] ?? 0;
      if (!acc || val > (acc.scores[badge.key] ?? 0)) return e;
      return acc;
    }, null);
    if (best) {
      badges[best.scenario.id] = badges[best.scenario.id] ?? [];
      badges[best.scenario.id].push(badge);
    }
  });

  return (
    <div className="space-y-5">

      {/* Main ranked table */}
      <SectionCard title={t('exec.title')} subtitle={t('exec.subtitle')}>
        <div className="flex items-center gap-2 mb-5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('exec.sortBy')}</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="weighted">{t('exec.sortWeighted')}</option>
            {SCORE_DIMENSIONS.map(d => (
              <option key={d.key} value={d.key}>{dimLabel(d, lang)}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <TH className="w-6">#</TH>
                <TH>{t('exec.col.scenario')}</TH>
                <TH>{t('exec.col.type')}</TH>
                <TH right>{t('exec.col.funding')}</TH>
                <TH right>{t('exec.col.setupCost')}</TH>
                <TH right>{t('exec.col.monthly')}</TH>
                <TH right>{t('exec.col.ownership')}</TH>
                {SCORE_DIMENSIONS.map(d => (
                  <TH key={d.key} active={sortBy === d.key} className="min-w-[64px]">
                    <span className="block text-center">{dimLabel(d, lang)}</span>
                  </TH>
                ))}
                <TH active={sortBy === 'weighted'} className="min-w-[80px]">
                  {t('exec.col.globalScore')}
                </TH>
                <TH>{t('exec.col.badges')}</TH>
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ scenario, scores, weighted, impact }, i) => {
                const name = typeof scenario.name === 'object' ? tf(scenario.name) : scenario.name;
                const desc = typeof scenario.description === 'object' ? tf(scenario.description) : scenario.description;
                const txType = TRANSACTION_TYPES.find(tx => tx.value === scenario.transactionType);
                const isTop = i === 0;
                return (
                  <tr
                    key={scenario.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isTop ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="py-3 px-3">
                      <span className={`text-sm font-bold ${isTop ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-sm font-semibold text-slate-900">{name}</div>
                      {desc && <div className="text-xs text-slate-400 truncate max-w-[160px] mt-0.5">{desc}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {txType ? optLabel(txType, lang) : scenario.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-semibold text-slate-900">
                      €{fmt(impact.totalFunding)}
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-slate-600">
                      €{fmt(impact.totalSetupCost)}
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-slate-600">
                      {impact.monthlyDebtService > 0
                        ? `€${fmt(impact.monthlyDebtService)}`
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`text-sm font-semibold ${impact.ownershipResult.you >= 80 ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {impact.ownershipResult.you.toFixed(1)}%
                      </span>
                    </td>
                    {SCORE_DIMENSIONS.map(d => (
                      <td key={d.key} className="py-2 px-1 text-center">
                        <HeatCell score={scores[d.key]} />
                      </td>
                    ))}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg font-bold text-sm ${
                        weighted >= 4 ? 'bg-emerald-100 text-emerald-700'
                        : weighted >= 3 ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                      }`}>{weighted}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {(badges[scenario.id] ?? []).map(b => (
                          <span
                            key={b.key}
                            title={badgeLabel(b, lang)}
                            className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
                          >
                            {b.icon} {badgeLabel(b, lang)}
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

      {/* Radar chart */}
      <SectionCard title={t('exec.radar.title')} subtitle={t('exec.radar.subtitle')}>
        <ScoreRadar scenarios={scenarios} scoreMap={scoreMap} />
      </SectionCard>

      {/* Red flag summary */}
      <SectionCard title={t('exec.redflags.title')} subtitle={t('exec.redflags.subtitle')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map(s => {
            const name = typeof s.name === 'object' ? tf(s.name) : s.name;
            return (
              <div key={s.id} className="border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-800 mb-2">{name}</p>
                <RedFlagBox flags={s.redFlags} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Recommendation matrix */}
      <SectionCard title={t('exec.matrix.title')} subtitle={t('exec.matrix.subtitle')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {t('exec.matrix.col.goal')}
                </th>
                <th className="text-left py-3 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {t('exec.matrix.col.reco')}
                </th>
              </tr>
            </thead>
            <tbody>
              {BADGE_CRITERIA.map(badge => {
                const top2 = [...enriched]
                  .sort((a, b) => (b.scores[badge.key] ?? 0) - (a.scores[badge.key] ?? 0))
                  .slice(0, 2);
                return (
                  <tr key={badge.key} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-sm font-medium text-slate-700">
                      {badge.icon} {badgeLabel(badge, lang)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {top2.map(({ scenario, scores }) => {
                          const sName = typeof scenario.name === 'object' ? tf(scenario.name) : scenario.name;
                          return (
                            <span key={scenario.id} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {sName}
                              <span className="text-slate-400 ml-1">({scores[badge.key]}/5)</span>
                            </span>
                          );
                        })}
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
