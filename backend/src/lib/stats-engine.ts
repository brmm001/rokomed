// ── Statistical Analysis Engine ───────────────────────────────────────────
// 9 methods for learning analytics. Pure math, zero dependencies.

// ── 1. CUSUM (Cumulative Sum Control Chart) ───────────────────────────────

export interface CUSUMResult {
  stat: number
  alert: boolean
  values: number[]  // running S values
  changePoint: number | null
}

/**
 * One-sided CUSUM for detecting performance drops.
 * @param series  array of 0/1 (incorrect/correct) or accuracy values
 * @param target  expected accuracy (baseline)
 * @param k       slack (allowance, typically 0.5 × shift to detect)
 * @param h       decision threshold (typically 4-5 for ARL₀ ≈ 50)
 */
export function cusum(series: number[], target: number, k = 0.25, h = 4.0): CUSUMResult {
  const values: number[] = []
  let s = 0
  let changePoint: number | null = null

  for (let i = 0; i < series.length; i++) {
    // Detecting drop: accumulate negative deviations
    s = Math.max(0, s + (target - series[i]) - k)
    values.push(s)
    if (s > h && changePoint === null) {
      changePoint = i
    }
  }

  return { stat: s, alert: s > h, values, changePoint }
}

// ── 2. Monte Carlo Approval Probability ───────────────────────────────────

/**
 * Estimate P(approval) via Monte Carlo simulation.
 * @param theta     current estimated ability
 * @param se        standard error of theta
 * @param cutoff    minimum score to pass (0-100 scale)
 * @param examSize  number of items on the real exam
 * @param itemDist  distribution of item difficulties { mean, sd }
 * @param nSim      number of simulations
 */
export function monteCarloApproval(
  theta: number,
  se: number,
  cutoff: number,
  examSize = 100,
  itemDist = { mean: 0, sd: 1 },
  nSim = 10000
): { pApproval: number; scores: number[]; ci95: [number, number] } {
  const scores: number[] = []
  let approvedCount = 0

  for (let sim = 0; sim < nSim; sim++) {
    // Sample θ from posterior N(theta, se²)
    const thetaSim = theta + se * boxMullerZ()

    // Simulate exam
    let correct = 0
    for (let j = 0; j < examSize; j++) {
      const b = itemDist.mean + itemDist.sd * boxMullerZ()
      const p = 0.2 + 0.8 / (1 + Math.exp(-1.7 * (thetaSim - b))) // 3PL simplified
      correct += Math.random() < p ? 1 : 0
    }

    const score = (correct / examSize) * 100
    scores.push(score)
    if (score >= cutoff) approvedCount++
  }

  const pApproval = approvedCount / nSim

  // 95% CI via sorted scores
  scores.sort((a, b) => a - b)
  const ci95: [number, number] = [
    scores[Math.floor(nSim * 0.025)],
    scores[Math.floor(nSim * 0.975)],
  ]

  return { pApproval, scores, ci95 }
}

// ── 3. Brier Score ────────────────────────────────────────────────────────

/**
 * Brier Score: measures calibration quality.
 * 0 = perfect, 0.25 = random guessing.
 */
export function brierScore(predictions: number[], outcomes: number[]): number {
  if (predictions.length === 0) return 0
  let sum = 0
  for (let i = 0; i < predictions.length; i++) {
    sum += (predictions[i] - outcomes[i]) ** 2
  }
  return sum / predictions.length
}

// ── 4. Chi-Squared Bias Test ──────────────────────────────────────────────

export interface ChiSquaredResult {
  stat: number
  pValue: number
  biasedOption: string | null
  distribution: Record<string, number>
}

/**
 * Chi-squared test for response option bias (uniform expected).
 * @param optionCounts e.g. { A: 45, B: 30, C: 25, D: 40, E: 60 }
 */
export function chiSquaredBias(optionCounts: Record<string, number>): ChiSquaredResult {
  const options = Object.keys(optionCounts)
  const total = Object.values(optionCounts).reduce((s, v) => s + v, 0)
  const expected = total / options.length
  const df = options.length - 1

  let stat = 0
  let maxDev = 0
  let biasedOption: string | null = null

  for (const opt of options) {
    const observed = optionCounts[opt]
    const deviation = (observed - expected) ** 2 / expected
    stat += deviation
    if (observed - expected > maxDev) {
      maxDev = observed - expected
      biasedOption = opt
    }
  }

  // p-value from chi-squared distribution (Wilson-Hilferty approx)
  const pValue = 1 - chiSquaredCDF(stat, df)

  // Only flag bias if significant
  if (pValue >= 0.05) biasedOption = null

  const distribution: Record<string, number> = {}
  for (const opt of options) {
    distribution[opt] = Math.round((optionCounts[opt] / total) * 100)
  }

  return { stat, pValue, biasedOption, distribution }
}

// ── 5. Learning Curve (Logistic Regression) ───────────────────────────────

export interface LearningCurveResult {
  beta0: number       // intercept
  beta1: number       // slope (learning rate)
  r2: number          // pseudo R²
  projection: { day: number; predicted: number }[]
}

/**
 * Logistic regression: logit(P) = β₀ + β₁·t
 * Fitted via iteratively reweighted least squares (IRLS).
 * @param history  array of { day: number, correct: boolean }
 * @param projectDays  number of future days to project
 */
