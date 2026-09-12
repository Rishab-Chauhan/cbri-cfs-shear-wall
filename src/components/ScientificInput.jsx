import { useEffect, useState } from "react";

export default function ScientificInput({
  label,
  value,
  onChange,
  unit = "",
  disabled = false,
  compact = true,
}) {
  const getParts = (numberValue) => {
    const number = Number(numberValue);

    if (!Number.isFinite(number) || number === 0) {
      return {
        mantissa: number === 0 ? "0" : "",
        exponent: "0",
      };
    }

    const exponent = Math.floor(Math.log10(Math.abs(number)));
    const mantissa = number / Math.pow(10, exponent);

    return {
      mantissa: Number(mantissa.toFixed(6)).toString(),
      exponent: exponent.toString(),
    };
  };

  const initialParts = getParts(value);
  const [mantissa, setMantissa] = useState(initialParts.mantissa);
  const [exponent, setExponent] = useState(initialParts.exponent);

  useEffect(() => {
    const parts = getParts(value);
    setMantissa(parts.mantissa);
    setExponent(parts.exponent);
  }, [value]);

  const updateValue = (newMantissa, newExponent) => {
    const m = Number(newMantissa);
    const e = Number(newExponent);

    if (newMantissa === "" || newMantissa === "-" || Number.isNaN(m)) {
      onChange("");
      return;
    }

    if (newExponent === "" || newExponent === "-") {
      return;
    }

    if (Number.isNaN(e)) {
      return;
    }

    onChange(m * Math.pow(10, e));
  };

  if (!compact) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="any"
            value={mantissa}
            disabled={disabled}
            onChange={(e) => {
              setMantissa(e.target.value);
              updateValue(e.target.value, exponent);
            }}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm"
          />
          <span className="text-sm">× 10</span>
          <input
            type="number"
            step="1"
            value={exponent}
            disabled={disabled}
            onChange={(e) => {
              setExponent(e.target.value);
              updateValue(mantissa, e.target.value);
            }}
            className="w-20 rounded-md border border-gray-300 px-3 py-2.5 text-sm"
          />
          {unit ? <span className="text-sm text-gray-600">{unit}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <label className="flex min-w-0 items-center gap-1.5">
      <span className="w-[7.5rem] shrink-0 text-[11px] leading-tight text-slate-700">
        {label}
      </span>
      <input
        type="number"
        step="any"
        value={mantissa}
        disabled={disabled}
        onChange={(e) => {
          setMantissa(e.target.value);
          updateValue(e.target.value, exponent);
        }}
        className="h-6 min-w-0 flex-1 border border-slate-300 bg-white px-1.5 text-[11px] outline-none focus:border-blue-700 disabled:bg-slate-100"
      />
      <span className="shrink-0 text-[10px] text-slate-600">×10</span>
      <input
        type="number"
        step="1"
        value={exponent}
        disabled={disabled}
        onChange={(e) => {
          setExponent(e.target.value);
          updateValue(mantissa, e.target.value);
        }}
        className="h-6 w-10 shrink-0 border border-slate-300 bg-white px-1 text-[11px] outline-none focus:border-blue-700 disabled:bg-slate-100"
      />
      {unit ? (
        <span className="w-8 shrink-0 text-[10px] text-slate-500">{unit}</span>
      ) : (
        <span className="w-8 shrink-0" />
      )}
    </label>
  );
}
