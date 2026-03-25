import { useState } from 'react';
import SectionCard from '../layout/SectionCard';
import { DOCUMENT_STATUSES } from '../../data/documents';

function statusMeta(value) {
  return DOCUMENT_STATUSES.find(s => s.value === value) ?? DOCUMENT_STATUSES[3];
}

function CriticalBadge({ critical }) {
  if (!critical) return null;
  const map = {
    bank:   { label: '🏦 Banque',  cls: 'bg-blue-50 text-blue-600 border border-blue-200' },
    notary: { label: '⚖️ Notaire', cls: 'bg-purple-50 text-purple-600 border border-purple-200' },
    both:   { label: '🏦 + ⚖️',    cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  };
  const m = map[critical];
  if (!m) return null;
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${m.cls}`}>{m.label}</span>;
}

export default function Documents({ scenarios, documents, onUpdateDocument }) {
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

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DOCUMENT_STATUSES.map(s => (
          <div key={s.value} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-slate-800">{counts[s.value] ?? 0}</div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${s.color}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Scénario :</label>
          <select
            value={filterScenario}
            onChange={e => setFilterScenario(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">Tous</option>
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Statut :</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">Tous</option>
            {DOCUMENT_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-400">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <SectionCard title="Liste des documents requis">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 font-semibold text-slate-500 min-w-[200px]">Document</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-500">Statut</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-500">Critique pour</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-500">Scénarios</th>
                <th className="text-left py-2 font-semibold text-slate-500">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const meta = statusMeta(doc.status);
                return (
                  <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 pr-4">
                      <div className="font-medium text-slate-800">{doc.name}</div>
                      <div className="text-slate-400 mt-0.5">{doc.description}</div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <select
                        value={doc.status}
                        onChange={e => onUpdateDocument(doc.id, { status: e.target.value })}
                        className={`text-xs px-1.5 py-0.5 rounded border-0 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${meta.color}`}
                      >
                        {DOCUMENT_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 pr-4">
                      <CriticalBadge critical={doc.critical} />
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {doc.requiredFor.map(sid => {
                          const s = scenarios.find(sc => sc.id === sid);
                          return s ? (
                            <span key={sid} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                              {s.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-400 max-w-[200px]">
                      <input
                        type="text"
                        value={doc.notes}
                        onChange={e => onUpdateDocument(doc.id, { notes: e.target.value })}
                        className="w-full bg-transparent border-none text-xs focus:outline-none focus:bg-white focus:border focus:border-slate-200 focus:rounded px-1 py-0.5"
                        placeholder="Ajouter note…"
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
