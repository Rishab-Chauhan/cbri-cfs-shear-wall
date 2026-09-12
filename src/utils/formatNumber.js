const SUPER = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
  "+": "⁺",
};

function toSuperscript(exponent) {
  return String(exponent)
    .split("")
    .map((ch) => SUPER[ch] ?? ch)
    .join("");
}

function cleanFloat(value) {
  if (!Number.isFinite(value)) {
    return value;
  }

  return Number(Number(value).toPrecision(12));
}

export function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const cleaned = cleanFloat(value);

  if (Object.is(cleaned, -0) || cleaned === 0) {
    return (0).toFixed(Math.min(digits, 2));
  }

  const abs = Math.abs(cleaned);

  if (Number.isInteger(cleaned) && abs < 1e6) {
    return String(cleaned);
  }

  const rounded = Number(cleaned.toFixed(digits));

  if (Number.isInteger(rounded) && abs >= 1) {
    return String(rounded);
  }

  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function formatEngineering(value, options = {}) {
  const { digits = 2, sciMin = 1e5, sciMax = 1e-3 } = options;

  if (!Number.isFinite(value)) {
    return "—";
  }

  const cleaned = cleanFloat(value);
  const abs = Math.abs(cleaned);

  if (abs !== 0 && (abs >= sciMin || abs < sciMax)) {
    const exp = Math.floor(Math.log10(abs));
    const mantissa = cleaned / 10 ** exp;
    const mantissaText = Number(mantissa.toFixed(3))
      .toString()
      .replace(/\.0+$/, "");
    return `${mantissaText} × 10${toSuperscript(exp)}`;
  }

  return formatNumber(cleaned, digits);
}

export function formatCoord(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return formatNumber(cleanFloat(value), digits);
}
