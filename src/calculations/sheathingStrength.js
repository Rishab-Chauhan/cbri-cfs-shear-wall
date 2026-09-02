/**
 * sheathingStrength.js
 *
 * Calculates:
 *   η
 *   Ps
 *
 * For one sheathing side.
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

  // η = sqrt(8 - h/l - 1.45)
  const etaArgument =
    8.0 - h / l - 1.45;

  const eta =
    Math.sqrt(
      Math.max(etaArgument, 0)
    );

  // Ps = Cu * Vr * η
  const Ps =
    cu * vr * eta;

  return {
    success: true,
    etaArgument,
    eta,
    Ps,
  };
}