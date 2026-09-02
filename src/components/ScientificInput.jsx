import React, { useEffect, useState } from "react";

export default function ScientificInput({
  label,
  value,
  onChange,
  unit = "",
  disabled = false,
  required = false,
}) {
  const getParts = (numberValue) => {
    const number = Number(numberValue);

    if (!Number.isFinite(number) || number === 0) {
      return {
        mantissa: number === 0 ? "0" : "",
        exponent: "0",
      };
    }

    const exponent = Math.floor(
      Math.log10(Math.abs(number))
    );

    const mantissa =
      number / Math.pow(10, exponent);

    return {
      mantissa: Number(mantissa.toFixed(6)).toString(),
      exponent: exponent.toString(),
    };
  };

  const initialParts = getParts(value);

  const [mantissa, setMantissa] = useState(
    initialParts.mantissa
  );

  const [exponent, setExponent] = useState(
    initialParts.exponent
  );

  /*
   * Update the displayed scientific notation when
   * the value changes from outside this component.
   *
   * Example:
   * value = 203000
   * displays:
   * 2.03 × 10⁵
   */
  useEffect(() => {
    const parts = getParts(value);

    setMantissa(parts.mantissa);
    setExponent(parts.exponent);
  }, [value]);

  const updateValue = (newMantissa, newExponent) => {
    const m = Number(newMantissa);
    const e = Number(newExponent);

    if (
      newMantissa === "" ||
      newMantissa === "-" ||
      Number.isNaN(m)
    ) {
      onChange("");
      return;
    }

    if (
      newExponent === "" ||
      newExponent === "-"
    ) {
      return;
    }

    if (Number.isNaN(e)) {
      return;
    }

    const result =
      m * Math.pow(10, e);

    onChange(result);
  };

  const handleMantissaChange = (e) => {
    const newValue = e.target.value;

    setMantissa(newValue);

    updateValue(
      newValue,
      exponent
    );
  };

  const handleExponentChange = (e) => {
    const newValue = e.target.value;

    setExponent(newValue);

    updateValue(
      mantissa,
      newValue
    );
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      <div className="flex items-center gap-2">
        {/* Mantissa */}
        <input
          type="number"
          step="any"
          value={mantissa}
          onChange={handleMantissaChange}
          disabled={disabled}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100"
        />

        {/* × 10 */}
        <span className="whitespace-nowrap text-sm font-medium text-gray-700">
          × 10
        </span>

        {/* Exponent */}
        <input
          type="number"
          step="1"
          value={exponent}
          onChange={handleExponentChange}
          disabled={disabled}
          className="w-20 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100"
        />

        {/* Unit */}
        {unit && (
          <span className="min-w-[55px] text-sm text-gray-600">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}