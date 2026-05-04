// ── IRT 3-Parameter Logistic Engine ───────────────────────────────────────
// Pure math — zero dependencies, fully testable.

export interface IRTParams {
  a: number  // discrimination
  b: number  // difficulty
  c: number  // guessing
}

export interface Response {
  params: IRTParams
  correct: boolean
}

// ── Core IRT Functions ────────────────────────────────────────────────────

/** P(θ) — probability of correct answer under 3PL */
export function probability3PL(theta: number, { a, b, c }: IRTParams): number {
  const D = 1.7 // scaling constant
  const exponent = -D * a * (theta - b)
  return c + (1 - c) / (1 + Math.exp(exponent))
}

/** Log-likelihood of a set of responses given θ */
export function logLikelihood(theta: number, responses: Response[]): number {
  let ll = 0
  for (const r of responses) {
    const p = probability3PL(theta, r.params)
    const pClamped = Math.max(1e-10, Math.min(1 - 1e-10, p))
    ll += r.correct ? Math.log(pClamped) : Math.log(1 - pClamped)
  }
  return ll
}

/** Fisher Information I(θ) for a single item */
export function fisherInformation(theta: number, { a, b, c }: IRTParams): number {
  const D = 1.7
  const p = probability3PL(theta, { a, b, c })
  const q = 1 - p
  if (p <= c + 1e-10 || q < 1e-10) return 0
  const pStar = (p - c) / (1 - c) // P* in the 3PL formula
  return (D * D * a * a * pStar * pStar * q) / (p * (1 - c) * (1 - c))
}

// ── MAP Estimation (Newton-Raphson) ───────────────────────────────────────

/** First derivative of log-posterior w.r.t. θ */
function dLogPosterior(theta: number, responses: Response[], priorMean: number, priorVar: number): number {
  const D = 1.7
  let deriv = -(theta - priorMean) / priorVar // prior gradient
  for (const r of responses) {
    const { a, b, c } = r.params
    const p = probability3PL(theta, r.params)
    const pStar = (p - c) / (1 - c)
    const w = D * a * pStar * (1 - p) / (p * (1 - c)) // simplified derivative term
    deriv += r.correct ? (D * a * (1 - p) * pStar) / (p * (1 - c))
                       : -(D * a * pStar * p) / ((1 - p) * p) * (p - c) / (1 - c)
  }
  return deriv
}

/** Second derivative of log-posterior w.r.t. θ */
function d2LogPosterior(theta: number, responses: Response[], priorVar: number): number {
  let d2 = -1 / priorVar // prior curvature
  for (const r of responses) {
    d2 -= fisherInformation(theta, r.params)
  }
  return d2
}

export interface MAPResult {
  theta: number
  se: number
  converged: boolean
  iterations: number
}

/** Estimate θ via Maximum A Posteriori with N(priorMean, priorVar) prior */
export function estimateMAP(
  responses: Response[],
  priorMean = 0,
  priorVar = 1,
  maxIter = 50,
  tol = 0.001
): MAPResult {
  let theta = priorMean
  let converged = false
  let iter = 0

  for (iter = 0; iter < maxIter; iter++) {
    const d1 = dLogPosteriorNumerical(theta, responses, priorMean, priorVar)
    const d2 = d2LogPosteriorNumerical(theta, responses, priorVar)

    if (Math.abs(d2) < 1e-10) break

    const step = d1 / d2
    theta -= step

    // Clamp θ to reasonable range
    theta = Math.max(-4, Math.min(4, theta))

    if (Math.abs(step) < tol) {
      converged = true
      break
    }
  }

  // SE = sqrt(1 / -d²logP/dθ²)
  const info = -d2LogPosteriorNumerical(theta, responses, priorVar)
  const se = info > 0 ? 1 / Math.sqrt(info) : 1.0

  return { theta, se, converged, iterations: iter }
}

// Numerical derivatives (more stable than analytical for edge cases)
function dLogPosteriorNumerical(theta: number, responses: Response[], priorMean: number, priorVar: number): number {
  const h = 0.001
  const f1 = logLikelihood(theta + h, responses) - ((theta + h - priorMean) ** 2) / (2 * priorVar)
  const f0 = logLikelihood(theta - h, responses) - ((theta - h - priorMean) ** 2) / (2 * priorVar)
  return (f1 - f0) / (2 * h)
}

function d2LogPosteriorNumerical(theta: number, responses: Response[], priorVar: number): number {
  const h = 0.001
  const fPlus  = logLikelihood(theta + h, responses) - ((theta + h) ** 2) / (2 * priorVar)
  const f0     = logLikelihood(theta, responses)     - ((theta) ** 2) / (2 * priorVar)
  const fMinus = logLikelihood(theta - h, responses) - ((theta - h) ** 2) / (2 * priorVar)
  return (fPlus - 2 * f0 + fMinus) / (h * h)
}

// ── CAT Item Selection ────────────────────────────────────────────────────

export interface PoolItem {
  questionId: string
  params: IRTParams
}

/** Select next item with maximum Fisher Information at current θ̂ */
export function selectNextItem(
  thetaHat: number,
  pool: PoolItem[],
  answeredIds: Set<string>
): PoolItem | null {
  let best: PoolItem | null = null
  let bestInfo = -Infinity

  for (const item of pool) {
    if (answeredIds.has(item.questionId)) continue
    const info = fisherInformation(thetaHat, item.params)
    if (info > bestInfo) {
      bestInfo = info
      best = item
    }
  }

  return best
}

/** Get Fisher Information for a specific item at given theta */
export function getItemInfo(thetaHat: number, item: PoolItem): number {
  return fisherInformation(thetaHat, item.params)
}

// ── Calibration Helpers ───────────────────────────────────────────────────

/** Map difficulty label to IRT b parameter (initial estimate) */
export function difficultyToB(difficulty: string): number {
  switch (difficulty) {
    case 'FACIL':   return -1.0
    case 'MEDIO':   return 0.0
    case 'DIFICIL': return 1.5
    default:        return 0.0
  }
}

/** Estimate IRT params from empirical data (proportion correct + N) */
export function calibrateFromData(
  proportionCorrect: number,
  nResponses: number,
  nOptions = 5
): IRTParams {
  const c = 1 / nOptions // guessing = 1/nOptions

  // b estimate: inverse of 3PL at P = proportion correct
  // P = c + (1-c)/(1+exp(-1.7*a*(θ-b)))  → solve for b at θ=0
  const pAdj = Math.max(c + 0.01, Math.min(0.99, proportionCorrect))
  const pStar = (pAdj - c) / (1 - c)
  const b = -Math.log(pStar / (1 - pStar)) / 1.7

  // a estimate: higher discrimination for items with more responses
  const a = nResponses > 50 ? 1.2 : nResponses > 20 ? 1.0 : 0.8

  return { a, b: Math.max(-3, Math.min(3, b)), c }
}

// ── Theta → Human Label ───────────────────────────────────────────────────

export function thetaToLabel(theta: number): string {
  if (theta < -1) return 'Iniciante'
  if (theta < 0)  return 'Em desenvolvimento'
  if (theta < 1)  return 'Competente'
  if (theta < 2)  return 'Avançado'
  return 'Excelente'
}

export function thetaToPercentile(theta: number): number {
  // Approximate percentile from standard normal CDF
  // Using rational approximation for Φ(θ)
  const t = 1 / (1 + 0.2316419 * Math.abs(theta))
  const d = 0.3989423 * Math.exp(-theta * theta / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return Math.round((theta >= 0 ? 1 - p : p) * 100)
}
