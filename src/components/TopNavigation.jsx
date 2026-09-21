export default function TopNavigation({
  activeView,
  sectionCalculated,
  onChangeView,
}) {
  const tabClass = (id, enabled) => {
    const isActive = activeView === id;
    const base =
      "h-7 min-w-[9.5rem] border px-3 text-[11px] font-semibold tracking-wide";

    if (!enabled) {
      return `${base} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400`;
    }

    if (isActive) {
      return `${base} border-blue-800 bg-blue-700 text-white`;
    }

    return `${base} border-slate-400 bg-white text-slate-800 hover:bg-slate-50`;
  };

  return (
    <header className="flex h-9 shrink-0 items-center justify-between border-b border-slate-400 bg-slate-100 px-3">
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="text-[13px] font-bold tracking-tight text-blue-950 whitespace-nowrap">
          LSE_CFSSWP
        </h1>
        <span className="hidden truncate text-[11px] font-medium text-slate-600 md:inline">
          (Lateral Strength Evaluator for Cold-Formed Steel Sheathed Shear Wall Panel)
        </span>
      </div>
      <nav className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className={tabClass("section", true)}
          onClick={() => onChangeView("section")}
        >
          Section Properties
        </button>
        <button
          type="button"
          className={tabClass("sw", sectionCalculated)}
          disabled={!sectionCalculated}
          onClick={() => {
            if (sectionCalculated) {
              onChangeView("sw");
            }
          }}
        >
          SW Parameters
        </button>
        <button
          type="button"
          className={tabClass("plotted", sectionCalculated)}
          disabled={!sectionCalculated}
          onClick={() => {
            if (sectionCalculated) {
              onChangeView("plotted");
            }
          }}
        >
          Plotted View
        </button>
      </nav>
    </header>
  );
}
