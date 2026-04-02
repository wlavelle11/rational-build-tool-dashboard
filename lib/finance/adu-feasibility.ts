export interface FeasibilityInputs {
  lotSizeSqft: number
  existingCoverageSqft: number
  zoningCode: string
  aduCount: number
  setbackFront: boolean
  setbackRear: boolean
  setbackSide: boolean
  utilityWater: 'adequate' | 'needs_upgrade'
  utilitySewer: 'adequate' | 'needs_upgrade'
  hasHOA: boolean
  permitTimelineMonths: number
  permitCostEstimate: number
}

export interface FeasibilityCategory {
  label: string
  score: number
  maxScore: number
  flag: 'pass' | 'caution' | 'fail'
  notes: string
}

export interface FeasibilityResult {
  totalScore: number
  flag: 'GO' | 'CAUTION' | 'NO-GO'
  categories: FeasibilityCategory[]
}

const ADU_SQFT = 480
const MIN_LOT_FOR_BONUS_ADU = 5000

export function assessFeasibility(inputs: FeasibilityInputs): FeasibilityResult {
  const categories: FeasibilityCategory[] = []

  // ── 1. Lot Size & Coverage (25 pts) ──────────────────────────────────
  const availableSqft = inputs.lotSizeSqft - inputs.existingCoverageSqft
  const neededFootprint = inputs.aduCount * ADU_SQFT
  const coverageRatio = inputs.lotSizeSqft > 0 ? inputs.existingCoverageSqft / inputs.lotSizeSqft : 1

  let lotScore = 0
  let lotNotes = ''

  if (inputs.lotSizeSqft >= MIN_LOT_FOR_BONUS_ADU && availableSqft >= neededFootprint * 1.5 && coverageRatio <= 0.40) {
    lotScore = 25
    lotNotes = 'Lot size and coverage are well-suited for Bonus ADU development.'
  } else if (inputs.lotSizeSqft >= MIN_LOT_FOR_BONUS_ADU && availableSqft >= neededFootprint) {
    lotScore = 15
    lotNotes = 'Lot is adequate but coverage is tight. Verify setback clearances carefully.'
  } else if (inputs.lotSizeSqft >= 4000 && availableSqft >= neededFootprint * 0.8) {
    lotScore = 8
    lotNotes = 'Lot is marginal. May need to reduce ADU count or size.'
  } else {
    lotScore = 0
    lotNotes = 'Lot size or remaining coverage is insufficient for the planned ADU count.'
  }

  categories.push({
    label: 'Lot Size & Coverage',
    score: lotScore,
    maxScore: 25,
    flag: lotScore >= 18 ? 'pass' : lotScore >= 8 ? 'caution' : 'fail',
    notes: lotNotes,
  })

  // ── 2. Zoning (25 pts) ───────────────────────────────────────────────
  const code = inputs.zoningCode.toUpperCase().trim()
  let zoningScore = 0
  let zoningNotes = ''

  if (/^(RS|R-1|R1|A70|A72|A73)/.test(code)) {
    zoningScore = 25
    zoningNotes = `${code} — Single-family residential. Eligible for San Diego Bonus ADU program.`
  } else if (/^(RM|R-2|R2|R-3|R3|RX|RP)/.test(code)) {
    zoningScore = 15
    zoningNotes = `${code} — Multi-family zone. ADUs may be permitted but Bonus ADU rules differ. Verify with Planning.`
  } else if (/^(AR|A|RR)/.test(code)) {
    zoningScore = 10
    zoningNotes = `${code} — Agricultural/rural residential. ADU rules may apply but verify minimum lot requirements.`
  } else if (code === '') {
    zoningScore = 0
    zoningNotes = 'No zoning code entered. Enter manually or use auto-fill.'
  } else {
    zoningScore = 0
    zoningNotes = `${code} — Non-residential or unrecognized zoning. ADUs likely not permitted.`
  }

  categories.push({
    label: 'Zoning',
    score: zoningScore,
    maxScore: 25,
    flag: zoningScore >= 20 ? 'pass' : zoningScore >= 10 ? 'caution' : 'fail',
    notes: zoningNotes,
  })

  // ── 3. Setbacks (20 pts) ─────────────────────────────────────────────
  const setbacksOk = [inputs.setbackFront, inputs.setbackRear, inputs.setbackSide].filter(Boolean).length
  const setbackScore = setbacksOk === 3 ? 20 : setbacksOk === 2 ? 12 : setbacksOk === 1 ? 5 : 0
  const setbackNotes = setbacksOk === 3
    ? 'All setbacks compliant. No encroachment issues anticipated.'
    : setbacksOk === 2
    ? 'One setback may be non-compliant. Review with GC before proceeding.'
    : 'Multiple setback issues. Site survey required before committing.'

  categories.push({
    label: 'Setback Compliance',
    score: setbackScore,
    maxScore: 20,
    flag: setbackScore >= 16 ? 'pass' : setbackScore >= 8 ? 'caution' : 'fail',
    notes: setbackNotes,
  })

  // ── 4. Utility Capacity (15 pts) ─────────────────────────────────────
  const waterOk = inputs.utilityWater === 'adequate'
  const sewerOk = inputs.utilitySewer === 'adequate'
  const utilityScore = waterOk && sewerOk ? 15 : (waterOk || sewerOk) ? 7 : 0
  const utilityNotes = waterOk && sewerOk
    ? 'Water and sewer capacity confirmed adequate.'
    : !waterOk && !sewerOk
    ? 'Both water and sewer require upgrades. Significant added cost.'
    : `${!waterOk ? 'Water' : 'Sewer'} capacity needs upgrade. Budget accordingly.`

  categories.push({
    label: 'Utility Capacity',
    score: utilityScore,
    maxScore: 15,
    flag: utilityScore >= 12 ? 'pass' : utilityScore >= 5 ? 'caution' : 'fail',
    notes: utilityNotes,
  })

  // ── 5. HOA & Permit Complexity (15 pts) ──────────────────────────────
  let complexityScore = 15
  const complexityFlags: string[] = []

  if (inputs.hasHOA) {
    complexityScore -= 10
    complexityFlags.push('HOA present — ADU may require approval. Verify CC&Rs.')
  }
  if (inputs.permitTimelineMonths > 18) {
    complexityScore -= 3
    complexityFlags.push(`Long permit timeline (${inputs.permitTimelineMonths} months) increases carrying costs.`)
  }
  if (inputs.permitCostEstimate > 50000) {
    complexityScore -= 2
    complexityFlags.push(`High permit cost estimate ($${inputs.permitCostEstimate.toLocaleString()}) reduces returns.`)
  }

  complexityScore = Math.max(0, complexityScore)
  categories.push({
    label: 'HOA & Permit Complexity',
    score: complexityScore,
    maxScore: 15,
    flag: complexityScore >= 12 ? 'pass' : complexityScore >= 5 ? 'caution' : 'fail',
    notes: complexityFlags.length > 0 ? complexityFlags.join(' ') : 'No major HOA or permit obstacles identified.',
  })

  const totalScore = categories.reduce((s, c) => s + c.score, 0)
  const flag: 'GO' | 'CAUTION' | 'NO-GO' = totalScore >= 70 ? 'GO' : totalScore >= 50 ? 'CAUTION' : 'NO-GO'

  return { totalScore, flag, categories }
}
