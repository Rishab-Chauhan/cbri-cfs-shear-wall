import { formatEngineering, formatNumber } from "../utils/formatNumber";

function Item({ label, value, unit }) {
  return (
    <span className="text-[11px] text-slate-700">
      {label} ={" "}
      <span className="font-mono font-medium text-slate-900">
        {value}
        {unit ? ` ${unit}` : ""}
      </span>
    </span>
  );
}

export default function FinalResults({ result, parameters, sectionResults, stale }) {
  if (result && !result.success) {
    return (
      <section className="border border-red-300 bg-red-50 px-2 py-1.5 text-[11px] text-red-700">
        {result.error}
      </section>
    );
  }

  if (!result) {
    return (
      <section className="border border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-500">
        Calculate to view final results.
      </section>
    );
  }

  const totalScrews = result.screwLocations?.length ?? result.totalScrews;
  const Pr = result.PRSheathing;
  const Ps = result.sheathingStrength?.Ps;
  const Cu = result.screwGroup?.Cu;
  const Vr = result.connection?.vr;

  return (
    <section className="border border-slate-300 bg-white">
      <header className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-2 py-1">
        <h2 className="text-[11px] font-semibold tracking-wide text-blue-900 uppercase">
          Final Results
        </h2>
        {stale ? (
          <span className="text-[10px] text-amber-700">
            Inputs changed — recalculate
          </span>
        ) : null}
      </header>
      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 px-2 py-1.5">
        <div className="col-span-2 text-[12px] font-semibold text-blue-900">
          Total Number of Screws: {totalScrews}
        </div>
        <Item label="Pr" value={formatNumber(Pr, 0)} unit="N" />
        <Item label="Ps" value={formatNumber(Ps, 0)} unit="N" />
        <Item label="Vr" value={formatNumber(Vr, 0)} unit="N" />
        <Item label="Cu" value={formatNumber(Cu, 3)} />
        <Item
          label="Displacement"
          value={formatNumber(result.ultimateDisplacement, 1)}
          unit="mm"
        />
        <Item label="Kf" value={formatNumber(result.Kf, 3)} unit="N/mm" />
        <Item label="Ks" value={formatNumber(result.Ks, 3)} unit="N/mm" />
        <Item
          label="Governing"
          value={result.governingFailureMode}
        />

        <div className="col-span-2 mt-1 border-t border-slate-200 pt-1 text-[10px] font-semibold uppercase text-slate-500">
          Parameters
        </div>
        <Item label="Height" value={formatNumber(parameters.panelHeight, 0)} unit="mm" />
        <Item label="Length" value={formatNumber(parameters.panelLength, 0)} unit="mm" />
        <Item label="Fy" value={formatNumber(parameters.fySteel, 0)} unit="MPa" />
        <Item label="Fu" value={formatNumber(parameters.fuSteel, 0)} unit="MPa" />
        <Item label="E" value={formatEngineering(parameters.eSteel)} unit="MPa" />
        <Item label="μ" value={formatNumber(parameters.poissonRatio, 2)} />
        <Item label="tS" value={formatNumber(parameters.tS, 1)} unit="mm" />
        <Item label="FuS" value={formatNumber(parameters.fuSheathing, 1)} unit="MPa" />
        <Item label="ES" value={formatEngineering(parameters.eSheathing)} unit="MPa" />
        <Item label="GS" value={formatEngineering(parameters.gSheathing)} unit="MPa" />
        <Item label="dC" value={formatNumber(parameters.dC, 3)} unit="mm" />
        <Item label="sC" value={formatNumber(parameters.perimeterSpacing, 0)} unit="mm" />
        {sectionResults ? (
          <>
            <Item label="Area" value={formatNumber(sectionResults.area, 1)} unit="mm²" />
            <Item
              label="Centroid X"
              value={formatNumber(sectionResults.centroidX, 2)}
              unit="mm"
            />
            <Item
              label="Centroid Y"
              value={formatNumber(sectionResults.centroidY, 2)}
              unit="mm"
            />
            <Item label="Ix" value={formatEngineering(sectionResults.Ix)} unit="mm⁴" />
            <Item label="Iy" value={formatEngineering(sectionResults.Iy)} unit="mm⁴" />
            <Item
              label="IF"
              value={formatEngineering(sectionResults.IF_end ?? sectionResults.IF)}
              unit="mm⁴"
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