export function learningCurve(
  history: { day: number; correct: boolean }[],
  projectDays = 30
): LearningCurveResult {
  if (history.length < 10) {
    return { beta0: 0, beta1: 0, r2: 0, projection: [] }
  }

  // Normalize days
  const maxDay = Math.max(...history.map(h => h.day))
  const minDay = Math.min(...history.map(h => h.day))
  const range = maxDay - minDay || 1

  let b0 = 0, b1 = 0

  // IRLS iterations
  for (let iter = 0; iter < 25; iter++) {
    let sw = 0, swx = 0, swy = 0, swxx = 0, swxy = 0

    for (const h of history) {
      const x = (h.day - minDay) / range
      const eta = b0 + b1 * x
      const p = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, eta))))
      const w = p * (1 - p) + 1e-6
      const z = eta + (h.correct ? 1 : 0 - p) / w

      sw += w; swx += w * x; swy += w * z
      swxx += w * x * x; swxy += w * x * z
    }

    const det = sw * swxx - swx * swx
    if (Math.abs(det) < 1e-10) break
    b0 = (swxx * swy - swx * swxy) / det
    b1 = (sw * swxy - swx * swy) / det
  }

  // Pseudo R² (McFadden)
  let llFull = 0, llNull = 0
  const pBar = history.filter(h => h.correct).length / history.length
  for (const h of history) {
    const x = (h.day - minDay) / range
    const pFull = 1 / (1 + Math.exp(-(b0 + b1 * x)))
    llFull += h.correct ? Math.log(pFull + 1e-10) : Math.log(1 - pFull + 1e-10)
    llNull += h.correct ? Math.log(pBar + 1e-10) : Math.log(1 - pBar + 1e-10)
  }
  const r2 = llNull !== 0 ? 1 - llFull / llNull : 0

  // Project forward
  const projection: { day: number; predicted: number }[] = []
  for (let d = 0; d <= projectDays; d++) {
    const futureDay = maxDay + d
    const x = (futureDay - minDay) / range
    const p = 1 / (1 + Math.exp(-(b0 + b1 * x)))
    projection.push({ day: futureDay, predicted: Math.round(p * 100) })
  }

  // Denormalize beta1 to per-day rate
  return { beta0: b0, beta1: b1 / range, r2: Math.max(0, r2), projection }
}

// ── 6. Moving Average ─────────────────────────────────────────────────────

export function movingAverage(series: number[], window: number): number[] {
  const result: number[] = []
  for (let i = 0; i < series.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = series.slice(start, i + 1)
    result.push(slice.reduce((s, v) => s + v, 0) / slice.length)
  }
  return result
}

// ── 7. Cohen's d ──────────────────────────────────────────────────────────

export function cohensD(group1: number[], group2: number[]): number {
  const mean1 = group1.reduce((s, v) => s + v, 0) / group1.length
  const mean2 = group2.reduce((s, v) => s + v, 0) / group2.length
  const var1 = group1.reduce((s, v) => s + (v - mean1) ** 2, 0) / (group1.length - 1)
  const var2 = group2.reduce((s, v) => s + (v - mean2) ** 2, 0) / (group2.length - 1)
  const pooledSD = Math.sqrt(((group1.length - 1) * var1 + (group2.length - 1) * var2) / (group1.length + group2.length - 2))
  return pooledSD > 0 ? (mean1 - mean2) / pooledSD : 0
}

// ── 8. Spearman-Brown Prophecy ────────────────────────────────────────────

export function spearmanBrown(reliability: number, nItems: number): number {
  return (nItems * reliability) / (1 + (nItems - 1) * reliability)
}

// ── 9. Theta Trajectory ───────────────────────────────────────────────────

export interface TrajectoryResult {
  trend: 'up' | 'down' | 'stable'
  velocity: number       // θ/day
  acceleration: number   // θ/day²
  smoothed: number[]
}

export function thetaTrajectory(snapshots: { theta: number; dayIndex: number }[]): TrajectoryResult {
  if (snapshots.length < 3) {
    return { trend: 'stable', velocity: 0, acceleration: 0, smoothed: snapshots.map(s => s.theta) }
  }

  const thetas = snapshots.map(s => s.theta)
  const smoothed = movingAverage(thetas, Math.min(5, Math.floor(thetas.length / 2)))

  // Linear regression for velocity
  const n = snapshots.length
  let sx = 0, sy = 0, sxy = 0, sxx = 0
  for (const s of snapshots) {
    sx += s.dayIndex; sy += s.theta
    sxy += s.dayIndex * s.theta; sxx += s.dayIndex * s.dayIndex
  }
  const velocity = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1)

  // Quadratic regression for acceleration
  let sxxx = 0, sxxxx = 0, sxxy = 0
  for (const s of snapshots) {
    const x2 = s.dayIndex * s.dayIndex
    sxxx += s.dayIndex * x2; sxxxx += x2 * x2; sxxy += x2 * s.theta
  }
  // Simplified: acceleration ~ second finite difference of smoothed
  const lastIdx = smoothed.length - 1
  const acceleration = lastIdx >= 2
    ? (smoothed[lastIdx] - 2 * smoothed[lastIdx - 1] + smoothed[lastIdx - 2])
    : 0

  const trend = velocity > 0.01 ? 'up' : velocity < -0.01 ? 'down' : 'stable'

  return { trend, velocity, acceleration, smoothed }
}

// ── Utility ───────────────────────────────────────────────────────────────

/** Box-Muller transform for standard normal random */
function boxMullerZ(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

/** Chi-squared CDF approximation (Wilson-Hilferty) */
function chiSquaredCDF(x: number, df: number): number {
  if (df <= 0 || x < 0) return 0
  const z = Math.pow(x / df, 1 / 3) - (1 - 2 / (9 * df))
  const denom = Math.sqrt(2 / (9 * df))
  return normalCDF(z / denom)
}

/** Standard normal CDF */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp(-x * x / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x >= 0 ? 1 - p : p
}
