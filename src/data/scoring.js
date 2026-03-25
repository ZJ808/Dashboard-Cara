export const SCORE_DIMENSIONS = [
  { key: 'simplicity',          labelFr: 'Simplicité',             labelEn: 'Simplicity',             color: '#6366f1' },
  { key: 'fiscalClarity',       labelFr: 'Clarté fiscale',         labelEn: 'Fiscal clarity',         color: '#10b981' },
  { key: 'upfrontCost',         labelFr: 'Coût initial',           labelEn: 'Upfront cost',           color: '#f59e0b' },
  { key: 'bankability',         labelFr: 'Bankabilité',            labelEn: 'Bankability',            color: '#3b82f6' },
  { key: 'executionSpeed',      labelFr: 'Rapidité d\'exécution',  labelEn: 'Execution speed',        color: '#8b5cf6' },
  { key: 'documentationBurden', labelFr: 'Charge documentaire',    labelEn: 'Documentation burden',   color: '#ef4444' },
  { key: 'familyControl',       labelFr: 'Contrôle familial',      labelEn: 'Family control',         color: '#ec4899' },
  { key: 'flexibility',         labelFr: 'Flexibilité long terme', labelEn: 'Long-term flexibility',  color: '#14b8a6' },
];

export const BADGE_CRITERIA = [
  { key: 'simplicity',     labelFr: 'Structure la plus simple',       labelEn: 'Simplest structure',        icon: '⚙️' },
  { key: 'bankability',    labelFr: 'Plus bankable',                   labelEn: 'Most bankable',             icon: '🏦' },
  { key: 'upfrontCost',    labelFr: 'Coût initial le plus bas',        labelEn: 'Lowest setup cost',         icon: '💰' },
  { key: 'executionSpeed', labelFr: 'Exécution la plus rapide',        labelEn: 'Fastest execution',         icon: '⚡' },
  { key: 'familyControl',  labelFr: 'Meilleur contrôle familial',      labelEn: 'Best family control',       icon: '👨‍👩‍👧' },
  { key: 'fiscalClarity',  labelFr: 'Plus efficace fiscalement',       labelEn: 'Most fiscally efficient',   icon: '📊' },
];

// Helper: get label in active language
export function dimLabel(dim, lang) {
  return lang === 'en' ? dim.labelEn : dim.labelFr;
}

export function badgeLabel(badge, lang) {
  return lang === 'en' ? badge.labelEn : badge.labelFr;
}

// ── Scoring functions ──────────────────────────────────────────────────────

function scoreSimplicity(scenario) {
  const scores = {
    obo: 4, obo_cca: 3, cession: 4, cession_cca: 3, hybrid: 1, personal_injection: 3,
  };
  let base = scores[scenario.transactionType] ?? 3;
  if (scenario.usufruit) base -= 1;
  if (scenario.ccaAmount > 0) base -= 0.5;
  return Math.max(1, Math.min(5, Math.round(base)));
}

function scoreFiscalClarity(scenario) {
  const scores = {
    sci_is_baseline: 5, sci_is_cca: 3, cession_tax: 2, usufruit: 2, mixed: 1,
  };
  return scores[scenario.taxProfile] ?? 3;
}

function scoreUpfrontCost(scenario, assumptions) {
  const txAmount = scenario.debtAmount + scenario.ccaAmount;
  const notaryCost = txAmount * (assumptions.notarialCostRate / 100);
  const regCost = ['cession', 'cession_cca', 'hybrid'].includes(scenario.transactionType)
    ? txAmount * (assumptions.registrationCostRate / 100)
    : 0;
  const ratio = (notaryCost + regCost) / assumptions.propertyValue;
  if (ratio < 0.05) return 5;
  if (ratio < 0.08) return 4;
  if (ratio < 0.10) return 3;
  if (ratio < 0.13) return 2;
  return 1;
}

function scoreBankability(scenario, assumptions) {
  let score = 4;
  if (['hybrid', 'personal_injection'].includes(scenario.transactionType)) score -= 1;
  if (scenario.transactionType === 'obo') score += 0.5;
  if (assumptions.lenderProfile === 'non-resident-sensitive') score -= 1;
  if (assumptions.lenderProfile === 'conservative') score -= 1.5;
  if (scenario.ccaAmount > 0) score -= 0.5;
  if (scenario.usufruit) score -= 1;
  if (scenario.guaranteePackage === 'reinforced') score += 0.5;
  if (scenario.guaranteePackage === 'minimal') score -= 1;
  const debtRatio = scenario.debtAmount / assumptions.propertyValue;
  if (debtRatio > 0.9) score -= 1;
  if (debtRatio < 0.7) score += 0.5;
  return Math.max(1, Math.min(5, Math.round(score)));
}

