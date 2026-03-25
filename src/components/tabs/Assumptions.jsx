import { useT } from '../../i18n/LanguageContext';
import SectionCard from '../layout/SectionCard';

const WEIGHT_KEYS = [
  'simplicity', 'fiscalClarity', 'upfrontCost', 'bankability',
  'executionSpeed', 'documentationBurden', 'familyControl', 'flexibility',
];

const DIM_I18N = {
  simplicity:          'dim.simplicity',
  fiscalClarity:       'dim.fiscal',
  upfrontCost:         'dim.cost',
  bankability:         'dim.bank',
  executionSpeed:      'dim.speed',
  documentationBurden: 'dim.docs',
  familyControl:       'dim.family',
  flexibility:         'dim.flex',
};

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">{label}</label>
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
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
      {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
    </div>
  );
}

function SelectInput({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    >
      {children}
    </select>
  );
}

export default function Assumptions({ assumptions, onUpdate }) {
  const { t } = useT();

  function set(key, value) { onUpdate({ ...assumptions, [key]: value }); }
  function setOwnership(who, value) {
    onUpdate({ ...assumptions, ownership: { ...assumptions.ownership, [who]: value } });
  }
  function setWeight(key, value) {
    onUpdate({ ...assumptions, scoringWeights: { ...assumptions.scoringWeights, [key]: value } });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Property & financing */}
        <SectionCard title={t('assum.prop.title')}>
          <div className="space-y-5">
            <Field label={t('assum.prop.value')}>
              <NumInput value={assumptions.propertyValue} prefix="€" step={1000}
                onChange={v => set('propertyValue', v)} />
            </Field>
            <Field label={t('assum.prop.rate')} hint={t('assum.prop.rate.hint')}>
              <NumInput value={assumptions.financingRate} suffix="%" step={0.1} min={0}
                onChange={v => set('financingRate', v)} />
            </Field>
            <Field label={t('assum.prop.duration')}>
              <NumInput value={assumptions.loanDuration} suffix={t('shared.years')} step={1} min={1}
                onChange={v => set('loanDuration', v)} />
            </Field>
            <Field label={t('assum.prop.ccaRate')} hint={t('assum.prop.ccaRate.hint')}>
              <NumInput value={assumptions.ccaInterestRate} suffix="%" step={0.1} min={0}
                onChange={v => set('ccaInterestRate', v)} />
            </Field>
          </div>
        </SectionCard>

        {/* Costs & tax */}
        <SectionCard title={t('assum.costs.title')}>
          <div className="space-y-5">
            <Field label={t('assum.costs.notary')} hint={t('assum.costs.notary.hint')}>
              <NumInput value={assumptions.notarialCostRate} suffix="%" step={0.1} min={0}
                onChange={v => set('notarialCostRate', v)} />
            </Field>
            <Field label={t('assum.costs.reg')} hint={t('assum.costs.reg.hint')}>
              <NumInput value={assumptions.registrationCostRate} suffix="%" step={0.1} min={0}
                onChange={v => set('registrationCostRate', v)} />
            </Field>
            <Field label={t('assum.costs.tax')}>
              <SelectInput value={assumptions.sciTaxRegime} onChange={v => set('sciTaxRegime', v)}>
                <option value="IS">{t('assum.costs.tax.is')}</option>
                <option value="IR">{t('assum.costs.tax.ir')}</option>
              </SelectInput>
            </Field>
          </div>
        </SectionCard>

        {/* Ownership & lender */}
        <SectionCard title={t('assum.own.title')}>
          <div className="space-y-5">
            <Field label={t('assum.own.you')}>
              <NumInput value={assumptions.ownership.you} suffix="%" step={0.01} min={0}
                onChange={v => setOwnership('you', v)} />
            </Field>
            <Field label={t('assum.own.mother')}>
              <NumInput value={assumptions.ownership.mother} suffix="%" step={0.01} min={0}
                onChange={v => setOwnership('mother', v)} />
            </Field>
            <Field label={t('assum.own.lender')} hint={t('assum.own.lender.hint')}>
              <SelectInput value={assumptions.lenderProfile} onChange={v => set('lenderProfile', v)}>
                <option value="standard">{t('assum.own.lender.std')}</option>
                <option value="non-resident-sensitive">{t('assum.own.lender.nres')}</option>
                <option value="conservative">{t('assum.own.lender.cons')}</option>
              </SelectInput>
            </Field>
          </div>
        </SectionCard>
      </div>

      {/* Scoring weights */}
      <SectionCard title={t('assum.weights.title')} subtitle={t('assum.weights.subtitle')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {WEIGHT_KEYS.map(key => (
            <Field key={key} label={t(DIM_I18N[key])}>
              <NumInput
                value={assumptions.scoringWeights[key]}
                step={0.1} min={0.1}
                onChange={v => setWeight(key, v)}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      <p className="text-xs text-slate-400 text-center">{t('assum.footer')}</p>
    </div>
  );
}
