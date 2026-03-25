export const defaultAssumptions = {
  propertyValue: 550000,
  financingRate: 3.5,        // %
  loanDuration: 20,          // years
  ownership: {
    you: 83.33,
    mother: 16.67,
  },
  notarialCostRate: 7.5,     // % of transaction amount
  registrationCostRate: 5.0, // % of transaction amount (OBO cession)
  sciTaxRegime: 'IS',        // 'IS' | 'IR'
  lenderProfile: 'standard', // 'standard' | 'non-resident-sensitive' | 'conservative'
  ccaInterestRate: 0,        // % — usually 0 for family CCA
  scoringWeights: {
    simplicity: 1,
    fiscalClarity: 1,
    upfrontCost: 1,
    bankability: 1.5,        // weighted slightly higher
    executionSpeed: 1,
    documentationBurden: 0.8,
    familyControl: 1.2,
    flexibility: 1,
  },
};
