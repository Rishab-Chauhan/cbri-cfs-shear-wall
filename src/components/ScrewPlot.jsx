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
      <p className="text-sm text-gray-500">
        Panel dimensions are required to plot the screws.
      </p>
    );
  }

  const svgWidth = 640;
  const svgHeight = 720;
  const margin = { top: 50, right: 70, bottom: 80, left: 80 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;
  const scale = Math.min(plotWidth / L, plotHeight / H);

  const xToSvg = (x) => margin.left + plotWidth / 2 + x * scale;
  const yToSvg = (y) => margin.top + plotHeight / 2 - y * scale;

  const left = xToSvg(-L / 2);
  const right = xToSvg(L / 2);
  const top = yToSvg(H / 2);
  const bottom = yToSvg(-H / 2);
  const originX = xToSvg(0);
  const originY = yToSvg(0);

  const locations = [...new Set(screws.map((screw) => screw.location))];

  return (
    <div className="flex flex-col items-center">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="max-w-full"
      >
        <rect
          x={left}
          y={top}
          width={right - left}
          height={bottom - top}
          fill="#f8fafc"
          stroke="#1e3a8a"
          strokeWidth="2"
        />

        <line
          x1={left}
          y1={top}
          x2={left}
          y2={bottom}
          stroke="#64748b"
          strokeWidth="6"
          strokeLinecap="square"
        />
        <line
          x1={right}
          y1={top}
          x2={right}
          y2={bottom}
          stroke="#64748b"
          strokeWidth="6"
          strokeLinecap="square"
        />
        <line
          x1={originX}
          y1={top}
          x2={originX}
          y2={bottom}
          stroke="#94a3b8"
          strokeWidth="4"
          strokeLinecap="square"
        />
        <line
          x1={left}
          y1={top}
          x2={right}
          y2={top}
          stroke="#64748b"
          strokeWidth="5"
        />
        <line
          x1={left}
          y1={bottom}
          x2={right}
          y2={bottom}
          stroke="#64748b"
          strokeWidth="5"
        />

        <line
          x1={left - 8}
          y1={originY}
          x2={right + 8}
          y2={originY}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1={originX}
          y1={top - 8}
          x2={originX}
          y2={bottom + 8}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {screws.map((screw) => (
          <circle
            key={screw.number}
            cx={xToSvg(screw.x)}
            cy={yToSvg(screw.y)}
            r="4.5"
            fill={colorFor(screw.location)}
            stroke="#ffffff"
            strokeWidth="1"
          />
        ))}

        <text
          x={(left + right) / 2}
          y={bottom + 28}
          textAnchor="middle"
          fill="#111827"
          fontSize="13"
        >
          L = {L} mm
        </text>
        <text
          x={left - 28}
          y={(top + bottom) / 2}
          textAnchor="middle"
          fill="#111827"
          fontSize="13"
          transform={`rotate(-90 ${left - 28} ${(top + bottom) / 2})`}
        >
          H = {H} mm
        </text>
        <text
          x={originX + 8}
          y={originY - 8}
          fill="#64748b"
          fontSize="11"
        >
          (0, 0)
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
        {locations.map((location) => (
          <span key={location} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colorFor(location) }}
            />
            {location}
          </span>
        ))}
        <span>{screws.length} screws</span>
      </div>
    </div>
  );
}
