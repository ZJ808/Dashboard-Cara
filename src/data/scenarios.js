// Transaction type options
export const TRANSACTION_TYPES = [
  { value: 'obo',                labelFr: 'OBO (Rachat par SCI)',                    labelEn: 'OBO (Buy-out via SCI)' },
  { value: 'obo_cca',            labelFr: 'OBO + Compte Courant d\'Associé',         labelEn: 'OBO + Associate Current Account' },
  { value: 'cession',            labelFr: 'Cession pure',                            labelEn: 'Pure share transfer' },
  { value: 'cession_cca',        labelFr: 'Cession + CCA',                           labelEn: 'Share transfer + CCA' },
  { value: 'hybrid',             labelFr: 'Cession + OBO hybride',                   labelEn: 'Hybrid transfer + OBO' },
  { value: 'personal_injection', labelFr: 'Emprunt personnel → Apport SCI',          labelEn: 'Personal loan → Capital injection' },
];

export const FUNDING_SOURCES = [
  { value: 'bank_only',     labelFr: '100% dette bancaire',             labelEn: '100% bank debt' },
  { value: 'bank_cca',      labelFr: 'Dette bancaire + CCA',            labelEn: 'Bank debt + CCA' },
  { value: 'family_debt',   labelFr: 'Contribution familiale + dette',  labelEn: 'Family contribution + debt' },
  { value: 'staged',        labelFr: 'Apport progressif',               labelEn: 'Staged contribution' },
  { value: 'personal_loan', labelFr: 'Emprunt personnel puis injection',labelEn: 'Personal loan then injection' },
];

export const GUARANTEE_TYPES = [
  { value: 'standard',   labelFr: 'Nantissement standard',  labelEn: 'Standard pledge' },
  { value: 'reinforced', labelFr: 'Package renforcé',       labelEn: 'Reinforced package' },
  { value: 'minimal',    labelFr: 'Minimal',                labelEn: 'Minimal' },
  { value: 'personal',   labelFr: 'Caution personnelle',    labelEn: 'Personal guarantee' },
];

export const TAX_PROFILES = [
  { value: 'sci_is_baseline', labelFr: 'SCI IS — Baseline',              labelEn: 'SCI IS — Baseline' },
  { value: 'sci_is_cca',      labelFr: 'SCI IS + implications CCA',      labelEn: 'SCI IS + CCA implications' },
  { value: 'cession_tax',     labelFr: 'Fiscalité cession applicable',   labelEn: 'Share transfer tax applicable' },
  { value: 'usufruit',        labelFr: 'Usufruit / nue-propriété',       labelEn: 'Usufruit / bare ownership' },
  { value: 'mixed',           labelFr: 'Mixte (IS + cession)',           labelEn: 'Mixed (IS + transfer)' },
];

// Helper: get label in active language
export function optLabel(opt, lang) {
  return lang === 'en' ? opt.labelEn : opt.labelFr;
}

