/**
 * frameStrength.js
 *
 * Frame stiffness:
 *
 *   Kf = n_EndCoupled × (3 Ef IF_doubleEnd / h³)
 *      + n_Single     × (3 Ef IF_intermediate / h³)
 *
 * Existing thesis mapping (preserved):
 *   End-coupled stud  = double end stud  → IF_end (IF_doubleEnd)
 *   Single stud       = intermediate C   → IF_intermediate
 *
 * Defaults match the previous implementation:
 *   n_EndCoupled = 2
 *   n_Single     = 1
 *
 * Frame failure:
 *   Pfc = Pn (L / H)
 */

export function calculateFrameStiffness({
  panelHeight,
  youngsModulus,
  endStudMomentOfInertia,
  intermediateStudMomentOfInertia,
  numberOfEndCoupledStuds = 2,
  numberOfSingleStuds,
  numberOfIntermediateStuds = 1,
}) {
  const h = Number(panelHeight);
  const E = Number(youngsModulus);
  const IEnd = Number(endStudMomentOfInertia);
  const IIntermediate = Number(intermediateStudMomentOfInertia);
  const nEnd = Number(numberOfEndCoupledStuds);
  const nSingle = Number(
    numberOfSingleStuds ?? numberOfIntermediateStuds ?? 1
  );

  const values = [h, E, IEnd, IIntermediate, nEnd, nSingle];

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
  const Kf = nEnd * KEndEach + nSingle * KIntermediate;

  return {
    success: true,
    KEndEach,
    KIntermediate,
    Kf,
    numberOfEndStuds: nEnd,
    numberOfEndCoupledStuds: nEnd,
    numberOfIntermediateStuds: nSingle,
    numberOfSingleStuds: nSingle,
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
