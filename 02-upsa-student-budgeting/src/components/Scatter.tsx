import type { Regression } from "@/lib/stats";

/** SVG scatter of composite scores (1–5 on both axes) with the OLS line. */
export default function Scatter({
  points,
  xLabel,
  yLabel,
  slope,
}: {
  points: [number, number][];
  xLabel: string;
  yLabel: string;
  slope: Regression | null;
}) {
  const W = 360;
  const H = 280;
  const pad = { l: 40, r: 12, t: 10, b: 40 };
  const x = (v: number) => pad.l + ((v - 1) / 4) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - ((v - 1) / 4) * (H - pad.t - pad.b);
  const ticks = [1, 2, 3, 4, 5];
  const b0 = slope?.coefficients[0]?.b;
  const b1 = slope?.coefficients[1]?.b;
  const clampY = (v: number) => Math.max(1, Math.min(5, v));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Scatter plot of ${yLabel} against ${xLabel}`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={pad.t} y2={H - pad.b} stroke="var(--border)" />
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border)" />
          <text x={x(t)} y={H - pad.b + 14} fontSize="10" textAnchor="middle" fill="var(--muted)">
            {t}
          </text>
          <text x={pad.l - 8} y={y(t) + 3} fontSize="10" textAnchor="end" fill="var(--muted)">
            {t}
          </text>
        </g>
      ))}
      {points.map(([px, py], i) => (
        <circle key={i} cx={x(px)} cy={y(py)} r={3} fill="var(--accent)" fillOpacity={0.45} />
      ))}
      {b0 !== undefined && b1 !== undefined && Number.isFinite(b0) && Number.isFinite(b1) && (
        <line x1={x(1)} y1={y(clampY(b0 + b1))} x2={x(5)} y2={y(clampY(b0 + 5 * b1))} stroke="var(--foreground)" strokeWidth={1.5} />
      )}
      <text x={(pad.l + W - pad.r) / 2} y={H - 6} fontSize="11" textAnchor="middle" fill="var(--muted)">
        {xLabel}
      </text>
      <text
        x={12}
        y={(pad.t + H - pad.b) / 2}
        fontSize="11"
        textAnchor="middle"
        fill="var(--muted)"
        transform={`rotate(-90 12 ${(pad.t + H - pad.b) / 2})`}
      >
        {yLabel}
      </text>
    </svg>
  );
}
