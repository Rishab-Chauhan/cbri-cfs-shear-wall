/**
 * sheathingStiffness.js
 *
 * Matches test03.py / Martinez thesis:
 *
 *   αV = (Cu / (3.3 nC))^1.8 * (6 / s_in)          PDF Eq. 3.10
 *   αB = (6 / Cu)^2 * (6 / s_in)^(1.3 nC / Cu)     PDF Eq. 3.11
 *
 *   Ks = (G As / 1.2 H) αV + (3 E Is / H³) αB
 */

export function calculateSheathingStiffness({
  panelHeight,
  panelLength,
  thickness,
  youngsModulus,
  shearModulus,
  screwSpacing,
  totalScrews,
  Cu,
}) {
  const h = Number(panelHeight);
  const l = Number(panelLength);
  const t = Number(thickness);
  const E = Number(youngsModulus);
  const G = Number(shearModulus);
  const sC = Number(screwSpacing);
  const nC = Number(totalScrews);
  const cu = Number(Cu);

  const values = [h, l, t, E, G, sC, nC, cu];

  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    return {
      success: false,
      error: "Invalid sheathing-stiffness input.",
    };
  }

  const As = t * l;
  const Is = (t * Math.pow(l, 3)) / 12;
  const sCIn = sC / 25.4;

  const alphaV =
    Math.pow(cu / (3.3 * nC), 1.8) * (6.0 / sCIn);

  const alphaB =
    Math.pow(6.0 / cu, 2) *
    Math.pow(6.0 / sCIn, (1.3 * nC) / cu);

  const shearComponent = ((G * As) / (1.2 * h)) * alphaV;
  const bendingComponent =
    ((3 * E * Is) / Math.pow(h, 3)) * alphaB;
  const Ks = shearComponent + bendingComponent;

  return {
    success: true,
    As,
    Is,
    sCIn,
    alphaV,
    alphaB,
    shearComponent,
    bendingComponent,
    Ks,
  };
}
