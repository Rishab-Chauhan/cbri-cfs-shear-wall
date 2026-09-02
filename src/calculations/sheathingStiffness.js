/**
 * sheathingStiffness.js
 *
 * Calculates sheathing:
 *   As
 *   Is
 *   αV
 *   αB
 *   Ks
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

  const values = [
    h,
    l,
    t,
    E,
    G,
    sC,
    nC,
    cu,
  ];

  if (
    values.some(
      (value) =>
        !Number.isFinite(value) ||
        value <= 0
    )
  ) {
    return {
      success: false,
      error:
        "Invalid sheathing-stiffness input.",
    };
  }

  // ------------------------------------------
  // Section properties of sheathing
  // ------------------------------------------

  const As =
    t * l;

  const Is =
    (t * Math.pow(l, 3)) / 12;

  // ------------------------------------------
  // Convert screw spacing from mm to inches
  // ------------------------------------------

  const sCIn =
    sC / 25.4;

  // ------------------------------------------
  // αV
  //
  // αV =
  // (Cu / (3.3 nC))^1.8
  // × (6 in / sC)^1.8
  // ------------------------------------------

  const alphaV =
    Math.pow(
      cu / (3.3 * nC),
      1.8
    ) *
    Math.pow(
      6 / sCIn,
      1.8
    );

  // ------------------------------------------
  // αB
  //
  // αB =
  // (6 / Cu)^2
  // × (6 in / sC)^(1.35 / Cu)
  // ------------------------------------------

  const alphaB =
    Math.pow(
      6 / cu,
      2
    ) *
    Math.pow(
      6 / sCIn,
      1.35 / cu
    );

  // ------------------------------------------
  // Sheathing stiffness
  //
  // Ks =
  // (G As / 1.2h) αV
  // +
  // (3 E Is / h³) αB
  // ------------------------------------------

  const shearComponent =
    (G * As) /
    (1.2 * h) *
    alphaV;

  const bendingComponent =
    (3 * E * Is) /
    Math.pow(h, 3) *
    alphaB;

  const Ks =
    shearComponent +
    bendingComponent;

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