function cPath({ left, right, top, bottom, C, T, mirrored }) {
  if (!mirrored) {
    return `
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

  return `
    M ${right} ${top}
    L ${left} ${top}
    L ${left} ${top + C}
    L ${left + T} ${top + C}
    L ${left + T} ${top + T}
    L ${right - T} ${top + T}
    L ${right - T} ${bottom - T}
    L ${left + T} ${bottom - T}
    L ${left + T} ${bottom - C}
    L ${left} ${bottom - C}
    L ${left} ${bottom}
    L ${right} ${bottom}
    Z
  `;
}

export default function SectionDrawing({ section, type = "C" }) {
  const h = Math.max(Number(section.webLength) || 0, 1);
  const b = Math.max(Number(section.flangeWidth) || 0, 1);
  const c = Math.max(Number(section.lipLength) || 0, 0);
  const t = Math.max(Number(section.thickness) || 0, 0.01);

  const svgWidth = 360;
  const svgHeight = 280;
  const availableWidth = type === "I" ? 280 : 200;
  const availableHeight = 210;
  const totalWidth = type === "I" ? b * 2 : b;

  const scale = Math.min(availableWidth / totalWidth, availableHeight / h);
  const B = b * scale;
  const H = h * scale;
  const C = c * scale;
  const T = Math.max(t * scale, 1.2);

  const drawWidth = type === "I" ? B * 2 : B;
  const startX = (svgWidth - drawWidth) / 2;
  const startY = (svgHeight - H) / 2;

  const left = type === "I" ? startX + B : startX;
  const right = left + B;
  const top = startY;
  const bottom = startY + H;

  const path = cPath({ left, right, top, bottom, C, T, mirrored: false });
  const mirrorPath =
    type === "I"
          ? cPath({
          left: startX,
          right: startX + B,
          top,
          bottom,
          C,
          T,
          mirrored: true,
        })
      : "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h3 className="mb-1 text-[11px] font-semibold text-blue-900">
        Section Drawing
      </h3>
      <div className="flex min-h-0 flex-1 items-center justify-center border border-slate-300 bg-white">
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
          <text x={left + 6} y={top - 8} fill="#334155" fontSize="10">
            t = {t} mm
          </text>
          <text
            x={(startX + startX + drawWidth) / 2}
            y={bottom + 16}
            textAnchor="middle"
            fill="#334155"
            fontSize="10"
          >
            {type === "I" ? `${(b * 2).toFixed(1)} mm` : `${b} mm`}
          </text>
          <text
            x={startX - 8}
            y={(top + bottom) / 2}
            textAnchor="middle"
            fill="#334155"
            fontSize="10"
            transform={`rotate(-90 ${startX - 8} ${(top + bottom) / 2})`}
          >
            {h} mm
          </text>
        </svg>
      </div>
    </div>
  );
}
