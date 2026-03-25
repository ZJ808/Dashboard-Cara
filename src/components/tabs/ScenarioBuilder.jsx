import { useState } from 'react';
import { useT } from '../../i18n/LanguageContext';
import RedFlagBox from '../shared/RedFlagBox';
import ScoreBadge from '../shared/ScoreBadge';
import { calculateScores, calculateWeightedScore, SCORE_DIMENSIONS, dimLabel } from '../../data/scoring';
import { TRANSACTION_TYPES, FUNDING_SOURCES, GUARANTEE_TYPES, TAX_PROFILES, optLabel } from '../../data/scenarios';

function SelectField({ label, value, options, lang, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{optLabel(o, lang)}</option>
        ))}
      </select>
    </div>
  );
}

function NumField({ label, value, prefix, suffix, step = 1000, min = 0, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-xs text-slate-400">{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={e => onChange(Number(e.target.value))}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, assumptions, lang, t, tf, onUpdate, onDelete, onDuplicate }) {
  const [expanded, setExpanded] = useState(false);
  const scores = calculateScores(scenario, assumptions);
  const weighted = calculateWeightedScore(scores, assumptions.scoringWeights);
  const displayName = typeof scenario.name === 'object' ? tf(scenario.name) : scenario.name;

  function upd(key, value) { onUpdate(scenario.id, { [key]: value }); }
  function updOwnership(who, value) {
    onUpdate(scenario.id, { ownershipResult: { ...scenario.ownershipResult, [who]: value } });
  }

  const weightedColor = weighted >= 4
    ? 'bg-emerald-100 text-emerald-700'
    : weighted >= 3
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Collapsed header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-900">{displayName}</span>
            {typeof scenario.description === 'object'
              ? <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-xs">{tf(scenario.description)}</span>
              : scenario.description
              ? <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-xs">{scenario.description}</span>
              : null
            }
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-slate-500">
              {t('sb.label.debt')} <span className="font-medium text-slate-700">€{scenario.debtAmount.toLocaleString('fr-FR')}</span>
            </span>
            {scenario.ccaAmount > 0 && (
              <span className="text-xs text-slate-500">
                {t('sb.label.cca')} <span className="font-medium text-slate-700">€{scenario.ccaAmount.toLocaleString('fr-FR')}</span>
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${weightedColor}`}>
              {t('sb.label.score')} {weighted}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onDuplicate(scenario.id); }}
            className="text-xs text-slate-400 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            title={t('sb.duplicate')}
          >⊕</button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(scenario.id); }}
            className="text-xs text-slate-400 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title={t('sb.delete')}
          >✕</button>
          <span className="text-slate-400 ml-1 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-6 bg-slate-50/40">

          {/* Name & description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{t('sb.field.name')}</label>
              <input
                type="text"
                value={displayName}
                onChange={e => upd('name', e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{t('sb.field.desc')}</label>
              <input
                type="text"
                value={typeof scenario.description === 'object' ? tf(scenario.description) : scenario.description}
                onChange={e => upd('description', e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Transaction, funding, tax */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField label={t('sb.field.txType')} value={scenario.transactionType}
              options={TRANSACTION_TYPES} lang={lang} onChange={v => upd('transactionType', v)} />
            <SelectField label={t('sb.field.funding')} value={scenario.fundingSource}
              options={FUNDING_SOURCES} lang={lang} onChange={v => upd('fundingSource', v)} />
            <SelectField label={t('sb.field.tax')} value={scenario.taxProfile}
              options={TAX_PROFILES} lang={lang} onChange={v => upd('taxProfile', v)} />
          </div>

          {/* Amounts */}
          <div className="flex flex-wrap gap-5">
            <NumField label={t('sb.field.debt')} value={scenario.debtAmount} prefix="€"
              onChange={v => upd('debtAmount', v)} />
            <NumField label={t('sb.field.cca')} value={scenario.ccaAmount} prefix="€"
              onChange={v => upd('ccaAmount', v)} />
          </div>

          {/* Ownership */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-3">{t('sb.field.ownership')}</p>
            <div className="flex flex-wrap gap-5">
              {[['you', t('sb.field.you')], ['mother', t('sb.field.mother')], ['other', t('sb.field.other')]].map(([k, lbl]) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500">{lbl}</label>
                  <input
                    type="number" step={0.01} min={0} max={100}
                    value={scenario.ownershipResult[k]}
                    onChange={e => updOwnership(k, Number(e.target.value))}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-24 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              ))}
              <div className="flex items-end pb-1">
                <span className="text-xs text-slate-400">
                  {t('sb.field.total')} {(
                    (scenario.ownershipResult.you || 0) +
                    (scenario.ownershipResult.mother || 0) +
                    (scenario.ownershipResult.other || 0)
                  ).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Toggles & guarantees */}
          <div className="flex flex-wrap gap-6">
            {[
              ['usufruit', t('sb.field.usufruit')],
              ['nantissement', t('sb.field.nantiss')],
            ].map(([key, label]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={scenario[key]}
                    onChange={e => upd(key, e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-sm text-slate-700">{scenario[key] ? t('sb.yes') : t('sb.no')}</span>
                </label>
              </div>
            ))}
            <SelectField label={t('sb.field.guarantee')} value={scenario.guaranteePackage}
              options={GUARANTEE_TYPES} lang={lang} onChange={v => upd('guaranteePackage', v)} />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{t('sb.field.notes')}</label>
            <textarea
              value={typeof scenario.notes === 'object' ? tf(scenario.notes) : scenario.notes}
              onChange={e => upd('notes', e.target.value)}
              rows={2}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
            />
          </div>

          {/* Auto-scores */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-3">{t('sb.field.scores')}</p>
            <div className="flex flex-wrap gap-3">
              {SCORE_DIMENSIONS.map(dim => (
                <div key={dim.key} className="flex flex-col items-center gap-1">
                  <ScoreBadge score={scores[dim.key]} />
                  <span className="text-[10px] text-slate-400 text-center w-16 leading-tight">{dimLabel(dim, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red flags */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">{t('sb.field.redflags')}</p>
            <RedFlagBox flags={scenario.redFlags} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScenarioBuilder({ assumptions, scenarios, onUpdate, onAdd, onDelete, onDuplicate }) {
  const { t, lang, tf } = useT();
  const count = scenarios.length;
  const subtitle = count === 1 ? t('sb.subtitle.one') : t('sb.subtitle.many').replace('{n}', count);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{t('sb.title')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={onAdd}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          {t('sb.addBtn')}
        </button>
      </div>

      {scenarios.map(scenario => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          assumptions={assumptions}
          lang={lang}
          t={t}
          tf={tf}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}
