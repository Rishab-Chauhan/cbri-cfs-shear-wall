function cPath({ left, right, top, bottom, C, Tw, Tf, Tl, mirrored, R }) {
  const hasLip = C > 0.05 && Tl > 0.005;

  if (!R || R <= 0) {
    if (!mirrored) {
      if (hasLip) {
        return `
          M ${left} ${top}
          L ${right} ${top}
          L ${right} ${top + Tf + C}
          L ${right - Tl} ${top + Tf + C}
          L ${right - Tl} ${top + Tf}
          L ${left + Tw} ${top + Tf}
          L ${left + Tw} ${bottom - Tf}
          L ${right - Tl} ${bottom - Tf}
          L ${right - Tl} ${bottom - Tf - C}
          L ${right} ${bottom - Tf - C}
          L ${right} ${bottom}
          L ${left} ${bottom}
          Z
        `;
      }

      // Plain channel (no lip): completely flat at ends, zero spurious lines
      return `
        M ${left} ${top}
        L ${right} ${top}
        L ${right} ${top + Tf}
        L ${left + Tw} ${top + Tf}
        L ${left + Tw} ${bottom - Tf}
        L ${right} ${bottom - Tf}
        L ${right} ${bottom}
        L ${left} ${bottom}
        Z
      `;
    }

    // Mirrored (extends towards the left)
    if (hasLip) {
      return `
        M ${right} ${top}
        L ${left} ${top}
        L ${left} ${top + Tf + C}
        L ${left + Tl} ${top + Tf + C}
        L ${left + Tl} ${top + Tf}
        L ${right - Tw} ${top + Tf}
        L ${right - Tw} ${bottom - Tf}
        L ${left + Tl} ${bottom - Tf}
        L ${left + Tl} ${bottom - Tf - C}
        L ${left} ${bottom - Tf - C}
        L ${left} ${bottom}
        L ${right} ${bottom}
        Z
      `;
    }

    // Plain channel mirrored (no lip)
    return `
      M ${right} ${top}
      L ${left} ${top}
      L ${left} ${top + Tf}
      L ${right - Tw} ${top + Tf}
      L ${right - Tw} ${bottom - Tf}
      L ${left} ${bottom - Tf}
      L ${left} ${bottom}
      L ${right} ${bottom}
      Z
    `;
  }

  // Rounded corners (R > 0)
  // Base non-mirrored path
  const tbW = (Tw + Tf) / 2;
  const tbL = hasLip ? (Tf + Tl) / 2 : 0;

  // Outer and inner radii
  let RoW = R + tbW;
  let RiW = R;
  let RoL = hasLip ? R + tbL : 0;
  let RiL = hasLip ? R : 0;

  // Available flat lengths (in px)
  const totalW = right - left;
  const totalH = bottom - top;

  // Clamp radii so they never exceed half the available flat length / element dimensions
  // Web height: 2 * RoW <= totalH -> RoW <= totalH / 2
  // Flange width: RoW + RoL <= totalW
  // Lip height: RoL <= Tf + C
  const maxRoW_H = totalH / 2.05;
  const maxRoW_W = hasLip ? totalW / 2.05 : totalW * 0.95;
  RoW = Math.max(0.1, Math.min(RoW, maxRoW_H, maxRoW_W));
  RiW = Math.max(0.1, Math.min(RiW, RoW - 0.5));

  if (hasLip) {
    const maxRoL_W = totalW - RoW - 0.5;
    const maxRoL_H = Tf + C - 0.5;
    RoL = Math.max(0.1, Math.min(RoL, maxRoL_W, maxRoL_H));
    RiL = Math.max(0.1, Math.min(RiL, RoL - 0.5));
  }

  if (hasLip) {
    return `
      M ${left + RoW} ${top}
      L ${right - RoL} ${top}
      A ${RoL} ${RoL} 0 0 1 ${right} ${top + RoL}
      L ${right} ${top + Tf + C}
      L ${right - Tl} ${top + Tf + C}
      L ${right - Tl} ${top + Tf + RiL}
      A ${RiL} ${RiL} 0 0 0 ${right - Tl - RiL} ${top + Tf}
      L ${left + Tw + RiW} ${top + Tf}
      A ${RiW} ${RiW} 0 0 0 ${left + Tw} ${top + Tf + RiW}
      L ${left + Tw} ${bottom - Tf - RiW}
      A ${RiW} ${RiW} 0 0 0 ${left + Tw + RiW} ${bottom - Tf}
      L ${right - Tl - RiL} ${bottom - Tf}
      A ${RiL} ${RiL} 0 0 0 ${right - Tl} ${bottom - Tf - RiL}
      L ${right - Tl} ${bottom - Tf - C}
      L ${right} ${bottom - Tf - C}
      L ${right} ${bottom - RoL}
      A ${RoL} ${RoL} 0 0 1 ${right - RoL} ${bottom}
      L ${left + RoW} ${bottom}
      A ${RoW} ${RoW} 0 0 1 ${left} ${bottom - RoW}
      L ${left} ${top + RoW}
      A ${RoW} ${RoW} 0 0 1 ${left + RoW} ${top}
      Z
    `;
  }

  // Plain channel with R > 0 (no lip)
  return `
    M ${left + RoW} ${top}
    L ${right} ${top}
    L ${right} ${top + Tf}
    L ${left + Tw + RiW} ${top + Tf}
    A ${RiW} ${RiW} 0 0 0 ${left + Tw} ${top + Tf + RiW}
    L ${left + Tw} ${bottom - Tf - RiW}
    A ${RiW} ${RiW} 0 0 0 ${left + Tw + RiW} ${bottom - Tf}
    L ${right} ${bottom - Tf}
    L ${right} ${bottom}
    L ${left + RoW} ${bottom}
    A ${RoW} ${RoW} 0 0 1 ${left} ${bottom - RoW}
    L ${left} ${top + RoW}
    A ${RoW} ${RoW} 0 0 1 ${left + RoW} ${top}
    Z
  `;
}

