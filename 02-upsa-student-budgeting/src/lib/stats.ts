// Small, dependency-free statistics library for the dashboard.
// Distribution functions follow Numerical Recipes (Lanczos log-gamma,
// continued-fraction incomplete beta, series/CF incomplete gamma).

export function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
}

export function variance(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1);
}

export function sd(xs: number[]): number {
  return Math.sqrt(variance(xs));
}

export function median(xs: number[]): number {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export type Descriptives = { n: number; mean: number; sd: number; median: number; min: number; max: number };

export function describe(xs: number[]): Descriptives {
  return {
    n: xs.length,
    mean: mean(xs),
    sd: sd(xs),
    median: median(xs),
    min: xs.length ? Math.min(...xs) : NaN,
    max: xs.length ? Math.max(...xs) : NaN,
  };
}

// ---------- special functions ----------

function logGamma(x: number): number {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2,
    -0.5395239384953e-5,
  ];
  let y = x;
  const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  let ser = 1.000000000190015;
  for (const ci of c) ser += ci / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betaCF(a: number, b: number, x: number): number {
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-14) break;
  }
  return h;
}

/** Regularised incomplete beta I_x(a, b). */
export function incBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betaCF(a, b, x)) / a : 1 - (bt * betaCF(b, a, 1 - x)) / b;
}

/** Regularised upper incomplete gamma Q(a, x). */
function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1;
  const gln = logGamma(a);
  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 0; n < 500; n++) {
      ap++;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 3e-14) break;
    }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - gln);
  }
  const FPMIN = 1e-300;
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-14) break;
  }
  return Math.exp(-x + a * Math.log(x) - gln) * h;
}

/** Two-tailed p-value for a t statistic. */
export function tTestP(t: number, df: number): number {
  if (!Number.isFinite(t) || df <= 0) return NaN;
  return incBeta(df / (df + t * t), df / 2, 0.5);
}

export function chiSquareP(x2: number, df: number): number {
  if (!Number.isFinite(x2) || df <= 0) return NaN;
  return gammaQ(df / 2, x2 / 2);
}

export function fTestP(f: number, df1: number, df2: number): number {
  if (!Number.isFinite(f) || df1 <= 0 || df2 <= 0) return NaN;
  return incBeta(df2 / (df2 + df1 * f), df2 / 2, df1 / 2);
}

// ---------- reliability ----------

/** Cronbach's alpha over complete cases. `rows` = respondents × items. */
export function cronbachAlpha(rows: number[][]): number {
  const k = rows[0]?.length ?? 0;
  if (k < 2 || rows.length < 3) return NaN;
  const itemVars = Array.from({ length: k }, (_, j) => variance(rows.map((r) => r[j])));
  const totalVar = variance(rows.map((r) => r.reduce((a, b) => a + b, 0)));
  if (!(totalVar > 0)) return NaN;
  return (k / (k - 1)) * (1 - itemVars.reduce((a, b) => a + b, 0) / totalVar);
}

// ---------- correlation ----------

export type Correlation = { n: number; r: number; t: number; df: number; p: number };

export function pearson(x: number[], y: number[]): Correlation {
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  const r = sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : NaN;
  const df = n - 2;
  const t = Math.abs(r) >= 1 ? Infinity * Math.sign(r) : (r * Math.sqrt(df)) / Math.sqrt(1 - r * r);
  const p = Math.abs(r) >= 1 ? 0 : tTestP(t, df);
  return { n, r, t, df, p };
}

/** Average ranks, ties share the mean rank. */
export function rank(xs: number[]): number[] {
  const idx = xs.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const ranks = new Array<number>(xs.length);
  for (let i = 0; i < idx.length; ) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const r = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[idx[k][1]] = r;
    i = j + 1;
  }
  return ranks;
}

/** Spearman's rho with the usual t approximation for significance. */
export function spearman(x: number[], y: number[]): Correlation {
  return pearson(rank(x), rank(y));
}

export function strengthLabel(r: number): string {
  const a = Math.abs(r);
  if (!Number.isFinite(a)) return "undefined";
  if (a < 0.1) return "negligible";
  if (a < 0.3) return "weak";
  if (a < 0.5) return "moderate";
  return "strong";
}

// ---------- chi-square test of independence ----------

export type ChiSquare = {
  rows: string[];
  cols: string[];
  observed: number[][];
  expected: number[][];
  x2: number;
  df: number;
  p: number;
  cramersV: number;
  lowExpectedShare: number; // share of cells with expected count < 5
  n: number;
};

