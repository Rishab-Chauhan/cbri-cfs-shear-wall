/**
 * sheathingStrength.js
 *
 * Calculates:
 *   η  (PDF Eq. 3.13)
 *   Ps (PDF Eq. 3.12)
 *
 * η = sqrt(8 - H/L) - 1.45   when 8 - H/L ≥ 0
 * η = 0                       otherwise
 */

export function calculateSheathingStrength({
  panelHeight,
  panelLength,
  Cu,
  Vr,
}) {
  const h = Number(panelHeight);
  const l = Number(panelLength);
  const cu = Number(Cu);
  const vr = Number(Vr);

  if (
    !Number.isFinite(h) ||
    h <= 0 ||
    !Number.isFinite(l) ||
    l <= 0 ||
    !Number.isFinite(cu) ||
    cu < 0 ||
    !Number.isFinite(vr) ||
    vr <= 0
  ) {
    return {
      success: false,
      error: "Invalid sheathing-strength input.",
    };
  }

  const ratio = h / l;
  const etaArgument = 8.0 - ratio;

  let eta = 0;

  if (etaArgument >= 0) {
    eta = Math.max(0, Math.sqrt(etaArgument) - 1.45);
  }

  const Ps = cu * vr * eta;

  return {
    success: true,
    ratio,
    etaArgument,
    eta,
    Ps,
    aspectRatioWarning: ratio > 8.0,
  };
}
