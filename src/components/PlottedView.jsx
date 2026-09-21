import ScrewLayout from "./ScrewLayout";
import ScrewCoordinateTable from "./ScrewCoordinateTable";
import { CompactButton } from "./ui";

export default function PlottedView({
  screws = [],
  parameters,
  result,
  onBack,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="flex shrink-0 items-center justify-between border border-slate-300 bg-white px-3 py-1.5 shadow-sm">
        <div className="flex items-center gap-4">
          <CompactButton onClick={onBack}>← Back to SW Parameters</CompactButton>
          <span className="text-[12px] font-semibold tracking-wide text-blue-900 uppercase">
            Plotted View: Fastener Arrangement &amp; Calculations
          </span>
          {parameters ? (
            <div className="hidden items-center gap-3 text-[11px] text-slate-600 sm:flex">
              <span>
                Panel: <strong>{parameters.panelLength} × {parameters.panelHeight} mm</strong>
              </span>
              <span>
                Perimeter Spacing: <strong>{parameters.perimeterSpacing} mm</strong>
              </span>
              <span>
                Field Spacing: <strong>{parameters.fieldSpacing} mm</strong>
              </span>
            </div>
          ) : null}
        </div>
        <span className="text-[11px] font-medium text-slate-700">
          Total Screws: <strong className="text-blue-900">{screws.length}</strong>
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        <ScrewLayout
          screws={screws}
          panelLength={parameters?.panelLength}
          panelHeight={parameters?.panelHeight}
        />
        <section className="flex min-h-0 flex-col border border-slate-300 bg-white">
          <header className="shrink-0 border-b border-slate-300 bg-slate-100 px-2 py-1">
            <h2 className="text-[11px] font-semibold tracking-wide text-blue-900 uppercase">
              Screw Coordinates &amp; J-Calculation Table
            </h2>
          </header>
          <div className="min-h-0 flex-1">
            <ScrewCoordinateTable
              screws={screws}
              panelHeight={parameters?.panelHeight}
              panelLength={parameters?.panelLength}
              screwGroup={result?.screwGroup}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
