import { formatEngineering, formatNumber } from "../utils/formatNumber";

function Row({ label, value, unit }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-1 last:border-0">
      <span className="text-[13px] font-medium text-slate-600">{label}</span>
      <span className="font-mono text-[13px] font-semibold text-blue-950">
        {value} <span className="font-mono text-[13px] font-medium text-slate-700">{unit}</span>
      </span>
    </div>
  );
}

export default function SectionResults({ results, error, stale }) {
  return (
    <section className="border border-slate-300 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-3 py-1.5">
        <h2 className="text-[12px] font-bold tracking-wide text-blue-900 uppercase">
          Section Properties
        </h2>
        {stale ? (
          <span className="text-[11px] font-medium text-amber-700">
            Geometry changed — recalculate
          </span>
        ) : null}
      </header>
      <div className="grid grid-cols-2 gap-x-8 px-4 py-2">
        {error ? (
          <p className="col-span-2 text-[12px] text-red-700">{error}</p>
        ) : !results ? (
          <p className="col-span-2 py-1 text-[12px] text-slate-500">
            Calculate section properties to unlock SW Parameters.
          </p>
        ) : (
          <>
            <Row
              label="Area (A)"
              value={formatNumber(results.area, 2)}
              unit="mm²"
            />
            <Row
              label="Centroid X"
              value={formatNumber(results.centroidX, 2)}
              unit="mm"
            />
            <Row
              label="Centroid Y"
              value={formatNumber(results.centroidY, 2)}
              unit="mm"
            />
            <Row
              label="Moment of Inertia (Ix)"
              value={formatEngineering(results.Ix, { sciMin: 1e4 })}
              unit="mm⁴"
            />
            <Row
              label="Moment of Inertia (Iy)"
              value={formatEngineering(results.Iy, { sciMin: 1e4 })}
              unit="mm⁴"
            />
          </>
        )}
      </div>
    </section>
  );
}
