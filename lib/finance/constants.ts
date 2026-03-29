export const SCORING = {
  STRONG_BUY_THRESHOLD: 80,
  CAUTION_THRESHOLD: 60,

  WEIGHTS: {
    capRate: 0.20,
    irr: 0.30,
    equityMultiple: 0.25,
    cashOnCash: 0.15,
    totalValueCreation: 0.10,
  },

  BENCHMARKS: {
    capRate: {
      excellent: 0.065,
      good: 0.05,
      fair: 0.035,
    },
    irr: {
      excellent: 0.15,
      good: 0.10,
      fair: 0.07,
    },
    equityMultiple: {
      excellent: 2.0,
      good: 1.5,
      fair: 1.2,
    },
    cashOnCash: {
      excellent: 0.08,
      good: 0.06,
      fair: 0.04,
    },
    totalValueCreation: {
      excellent: 0.50,
      good: 0.25,
      fair: 0.10,
    },
  },
}

export const SENSITIVITY = {
  RENT_GROWTH_STEPS: 7,
  EXIT_CAP_STEPS: 7,
  RENT_GROWTH_DELTA: 0.01,
  EXIT_CAP_DELTA: 0.005,
}