function scoreExecutionSpeed(scenario) {
  const speeds = {
    obo: 4, obo_cca: 3, cession: 4, cession_cca: 3, hybrid: 1, personal_injection: 3,
  };
  let base = speeds[scenario.transactionType] ?? 3;
  if (scenario.usufruit) base -= 1;
  return Math.max(1, Math.min(5, Math.round(base)));
}

function scoreDocumentationBurden(scenario) {
  let burden = 0;
  if (['hybrid', 'cession_cca'].includes(scenario.transactionType)) burden += 2;
  if (['obo_cca', 'cession'].includes(scenario.transactionType)) burden += 1;
  if (scenario.usufruit) burden += 1;
  if (scenario.ccaAmount > 0) burden += 1;
  if (scenario.guaranteePackage === 'reinforced') burden += 1;
  return Math.max(1, Math.min(5, 5 - burden));
}

function scoreFamilyControl(scenario) {
  let score = 3;
  const { you } = scenario.ownershipResult;
  if (you >= 80) score += 1;
  if (you >= 83) score += 0.5;
  if (scenario.usufruit) score += 1;
  if (you < 70) score -= 1;
  return Math.max(1, Math.min(5, Math.round(score)));
}

function scoreFlexibility(scenario) {
  let score = 3;
  if (scenario.ccaAmount > 0) score += 0.5;
  if (scenario.usufruit) score += 1;
  if (scenario.transactionType === 'hybrid') score += 0.5;
  if (scenario.transactionType === 'personal_injection') score -= 0.5;
  return Math.max(1, Math.min(5, Math.round(score)));
}

export function calculateScores(scenario, assumptions) {
  if (scenario.manualScores) return scenario.manualScores;
  return {
    simplicity:          scoreSimplicity(scenario),
    fiscalClarity:       scoreFiscalClarity(scenario),
    upfrontCost:         scoreUpfrontCost(scenario, assumptions),
    bankability:         scoreBankability(scenario, assumptions),
    executionSpeed:      scoreExecutionSpeed(scenario),
    documentationBurden: scoreDocumentationBurden(scenario),
    familyControl:       scoreFamilyControl(scenario),
    flexibility:         scoreFlexibility(scenario),
  };
}

export function calculateWeightedScore(scores, weights) {
  let total = 0, weightSum = 0;
  for (const dim of SCORE_DIMENSIONS) {
    const w = weights[dim.key] ?? 1;
    total += (scores[dim.key] ?? 3) * w;
    weightSum += w;
  }
  return Math.round((total / weightSum) * 10) / 10;
}

export function calculateImpact(scenario, assumptions) {
  const totalFunding = scenario.debtAmount + scenario.ccaAmount;
  const notaryCost = totalFunding * (assumptions.notarialCostRate / 100);
  const regCost = ['cession', 'cession_cca', 'hybrid'].includes(scenario.transactionType)
    ? totalFunding * (assumptions.registrationCostRate / 100)
    : 0;
  const r = assumptions.financingRate / 100 / 12;
  const n = assumptions.loanDuration * 12;
  const monthlyDebt = scenario.debtAmount > 0 && r > 0
    ? (scenario.debtAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : 0;
  const scores = calculateScores(scenario, assumptions);
  return {
    totalFunding,
    debtAmount:           scenario.debtAmount,
    ccaAmount:            scenario.ccaAmount,
    notaryCost:           Math.round(notaryCost),
    registrationCost:     Math.round(regCost),
    totalSetupCost:       Math.round(notaryCost + regCost),
    monthlyDebtService:   Math.round(monthlyDebt),
    annualDebtService:    Math.round(monthlyDebt * 12),
    ownershipResult:      scenario.ownershipResult,
    complexityScore:      6 - scores.simplicity,
    bankabilityScore:     scores.bankability,
    scores,
  };
}

export function getScoreColor(score) {
  if (score >= 4.5) return 'bg-emerald-100 text-emerald-800';
  if (score >= 3.5) return 'bg-green-100 text-green-800';
  if (score >= 2.5) return 'bg-amber-100 text-amber-800';
  if (score >= 1.5) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

export function getScoreBg(score) {
  if (score >= 4.5) return '#10b981';
  if (score >= 3.5) return '#22c55e';
  if (score >= 2.5) return '#eab308';
  if (score >= 1.5) return '#f97316';
  return '#ef4444';
}
