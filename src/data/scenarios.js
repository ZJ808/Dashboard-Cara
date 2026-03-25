// Transaction type options
export const TRANSACTION_TYPES = [
  { value: 'obo', label: 'OBO (Rachat par SCI)' },
  { value: 'obo_cca', label: 'OBO + Compte Courant d\'Associé' },
  { value: 'cession', label: 'Cession pure' },
  { value: 'cession_cca', label: 'Cession + CCA' },
  { value: 'hybrid', label: 'Cession + OBO hybride' },
  { value: 'personal_injection', label: 'Emprunt personnel → Apport SCI' },
];

export const FUNDING_SOURCES = [
  { value: 'bank_only', label: '100% dette bancaire' },
  { value: 'bank_cca', label: 'Dette bancaire + CCA' },
  { value: 'family_debt', label: 'Contribution familiale + dette' },
  { value: 'staged', label: 'Apport progressif' },
  { value: 'personal_loan', label: 'Emprunt personnel puis injection' },
];

export const GUARANTEE_TYPES = [
  { value: 'standard', label: 'Nantissement standard' },
  { value: 'reinforced', label: 'Package renforcé' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'personal', label: 'Caution personnelle' },
];

export const TAX_PROFILES = [
  { value: 'sci_is_baseline', label: 'SCI IS — Baseline' },
  { value: 'sci_is_cca', label: 'SCI IS + implications CCA' },
  { value: 'cession_tax', label: 'Fiscalité cession applicable' },
  { value: 'usufruit', label: 'Usufruit / nue-propriété' },
  { value: 'mixed', label: 'Mixte (IS + cession)' },
];

// Pre-built base scenarios from the brief
export const defaultScenarios = [
  {
    id: 's1',
    name: 'OBO Base',
    description: 'OBO pur — dette bancaire uniquement, ownership inchangée',
    transactionType: 'obo',
    debtAmount: 550000,
    ccaAmount: 0,
    fundingSource: 'bank_only',
    ownershipResult: { you: 83.33, mother: 16.67, other: 0 },
    usufruit: false,
    nantissement: true,
    guaranteePackage: 'standard',
    taxProfile: 'sci_is_baseline',
    notes: 'Structure la plus simple. Pas de CCA. Ownership non modifiée.',
    redFlags: [
      'Bankabilité dépend du profil non-résident',
      'Pas de levier familial supplémentaire',
      'Montant intégral à financer via banque',
    ],
    manualScores: null, // null = auto-calculate
  },
  {
    id: 's2',
    name: 'OBO + CCA (1/6)',
    description: 'OBO avec compte courant d\'associé correspondant à la part de la mère (1/6)',
    transactionType: 'obo_cca',
    debtAmount: 550000,
    ccaAmount: 91667, // ~1/6 of 550k
    fundingSource: 'bank_cca',
    ownershipResult: { you: 83.33, mother: 16.67, other: 0 },
    usufruit: false,
    nantissement: true,
    guaranteePackage: 'reinforced',
    taxProfile: 'sci_is_cca',
    notes: 'CCA permet de réduire la dépendance bancaire. Package de garanties renforcé requis.',
    redFlags: [
      'Traitement fiscal du CCA à valider',
      'Documentation supplémentaire pour le CCA',
      'Risque de requalification si taux non conforme',
    ],
    manualScores: null,
  },
  {
    id: 's3',
    name: 'Cession + OBO Hybride',
    description: 'Cession partielle + restructuration OBO, contribution personnelle, répartition familiale révisée',
    transactionType: 'hybrid',
    debtAmount: 400000,
    ccaAmount: 80000,
    fundingSource: 'family_debt',
    ownershipResult: { you: 70, mother: 20, other: 10 },
    usufruit: true,
    nantissement: true,
    guaranteePackage: 'reinforced',
    taxProfile: 'mixed',
    notes: 'Structure complexe mais potentiellement optimisée pour transmission familiale.',
    redFlags: [
      'Complexité notariale élevée',
      'Risque fiscal sur la cession',
      'Usufruit crée des complications bancaires',
      'Timeline plus longue',
      'Contentieux fiscal potentiel à gérer en parallèle',
    ],
    manualScores: null,
  },
  {
    id: 's4',
    name: 'Emprunt Personnel → Apport',
    description: 'Emprunt personnel hors SCI puis injection dans la SCI comme apport en capital',
    transactionType: 'personal_injection',
    debtAmount: 0,
    ccaAmount: 550000,
    fundingSource: 'personal_loan',
    ownershipResult: { you: 83.33, mother: 16.67, other: 0 },
    usufruit: false,
    nantissement: false,
    guaranteePackage: 'personal',
    taxProfile: 'sci_is_baseline',
    notes: 'Évite la structure OBO formelle. Dépend de la capacité d\'emprunt personnelle.',
    redFlags: [
      'Capacité d\'emprunt personnel limitante',
      'Pas de nantissement SCI pour la banque',
      'Traitement fiscal de l\'apport à valider',
      'Peut être perçu comme contournement OBO',
    ],
    manualScores: null,
  },
  {
    id: 's5',
    name: 'Cession + CCA',
    description: 'Cession directe avec financement via compte courant d\'associé',
    transactionType: 'cession_cca',
    debtAmount: 300000,
    ccaAmount: 200000,
    fundingSource: 'bank_cca',
    ownershipResult: { you: 83.33, mother: 16.67, other: 0 },
    usufruit: false,
    nantissement: true,
    guaranteePackage: 'standard',
    taxProfile: 'cession_tax',
    notes: 'Cession avec levier CCA pour réduire la dette bancaire.',
    redFlags: [
      'Droits d\'enregistrement sur la cession',
      'Plus-value potentielle imposable',
      'Traitement CCA post-cession complexe',
    ],
    manualScores: null,
  },
];

export function createBlankScenario(id) {
  return {
    id,
    name: 'Nouveau scénario',
    description: '',
    transactionType: 'obo',
    debtAmount: 550000,
    ccaAmount: 0,
    fundingSource: 'bank_only',
    ownershipResult: { you: 83.33, mother: 16.67, other: 0 },
    usufruit: false,
    nantissement: true,
    guaranteePackage: 'standard',
    taxProfile: 'sci_is_baseline',
    notes: '',
    redFlags: [],
    manualScores: null,
  };
}
