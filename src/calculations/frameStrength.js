/**
 * frameStrength.js
 *
 * Frame stiffness:
 *
 * Kf = Σ(3 E I / h³)
 *
 * Frame failure:
 *
 * Pfc = Pn (l / h)
 */

export function calculateFrameStiffness({
  panelHeight,
  youngsModulus,
  endStudMomentOfInertia,
  intermediateStudMomentOfInertia,
  numberOfIntermediateStuds = 1,
}) {
  const h = Number(panelHeight);
  const E = Number(youngsModulus);
  const IEnd = Number(endStudMomentOfInertia);
  const IIntermediate =
    Number(intermediateStudMomentOfInertia);
  const nIntermediate =
    Number(numberOfIntermediateStuds);

  const values = [
    h,
    E,
    IEnd,
    IIntermediate,
    nIntermediate,
  ];

  if (
    values.some(
      (value) =>
        !Number.isFinite(value) ||
        value < 0
    ) ||
    h <= 0 ||
    E <= 0 ||
    IEnd <= 0
  ) {
    return {
      success: false,
      error: "Invalid frame stiffness input.",
    };
  }

  // Two end studs + intermediate studs
  const totalEI =
    2 * IEnd +
    nIntermediate * IIntermediate;

  const Kf =
    (3 * E * totalEI) /
    Math.pow(h, 3);

  return {
    success: true,

    totalEI,
    Kf,

    numberOfEndStuds: 2,
    numberOfIntermediateStuds:
      nIntermediate,
  };
}

export function calculateFrameFailure({
  panelHeight,
  panelLength,
  nominalCompressionStrength,
}) {
  const h = Number(panelHeight);
  const l = Number(panelLength);
  const Pn =
    Number(nominalCompressionStrength);

  if (!Number.isFinite(h) || h <= 0) {
    return {
      success: false,
      error: "Panel height must be greater than zero.",
    };
  }

  if (!Number.isFinite(l) || l <= 0) {
    return {
      success: false,
      error: "Panel length must be greater than zero.",
    };
  }

  if (!Number.isFinite(Pn) || Pn <= 0) {
    return {
      success: false,
      error:
        "Nominal compression strength Pn must be greater than zero.",
    };
  }

  const Pfc =
    Pn * (l / h);

  return {
    success: true,
    Pn,
    Pfc,
  };
}