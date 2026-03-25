import { useT } from '../../i18n/LanguageContext';
import SectionCard from '../layout/SectionCard';
import HeatCell from '../shared/HeatCell';
import { calculateImpact, SCORE_DIMENSIONS, dimLabel } from '../../data/scoring';

function fmt(n) {
  return n?.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) ?? '—';
}

const TH = ({ children, right }) => (
  <th className={`py-3 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 ${right ? 'text-right' : 'text-left'}`}>
    {children}
  </th>
);

export default function ImpactAnalysis({ assumptions, scenarios }) {
  const { t, lang, tf } = useT();
  const impacts = scenarios.map(s => ({ scenario: s, impact: calculateImpact(s, assumptions) }));

  return (
    <div className="space-y-5">

      {/* Financial summary */}
      <SectionCard title={t('impact.fin.title')} subtitle={t('impact.fin.subtitle')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <TH>{t('impact.col.scenario')}</TH>
                <TH right>{t('impact.col.total')}</TH>
                <TH right>{t('impact.col.debt')}</TH>
                <TH right>{t('impact.col.cca')}</TH>
                <TH right>{t('impact.col.monthly')}</TH>
                <TH right>{t('impact.col.notary')}</TH>
                <TH right>{t('impact.col.reg')}</TH>
                <TH right>{t('impact.col.setup')}</TH>
                <TH right>{t('impact.col.own')}</TH>
              </tr>
            </thead>
            <tbody>
              {impacts.map(({ scenario, impact }) => {
                const name = typeof scenario.name === 'object' ? tf(scenario.name) : scenario.name;
                const desc = typeof scenario.description === 'object' ? tf(scenario.description) : scenario.description;
                return (
                  <tr key={scenario.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 text-sm">{name}</div>
                      {desc && <div className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5">{desc}</div>}
                    </td>
                    <td className="text-right py-3 px-3 font-semibold text-slate-900">€{fmt(impact.totalFunding)}</td>
                    <td className="text-right py-3 px-3 text-slate-600">€{fmt(impact.debtAmount)}</td>
                    <td className="text-right py-3 px-3 text-slate-600">
                      {impact.ccaAmount > 0 ? `€${fmt(impact.ccaAmount)}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="text-right py-3 px-3 text-slate-600">
                      {impact.monthlyDebtService > 0
                        ? `€${fmt(impact.monthlyDebtService)}${t('shared.perMonth')}`
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="text-right py-3 px-3 text-slate-600">€{fmt(impact.notaryCost)}</td>
                    <td className="text-right py-3 px-3 text-slate-600">
                      {impact.registrationCost > 0 ? `€${fmt(impact.registrationCost)}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="text-right py-3 px-3 font-semibold text-slate-900">€{fmt(impact.totalSetupCost)}</td>
                    <td className="text-right py-3 px-3">
                      <span className={`font-semibold ${impact.ownershipResult.you >= 80 ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {impact.ownershipResult.you.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Score heatmap */}
      <SectionCard title={t('impact.heat.title')} subtitle={t('impact.heat.subtitle')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 min-w-[160px]">
                  {t('impact.col.scenario')}
                </th>
                {SCORE_DIMENSIONS.map(d => (
                  <th key={d.key} className="text-center py-3 px-2 text-[11px] font-medium text-slate-400 min-w-[72px]">
                    <span className="block leading-tight">{dimLabel(d, lang)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {impacts.map(({ scenario, impact }) => {
                const name = typeof scenario.name === 'object' ? tf(scenario.name) : scenario.name;
                return (
                  <tr key={scenario.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800 text-sm">{name}</td>
                    {SCORE_DIMENSIONS.map(d => (
                      <td key={d.key} className="py-2 px-1 text-center">
                        <HeatCell score={impact.scores[d.key]} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Ownership breakdown */}
      <SectionCard title={t('impact.own.title')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {impacts.map(({ scenario, impact }) => {
            const name = typeof scenario.name === 'object' ? tf(scenario.name) : scenario.name;
            return (
              <div key={scenario.id} className="border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-700 mb-3">{name}</p>
                <div className="space-y-2">
                  {[
                    [t('sb.field.you'), impact.ownershipResult.you, 'bg-blue-500'],
                    [t('sb.field.mother'), impact.ownershipResult.mother, 'bg-violet-400'],
                    [t('sb.field.other'), impact.ownershipResult.other, 'bg-slate-300'],
                  ].filter(([, v]) => v > 0).map(([label, pct, color]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-14 shrink-0">{label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-slate-700 w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
                {scenario.usufruit && (
                  <p className="text-xs text-amber-600 mt-3 font-medium">{t('impact.usufruit.warn')}</p>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
