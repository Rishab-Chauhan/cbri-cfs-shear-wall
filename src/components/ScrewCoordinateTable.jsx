import { useMemo } from "react";
import { calculateCu } from "../calculations/cuStrength";

function formatVal(val, decimals = 2) {
  if (val === undefined || val === null || !Number.isFinite(val)) {
    return "—";
  }
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function ScrewCoordinateTable({
  screws = [],
  panelHeight,
  panelLength,
  screwGroup,
}) {
  const cuData = useMemo(() => {
    if (!screws.length || !panelHeight || !panelLength) {
      return null;
    }

    // Reuse existing calculated screwGroup if present and matching
    if (
      screwGroup?.screwDetails &&
      screwGroup.screwDetails.length === screws.length &&
      Number.isFinite(screwGroup.J)
    ) {
      const details = screwGroup.screwDetails;
      const J = screwGroup.J;
      const deltaY = screwGroup.deltaY;
      const sumDi = details.reduce((sum, s) => sum + (s.distance || 0), 0);
      const M = screwGroup.M ?? 0.93 * sumDi;
      return { details, J, deltaY, sumDi, M };
    }

    // Otherwise calculate dynamically using existing calculateCu logic
    const res = calculateCu({
      panelHeight,
      panelLength,
      screwLocations: screws,
    });

    if (!res || !res.success) {
      return null;
    }

    const details = res.screwDetails || [];
    const J = res.J;
    const deltaY = res.deltaY;
    const sumDi = details.reduce((sum, s) => sum + (s.distance || 0), 0);
    const M = res.M ?? 0.93 * sumDi;

    return { details, J, deltaY, sumDi, M };
  }, [screws, panelHeight, panelLength, screwGroup]);

  if (!screws.length || !cuData) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-[11px] text-slate-500">
        Coordinates appear after SW parameters are configured.
      </div>
    );
  }

  const { details, J, sumDi, M } = cuData;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Scrollable table container */}
      <div className="min-h-0 flex-1 overflow-auto border-b border-slate-300">
        <table className="w-full border-collapse text-right text-[11px] whitespace-nowrap font-mono">
          <thead className="sticky top-0 z-10 border-b border-slate-300 bg-slate-100 shadow-xs">
            <tr className="text-[10px] font-semibold text-slate-700">
              <th className="border-r border-slate-200 px-2 py-1 text-center font-sans">
                No.
              </th>
              <th className="border-r border-slate-200 px-2 py-1">X</th>
              <th className="border-r border-slate-200 px-2 py-1">Y</th>
              <th className="border-r border-slate-200 px-2 py-1">X²</th>
              <th className="border-r border-slate-200 px-2 py-1">Y²</th>
              <th className="border-r border-slate-200 px-2 py-1 text-blue-900">
                X² + Y²
              </th>
              <th className="border-r border-slate-200 px-2 py-1">Y + Δy</th>
              <th className="border-r border-slate-200 px-2 py-1">
                (Y + Δy)²
              </th>
              <th className="border-r border-slate-200 px-2 py-1 text-blue-900">
                dᵢ
              </th>
              <th className="px-2 py-1 text-blue-900">0.93 × dᵢ</th>
            </tr>
          </thead>
          <tbody>
            {details.map((screw) => (
              <tr
                key={screw.number}
                className="border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-blue-50/50"
              >
                <td className="border-r border-slate-100 px-2 py-0.5 text-center font-sans font-medium text-slate-600">
                  {screw.number}
                </td>
                <td className="border-r border-slate-100 px-2 py-0.5 text-slate-800">
                  {formatVal(screw.x, 2)}
                </td>
                <td className="border-r border-slate-100 px-2 py-0.5 text-slate-800">
                  {formatVal(screw.y, 2)}
                </td>
                <td className="border-r border-slate-100 px-2 py-0.5 text-slate-600">
                  {formatVal(screw.xSquared, 2)}
                </td>
                <td className="border-r border-slate-100 px-2 py-0.5 text-slate-600">
                  {formatVal(screw.ySquared, 2)}
                </td>
                <td className="border-r border-slate-100 px-2 py-0.5 font-semibold text-slate-900">
                  {formatVal(screw.x2PlusY2, 2)}
                </td>
                <td className="border-r border-slate-100 px-2 py-0.5 text-slate-800">
                  {formatVal(screw.dy, 2)}
                </td>
                <td className="border-r border-slate-100 px-2 py-0.5 text-slate-600">
                  {formatVal(screw.dySquared, 2)}
                </td>
                <td className="border-r border-slate-100 px-2 py-0.5 font-semibold text-blue-950">
                  {formatVal(screw.distance, 2)}
                </td>
                <td className="px-2 py-0.5 font-semibold text-blue-950">
                  {formatVal(screw.mContribution, 2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-10 border-t-2 border-slate-400 bg-slate-100 shadow-sm">
            <tr className="font-bold text-slate-900">
              <td
                colSpan={5}
                className="border-r border-slate-300 px-2 py-1.5 text-left font-sans text-[11px] font-bold tracking-wide text-blue-900 uppercase"
              >
                TOTAL
              </td>
              <td className="border-r border-slate-300 px-2 py-1.5 text-right font-mono text-[11px] font-bold text-blue-950">
                {formatVal(J, 2)}
              </td>
              <td
                colSpan={2}
                className="border-r border-slate-300 px-2 py-1.5 text-center text-slate-400 font-normal"
              >
                —
              </td>
              <td className="border-r border-slate-300 px-2 py-1.5 text-right font-mono text-[11px] font-bold text-blue-950">
                {formatVal(sumDi, 2)}
              </td>
              <td className="px-2 py-1.5 text-right font-mono text-[11px] font-bold text-blue-950">
                {formatVal(M, 2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary calculation card below the table */}
      <div className="shrink-0 bg-slate-50 px-3 py-2 text-[11px] border-t border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-slate-700">
            <span>
              <strong className="text-slate-900">Σ(X² + Y²) / J:</strong>{" "}
              <span className="font-mono font-bold text-blue-900">
                {formatVal(J, 2)}
              </span>{" "}
              mm²
            </span>
            <span>
              <strong className="text-slate-900">Σdᵢ:</strong>{" "}
              <span className="font-mono font-bold text-blue-900">
                {formatVal(sumDi, 2)}
              </span>{" "}
              mm
            </span>
            {cuData.deltaY !== undefined ? (
              <span className="text-slate-500">
                (Δy = <span className="font-mono">{formatVal(cuData.deltaY, 2)}</span> mm)
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 rounded border border-blue-300 bg-blue-50/80 px-3 py-1 shadow-2xs">
            <span className="font-bold text-blue-950">
              M = 0.93 × Σdᵢ =
            </span>
            <span className="font-mono text-[13px] font-bold text-blue-800">
              {formatVal(M, 2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
