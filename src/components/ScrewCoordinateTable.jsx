import { formatCoord } from "../utils/formatNumber";

export default function ScrewCoordinateTable({ screws = [] }) {
  if (!screws.length) {
    return (
      <p className="text-[11px] text-slate-500">
        Coordinates appear after Calculate.
      </p>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-auto">
      <table className="w-full border-collapse text-left text-[11px]">
        <thead className="sticky top-0 bg-slate-100">
          <tr>
            <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
              No.
            </th>
            <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
              X (mm)
            </th>
            <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
              Y (mm)
            </th>
            <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
              Location
            </th>
          </tr>
        </thead>
        <tbody>
          {screws.map((screw) => (
            <tr key={screw.number} className="odd:bg-white even:bg-slate-50">
              <td className="border-b border-slate-100 px-1.5 py-0.5">
                {screw.number}
              </td>
              <td className="border-b border-slate-100 px-1.5 py-0.5 font-mono">
                {formatCoord(screw.x, 1)}
              </td>
              <td className="border-b border-slate-100 px-1.5 py-0.5 font-mono">
                {formatCoord(screw.y, 1)}
              </td>
              <td className="border-b border-slate-100 px-1.5 py-0.5">
                {screw.location}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
