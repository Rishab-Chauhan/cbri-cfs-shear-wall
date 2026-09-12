export function CompactField({
  label,
  value,
  unit,
  onChange,
  type = "number",
  step,
  disabled = false,
}) {
  return (
    <label className="flex min-w-0 items-center gap-1.5">
      <span className="w-[7.5rem] shrink-0 text-[11px] leading-tight text-slate-700">
        {label}
      </span>
      <input
        type={type}
        step={step}
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 min-w-0 flex-1 border border-slate-300 bg-white px-1.5 text-[11px] text-slate-900 outline-none focus:border-blue-700 disabled:bg-slate-100"
      />
      {unit ? (
        <span className="w-8 shrink-0 text-[10px] text-slate-500">{unit}</span>
      ) : (
        <span className="w-8 shrink-0" />
      )}
    </label>
  );
}

export function CompactSelect({ label, value, onChange, children }) {
  return (
    <label className="flex min-w-0 items-center gap-1.5">
      <span className="w-[7.5rem] shrink-0 text-[11px] leading-tight text-slate-700">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 min-w-0 flex-1 border border-slate-300 bg-white px-1 text-[11px] text-slate-900 outline-none focus:border-blue-700"
      >
        {children}
      </select>
      <span className="w-8 shrink-0" />
    </label>
  );
}

export function Panel({ title, children, className = "" }) {
  return (
    <section
      className={`flex min-h-0 flex-col border border-slate-300 bg-white ${className}`}
    >
      {title ? (
        <header className="shrink-0 border-b border-slate-300 bg-slate-100 px-2 py-1">
          <h2 className="text-[11px] font-semibold tracking-wide text-blue-900 uppercase">
            {title}
          </h2>
        </header>
      ) : null}
      <div className="min-h-0 flex-1 p-2">{children}</div>
    </section>
  );
}

export function CompactButton({
  children,
  onClick,
  disabled = false,
  variant = "default",
  type = "button",
}) {
  const styles = {
    default:
      "border border-slate-400 bg-white text-slate-800 hover:bg-slate-50",
    primary:
      "border border-blue-800 bg-blue-700 text-white hover:bg-blue-800",
    ghost: "border border-transparent bg-transparent text-slate-700 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-6 px-2.5 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant] || styles.default}`}
    >
      {children}
    </button>
  );
}