export default function SectionDrawing({ section, type = "C" }) {
  const h = Math.max(Number(section.webLength) || 0, 1);
  const b = Math.max(Number(section.flangeWidth) || 0, 1);
  const c = Math.max(Number(section.lipLength) || 0, 0);

  const tw = Math.max(Number(section.webThickness ?? section.thickness) || 0, 0.01);
  const tf = Math.max(Number(section.flangeThickness ?? section.thickness) || 0, 0.01);
  const tl = Math.max(Number(section.lipThickness ?? section.flangeThickness ?? section.thickness) || 0, 0.01);

  const rawRadius = section.radius !== undefined && section.radius !== null && String(section.radius).trim() !== ""
    ? Number(section.radius)
    : 0;
  const radius = Number.isFinite(rawRadius) && rawRadius > 0 ? rawRadius : 0;

  const hasLip = c > 0.05 && tl > 0.005;

  // Check if radius is too large for the section
  let isRadiusTooLarge = false;
  if (radius > 0) {
    const tb_w = (tw + tf) / 2;
    const kw = radius + tb_w;
    const webFlatH = h - 2 * kw;
    const tb_l = hasLip ? (tf + tl) / 2 : 0;
    const kl = hasLip ? radius + tb_l : 0;
    const flangeFlatW = hasLip ? (b - kw - kl) : (b - kw);
    const lipFlatD = hasLip ? (c + tf - kl) : 0;
    if (webFlatH <= 0 || flangeFlatW <= 0 || (hasLip && lipFlatD < 0)) {
      isRadiusTooLarge = true;
    }
  }

  const svgWidth = 360;
  const svgHeight = 280;
  const availableWidth = type === "I" ? 280 : 200;
  const availableHeight = 200;
  const totalWidth = type === "I" ? b * 2 : b;

  const scale = Math.min(availableWidth / totalWidth, availableHeight / h);
  const B = b * scale;
  const H = h * scale;
  const C = c * scale;

  const Tw = Math.max(tw * scale, 1.5);
  const Tf = Math.max(tf * scale, 1.5);
  const Tl = Math.max(tl * scale, 1.5);
  const R = radius * scale;

  const drawWidth = type === "I" ? B * 2 : B;
  const startX = (svgWidth - drawWidth) / 2;
  const startY = (svgHeight - H) / 2;

  const left = type === "I" ? startX + B : startX;
  const right = left + B;
  const top = startY;
  const bottom = startY + H;

  const path = cPath({ left, right, top, bottom, C, Tw, Tf, Tl, mirrored: false, R });
  const mirrorPath =
    type === "I"
      ? (R > 0
          ? path // Will use SVG transform to mirror across the shared web line
          : cPath({
              left: startX,
              right: startX + B,
              top,
              bottom,
              C,
              Tw,
              Tf,
              Tl,
              mirrored: true,
              R: 0,
            }))
      : "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h3 className="mb-1 text-[11px] font-semibold text-blue-900">
        Section Drawing
      </h3>
      <div className="relative flex min-h-0 flex-1 items-center justify-center border border-slate-300 bg-white">
        {isRadiusTooLarge && (
          <div className="absolute top-2 left-2 z-10 rounded bg-red-50 border border-red-200 px-2 py-0.5 text-[11px] font-semibold text-red-600">
            Radius too large
          </div>
        )}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-full max-h-full w-full"
        >
          {type === "I" ? (
            <path
              d={mirrorPath}
              transform={R > 0 ? `translate(${2 * (startX + B)} 0) scale(-1 1)` : undefined}
              fill="#dbeafe"
              stroke="#1d4ed8"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          ) : null}
          <path
            d={path}
            fill="#dbeafe"
            stroke="#1d4ed8"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Dimension: Total Width */}
          <text
            x={(startX + startX + drawWidth) / 2}
            y={bottom + 16}
            textAnchor="middle"
            fill="#334155"
            fontSize="10"
            fontWeight="500"
          >
            {type === "I" ? `${(b * 2).toFixed(1)} mm` : `${b} mm`}
          </text>

          {/* Dimension: Total Depth (Web Length) */}
          <text
            x={startX - 8}
            y={(top + bottom) / 2}
            textAnchor="middle"
            fill="#334155"
            fontSize="10"
            fontWeight="500"
            transform={`rotate(-90 ${startX - 8} ${(top + bottom) / 2})`}
          >
            {h} mm
          </text>
        </svg>

        {/* Thickness labels badge showing Web, Flange, Lip thicknesses, and Corner Radius */}
        <div className="absolute top-2 right-2 flex flex-col gap-0.5 rounded border border-slate-200 bg-slate-50/90 px-2 py-1 text-[10px] text-slate-700 shadow-xs backdrop-blur-xs">
          <div>
            <span className="font-semibold text-slate-900">t_web:</span> {tw} mm
          </div>
          <div>
            <span className="font-semibold text-slate-900">t_flange:</span> {tf} mm
          </div>
          {hasLip ? (
            <div>
              <span className="font-semibold text-slate-900">t_lip:</span> {tl} mm
            </div>
          ) : (
            <div className="italic text-slate-400">no lip</div>
          )}
          <div>
            <span className="font-semibold text-slate-900">R:</span>{" "}
            {radius > 0 ? `${radius} mm` : "sharp"}
          </div>
        </div>
      </div>
    </div>
  );
}
