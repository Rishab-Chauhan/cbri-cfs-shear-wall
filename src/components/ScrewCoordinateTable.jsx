function formatValue(value, digits = 3) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(digits);
}

export function downloadScrewCsv(screws, filename = "screw_coordinates.csv") {
  if (!Array.isArray(screws) || screws.length === 0) {
    return;
  }

  const headers = [
    "Screw No.",
    "X (mm)",
    "Y (mm)",
    "Location",
    "X^2",
    "Y^2",
    "X^2 + Y^2",
    "Y + delta_y",
    "(Y + delta_y)^2",
    "d_i",
    "0.93*d_i",
  ];

  const rows = screws.map((screw) => [
    screw.number,
    formatValue(screw.x, 6),
    formatValue(screw.y, 6),
    screw.location,
    formatValue(screw.xSquared, 6),
    formatValue(screw.ySquared, 6),
    formatValue(screw.x2PlusY2, 6),
    formatValue(screw.dy, 6),
    formatValue(screw.dySquared, 6),
    formatValue(screw.distance, 6),
    formatValue(screw.mContribution, 6),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ScrewCoordinateTable({
  screws = [],
  J,
  M,
}) {
  if (!screws.length) {
    return (
      <p className="text-sm text-gray-500">
        No screw coordinates are available yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1100px] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="bg-slate-50 text-gray-600">
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">No.</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">X (mm)</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">Y (mm)</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">Location</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">X²</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">Y²</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">X² + Y²</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">Y + δy</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">(Y + δy)²</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">dᵢ</th>
            <th className="border-b border-gray-200 px-3 py-2 font-semibold">0.93 × dᵢ</th>
          </tr>
        </thead>
        <tbody>
          {screws.map((screw) => (
            <tr key={screw.number} className="odd:bg-white even:bg-slate-50">
              <td className="border-b border-gray-100 px-3 py-1.5">{screw.number}</td>
              <td className="border-b border-gray-100 px-3 py-1.5 font-mono">
                {formatValue(screw.x)}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 font-mono">
                {formatValue(screw.y)}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5">
                {screw.location}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 font-mono">
                {formatValue(screw.xSquared)}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 font-mono">
                {formatValue(screw.ySquared)}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 font-mono">
                {formatValue(screw.x2PlusY2)}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 font-mono">
                {formatValue(screw.dy)}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 font-mono">
                {formatValue(screw.dySquared)}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 font-mono">
                {formatValue(screw.distance)}
              </td>
              <td className="border-b border-gray-100 px-3 py-1.5 font-mono">
                {formatValue(screw.mContribution)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-blue-50 font-semibold">
            <td className="px-3 py-2">TOTAL</td>
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2 font-mono">{formatValue(J)}</td>
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2 font-mono">{formatValue(M)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-3 text-xs text-gray-500">
        Origin is at the centre of the wall. M = 0.93 × Σdᵢ = {formatValue(M)}
      </p>
    </div>
  );
}
