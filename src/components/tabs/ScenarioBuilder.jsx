import { useState } from 'react';
import SectionCard from '../layout/SectionCard';
import RedFlagBox from '../shared/RedFlagBox';
import ScoreBadge from '../shared/ScoreBadge';
import { calculateScores, calculateWeightedScore, SCORE_DIMENSIONS } from '../../data/scoring';
import {
  TRANSACTION_TYPES, FUNDING_SOURCES, GUARANTEE_TYPES, TAX_PROFILES,
} from '../../data/scenarios';

function SelectField({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function NumField({ label, value, prefix, suffix, step = 1000, min = 0, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-xs text-slate-400">{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={e => onChange(Number(e.target.value))}
          className="border border-slate-200 rounded px-2 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, assumptions, onUpdate, onDelete, onDuplicate }) {
  const [expanded, setExpanded] = useState(false);
  const scores = calculateScores(scenario, assumptions);
  const weighted = calculateWeightedScore(scores, assumptions.scoringWeights);

  function upd(key, value) { onUpdate(scenario.id, { [key]: value }); }
  function updOwnership(who, value) {
    onUpdate(scenario.id, {
      ownershipResult: { ...scenario.ownershipResult, [who]: value },
    });
  }

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-slate-800 truncate">{scenario.name}</span>
            <span className="text-xs text-slate-400 truncate hidden sm:inline">{scenario.description}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-slate-500">
              Dette: <strong>€{scenario.debtAmount.toLocaleString('fr-FR')}</strong>
            </span>
            {scenario.ccaAmount > 0 && (
              <span className="text-xs text-slate-500">
                CCA: <strong>€{scenario.ccaAmount.toLocaleString('fr-FR')}</strong>
              </span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              weighted >= 4 ? 'bg-emerald-100 text-emerald-700'
              : weighted >= 3 ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
            }`}>
              Score pondéré: {weighted}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onDuplicate(scenario.id); }}
            className="text-xs text-slate-400 hover:text-blue-500 px-2 py-1 rounded hover:bg-blue-50"
            title="Dupliquer"
          >⊕</button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(scenario.id); }}
            className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50"
            title="Supprimer"
          >✕</button>
          <span className="text-slate-400 ml-1">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-5">
          {/* Name & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Nom du scénario</label>
              <input
                type="text"
                value={scenario.name}
                onChange={e => upd('name', e.target.value)}
                className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Description courte</label>
              <input
                type="text"
                value={scenario.description}
                onChange={e => upd('description', e.target.value)}
                className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Transaction & Funding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <SelectField label="Type de transaction" value={scenario.transactionType}
              options={TRANSACTION_TYPES} onChange={v => upd('transactionType', v)} />
            <SelectField label="Source de financement" value={scenario.fundingSource}
              options={FUNDING_SOURCES} onChange={v => upd('fundingSource', v)} />
            <SelectField label="Profil fiscal" value={scenario.taxProfile}
              options={TAX_PROFILES} onChange={v => upd('taxProfile', v)} />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <NumField label="Dette bancaire (€)" value={scenario.debtAmount} prefix="€"
              onChange={v => upd('debtAmount', v)} />
            <NumField label="Montant CCA (€)" value={scenario.ccaAmount} prefix="€"
              onChange={v => upd('ccaAmount', v)} />
          </div>

          {/* Ownership */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Ownership post-transaction (%)</p>
            <div className="flex flex-wrap gap-4">
              {[['you', 'Vous'], ['mother', 'Mère'], ['other', 'Autres']].map(([k, lbl]) => (
                <div key={k} className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">{lbl}</label>
                  <input
                    type="number"
                    step={0.01}
                    min={0}
                    max={100}
                    value={scenario.ownershipResult[k]}
                    onChange={e => updOwnership(k, Number(e.target.value))}
                    className="border border-slate-200 rounded px-2 py-1.5 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
              <div className="flex items-end pb-1">
                <span className="text-xs text-slate-400">
                  Total: {(
                    (scenario.ownershipResult.you || 0) +
                    (scenario.ownershipResult.mother || 0) +
                    (scenario.ownershipResult.other || 0)
                  ).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Toggles & Guarantees */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Usufruit / NP</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={scenario.usufruit}
                  onChange={e => upd('usufruit', e.target.checked)}
                  className="accent-blue-500" />
                <span className="text-sm">{scenario.usufruit ? 'Oui' : 'Non'}</span>
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Nantissement</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={scenario.nantissement}
                  onChange={e => upd('nantissement', e.target.checked)}
                  className="accent-blue-500" />
                <span className="text-sm">{scenario.nantissement ? 'Oui' : 'Non'}</span>
              </label>
            </div>
            <SelectField label="Package garanties" value={scenario.guaranteePackage}
              options={GUARANTEE_TYPES} onChange={v => upd('guaranteePackage', v)} />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Notes internes</label>
            <textarea
              value={scenario.notes}
              onChange={e => upd('notes', e.target.value)}
              rows={2}
              className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Scores preview */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Scores calculés (auto)</p>
            <div className="flex flex-wrap gap-2">
              {SCORE_DIMENSIONS.map(dim => (
                <div key={dim.key} className="flex flex-col items-center gap-0.5">
                  <ScoreBadge score={scores[dim.key]} />
                  <span className="text-[10px] text-slate-400 text-center w-16 leading-tight">{dim.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red flags */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Signaux d'alerte</p>
            <RedFlagBox flags={scenario.redFlags} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScenarioBuilder({ assumptions, scenarios, onUpdate, onAdd, onDelete, onDuplicate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Constructeur de scénarios</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {scenarios.length} scénario{scenarios.length !== 1 ? 's' : ''} — cliquez pour modifier
          </p>
        </div>
        <button
          onClick={onAdd}
          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
        >
          + Nouveau scénario
        </button>
      </div>

      {scenarios.map(scenario => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          assumptions={assumptions}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}
