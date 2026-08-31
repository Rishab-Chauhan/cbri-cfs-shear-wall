function SectionDrawing({ section }) {
  const {
    webLength,
    flangeWidth,
    lipLength,
    thickness,
    radius,
  } = section;

  // ------------------------------------------------------------
  // INPUT VALUES
  // ------------------------------------------------------------

  const h = Math.max(Number(webLength) || 0, 1);
  const b = Math.max(Number(flangeWidth) || 0, 1);
  const c = Math.max(Number(lipLength) || 0, 0);
  const t = Math.max(Number(thickness) || 0, 0.01);
  const r = Math.max(Number(radius) || 0, 0);

  // ------------------------------------------------------------
  // SVG SIZE
  // ------------------------------------------------------------

  const svgWidth = 520;
  const svgHeight = 520;

  const availableWidth = 300;
  const availableHeight = 360;

  // ------------------------------------------------------------
  // SCALE
  // ------------------------------------------------------------

  const scale = Math.min(
    availableWidth / b,
    availableHeight / h
  );

  const drawWidth = b * scale;
  const drawHeight = h * scale;

  const startX = (svgWidth - drawWidth) / 2;
  const startY = (svgHeight - drawHeight) / 2 - 10;

  // Actual drawing dimensions
  const H = h * scale;
  const B = b * scale;
  const C = c * scale;
  const T = t * scale;

  // Radius used for the drawing
  const R = Math.min(
    r * scale,
    B / 2,
    C > 0 ? C : B / 2,
    H / 2
  );

  // Inner radius cannot be negative
  const RI = Math.max(R - T, 0);

  const left = startX;
  const right = startX + B;
  const top = startY;
  const bottom = startY + H;

  // ------------------------------------------------------------
  // SECTION PATH
  // ------------------------------------------------------------
  //
  // The path represents the ACTUAL STEEL MATERIAL.
  //
  // It follows:
  //
  // OUTER SURFACE
  //      ↓
  //      top flange
  //      top lip
  //      bottom lip
  //      bottom flange
  //      web
  //
  // then returns along the INNER SURFACE.
  //
  // ------------------------------------------------------------

  let sectionPath = "";

  // ============================================================
  // RADIUS = 0
  // ============================================================

  if (R === 0) {
    sectionPath = `
      M ${left} ${top}

      L ${right} ${top}

      L ${right} ${top + C}

      L ${right - T} ${top + C}

      L ${right - T} ${top + T}

      L ${left + T} ${top + T}

      L ${left + T} ${bottom - T}

      L ${right - T} ${bottom - T}

      L ${right - T} ${bottom - C}

      L ${right} ${bottom - C}

      L ${right} ${bottom}

      L ${left} ${bottom}

      Z
    `;
  }

  // ============================================================
  // RADIUS > 0
  // ============================================================

  else {
    /*
     * The inside radius is:
     *
     * Ri = Ro - t
     *
     * which preserves the actual steel thickness through
     * the bend.
     */

    const outerR = R;
    const innerR = RI;

    // ----------------------------------------------------------
    // TOP WEB / FLANGE BEND
    // ----------------------------------------------------------

    const topOuterStartX = left + outerR;
    const topOuterWebY = top + outerR;

    const topInnerStartX = left + T + innerR;
    const topInnerWebY = top + T + innerR;

    // ----------------------------------------------------------
    // BOTTOM WEB / FLANGE BEND
    // ----------------------------------------------------------

    const bottomOuterStartX = left + outerR;
    const bottomOuterWebY = bottom - outerR;

    const bottomInnerStartX = left + T + innerR;
    const bottomInnerWebY = bottom - T - innerR;

    // ----------------------------------------------------------
    // TOP FLANGE / LIP BEND
    // ----------------------------------------------------------

    const topLipOuterY = top + C;
    const topLipInnerY = top + C;

    // ----------------------------------------------------------
    // BOTTOM FLANGE / LIP BEND
    // ----------------------------------------------------------

    const bottomLipOuterY = bottom - C;
    const bottomLipInnerY = bottom - C;

    sectionPath = `
      M ${topOuterStartX} ${top}

      L ${right - outerR} ${top}

      Q ${right} ${top}
        ${right} ${top + outerR}

      L ${right} ${topLipOuterY}

      L ${right - T} ${topLipInnerY}

      L ${right - T} ${top + T + innerR}

      Q ${right - T} ${top + T}
        ${right - T - innerR} ${top + T}

      L ${topInnerStartX} ${top + T}

      Q ${left + T} ${top + T}
        ${left + T} ${topInnerWebY}

      L ${left + T} ${bottomInnerWebY}

      Q ${left + T} ${bottom - T}
        ${left + T + innerR} ${bottom - T}

      L ${right - T - innerR} ${bottom - T}

      Q ${right - T} ${bottom - T}
        ${right - T} ${bottom - T - innerR}

      L ${right - T} ${bottomLipInnerY}

      L ${right} ${bottomLipOuterY}

      L ${right} ${bottom - outerR}

      Q ${right} ${bottom}
        ${right - outerR} ${bottom}

      L ${bottomOuterStartX} ${bottom}

      Q ${left} ${bottom}
        ${left} ${bottom - outerR}

      L ${left} ${top + outerR}

      Q ${left} ${top}
        ${topOuterStartX} ${top}

      Z
    `;
  }

  // ------------------------------------------------------------
  // DIMENSION HELPERS
  // ------------------------------------------------------------

  const dimensionOffset = 45;

  return (
    <section className="border border-gray-300 bg-white">

      {/* HEADER */}
      <div className="border-b border-gray-300 bg-slate-50 px-6 py-4">
        <h3 className="font-semibold text-blue-800">
          Section View
        </h3>
      </div>

      {/* DRAWING AREA */}
      <div className="flex min-h-[500px] items-center justify-center p-6">

        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="max-w-full"
        >

          {/* ================================================= */}
          {/* ACTUAL CFS MATERIAL */}
          {/* ================================================= */}

          <path
            d={sectionPath}
            fill="#dbeafe"
            stroke="#1d4ed8"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* ================================================= */}
          {/* WEB DIMENSION */}
          {/* ================================================= */}

          <line
            x1={left - dimensionOffset}
            y1={top}
            x2={left - dimensionOffset}
            y2={bottom}
            stroke="#374151"
            strokeWidth="1.2"
          />

          <line
            x1={left - dimensionOffset - 8}
            y1={top}
            x2={left - dimensionOffset + 8}
            y2={top}
            stroke="#374151"
            strokeWidth="1.2"
          />

          <line
            x1={left - dimensionOffset - 8}
            y1={bottom}
            x2={left - dimensionOffset + 8}
            y2={bottom}
            stroke="#374151"
            strokeWidth="1.2"
          />

          <text
            x={left - dimensionOffset - 18}
            y={(top + bottom) / 2}
            fill="#111827"
            fontSize="13"
            textAnchor="middle"
            transform={`
              rotate(
                -90
                ${left - dimensionOffset - 18}
                ${(top + bottom) / 2}
              )
            `}
          >
            {h} mm
          </text>

          {/* ================================================= */}
          {/* FLANGE WIDTH DIMENSION */}
          {/* ================================================= */}

          <line
            x1={left}
            y1={bottom + 35}
            x2={right}
            y2={bottom + 35}
            stroke="#374151"
            strokeWidth="1.2"
          />

          <line
            x1={left}
            y1={bottom + 27}
            x2={left}
            y2={bottom + 43}
            stroke="#374151"
            strokeWidth="1.2"
          />

          <line
            x1={right}
            y1={bottom + 27}
            x2={right}
            y2={bottom + 43}
            stroke="#374151"
            strokeWidth="1.2"
          />

          <text
            x={(left + right) / 2}
            y={bottom + 58}
            fill="#111827"
            fontSize="13"
            textAnchor="middle"
          >
            {b} mm
          </text>

          {/* ================================================= */}
          {/* LIP DIMENSION */}
          {/* ================================================= */}

          {c > 0 && (
            <>
              <line
                x1={right + 30}
                y1={top}
                x2={right + 30}
                y2={top + C}
                stroke="#374151"
                strokeWidth="1.2"
              />

              <line
                x1={right + 22}
                y1={top}
                x2={right + 38}
                y2={top}
                stroke="#374151"
                strokeWidth="1.2"
              />

              <line
                x1={right + 22}
                y1={top + C}
                x2={right + 38}
                y2={top + C}
                stroke="#374151"
                strokeWidth="1.2"
              />

              <text
                x={right + 50}
                y={top + C / 2}
                fill="#111827"
                fontSize="12"
                textAnchor="middle"
                transform={`
                  rotate(
                    -90
                    ${right + 50}
                    ${top + C / 2}
                  )
                `}
              >
                {c} mm
              </text>
            </>
          )}

          {/* ================================================= */}
          {/* THICKNESS LABEL */}
          {/* ================================================= */}

          <text
            x={left + 8}
            y={top - 12}
            fill="#374151"
            fontSize="12"
          >
            t = {t} mm
          </text>

          {/* ================================================= */}
          {/* RADIUS LABEL */}
          {/* ================================================= */}

          <text
            x={left}
            y={bottom + 82}
            fill="#374151"
            fontSize="12"
          >
            R = {r} mm
          </text>

          {/* ================================================= */}
          {/* INSIDE RADIUS LABEL */}
          {/* ================================================= */}

          {r > 0 && (
            <text
              x={left}
              y={bottom + 100}
              fill="#6b7280"
              fontSize="11"
            >
              Ri = {Math.max(r - t, 0).toFixed(2)} mm
            </text>
          )}

        </svg>

      </div>

    </section>
  );
}

export default SectionDrawing;