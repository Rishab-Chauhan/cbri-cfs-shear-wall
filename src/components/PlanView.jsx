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
      <div className="flex items-center justify-center py-2 text-[10px] text-slate-400 italic">
        Panel dimensions required to render section view.
      </div>
    );
  }

  const isDouble    = parameters?.sheathingConfiguration === "double";
  const mat1        = parameters?.sheathingMaterial  ?? "DFP";
  const mat2        = parameters?.sheathingMaterial2 ?? mat1;
  const numEndC     = Number(parameters?.numberOfEndCoupledStuds ?? 2);
  const isDoubleEnd = numEndC >= 2;
  const nInter      = Math.max(
    0,
    Number(parameters?.numberOfSingleStuds ?? parameters?.numberOfIntermediateStuds ?? 1),
  );

  /* ── SVG canvas ─────────────────────────────────────────────────── */
  const SVG_W = 414;
  const SVG_H = 102;
  const ML = 14, MR = 62, MT = 9, MB = 30;   // margins (B = room for L dim, R = H label)
  const DW = SVG_W - ML - MR;                 // drawing width  (wall length direction)
  const DH = SVG_H - MT - MB;                 // drawing height (wall depth, schematic)

  /* ── Y positions ─────────────────────────────────────────────────── */
  const SHEATH_T   = 7;                        // visual sheathing thickness (px)
  const NUM_LAYERS = isDouble ? 2 : 1;
  const CAV_H      = DH - NUM_LAYERS * SHEATH_T; // cavity height (between sheathings)

  const x0   = ML;
  const y0   = MT;
  const xMax = x0 + DW;

  const SY1  = y0;                             // top of Side-1 sheathing
  const CAV_Y = y0 + SHEATH_T;                 // top of cavity
  const CAV_B = CAV_Y + CAV_H;                 // bottom of cavity
  const SY2  = CAV_B;                          // top of Side-2 sheathing (if double)

  /* ── Stud visual geometry ────────────────────────────────────────── */
  // End stud: each C has a visual flange-width FW_E in X direction.
  // Two back-to-back Cs → total end-stud span = 2 × FW_E.
  const FW_E   = 13;                           // flange width of each C in end stud
  const FW_INT = 13;                           // flange width of intermediate single C
  const LIP_D  = 3.5;                          // lip return length (in Y, into cavity)
  const SW     = 1.5;                          // default stroke width

  /* ── Intermediate stud centres ───────────────────────────────────── */
  const intCenters = [];
  for (let i = 1; i <= nInter; i++) {
    intCenters.push(x0 + (i / (nInter + 1)) * DW);
  }

  /* ── Dimension positions ─────────────────────────────────────────── */
  const DIM_Y  = y0 + DH + 13;                // Y of L dimension line
  const H_X    = xMax + 10;                   // X of H reference line
  const H_MID  = y0 + DH / 2;               // mid-Y for H label

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ display: "block", width: "100%", height: SVG_H }}
      preserveAspectRatio="xMidYMid meet"
      aria-label="Plan cross-section of sheathed CFS wall framing"
    >
      {/* Background */}
      <rect width={SVG_W} height={SVG_H} fill="#f8fafc" />

      {/* ── Cavity fill (air space between sheathings) ── */}
      <rect x={x0} y={CAV_Y} width={DW} height={CAV_H} fill="#eef2f7" />

      {/* ── Side-1 sheathing (front face) ── */}
      <rect
        x={x0} y={SY1} width={DW} height={SHEATH_T}
        fill="#d4a54a" stroke="#8a640c" strokeWidth="0.85"
      />
      <text
        x={x0 + DW / 2} y={SY1 + SHEATH_T - 1.5}
        textAnchor="middle" fill="#4a2d00" fontSize="5.5" fontWeight="700"
      >
        {mat1} SHEATHING — SIDE 1
      </text>

      {/* ── Side-2 sheathing (back face, double only) ── */}
      {isDouble ? (
        <>
          <rect
            x={x0} y={SY2} width={DW} height={SHEATH_T}
            fill="#d4a54a" stroke="#8a640c" strokeWidth="0.85"
          />
          <text
            x={x0 + DW / 2} y={SY2 + SHEATH_T - 1.5}
            textAnchor="middle" fill="#4a2d00" fontSize="5.5" fontWeight="700"
          >
            {mat2} SHEATHING — SIDE 2
          </text>
        </>
      ) : (
        /* Subtle back-face indicator when only single-side */
        <rect
          x={x0} y={CAV_B} width={DW} height={1.5}
          fill="#94a3b8" opacity="0.45"
        />
      )}

      {/* ── Wall outline ── */}
      <rect
        x={x0} y={y0} width={DW} height={DH}
        fill="none" stroke="#475569" strokeWidth="1.1"
      />

      {/* ══════════════════════════════════════════
          LEFT END STUD — Double C (back-to-back)
          Left C:  web at x0,          flanges → right
          Right C: web at x0+2×FW_E,   flanges → left
          Shared interior at x0+FW_E
         ══════════════════════════════════════════ */}
      <g>
        {/* Filled box for double-C (light steel grey) */}
        {isDoubleEnd ? (
          <>
            <rect
              x={x0} y={CAV_Y}
              width={2 * FW_E} height={CAV_H}
              fill="#c8d3e3" stroke="#1e293b" strokeWidth="1.2"
            />
            {/* Centre dividing line (shared web zone) */}
            <line
              x1={x0 + FW_E} y1={CAV_Y} x2={x0 + FW_E} y2={CAV_B}
              stroke="#334155" strokeWidth="0.85" strokeDasharray="2.5 1.5"
            />
          </>
        ) : (
          /* Single end C: open outline */
          <g stroke="#1e293b" strokeWidth={SW} fill="none">
            <line x1={x0}        y1={CAV_Y} x2={x0}        y2={CAV_B} />
            <line x1={x0}        y1={CAV_Y} x2={x0 + FW_E} y2={CAV_Y} />
            <line x1={x0}        y1={CAV_B} x2={x0 + FW_E} y2={CAV_B} />
            <line x1={x0 + FW_E} y1={CAV_Y} x2={x0 + FW_E} y2={CAV_Y + LIP_D} />
            <line x1={x0 + FW_E} y1={CAV_B} x2={x0 + FW_E} y2={CAV_B - LIP_D} />
          </g>
        )}
      </g>

      {/* ══════════════════════════════════════════
          RIGHT END STUD — Double C (mirrored)
         ══════════════════════════════════════════ */}
      <g>
        {isDoubleEnd ? (
          <>
            <rect
              x={xMax - 2 * FW_E} y={CAV_Y}
              width={2 * FW_E} height={CAV_H}
              fill="#c8d3e3" stroke="#1e293b" strokeWidth="1.2"
            />
            <line
              x1={xMax - FW_E} y1={CAV_Y} x2={xMax - FW_E} y2={CAV_B}
              stroke="#334155" strokeWidth="0.85" strokeDasharray="2.5 1.5"
            />
          </>
        ) : (
          <g stroke="#1e293b" strokeWidth={SW} fill="none">
            <line x1={xMax}        y1={CAV_Y} x2={xMax}        y2={CAV_B} />
            <line x1={xMax}        y1={CAV_Y} x2={xMax - FW_E} y2={CAV_Y} />
            <line x1={xMax}        y1={CAV_B} x2={xMax - FW_E} y2={CAV_B} />
            <line x1={xMax - FW_E} y1={CAV_Y} x2={xMax - FW_E} y2={CAV_Y + LIP_D} />
            <line x1={xMax - FW_E} y1={CAV_B} x2={xMax - FW_E} y2={CAV_B - LIP_D} />
          </g>
        )}
      </g>

      {/* ══════════════════════════════════════════
          INTERMEDIATE STUDS — Single C each
          Web on left side, C opens to the right.
         ══════════════════════════════════════════ */}
      {intCenters.map((cx, i) => {
        const x1 = cx - FW_INT / 2;   // web (left side)
        const x2 = cx + FW_INT / 2;   // open end (right side, has lips)
        return (
          <g key={i} stroke="#1e293b" strokeWidth={SW} fill="none">
            {/* Web */}
            <line x1={x1} y1={CAV_Y} x2={x1} y2={CAV_B} />
            {/* Top flange */}
            <line x1={x1} y1={CAV_Y} x2={x2} y2={CAV_Y} />
            {/* Bottom flange */}
            <line x1={x1} y1={CAV_B} x2={x2} y2={CAV_B} />
            {/* Top lip return */}
            <line x1={x2} y1={CAV_Y} x2={x2} y2={CAV_Y + LIP_D} />
            {/* Bottom lip return */}
            <line x1={x2} y1={CAV_B} x2={x2} y2={CAV_B - LIP_D} />
          </g>
        );
      })}

      {/* ══════════════════════════════════════════
          DIMENSION: L (horizontal)
         ══════════════════════════════════════════ */}
      {/* Extension lines */}
      <line x1={x0}   y1={y0 + DH + 3} x2={x0}   y2={DIM_Y + 3} stroke="#64748b" strokeWidth="0.65" />
      <line x1={xMax} y1={y0 + DH + 3} x2={xMax} y2={DIM_Y + 3} stroke="#64748b" strokeWidth="0.65" />
      {/* Dimension line */}
      <line x1={x0} y1={DIM_Y} x2={xMax} y2={DIM_Y} stroke="#1d4ed8" strokeWidth="0.95" />
      {/* Arrowheads */}
      <polygon
        points={`${x0},${DIM_Y} ${x0 + 6},${DIM_Y - 2.5} ${x0 + 6},${DIM_Y + 2.5}`}
        fill="#1d4ed8"
      />
      <polygon
        points={`${xMax},${DIM_Y} ${xMax - 6},${DIM_Y - 2.5} ${xMax - 6},${DIM_Y + 2.5}`}
        fill="#1d4ed8"
      />
      {/* Label */}
      <text
        x={(x0 + xMax) / 2} y={DIM_Y + 11}
        textAnchor="middle" fill="#1e3a8a" fontSize="8.5" fontWeight="700"
      >
        L = {L} mm
      </text>

      {/* ══════════════════════════════════════════
          REFERENCE: H (panel height, out-of-plane)
          Shown as a dashed vertical reference line
          with rotated label on the right side.
         ══════════════════════════════════════════ */}
      {/* Dashed reference line */}
      <line
        x1={H_X} y1={y0} x2={H_X} y2={y0 + DH}
        stroke="#475569" strokeWidth="0.7" strokeDasharray="3 2"
      />
      {/* Small tick marks at top and bottom */}
      <line x1={H_X - 3} y1={y0}       x2={H_X + 3} y2={y0}       stroke="#475569" strokeWidth="1" />
      <line x1={H_X - 3} y1={y0 + DH}  x2={H_X + 3} y2={y0 + DH}  stroke="#475569" strokeWidth="1" />
      {/* Rotated label */}
      <text
        x={H_X + 18} y={H_MID}
        textAnchor="middle"
        fill="#374151" fontSize="7.5" fontWeight="600"
        transform={`rotate(-90 ${H_X + 18} ${H_MID})`}
      >
        H = {H} mm
      </text>

      {/* ── Legend (small text annotations) ── */}
      {isDoubleEnd && (
        <>
          <text x={x0 + FW_E}        y={y0 + DH + 1} textAnchor="middle" fill="#475569" fontSize="6">2×C</text>
          <text x={xMax - FW_E}      y={y0 + DH + 1} textAnchor="middle" fill="#475569" fontSize="6">2×C</text>
        </>
      )}
      {intCenters.map((cx, i) => (
        <text key={i} x={cx} y={y0 + DH + 1} textAnchor="middle" fill="#475569" fontSize="6">C</text>
      ))}
    </svg>
  );
}
