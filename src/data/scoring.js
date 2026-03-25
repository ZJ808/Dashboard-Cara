// Score each scenario dimension 1–5 based on its parameters
// 5 = best outcome for that dimension, 1 = worst

export const SCORE_DIMENSIONS = [
  { key: 'simplicity',          label: 'Simplicité',              color: '#6366f1' },
  { key: 'fiscalClarity',       label: 'Clarté fiscale',          color: '#10b981' },
  { key: 'upfrontCost',         label: 'Coût initial',            color: '#f59e0b' },
  { key: 'bankability',         label: 'Bankabilité',             color: '#3b82f6' },
  { key: 'executionSpeed',      label: 'Rapidité d\'exécution',   color: '#8b5cf6' },
  { key: 'documentationBurden', label: 'Charge documentaire',     color: '#ef4444' },
  { key: 'familyControl',       label: 'Contrôle familial',       color: '#ec4899' },
  { key: 'flexibility',         label: 'Flexibilité long terme',  color: '#14b8a6' },
];

export const BADGE_CRITERIA = [
  { key: 'simplicity',          label: 'Structure la plus simple',      icon: '⚙️' },
  { key: 'bankability',         label: 'Plus bankable',                  icon: '🏦' },
  { key: 'upfrontCost',         label: 'Coût initial le plus bas',       icon: '💰' },
  { key: 'executionSpeed',      label: 'Exécution la plus rapide',       icon: '⚡' },
  { key: 'familyControl',       label: 'Meilleur contrôle familial',     icon: '👨‍👩‍👧' },
  { key: 'fiscalClarity',       label: 'Plus efficace fiscalement',      icon: '📊' },
];

function scoreSimplicity(scenario) {
  const scores = {
    obo: 4,
    obo_cca: 3,
    cession: 4,
    cession_cca: 3,
    hybrid: 1,
    personal_injection: 3,
  };
  let base = scores[scenario.transactionType] ?? 3;
  if (scenario.usufruit) base -= 1;
  if (scenario.ccaAmount > 0) base -= 0.5;
  return Math.max(1, Math.min(5, Math.round(base)));
}

function scoreFiscalClarity(scenario) {
  const scores = {
    sci_is_baseline: 5,
    sci_is_cca: 3,
    cession_tax: 2,
    usufruit: 2,
    mixed: 1,
  };
  return scores[scenario.taxProfile] ?? 3;
}

function scoreUpfrontCost(scenario, assumptions) {
  const txAmount = scenario.debtAmount + scenario.ccaAmount;
  const notaryCost = txAmount * (assumptions.notarialCostRate / 100);
  const regCost = ['cession', 'cession_cca', 'hybrid'].includes(scenario.transactionType)
    ? txAmount * (assumptions.registrationCostRate / 100)
    : 0;
  const totalCost = notaryCost + regCost;
  const totalFunding = assumptions.propertyValue;

  const ratio = totalCost / totalFunding;
  if (ratio < 0.05) return 5;
  if (ratio < 0.08) return 4;
  if (ratio < 0.10) return 3;
  if (ratio < 0.13) return 2;
  return 1;
}

function scoreBankability(scenario, assumptions) {
  let score = 4;

  // Complexity of transaction type
  if (['hybrid', 'personal_injection'].includes(scenario.transactionType)) score -= 1;
  if (scenario.transactionType === 'obo') score += 0.5;

  // Non-resident sensitivity
  if (assumptions.lenderProfile === 'non-resident-sensitive') score -= 1;
  if (assumptions.lenderProfile === 'conservative') score -= 1.5;

  // CCA presence
  if (scenario.ccaAmount > 0) score -= 0.5;

  // Usufruit
  if (scenario.usufruit) score -= 1;

  // Guarantee package
  if (scenario.guaranteePackage === 'reinforced') score += 0.5;
  if (scenario.guaranteePackage === 'minimal') score -= 1;

  // Debt ratio vs property value
  const debtRatio = scenario.debtAmount / assumptions.propertyValue;
  if (debtRatio > 0.9) score -= 1;
  if (debtRatio < 0.7) score += 0.5;

  return Math.max(1, Math.min(5, Math.round(score)));
}

function scoreExecutionSpeed(scenario) {
  const speeds = {
    obo: 4,
    obo_cca: 3,
    cession: 4,
    cession_cca: 3,
    hybrid: 1,
    personal_injection: 3,
  };
  let base = speeds[scenario.transactionType] ?? 3;
  if (scenario.usufruit) base -= 1;
  return Math.max(1, Math.min(5, Math.round(base)));
}

function scoreDocumentationBurden(scenario) {
  // Higher score = LOWER burden (better)
  let burden = 0;
  if (['hybrid', 'cession_cca'].includes(scenario.transactionType)) burden += 2;
  if (['obo_cca', 'cession'].includes(scenario.transactionType)) burden += 1;
  if (scenario.usufruit) burden += 1;
  if (scenario.ccaAmount > 0) burden += 1;
  if (scenario.guaranteePackage === 'reinforced') burden += 1;
  // convert to 1–5 scale (lower burden = higher score)
  return Math.max(1, Math.min(5, 5 - burden));
}

function scoreFamilyControl(scenario) {
  let score = 3;
  const { you, mother } = scenario.ownershipResult;
  // Maintain majority control
  if (you >= 80) score += 1;
  if (you >= 83) score += 0.5;
  // Usufruit can help with transmission
  if (scenario.usufruit) score += 1;
  // If ownership diluted too much
  if (you < 70) score -= 1;
  return Math.max(1, Math.min(5, Math.round(score)));
}

function scoreFlexibility(scenario) {
  let score = 3;
  if (scenario.ccaAmount > 0) score += 0.5; // CCA repayable = flexible
  if (scenario.usufruit) score += 1;         // usufruit gives future options
  if (['hybrid'].includes(scenario.transactionType)) score += 0.5;
  if (['personal_injection'].includes(scenario.transactionType)) score -= 0.5;
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
  let total = 0;
  let weightSum = 0;
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
  const totalCosts = notaryCost + regCost;

  // Monthly debt service (annuity formula)
  const r = assumptions.financingRate / 100 / 12;
  const n = assumptions.loanDuration * 12;
  const monthlyDebt = scenario.debtAmount > 0 && r > 0
    ? (scenario.debtAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : 0;

  const annualDebtService = monthlyDebt * 12;

  // Effective ownership
  const ownershipDelta = scenario.ownershipResult.you - assumptions.ownership.you;

  // Complexity score (inverse of simplicity)
  const scores = calculateScores(scenario, assumptions);
  const complexityScore = 6 - scores.simplicity;
  const bankabilityScore = scores.bankability;

  return {
    totalFunding,
    debtAmount: scenario.debtAmount,
    ccaAmount: scenario.ccaAmount,
    notaryCost: Math.round(notaryCost),
    registrationCost: Math.round(regCost),
    totalSetupCost: Math.round(totalCosts),
    monthlyDebtService: Math.round(monthlyDebt),
    annualDebtService: Math.round(annualDebtService),
    ownershipResult: scenario.ownershipResult,
    ownershipDelta: Math.round(ownershipDelta * 100) / 100,
    complexityScore,
    bankabilityScore,
    scores,
  };
}

export function getScoreColor(score) {
  if (score >= 4.5) return 'bg-emerald-100 text-emerald-800';
  if (score >= 3.5) return 'bg-green-100 text-green-800';
  if (score >= 2.5) return 'bg-yellow-100 text-yellow-800';
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
