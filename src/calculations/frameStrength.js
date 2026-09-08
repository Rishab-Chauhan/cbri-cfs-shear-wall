/**
 * frameStrength.js
 *
 * Frame stiffness (two double end studs + intermediate studs):
 *
 *   K_end_each     = 3 E IF_end / H³
 *   K_intermediate = 3 E IF_intermediate / H³
 *   Kf = 2 * K_end_each + n_intermediate * K_intermediate
 *
 * Frame failure:
 *
 *   Pfc = Pn (L / H)
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
  const IIntermediate = Number(intermediateStudMomentOfInertia);
  const nIntermediate = Number(numberOfIntermediateStuds);

  const values = [h, E, IEnd, IIntermediate, nIntermediate];

  if (
    values.some((value) => !Number.isFinite(value) || value < 0) ||
    h <= 0 ||
    E <= 0 ||
    IEnd <= 0
  ) {
    return {
      success: false,
      error: "Invalid frame stiffness input.",
    };
  }

  const KEndEach = (3.0 * E * IEnd) / Math.pow(h, 3);
  const KIntermediate =
    (3.0 * E * IIntermediate) / Math.pow(h, 3);
  const Kf = 2.0 * KEndEach + nIntermediate * KIntermediate;

  return {
    success: true,
    KEndEach,
    KIntermediate,
    Kf,
    numberOfEndStuds: 2,
    numberOfIntermediateStuds: nIntermediate,
    IF_end: IEnd,
    IF_intermediate: IIntermediate,
  };
}

export function calculateFrameFailure({
  panelHeight,
  panelLength,
  nominalCompressionStrength,
}) {
  const h = Number(panelHeight);
  const l = Number(panelLength);
  const Pn = Number(nominalCompressionStrength);

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
      error: "Nominal compression strength Pn must be greater than zero.",
    };
  }

  const Pfc = Pn * (l / h);

  return {
    success: true,
    Pn,
    Pfc,
  };
}
