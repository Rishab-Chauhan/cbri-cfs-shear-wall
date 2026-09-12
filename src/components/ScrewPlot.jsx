const LOCATION_COLORS = {
  "Top edge": "#1d4ed8",
  "Bottom edge": "#1d4ed8",
  "Left edge": "#1d4ed8",
  "Right edge": "#1d4ed8",
  "Intermediate stud": "#dc2626",
  "Horizontal bracing": "#059669",
};

function colorFor(location) {
  return LOCATION_COLORS[location] || "#111827";
}

export default function ScrewPlot({
  screws = [],
  panelLength,
  panelHeight,
}) {
  const L = Number(panelLength);
  const H = Number(panelHeight);

  if (!Number.isFinite(L) || !Number.isFinite(H) || L <= 0 || H <= 0) {
    return (
      <p className="text-[11px] text-slate-500">
        Panel dimensions are required to plot the screws.
      </p>
    );
  }

  const svgWidth = 420;
  const svgHeight = 280;
  const margin = { top: 22, right: 28, bottom: 28, left: 36 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;
  const scale = Math.min(plotWidth / L, plotHeight / H);

  const xToSvg = (x) => margin.left + plotWidth / 2 + x * scale;
  const yToSvg = (y) => margin.top + plotHeight / 2 - y * scale;

  const left = xToSvg(-L / 2);
  const right = xToSvg(L / 2);
  const top = yToSvg(H / 2);
  const bottom = yToSvg(-H / 2);

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width={svgWidth} height={svgHeight} fill="#fbfcfe" />
      <rect
        x={left}
        y={top}
        width={right - left}
        height={bottom - top}
        fill="#ffffff"
        stroke="#1e3a8a"
        strokeWidth="1.5"
      />
      <line
        x1={left}
        y1={yToSvg(0)}
        x2={right}
        y2={yToSvg(0)}
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <line
        x1={xToSvg(0)}
        y1={top}
        x2={xToSvg(0)}
        y2={bottom}
        stroke="#e2e8f0"
        strokeWidth="1"
      />

      {screws.map((screw) => (
        <g key={screw.number}>
          <circle
            cx={xToSvg(screw.x)}
            cy={yToSvg(screw.y)}
            r="3"
            fill={colorFor(screw.location)}
            stroke="#ffffff"
            strokeWidth="0.8"
          />
          <text
            x={xToSvg(screw.x) + 4}
            y={yToSvg(screw.y) - 4}
            fill="#0f172a"
            fontSize="7"
          >
            {screw.number}
          </text>
        </g>
      ))}

      <text
        x={(left + right) / 2}
        y={bottom + 16}
        textAnchor="middle"
        fill="#334155"
        fontSize="9"
      >
        L = {L} mm
      </text>
      <text
        x={left - 14}
        y={(top + bottom) / 2}
        textAnchor="middle"
        fill="#334155"
        fontSize="9"
        transform={`rotate(-90 ${left - 14} ${(top + bottom) / 2})`}
      >
        H = {H} mm
      </text>
    </svg>
  );
}
