import { CompactButton, Panel } from "./ui";
import WallParametersPanel from "./WallParametersPanel";
import SteelParametersPanel from "./SteelParametersPanel";
import SheathingParametersPanel from "./SheathingParametersPanel";
import FastenerParametersPanel from "./FastenerParametersPanel";
import ScrewLayout from "./ScrewLayout";
import ScrewCoordinateTable from "./ScrewCoordinateTable";
import FinalResults from "./FinalResults";

export default function ShearWallParameters({
  parameters,
  onChange,
  onCalculate,
  isCalculating,
  result,
  stale,
  error,
  sectionResults,
  onBack,
}) {
  const screws = result?.screwDetails || result?.screwLocations || [];

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="grid max-h-[38vh] shrink-0 grid-cols-4 gap-2 overflow-auto">
        <Panel title="Panel / Wall">
          <WallParametersPanel parameters={parameters} onChange={onChange} />
        </Panel>
        <Panel title="Steel">
          <SteelParametersPanel parameters={parameters} onChange={onChange} />
        </Panel>
        <Panel title="Sheathing" className="overflow-auto">
          <SheathingParametersPanel parameters={parameters} onChange={onChange} />
        </Panel>
        <Panel title="Fasteners">
          <FastenerParametersPanel parameters={parameters} onChange={onChange} />
        </Panel>
      </div>

      <div className="flex shrink-0 items-center justify-between">
        <CompactButton onClick={onBack}>Back</CompactButton>
        <div className="flex items-center gap-2">
          {error ? <span className="text-[11px] text-red-700">{error}</span> : null}
          <CompactButton
            variant="primary"
            onClick={onCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? "Calculating..." : "Calculate"}
          </CompactButton>
        </div>
        <span />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        <ScrewLayout
          screws={screws}
          panelLength={parameters.panelLength}
          panelHeight={parameters.panelHeight}
        />
        <section className="flex min-h-0 flex-col border border-slate-300 bg-white">
          <header className="shrink-0 border-b border-slate-300 bg-slate-100 px-2 py-1">
            <h2 className="text-[11px] font-semibold tracking-wide text-blue-900 uppercase">
              Screw Coordinates
            </h2>
          </header>
          <div className="min-h-0 flex-1">
            <ScrewCoordinateTable screws={screws} />
          </div>
        </section>
      </div>

      <FinalResults
        result={result}
        parameters={parameters}
        sectionResults={sectionResults}
        stale={stale}
      />
    </div>
  );
}
