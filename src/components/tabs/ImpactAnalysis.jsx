import SectionCard from '../layout/SectionCard';
import HeatCell from '../shared/HeatCell';
import { calculateImpact, SCORE_DIMENSIONS } from '../../data/scoring';

function fmt(n) {
  return n?.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) ?? '—';
}

export default function ImpactAnalysis({ assumptions, scenarios }) {
  const impacts = scenarios.map(s => ({ scenario: s, impact: calculateImpact(s, assumptions) }));

  return (
    <div className="space-y-5">
      {/* Cash Flow Summary Table */}
      <SectionCard title="Synthèse financière" subtitle="Montants calculés à partir des hypothèses et paramètres de chaque scénario">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 font-semibold text-slate-500 min-w-[160px]">Scénario</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Financement total</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Dette bancaire</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">CCA</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Mensualité</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Frais notaire</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Droits enreg.</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Coût total setup</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Ownership (vous)</th>
              </tr>
            </thead>
            <tbody>
              {impacts.map(({ scenario, impact }) => (
                <tr key={scenario.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-slate-800">{scenario.name}</div>
                    <div className="text-slate-400 truncate max-w-[160px]">{scenario.description}</div>
                  </td>
                  <td className="text-right py-2 px-3 text-slate-700 font-medium">€{fmt(impact.totalFunding)}</td>
                  <td className="text-right py-2 px-3 text-slate-600">€{fmt(impact.debtAmount)}</td>
                  <td className="text-right py-2 px-3 text-slate-600">
                    {impact.ccaAmount > 0 ? `€${fmt(impact.ccaAmount)}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="text-right py-2 px-3 text-slate-600">
                    {impact.monthlyDebtService > 0 ? `€${fmt(impact.monthlyDebtService)}/mois` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="text-right py-2 px-3 text-slate-600">€{fmt(impact.notaryCost)}</td>
                  <td className="text-right py-2 px-3 text-slate-600">
                    {impact.registrationCost > 0 ? `€${fmt(impact.registrationCost)}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="text-right py-2 px-3 font-semibold text-slate-800">€{fmt(impact.totalSetupCost)}</td>
                  <td className="text-right py-2 px-3">
                    <span className={`font-medium ${
                      impact.ownershipResult.you >= 80 ? 'text-emerald-600' : 'text-orange-500'
                    }`}>
                      {impact.ownershipResult.you.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Score Heatmap */}
      <SectionCard title="Heatmap des scores" subtitle="Visualisation comparative par dimension (5 = meilleur)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 font-semibold text-slate-500 min-w-[160px]">Scénario</th>
                {SCORE_DIMENSIONS.map(d => (
                  <th key={d.key} className="text-center py-2 px-2 font-semibold text-slate-500 min-w-[72px]">
                    <span className="block text-[10px] leading-tight">{d.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {impacts.map(({ scenario, impact }) => (
                <tr key={scenario.id} className="border-b border-slate-50">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-slate-800">{scenario.name}</div>
                  </td>
                  {SCORE_DIMENSIONS.map(d => (
                    <td key={d.key} className="py-1.5 px-1 text-center">
                      <HeatCell score={impact.scores[d.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Ownership comparison */}
      <SectionCard title="Comparaison ownership post-transaction">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {impacts.map(({ scenario, impact }) => (
            <div key={scenario.id} className="border border-slate-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-700 mb-2">{scenario.name}</p>
              <div className="space-y-1.5">
                {[
                  ['Vous', impact.ownershipResult.you],
                  ['Mère', impact.ownershipResult.mother],
                  ['Autres', impact.ownershipResult.other],
                ].filter(([, v]) => v > 0).map(([label, pct]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-12">{label}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-12 text-right">
                      {pct.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
              {scenario.usufruit && (
                <p className="text-xs text-amber-600 mt-2">⚠ Usufruit impliqué</p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
