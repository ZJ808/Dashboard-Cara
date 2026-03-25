import { useT } from '../../i18n/LanguageContext';
import SectionCard from '../layout/SectionCard';
import RedFlagBox from '../shared/RedFlagBox';

// Risk category items — bilingual arrays
const RISK_CATEGORIES = [
  {
    catKey: 'risks.cat.legal',
    color:  'border-violet-200 bg-violet-50',
    hColor: 'text-violet-800',
    items: [
      { fr: 'Validité de la structure OBO au regard du droit des sociétés',           en: 'Validity of the OBO structure under company law' },
      { fr: 'Conformité des statuts SCI avec l\'opération envisagée',                 en: 'Compliance of SCI articles with the intended transaction' },
      { fr: 'Risque de nullité si cession sous-évaluée (inopposabilité)',              en: 'Risk of nullity if share transfer is undervalued' },
      { fr: 'Impact sur les droits de la mère en cas de restructuration',             en: 'Impact on the mother\'s rights in case of restructuring' },
      { fr: 'Risque de requalification CCA en capital si mal documenté',              en: 'CCA recharacterisation risk as capital if poorly documented' },
    ],
  },
  {
    catKey: 'risks.cat.tax',
    color:  'border-amber-200 bg-amber-50',
    hColor: 'text-amber-800',
    items: [
      { fr: 'Traitement fiscal du CCA selon taux appliqué',                           en: 'Tax treatment of CCA depending on rate applied' },
      { fr: 'Plus-value éventuelle sur cession de parts',                             en: 'Potential capital gain on share transfer' },
      { fr: 'SCI IS vs IR : impact sur déductibilité des intérêts',                  en: 'SCI IS vs IR: impact on interest deductibility' },
      { fr: 'Droits d\'enregistrement sur cession de parts SCI',                     en: 'Registration duties on SCI share transfer' },
      { fr: 'Contentieux fiscal existant et impact sur le dossier',                   en: 'Existing tax dispute and impact on the file' },
      { fr: 'Traitement usufruit / nue-propriété si démembrement retenu',             en: 'Usufruit / bare ownership treatment if dismemberment adopted' },
    ],
  },
  {
    catKey: 'risks.cat.lender',
    color:  'border-blue-200 bg-blue-50',
    hColor: 'text-blue-800',
    items: [
      { fr: 'Profil non-résident : exigences renforcées selon établissement',         en: 'Non-resident profile: stricter requirements depending on lender' },
      { fr: 'Structure OBO perçue comme complexe par les comités de crédit',          en: 'OBO structure perceived as complex by credit committees' },
      { fr: 'CCA visible au bilan SCI peut inquiéter le prêteur',                    en: 'CCA visible on SCI balance sheet may concern lenders' },
      { fr: 'Contentieux fiscal actif = signal d\'alerte bancaire',                  en: 'Active tax dispute = banking red flag' },
      { fr: 'Nantissement insuffisant si valeur bien non actualisée',                 en: 'Insufficient pledge if property value not updated' },
      { fr: 'Délais d\'instruction longs si dossier incomplet',                      en: 'Long processing delays if file is incomplete' },
    ],
  },
  {
    catKey: 'risks.cat.governance',
    color:  'border-emerald-200 bg-emerald-50',
    hColor: 'text-emerald-800',
    items: [
      { fr: 'Accord de la mère requis si sa part est modifiée',                       en: 'Mother\'s consent required if her share is modified' },
      { fr: 'Quorum AG à vérifier pour approuver la transaction',                     en: 'AGM quorum to verify for transaction approval' },
      { fr: 'Transmission future : impact sur droits de succession',                  en: 'Future transmission: impact on succession rights' },
      { fr: 'Usufruit peut créer des conflits d\'intérêt entre propriétaires',        en: 'Usufruit may create conflicts between bare owner and usufructuary' },
      { fr: 'Rôle de gérant SCI à clarifier post-opération',                         en: 'SCI manager role to be clarified post-transaction' },
    ],
  },
  {
    catKey: 'risks.cat.execution',
    color:  'border-red-200 bg-red-50',
    hColor: 'text-red-800',
    items: [
      { fr: 'Disponibilité du notaire et délais de rédaction des actes',              en: 'Notary availability and deed drafting lead times' },
      { fr: 'Documents manquants ou à actualiser (valorisation, statuts)',            en: 'Missing or outdated documents (valuation, articles)' },
      { fr: 'Délai d\'instruction bancaire : 6–12 semaines selon établissement',     en: 'Bank processing time: 6–12 weeks depending on lender' },
      { fr: 'Contentieux fiscal : risque de blocage si non soldé',                   en: 'Tax dispute: risk of blocking if unresolved' },
      { fr: 'Accord de tous les associés requis pour certaines opérations',           en: 'All associates\' consent required for certain transactions' },
      { fr: 'Dépôt et publication des modifications statutaires',                     en: 'Filing and publication of statutory changes' },
    ],
  },
];

export default function RisksBlockers({ scenarios }) {
  const { t, lang, tf } = useT();

  return (
    <div className="space-y-5">
      {/* Risk category grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RISK_CATEGORIES.map(cat => (
          <div key={cat.catKey} className={`rounded-xl border p-5 ${cat.color}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${cat.hColor}`}>
              {t(cat.catKey)}
            </h3>
            <ul className="space-y-1.5">
              {cat.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="mt-0.5 shrink-0 text-slate-400">•</span>
                  <span>{lang === 'en' ? item.en : item.fr}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Per-scenario red flags */}
      <SectionCard title={t('risks.scenario.title')} subtitle={t('risks.scenario.subtitle')}>
        <div className="space-y-4">
          {scenarios.map(scenario => {
            const name = typeof scenario.name === 'object' ? tf(scenario.name) : scenario.name;
            const desc = typeof scenario.description === 'object' ? tf(scenario.description) : scenario.description;
            const notes = typeof scenario.notes === 'object' ? tf(scenario.notes) : scenario.notes;
            return (
              <div key={scenario.id} className="border border-slate-100 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 mb-0.5">{name}</p>
                    {desc && <p className="text-xs text-slate-400 mb-3">{desc}</p>}
                    <RedFlagBox flags={scenario.redFlags} />
                  </div>
                  <div className="shrink-0 text-right space-y-2">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wide">{t('risks.usufruit.label')}</div>
                      <div className={`text-xs font-semibold mt-0.5 ${scenario.usufruit ? 'text-amber-600' : 'text-slate-400'}`}>
                        {scenario.usufruit ? t('risks.yes.warn') : t('risks.no')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wide">{t('risks.nantiss.label')}</div>
                      <div className={`text-xs font-semibold mt-0.5 ${scenario.nantissement ? 'text-emerald-600' : 'text-red-400'}`}>
                        {scenario.nantissement ? t('risks.yes.ok') : t('risks.no')}
                      </div>
                    </div>
                  </div>
                </div>
                {notes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 italic">{notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Cross-cutting alerts */}
      <SectionCard title={t('risks.cross.title')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            ['risks.cross.tax.title',  'risks.cross.tax.body'],
            ['risks.cross.nres.title', 'risks.cross.nres.body'],
            ['risks.cross.time.title', 'risks.cross.time.body'],
            ['risks.cross.cca.title',  'risks.cross.cca.body'],
          ].map(([titleKey, bodyKey]) => (
            <div key={titleKey}>
              <p className="text-xs font-semibold text-slate-900 mb-1.5">{t(titleKey)}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{t(bodyKey)}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
