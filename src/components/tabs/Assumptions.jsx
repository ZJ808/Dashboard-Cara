import SectionCard from '../layout/SectionCard';

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

function NumInput({ value, onChange, prefix, suffix, step = 1, min = 0 }) {
  return (
    <div className="flex items-center gap-1.5">
      {prefix && <span className="text-sm text-slate-400">{prefix}</span>}
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={e => onChange(Number(e.target.value))}
        className="border border-slate-200 rounded px-2 py-1 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
    </div>
  );
}

export default function Assumptions({ assumptions, onUpdate }) {
  function set(key, value) {
    onUpdate({ ...assumptions, [key]: value });
  }
  function setOwnership(who, value) {
    const other = who === 'you' ? assumptions.ownership.mother : assumptions.ownership.you;
    onUpdate({
      ...assumptions,
      ownership: { ...assumptions.ownership, [who]: value },
    });
  }
  function setWeight(key, value) {
    onUpdate({
      ...assumptions,
      scoringWeights: { ...assumptions.scoringWeights, [key]: value },
    });
  }

  const WEIGHT_LABELS = {
    simplicity:          'Simplicité',
    fiscalClarity:       'Clarté fiscale',
    upfrontCost:         'Coût initial',
    bankability:         'Bankabilité',
    executionSpeed:      'Rapidité d\'exécution',
    documentationBurden: 'Charge documentaire',
    familyControl:       'Contrôle familial',
    flexibility:         'Flexibilité long terme',
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Property & Financing */}
        <SectionCard title="Bien & financement">
          <div className="space-y-4">
            <Field label="Valeur du bien (€)">
              <NumInput value={assumptions.propertyValue} prefix="€" step={1000}
                onChange={v => set('propertyValue', v)} />
            </Field>
            <Field label="Taux de financement" hint="Taux d'intérêt annuel du crédit bancaire">
              <NumInput value={assumptions.financingRate} suffix="%" step={0.1} min={0}
                onChange={v => set('financingRate', v)} />
            </Field>
            <Field label="Durée du crédit">
              <NumInput value={assumptions.loanDuration} suffix="ans" step={1} min={1}
                onChange={v => set('loanDuration', v)} />
            </Field>
            <Field label="Taux rémunération CCA" hint="0% pour CCA familial standard">
              <NumInput value={assumptions.ccaInterestRate} suffix="%" step={0.1} min={0}
                onChange={v => set('ccaInterestRate', v)} />
            </Field>
          </div>
        </SectionCard>

        {/* Costs & Taxes */}
        <SectionCard title="Coûts & fiscalité">
          <div className="space-y-4">
            <Field label="Frais notariaux" hint="% du montant de transaction">
              <NumInput value={assumptions.notarialCostRate} suffix="%" step={0.1} min={0}
                onChange={v => set('notarialCostRate', v)} />
            </Field>
            <Field label="Droits d'enregistrement (cession)" hint="% — applicable si cession de parts">
              <NumInput value={assumptions.registrationCostRate} suffix="%" step={0.1} min={0}
                onChange={v => set('registrationCostRate', v)} />
            </Field>
            <Field label="Régime fiscal SCI">
              <select
                value={assumptions.sciTaxRegime}
                onChange={e => set('sciTaxRegime', e.target.value)}
                className="border border-slate-200 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="IS">SCI soumise à l'IS</option>
                <option value="IR">SCI soumise à l'IR</option>
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* Ownership & Lender */}
        <SectionCard title="Ownership actuelle & profil prêteur">
          <div className="space-y-4">
            <Field label="Part actuelle — Vous (%)">
              <NumInput value={assumptions.ownership.you} suffix="%" step={0.01} min={0}
                onChange={v => setOwnership('you', v)} />
            </Field>
            <Field label="Part actuelle — Mère (%)">
              <NumInput value={assumptions.ownership.mother} suffix="%" step={0.01} min={0}
                onChange={v => setOwnership('mother', v)} />
            </Field>
            <Field label="Profil prêteur" hint="Sensibilité du prêteur aux profils complexes">
              <select
                value={assumptions.lenderProfile}
                onChange={e => set('lenderProfile', e.target.value)}
                className="border border-slate-200 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="standard">Standard</option>
                <option value="non-resident-sensitive">Sensible non-résident</option>
                <option value="conservative">Conservateur</option>
              </select>
            </Field>
          </div>
        </SectionCard>
      </div>

      {/* Scoring Weights */}
      <SectionCard title="Pondérations des scores" subtitle="Ajustez l'importance relative de chaque dimension (0.5 – 2.0)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(WEIGHT_LABELS).map(([key, label]) => (
            <Field key={key} label={label}>
              <NumInput
                value={assumptions.scoringWeights[key]}
                step={0.1} min={0.1}
                onChange={v => setWeight(key, v)}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      <p className="text-xs text-slate-400">
        Les modifications d'hypothèses se propagent en temps réel à tous les scénarios.
      </p>
    </div>
  );
}
