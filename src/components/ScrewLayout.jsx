import PlanView from "./PlanView";
import ScrewPlot from "./ScrewPlot";

export default function ScrewLayout({
  screws = [],
  panelLength,
  panelHeight,
  parameters,
}) {
  const total = screws.length;

  return (
    <section className="flex min-h-0 flex-col border border-slate-300 bg-white">
      {/* ── Panel header ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-300 bg-slate-100 px-2 py-1">
        <h2 className="text-[11px] font-semibold tracking-wide text-blue-900 uppercase">
          Screw Layout
        </h2>
        <span className="text-[12px] font-semibold text-blue-800">
          TOTAL SCREWS: {total}
        </span>
      </header>

      {/* ── Drawings area (Screw plot on top + Plan cross-section directly below) ── */}
      <div className="flex min-h-0 flex-1 flex-col p-2 gap-2">
        <div className="min-h-0 flex-1">
          {total === 0 ? (
            <p className="p-2 text-[11px] text-slate-500">
              Press Calculate to generate the screw layout.
            </p>
          ) : (
            <ScrewPlot
              screws={screws}
              panelLength={panelLength}
              panelHeight={panelHeight}
            />
          )}
        </div>

        {/* ── Top view cross-section sits directly below the screw plot ── */}
        <div className="shrink-0">
          <PlanView parameters={parameters} />
        </div>
      </div>
    </section>
  );
}