export function chiSquare(a: string[], b: string[], rowOrder: string[], colOrder: string[]): ChiSquare {
  const observed = rowOrder.map(() => colOrder.map(() => 0));
  for (let i = 0; i < a.length; i++) {
    const r = rowOrder.indexOf(a[i]);
    const c = colOrder.indexOf(b[i]);
    if (r >= 0 && c >= 0) observed[r][c]++;
  }
  // Drop empty rows/columns so df is correct.
  const keepR = rowOrder.map((_, r) => observed[r].some((v) => v > 0));
  const keepC = colOrder.map((_, c) => observed.some((row) => row[c] > 0));
  const rows = rowOrder.filter((_, r) => keepR[r]);
  const cols = colOrder.filter((_, c) => keepC[c]);
  const obs = observed.filter((_, r) => keepR[r]).map((row) => row.filter((_, c) => keepC[c]));

  const n = obs.flat().reduce((s, v) => s + v, 0);
  const rowSum = obs.map((row) => row.reduce((s, v) => s + v, 0));
  const colSum = cols.map((_, c) => obs.reduce((s, row) => s + row[c], 0));
  const expected = obs.map((_, r) => cols.map((_, c) => (rowSum[r] * colSum[c]) / (n || 1)));
  let x2 = 0;
  let low = 0;
  for (let r = 0; r < rows.length; r++)
    for (let c = 0; c < cols.length; c++) {
      const e = expected[r][c];
      if (e < 5) low++;
      if (e > 0) x2 += (obs[r][c] - e) ** 2 / e;
    }
  const df = (rows.length - 1) * (cols.length - 1);
  const minDim = Math.min(rows.length, cols.length) - 1;
  return {
    rows,
    cols,
    observed: obs,
    expected,
    x2,
    df,
    p: df > 0 ? chiSquareP(x2, df) : NaN,
    cramersV: minDim > 0 && n > 0 ? Math.sqrt(x2 / (n * minDim)) : NaN,
    lowExpectedShare: rows.length * cols.length ? low / (rows.length * cols.length) : 0,
    n,
  };
}

// ---------- OLS regression ----------

export type Coefficient = { name: string; b: number; se: number; beta: number; t: number; p: number };
export type Regression = {
  n: number;
  k: number;
  r2: number;
  adjR2: number;
  f: number;
  df1: number;
  df2: number;
  p: number;
  coefficients: Coefficient[];
};

function invert(m: number[][]): number[][] | null {
  const n = m.length;
  const a = m.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const div = a[col][col];
    for (let j = 0; j < 2 * n; j++) a[col][j] /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = a[r][col];
      for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[col][j];
    }
  }
  return a.map((row) => row.slice(n));
}

/** y = b0 + b1*x1 + ... ; `xs` is one array per predictor. Returns null if singular or too few cases. */
export function ols(y: number[], xs: number[][], names: string[]): Regression | null {
  const n = y.length;
  const k = xs.length;
  if (n <= k + 1) return null;
  const X = y.map((_, i) => [1, ...xs.map((x) => x[i])]);
  const p = k + 1;
  const xtx = Array.from({ length: p }, (_, a) =>
    Array.from({ length: p }, (_, b) => X.reduce((s, row) => s + row[a] * row[b], 0)),
  );
  const inv = invert(xtx);
  if (!inv) return null;
  const xty = Array.from({ length: p }, (_, a) => X.reduce((s, row, i) => s + row[a] * y[i], 0));
  const b = inv.map((row) => row.reduce((s, v, j) => s + v * xty[j], 0));
  const fitted = X.map((row) => row.reduce((s, v, j) => s + v * b[j], 0));
  const my = mean(y);
  const sst = y.reduce((s, v) => s + (v - my) ** 2, 0);
  const sse = y.reduce((s, v, i) => s + (v - fitted[i]) ** 2, 0);
  const df2 = n - k - 1;
  const mse = sse / df2;
  const r2 = sst > 0 ? 1 - sse / sst : NaN;
  const f = (sst - sse) / k / mse;
  const sy = sd(y);
  const coefficients = b.map((bi, j) => {
    const se = Math.sqrt(mse * inv[j][j]);
    const t = bi / se;
    return {
      name: j === 0 ? "(Constant)" : names[j - 1],
      b: bi,
      se,
      beta: j === 0 ? NaN : (bi * sd(xs[j - 1])) / sy,
      t,
      p: tTestP(t, df2),
    };
  });
  return {
    n,
    k,
    r2,
    adjR2: 1 - ((1 - r2) * (n - 1)) / df2,
    f,
    df1: k,
    df2,
    p: fTestP(f, k, df2),
    coefficients,
  };
}

// ---------- formatting ----------

export function fmt(x: number, digits = 2): string {
  return Number.isFinite(x) ? x.toFixed(digits) : "–";
}

/** APA-style p-value. */
export function fmtP(p: number): string {
  if (!Number.isFinite(p)) return "–";
  if (p < 0.001) return "< .001";
  return p.toFixed(3).replace(/^0/, "");
}
