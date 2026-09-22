function cPath({ left, right, top, bottom, C, Tw, Tf, Tl, mirrored }) {
  const hasLip = C > 0.05 && Tl > 0.005;

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

export default function SectionDrawing({ section, type = "C" }) {
  const h = Math.max(Number(section.webLength) || 0, 1);
  const b = Math.max(Number(section.flangeWidth) || 0, 1);
  const c = Math.max(Number(section.lipLength) || 0, 0);

  const tw = Math.max(Number(section.webThickness ?? section.thickness) || 0, 0.01);
  const tf = Math.max(Number(section.flangeThickness ?? section.thickness) || 0, 0.01);
  const tl = Math.max(Number(section.lipThickness ?? section.flangeThickness ?? section.thickness) || 0, 0.01);

  const hasLip = c > 0.05 && tl > 0.005;

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

  const drawWidth = type === "I" ? B * 2 : B;
  const startX = (svgWidth - drawWidth) / 2;
  const startY = (svgHeight - H) / 2;

  const left = type === "I" ? startX + B : startX;
  const right = left + B;
  const top = startY;
  const bottom = startY + H;

  const path = cPath({ left, right, top, bottom, C, Tw, Tf, Tl, mirrored: false });
  const mirrorPath =
    type === "I"
      ? cPath({
          left: startX,
          right: startX + B,
          top,
          bottom,
          C,
          Tw,
          Tf,
          Tl,
          mirrored: true,
        })
      : "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h3 className="mb-1 text-[11px] font-semibold text-blue-900">
        Section Drawing
      </h3>
      <div className="relative flex min-h-0 flex-1 items-center justify-center border border-slate-300 bg-white">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-full max-h-full w-full"
        >
          {type === "I" ? (
            <path
              d={mirrorPath}
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

        {/* Thickness labels badge showing Web, Flange, and Lip thicknesses */}
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
        </div>
      </div>
    </div>
  );
}
