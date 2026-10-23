/**
 * PlanView.jsx
 *
 * Draws a horizontal plan cross-section (top view) of the CFS shear wall.
 *
 * Coordinate system of this SVG:
 *   X-axis  → panel length L  (left = left edge, right = right edge)
 *   Y-axis  → wall depth       (top = front/sheathing face, bottom = back face)
 *   Panel height H is perpendicular to this plane → shown as a reference label only.
 *
 * Each C-stud appears in plan as its cross-section:
 *   Single C  → C-shape  (web + top/bottom flanges + lip returns, open on one side)
 *   Double C  → filled box (two back-to-back Cs with centre dividing line)
 *
 * Sheathing appears as horizontal bands:
 *   Side 1  → always shown (front face, top of drawing)
 *   Side 2  → shown only when sheathingConfiguration === "double"
 */
export default function PlanView({ parameters }) {
  const L = Number(parameters?.panelLength);
  const H = Number(parameters?.panelHeight);

  if (!Number.isFinite(L) || L <= 0 || !Number.isFinite(H) || H <= 0) {
    return (
      <div className="flex items-center justify-center py-1 text-[10px] text-slate-400">
        Panel dimensions required.
      </div>
    );
  }

  const isDouble = parameters?.sheathingConfiguration === "double";
  const nInter = Math.max(
    0,
    Number(parameters?.numberOfSingleStuds ?? parameters?.numberOfIntermediateStuds ?? 1),
  );

  /* ── Canvas coordinates aligned with ScrewPlot ── */
  const svgWidth = 420;
  const svgHeight = 44;
  const margin = { left: 36, right: 28 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = 280 - 22 - 28; // 230px, from ScrewPlot
  const scale = Math.min(plotWidth / L, plotHeight / H);

  // Panel left and right SVG coordinates exactly matching ScrewPlot
  const left = margin.left + plotWidth / 2 + (-L / 2) * scale;
  const right = margin.left + plotWidth / 2 + (L / 2) * scale;
  const wallWidth = right - left;

  /* ── Sheathing & Stud Geometry ── */
  const sheathingThickness = 6.5;
  const topSheathingY = 4;
  const bottomSheathingY = svgHeight - 4 - sheathingThickness;

  const cavityTop = topSheathingY + sheathingThickness;
  const cavityBottom = bottomSheathingY;

  const flangeWidth = 13;
  const lipLength = 3.5;
  const studStrokeWidth = 1.1;

  // Intermediate studs positions
  const intermediateStudXs = [];
  for (let i = 1; i <= nInter; i++) {
    const ratio = i / (nInter + 1);
    intermediateStudXs.push(left + ratio * wallWidth);
  }

  const numEndC = Number(parameters?.numberOfEndCoupledStuds ?? 2);
  const isDoubleEnd = numEndC >= 2;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Optional transparent/white background */}
      <rect width={svgWidth} height={svgHeight} fill="transparent" />

      {/* ── Top Sheathing Band ── */}
      <rect
        x={left}
        y={topSheathingY}
        width={wallWidth}
        height={sheathingThickness}
        fill="#e0aa4a"
        stroke="#5a3d0a"
        strokeWidth="1"
      />

      {/* ── Bottom Sheathing Band (or thin line if single-side) ── */}
      {isDouble ? (
        <rect
          x={left}
          y={bottomSheathingY}
          width={wallWidth}
          height={sheathingThickness}
          fill="#e0aa4a"
          stroke="#5a3d0a"
          strokeWidth="1"
        />
      ) : (
        <line
          x1={left}
          y1={bottomSheathingY + sheathingThickness}
          x2={right}
          y2={bottomSheathingY + sheathingThickness}
          stroke="#94a3b8"
          strokeWidth="1"
        />
      )}

      {/* ── Left End Stud: Double C (Coupled back-to-back facing opposite) ──
          Two Cs back-to-back:
          - Web divider in the middle at (left + flangeWidth).
          - Left C: Web at (left + flangeWidth), flanges extend LEFT to left edge, lips point into cavity.
          - Right C: Web at (left + flangeWidth), flanges extend RIGHT to (left + 2*flangeWidth), lips point into cavity.
          (If single: single C with web at left edge, opening right).
      */}
      <g stroke="#1e293b" strokeWidth={studStrokeWidth} fill="none">
        {isDoubleEnd ? (
          <>
            {/* Shared / back-to-back webs in middle */}
            <line
              x1={left + flangeWidth}
              y1={cavityTop}
              x2={left + flangeWidth}
              y2={cavityBottom}
            />

            {/* Left C (opens left to corner edge) */}
            <line
              x1={left + flangeWidth}
              y1={cavityTop}
              x2={left}
              y2={cavityTop}
            />
            <line
              x1={left + flangeWidth}
              y1={cavityBottom}
              x2={left}
              y2={cavityBottom}
            />
            <line x1={left} y1={cavityTop} x2={left} y2={cavityTop + lipLength} />
            <line
              x1={left}
              y1={cavityBottom}
              x2={left}
              y2={cavityBottom - lipLength}
            />

            {/* Right C (opens right into cavity) */}
            <line
              x1={left + flangeWidth}
              y1={cavityTop}
              x2={left + 2 * flangeWidth}
              y2={cavityTop}
            />
            <line
              x1={left + flangeWidth}
              y1={cavityBottom}
              x2={left + 2 * flangeWidth}
              y2={cavityBottom}
            />
            <line
              x1={left + 2 * flangeWidth}
              y1={cavityTop}
              x2={left + 2 * flangeWidth}
              y2={cavityTop + lipLength}
            />
            <line
              x1={left + 2 * flangeWidth}
              y1={cavityBottom}
              x2={left + 2 * flangeWidth}
              y2={cavityBottom - lipLength}
            />
          </>
        ) : (
          /* Single C at left edge */
          <>
            <line x1={left} y1={cavityTop} x2={left} y2={cavityBottom} />
            <line x1={left} y1={cavityTop} x2={left + flangeWidth} y2={cavityTop} />
            <line x1={left} y1={cavityBottom} x2={left + flangeWidth} y2={cavityBottom} />
            <line
              x1={left + flangeWidth}
              y1={cavityTop}
              x2={left + flangeWidth}
              y2={cavityTop + lipLength}
            />
            <line
              x1={left + flangeWidth}
              y1={cavityBottom}
              x2={left + flangeWidth}
              y2={cavityBottom - lipLength}
            />
          </>
        )}
      </g>

      {/* ── Intermediate Studs ──
          Web is vertical line; flanges go to the LEFT with small lip returns (C opens to left).
          Web line can be slightly lighter grey #9ca3af.
      */}
      {intermediateStudXs.map((x, idx) => (
        <g key={idx} stroke="#1e293b" strokeWidth={studStrokeWidth} fill="none">
          {/* Web (subtle lighter grey) */}
          <line x1={x} y1={cavityTop} x2={x} y2={cavityBottom} stroke="#9ca3af" />
          {/* Top flange going left */}
          <line x1={x} y1={cavityTop} x2={x - flangeWidth} y2={cavityTop} />
          {/* Bottom flange going left */}
          <line x1={x} y1={cavityBottom} x2={x - flangeWidth} y2={cavityBottom} />
          {/* Top lip return pointing into cavity */}
          <line
            x1={x - flangeWidth}
            y1={cavityTop}
            x2={x - flangeWidth}
            y2={cavityTop + lipLength}
          />
          {/* Bottom lip return pointing into cavity */}
          <line
            x1={x - flangeWidth}
            y1={cavityBottom}
            x2={x - flangeWidth}
            y2={cavityBottom - lipLength}
          />
        </g>
      ))}

      {/* ── Right End Stud: Double C (Coupled back-to-back facing opposite) ──
          Two Cs back-to-back:
          - Web divider in the middle at (right - flangeWidth).
          - Right C: Web at (right - flangeWidth), flanges extend RIGHT to right edge, lips point into cavity.
          - Left C: Web at (right - flangeWidth), flanges extend LEFT to (right - 2*flangeWidth), lips point into cavity.
          (If single: single C with web at right edge, opening left).
      */}
      <g stroke="#1e293b" strokeWidth={studStrokeWidth} fill="none">
        {isDoubleEnd ? (
          <>
            {/* Shared / back-to-back webs in middle */}
            <line
              x1={right - flangeWidth}
              y1={cavityTop}
              x2={right - flangeWidth}
              y2={cavityBottom}
            />

            {/* Right C (opens right to corner edge) */}
            <line
              x1={right - flangeWidth}
              y1={cavityTop}
              x2={right}
              y2={cavityTop}
            />
            <line
              x1={right - flangeWidth}
              y1={cavityBottom}
              x2={right}
              y2={cavityBottom}
            />
            <line x1={right} y1={cavityTop} x2={right} y2={cavityTop + lipLength} />
            <line
              x1={right}
              y1={cavityBottom}
              x2={right}
              y2={cavityBottom - lipLength}
            />

            {/* Left C (opens left into cavity) */}
            <line
              x1={right - flangeWidth}
              y1={cavityTop}
              x2={right - 2 * flangeWidth}
              y2={cavityTop}
            />
            <line
              x1={right - flangeWidth}
              y1={cavityBottom}
              x2={right - 2 * flangeWidth}
              y2={cavityBottom}
            />
            <line
              x1={right - 2 * flangeWidth}
              y1={cavityTop}
              x2={right - 2 * flangeWidth}
              y2={cavityTop + lipLength}
            />
            <line
              x1={right - 2 * flangeWidth}
              y1={cavityBottom}
              x2={right - 2 * flangeWidth}
              y2={cavityBottom - lipLength}
            />
          </>
        ) : (
          /* Single C at right edge */
          <>
            <line x1={right} y1={cavityTop} x2={right} y2={cavityBottom} />
            <line x1={right} y1={cavityTop} x2={right - flangeWidth} y2={cavityTop} />
            <line x1={right} y1={cavityBottom} x2={right - flangeWidth} y2={cavityBottom} />
            <line
              x1={right - flangeWidth}
              y1={cavityTop}
              x2={right - flangeWidth}
              y2={cavityTop + lipLength}
            />
            <line
              x1={right - flangeWidth}
              y1={cavityBottom}
              x2={right - flangeWidth}
              y2={cavityBottom - lipLength}
            />
          </>
        )}
      </g>
    </svg>
  );
}