// Pre-built base scenarios — all translatable text fields are { fr, en } objects
export const defaultScenarios = [
  {
    id: 's1',
    name:        { fr: 'OBO Base',              en: 'OBO Base' },
    description: {
      fr: 'OBO pur — dette bancaire uniquement, ownership inchangée',
      en: 'Pure OBO — bank debt only, ownership unchanged',
    },
    transactionType:  'obo',
    debtAmount:       550000,
    ccaAmount:        0,
    fundingSource:    'bank_only',
    ownershipResult:  { you: 83.33, mother: 16.67, other: 0 },
    usufruit:         false,
    nantissement:     true,
    guaranteePackage: 'standard',
    taxProfile:       'sci_is_baseline',
    notes: {
      fr: 'Structure la plus simple. Pas de CCA. Ownership non modifiée.',
      en: 'Simplest structure. No CCA. Ownership unchanged.',
    },
    redFlags: [
      { fr: 'Bankabilité dépend du profil non-résident',    en: 'Bankability depends on non-resident profile' },
      { fr: 'Pas de levier familial supplémentaire',         en: 'No additional family leverage' },
      { fr: 'Montant intégral à financer via banque',        en: 'Full amount must be financed through the bank' },
    ],
    manualScores: null,
  },
  {
    id: 's2',
    name:        { fr: 'OBO + CCA (1/6)',    en: 'OBO + CCA (1/6)' },
    description: {
      fr: 'OBO avec compte courant d\'associé correspondant à la part de la mère (1/6)',
      en: 'OBO with associate current account matching the mother\'s share (1/6)',
    },
    transactionType:  'obo_cca',
    debtAmount:       550000,
    ccaAmount:        91667,
    fundingSource:    'bank_cca',
    ownershipResult:  { you: 83.33, mother: 16.67, other: 0 },
    usufruit:         false,
    nantissement:     true,
    guaranteePackage: 'reinforced',
    taxProfile:       'sci_is_cca',
    notes: {
      fr: 'CCA permet de réduire la dépendance bancaire. Package de garanties renforcé requis.',
      en: 'CCA reduces bank dependency. Reinforced guarantee package required.',
    },
    redFlags: [
      { fr: 'Traitement fiscal du CCA à valider',                en: 'Tax treatment of CCA to be validated' },
      { fr: 'Documentation supplémentaire pour le CCA',          en: 'Additional documentation required for CCA' },
      { fr: 'Risque de requalification si taux non conforme',    en: 'Recharacterisation risk if rate is non-compliant' },
    ],
    manualScores: null,
  },
  {
    id: 's3',
    name:        { fr: 'Cession + OBO Hybride',  en: 'Hybrid Transfer + OBO' },
    description: {
      fr: 'Cession partielle + restructuration OBO, contribution personnelle, répartition familiale révisée',
      en: 'Partial transfer + OBO restructuring, personal contribution, revised family split',
    },
    transactionType:  'hybrid',
    debtAmount:       400000,
    ccaAmount:        80000,
    fundingSource:    'family_debt',
    ownershipResult:  { you: 70, mother: 20, other: 10 },
    usufruit:         true,
    nantissement:     true,
    guaranteePackage: 'reinforced',
    taxProfile:       'mixed',
    notes: {
      fr: 'Structure complexe mais potentiellement optimisée pour transmission familiale.',
      en: 'Complex structure but potentially optimised for family transmission.',
    },
    redFlags: [
      { fr: 'Complexité notariale élevée',                              en: 'High notarial complexity' },
      { fr: 'Risque fiscal sur la cession',                             en: 'Tax risk on the share transfer' },
      { fr: 'Usufruit crée des complications bancaires',                en: 'Usufruit creates banking complications' },
      { fr: 'Timeline plus longue',                                     en: 'Longer execution timeline' },
      { fr: 'Contentieux fiscal potentiel à gérer en parallèle',        en: 'Potential tax dispute to manage in parallel' },
    ],
    manualScores: null,
  },
  {
    id: 's4',
    name:        { fr: 'Emprunt Personnel → Apport',  en: 'Personal Loan → Capital Injection' },
    description: {
      fr: 'Emprunt personnel hors SCI puis injection dans la SCI comme apport en capital',
      en: 'Personal loan outside SCI then injected as capital into the SCI',
    },
    transactionType:  'personal_injection',
    debtAmount:       0,
    ccaAmount:        550000,
    fundingSource:    'personal_loan',
    ownershipResult:  { you: 83.33, mother: 16.67, other: 0 },
    usufruit:         false,
    nantissement:     false,
    guaranteePackage: 'personal',
    taxProfile:       'sci_is_baseline',
    notes: {
      fr: 'Évite la structure OBO formelle. Dépend de la capacité d\'emprunt personnelle.',
      en: 'Avoids the formal OBO structure. Depends on personal borrowing capacity.',
    },
    redFlags: [
      { fr: 'Capacité d\'emprunt personnel limitante',          en: 'Personal borrowing capacity may be limiting' },
      { fr: 'Pas de nantissement SCI pour la banque',           en: 'No SCI share pledge available for the bank' },
      { fr: 'Traitement fiscal de l\'apport à valider',         en: 'Tax treatment of capital injection to be confirmed' },
      { fr: 'Peut être perçu comme contournement OBO',          en: 'May be seen as circumventing OBO rules' },
    ],
    manualScores: null,
  },
  {
    id: 's5',
    name:        { fr: 'Cession + CCA',  en: 'Share Transfer + CCA' },
    description: {
      fr: 'Cession directe avec financement via compte courant d\'associé',
      en: 'Direct share transfer financed via associate current account',
    },
    transactionType:  'cession_cca',
    debtAmount:       300000,
    ccaAmount:        200000,
    fundingSource:    'bank_cca',
    ownershipResult:  { you: 83.33, mother: 16.67, other: 0 },
    usufruit:         false,
    nantissement:     true,
    guaranteePackage: 'standard',
    taxProfile:       'cession_tax',
    notes: {
      fr: 'Cession avec levier CCA pour réduire la dette bancaire.',
      en: 'Transfer with CCA leverage to reduce bank debt.',
    },
    redFlags: [
      { fr: 'Droits d\'enregistrement sur la cession',      en: 'Registration duties applicable on share transfer' },
      { fr: 'Plus-value potentielle imposable',             en: 'Potential taxable capital gain' },
      { fr: 'Traitement CCA post-cession complexe',         en: 'CCA treatment post-transfer is complex' },
    ],
    manualScores: null,
  },
];

export function createBlankScenario(id, lang = 'fr') {
  const name = lang === 'en' ? 'New scenario' : 'Nouveau scénario';
  return {
    id,
    name,           // plain string — user-created, not bilingual
    description: '',
    transactionType:  'obo',
    debtAmount:       550000,
    ccaAmount:        0,
    fundingSource:    'bank_only',
    ownershipResult:  { you: 83.33, mother: 16.67, other: 0 },
    usufruit:         false,
    nantissement:     true,
    guaranteePackage: 'standard',
    taxProfile:       'sci_is_baseline',
    notes:            '',
    redFlags:         [],
    manualScores:     null,
  };
}
