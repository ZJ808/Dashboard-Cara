import { useState } from 'react';
import { useT } from '../../i18n/LanguageContext';
import SectionCard from '../layout/SectionCard';
import { DOCUMENT_STATUSES } from '../../data/documents';

function statusMeta(value) {
  return DOCUMENT_STATUSES.find(s => s.value === value) ?? DOCUMENT_STATUSES[3];
}

function CriticalBadge({ critical, t }) {
  if (!critical) return null;
  const map = {
    bank:   { key: 'docs.crit.bank',   cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    notary: { key: 'docs.crit.notary', cls: 'bg-violet-50 text-violet-600 border-violet-200' },
    both:   { key: 'docs.crit.both',   cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };
  const m = map[critical];
  if (!m) return null;
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${m.cls}`}>
      {t(m.key)}
    </span>
  );
}

const TH = ({ children }) => (
  <th className="py-3 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 text-left">
    {children}
  </th>
);

export default function Documents({ scenarios, documents, onUpdateDocument }) {
  const { t, lang, tf } = useT();
  const [filterScenario, setFilterScenario] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = documents.filter(doc => {
    const matchScenario = filterScenario === 'all' || doc.requiredFor.includes(filterScenario);
    const matchStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchScenario && matchStatus;
  });

  const counts = DOCUMENT_STATUSES.reduce((acc, s) => {
    acc[s.value] = documents.filter(d => d.status === s.value).length;
    return acc;
  }, {});

  const countText = filtered.length === 1 ? t('docs.count.one') : t('docs.count.many').replace('{n}', filtered.length);

  return (
    <div className="space-y-5">
      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DOCUMENT_STATUSES.map(s => (
          <div key={s.value} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{counts[s.value] ?? 0}</div>
            <div className={`text-xs mt-1.5 px-2 py-0.5 rounded inline-block font-medium ${s.color}`}>
              {lang === 'en' ? s.labelEn : s.labelFr}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('docs.filter.scenario')}</label>
          <select
            value={filterScenario}
            onChange={e => setFilterScenario(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
          >
            <option value="all">{t('docs.filter.all')}</option>
            {scenarios.map(s => {
              const name = typeof s.name === 'object' ? tf(s.name) : s.name;
              return <option key={s.id} value={s.id}>{name}</option>;
            })}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('docs.filter.status')}</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
          >
            <option value="all">{t('docs.filter.all')}</option>
            {DOCUMENT_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{lang === 'en' ? s.labelEn : s.labelFr}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-400">{countText}</span>
      </div>

      {/* Document table */}
      <SectionCard title={t('docs.table.title')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <TH>{t('docs.col.document')}</TH>
                <TH>{t('docs.col.status')}</TH>
                <TH>{t('docs.col.critical')}</TH>
                <TH>{t('docs.col.scenarios')}</TH>
                <TH>{t('docs.col.notes')}</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const meta = statusMeta(doc.status);
                const name = typeof doc.name === 'object' ? tf(doc.name) : doc.name;
                const desc = typeof doc.description === 'object' ? tf(doc.description) : doc.description;
                const notes = typeof doc.notes === 'object' ? tf(doc.notes) : doc.notes;
                return (
                  <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="text-sm font-semibold text-slate-900">{name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={doc.status}
                        onChange={e => onUpdateDocument(doc.id, { status: e.target.value })}
                        className={`text-xs px-2 py-1 rounded border-0 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${meta.color}`}
                      >
                        {DOCUMENT_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>
                            {lang === 'en' ? s.labelEn : s.labelFr}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <CriticalBadge critical={doc.critical} t={t} />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {doc.requiredFor.map(sid => {
                          const s = scenarios.find(sc => sc.id === sid);
                          if (!s) return null;
                          const sName = typeof s.name === 'object' ? tf(s.name) : s.name;
                          return (
                            <span key={sid} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                              {sName}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400 max-w-[200px]">
                      <input
                        type="text"
                        value={notes}
                        onChange={e => onUpdateDocument(doc.id, { notes: e.target.value })}
                        className="w-full bg-transparent text-xs focus:outline-none focus:bg-white focus:border focus:border-slate-200 focus:rounded-lg px-2 py-1 transition"
                        placeholder={t('docs.notes.placeholder')}
                      />
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
