import SectionCard from '../layout/SectionCard';
import RedFlagBox from '../shared/RedFlagBox';

const RISK_CATEGORIES = [
  {
    key: 'legal',
    label: 'Risque juridique',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    items: [
      'Validité de la structure OBO au regard du droit des sociétés',
      'Conformité des statuts SCI avec l\'opération envisagée',
      'Risque de nullité si cession sous-évaluée (inopposabilité)',
      'Impact sur les droits de la mère en cas de restructuration',
      'Risque de requalification CCA en capital si mal documenté',
    ],
  },
  {
    key: 'tax',
    label: 'Incertitude fiscale',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    items: [
      'Traitement fiscal du CCA selon taux appliqué',
      'Plus-value éventuelle sur cession de parts',
      'SCI IS vs IR : impact sur déductibilité intérêts',
      'Droits d\'enregistrement sur cession de parts SCI',
      'Contentieux fiscal existant et impact sur le dossier',
      'Traitement usufruit / nue-propriété si démembrement retenu',
    ],
  },
  {
    key: 'lender',
    label: 'Sensibilité prêteur',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    items: [
      'Profil non-résident : exigences renforcées selon établissement',
      'Structure OBO perçue comme complexe par les comités de crédit',
      'CCA visible au bilan SCI peut inquiéter le prêteur',
      'Contentieux fiscal actif = signal d\'alerte bancaire',
      'Nantissement insuffisant si valeur bien non actualisée',
      'Délais d\'instruction longs si dossier incomplet',
    ],
  },
  {
    key: 'governance',
    label: 'Complexité familiale / gouvernance',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    items: [
      'Accord de la mère requis si sa part est modifiée',
      'Quorum AG à vérifier pour approuver la transaction',
      'Transmission future : impact sur droits de succession',
      'Usufruit peut créer des conflits d\'intérêt entre nue-propriétaire et usufruitier',
      'Rôle de gérant SCI à clarifier post-opération',
    ],
  },
  {
    key: 'execution',
    label: 'Points de blocage exécution',
    color: 'text-red-700 bg-red-50 border-red-200',
    items: [
      'Disponibilité du notaire et délais de rédaction des actes',
      'Documents manquants ou à actualiser (valorisation, statuts)',
      'Délai d\'instruction bancaire : 6–12 semaines selon établissement',
      'Contentieux fiscal : risque de blocage si non soldé',
      'Accord de tous les associés requis pour certaines opérations',
      'Dépôt et publication des modifications statutaires',
    ],
  },
];

export default function RisksBlockers({ scenarios }) {
  return (
    <div className="space-y-5">
      {/* Global risk categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RISK_CATEGORIES.map(cat => (
          <div key={cat.key} className={`rounded-lg border p-4 ${cat.color}`}>
            <h3 className="text-xs font-semibold mb-2">{cat.label}</h3>
            <ul className="space-y-1">
              {cat.items.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Per-scenario red flags */}
      <SectionCard title="Signaux d'alerte par scénario" subtitle="Signaux spécifiques identifiés pour chaque option">
        <div className="space-y-4">
          {scenarios.map(scenario => (
            <div key={scenario.id} className="border border-slate-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 mb-1">{scenario.name}</p>
                  <p className="text-xs text-slate-400 mb-3">{scenario.description}</p>
                  <RedFlagBox flags={scenario.redFlags} />
                </div>
                <div className="shrink-0 text-right space-y-1">
                  <div className="text-xs text-slate-400">Usufruit</div>
                  <div className={`text-xs font-medium ${scenario.usufruit ? 'text-amber-600' : 'text-slate-400'}`}>
                    {scenario.usufruit ? 'Oui ⚠' : 'Non'}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">Nantissement</div>
                  <div className={`text-xs font-medium ${scenario.nantissement ? 'text-emerald-600' : 'text-red-400'}`}>
                    {scenario.nantissement ? 'Oui ✓' : 'Non'}
                  </div>
                </div>
              </div>
              {scenario.notes && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 italic">{scenario.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Points de vigilance transversaux">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-700 mb-1">Contentieux fiscal</p>
            <p>Un contentieux fiscal actif est un signal d'alerte majeur pour le dossier bancaire. Documenter l'état, le montant en litige, et le risque résiduel dans le mémo de financement.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700 mb-1">Profil non-résident</p>
            <p>Certains établissements appliquent des critères renforcés ou exigent des garanties supplémentaires. Cibler les banques avec expérience en montages SCI OBO pour profils non-résidents.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700 mb-1">Timing des actes</p>
            <p>Ne pas sous-estimer le délai notarial (4–8 semaines minimum). Préparer tous les documents en parallèle pour éviter les blocages en série.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700 mb-1">Compte courant d'associé</p>
            <p>Le CCA doit être formalisé par une convention écrite, avec un taux conforme (taux légal ou taux de marché selon choix fiscal). Un CCA mal documenté risque d'être requalifié.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
