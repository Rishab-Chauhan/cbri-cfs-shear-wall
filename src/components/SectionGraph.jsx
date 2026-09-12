function niceStep(span) {
  if (!(span > 0)) {
    return 10;
  }

  const raw = span / 6;
  const exp = Math.floor(Math.log10(raw));
  const mag = 10 ** exp;
  const norm = raw / mag;

  if (norm < 1.5) {
    return mag;
  }
  if (norm < 3.5) {
    return 2 * mag;
  }
  if (norm < 7.5) {
    return 5 * mag;
  }
  return 10 * mag;
}

function ticks(min, max, step) {
  const start = Math.floor(min / step) * step;
  const values = [];
  for (let v = start; v <= max + step * 0.001; v += step) {
    values.push(Number(v.toPrecision(8)));
  }
  return values;
}

export default function SectionGraph({ nodes = [], edges = [] }) {
  const validNodes = nodes.filter(
    (node) => Number.isFinite(Number(node.x)) && Number.isFinite(Number(node.y))
  );

  const nodeMap = new Map(
    validNodes.map((node) => [Number(node.id), { ...node, x: Number(node.x), y: Number(node.y) }])
  );

  const xs = validNodes.map((n) => Number(n.x));
  const ys = validNodes.map((n) => Number(n.y));

  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 100;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 100;

  const pad = Math.max((maxX - minX) * 0.12, (maxY - minY) * 0.12, 8);
  const x0 = minX - pad;
  const x1 = maxX + pad;
  const y0 = minY - pad;
  const y1 = maxY + pad;
  const spanX = Math.max(x1 - x0, 1);
  const spanY = Math.max(y1 - y0, 1);
  const span = Math.max(spanX, spanY);
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const viewMinX = midX - span / 2;
  const viewMaxX = midX + span / 2;
  const viewMinY = midY - span / 2;
  const viewMaxY = midY + span / 2;

  const width = 420;
  const height = 320;
  const margin = { top: 18, right: 18, bottom: 28, left: 36 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const toX = (x) =>
    margin.left + ((x - viewMinX) / (viewMaxX - viewMinX)) * innerW;
  const toY = (y) =>
    margin.top + innerH - ((y - viewMinY) / (viewMaxY - viewMinY)) * innerH;

  const step = niceStep(span);
  const xTicks = ticks(viewMinX, viewMaxX, step);
  const yTicks = ticks(viewMinY, viewMaxY, step);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h3 className="mb-1 text-[11px] font-semibold text-blue-900">
        Section Plot
      </h3>
      <div className="min-h-0 flex-1 border border-slate-300 bg-white">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect width={width} height={height} fill="#fbfcfe" />

          {xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={toX(tick)}
                y1={margin.top}
                x2={toX(tick)}
                y2={margin.top + innerH}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={toX(tick)}
                y={height - 8}
                textAnchor="middle"
                fill="#64748b"
                fontSize="8"
              >
                {tick}
              </text>
            </g>
          ))}

          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={margin.left}
                y1={toY(tick)}
                x2={margin.left + innerW}
                y2={toY(tick)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={margin.left - 4}
                y={toY(tick) + 3}
                textAnchor="end"
                fill="#64748b"
                fontSize="8"
              >
                {tick}
              </text>
            </g>
          ))}

          <line
            x1={margin.left}
            y1={toY(0)}
            x2={margin.left + innerW}
            y2={toY(0)}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <line
            x1={toX(0)}
            y1={margin.top}
            x2={toX(0)}
            y2={margin.top + innerH}
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {edges.map((edge) => {
            const start = nodeMap.get(Number(edge.startNode));
            const end = nodeMap.get(Number(edge.endNode));
            if (!start || !end) {
              return null;
            }
            const t = Number(edge.thickness) || 1;
            return (
              <line
                key={edge.id}
                x1={toX(start.x)}
                y1={toY(start.y)}
                x2={toX(end.x)}
                y2={toY(end.y)}
                stroke="#1d4ed8"
                strokeWidth={Math.max(1.5, Math.min(t * 1.6, 8))}
                strokeLinecap="round"
              />
            );
          })}

          {validNodes.map((node) => {
            const x = Number(node.x);
            const y = Number(node.y);
            return (
              <g key={node.id}>
                <circle
                  cx={toX(x)}
                  cy={toY(y)}
                  r="3.5"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <text
                  x={toX(x) + 6}
                  y={toY(y) - 6}
                  fill="#0f172a"
                  fontSize="9"
                  fontWeight="600"
                >
                  {node.id}
                </text>
              </g>
            );
          })}

          <text x={width - 10} y={height - 6} textAnchor="end" fill="#64748b" fontSize="8">
            X (mm)
          </text>
          <text
            x={12}
            y={14}
            fill="#64748b"
            fontSize="8"
          >
            Y (mm)
          </text>
        </svg>
      </div>
    </div>
  );
}
