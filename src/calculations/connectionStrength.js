/**
 * connectionStrength.js
 *
 * Calculates the lateral strength of a single
 * sheathing-to-framing connection.
 *
 * Units:
 *   Length       = mm
 *   Stress       = MPa = N/mm²
 *   Strength     = N
 *
 * Governing connection strength:
 *
 * Vr = min(
 *   Br-sheathing,
 *   Br-steel
 * )
 */


/**
 * Calculate connection strength.
 *
 * @param {Object} inputs
 * @param {number} inputs.tS
 *        Sheathing thickness (mm)
 *
 * @param {number} inputs.dC
 *        Screw diameter (mm)
 *
 * @param {number} inputs.fuSheathing
 *        Sheathing bearing strength (MPa)
 *
 * @param {number} inputs.tF
 *        Steel stud thickness (mm)
 *
 * @param {number} inputs.fuSteel
 *        Steel tensile strength (MPa)
 *
 * @returns {Object}
 */
export function calculateConnectionStrength(inputs) {

  const {
    tS,
    dC,
    fuSheathing,
    tF,
    fuSteel,
  } = inputs;


  // ============================================================
  // INPUT VALIDATION
  // ============================================================

  const values = [
    tS,
    dC,
    fuSheathing,
    tF,
    fuSteel,
  ];

  const hasInvalidInput = values.some(
    (value) =>
      !Number.isFinite(Number(value)) ||
      Number(value) <= 0
  );

  if (hasInvalidInput) {
    return {
      success: false,
      error: "Invalid connection input.",
    };
  }


  // Convert everything to numbers
  const ts = Number(tS);
  const dc = Number(dC);
  const fus = Number(fuSheathing);
  const tf = Number(tF);
  const fu = Number(fuSteel);


  // ============================================================
  // 1. SHEATHING BEARING STRENGTH
  // ============================================================

  const brSheathing =
    3.0 *
    ts *
    dc *
    fus;


  // ============================================================
  // 2. STEEL / FRAMING BEARING STRENGTH
  // ============================================================

  const brSteel =
    3.0 *
    tf *
    dc *
    fu;


  // ============================================================
  // GOVERNING CONNECTION STRENGTH
  // ============================================================

  const strengths = {
    sheathingBearing: brSheathing,
    steelBearing: brSteel,
  };


  const governingStrength = Math.min(
    brSheathing,
    brSteel
  );


  // ============================================================
  // GOVERNING FAILURE MODE
  // ============================================================

  const governingMode =
    governingStrength === brSheathing
      ? "Sheathing Bearing"
      : "Steel Bearing";


  // ============================================================
  // RETURN RESULTS
  // ============================================================

  return {

    success: true,

    // Individual failure modes
    brSheathing,
    brSteel,

    // Governing result
    vr: governingStrength,

    governingMode,

  };
}