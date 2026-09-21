import { CompactButton, Panel } from "./ui";
import WallParametersPanel from "./WallParametersPanel";
import SteelParametersPanel from "./SteelParametersPanel";
import SheathingParametersPanel from "./SheathingParametersPanel";
import FastenerParametersPanel from "./FastenerParametersPanel";
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
  onViewPlotted,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="grid max-h-[44vh] shrink-0 grid-cols-4 gap-2 overflow-auto">
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
        <CompactButton onClick={onBack}>Back to Section</CompactButton>
        <div className="flex items-center gap-2">
          {error ? <span className="text-[11px] text-red-700">{error}</span> : null}
          <CompactButton
            variant="primary"
            onClick={onCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? "Calculating..." : "Calculate"}
          </CompactButton>
          <CompactButton onClick={onViewPlotted}>
            Plotted View →
          </CompactButton>
        </div>
        <span />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <FinalResults
          result={result}
          parameters={parameters}
          sectionResults={sectionResults}
          stale={stale}
        />
      </div>
    </div>
  );
}

