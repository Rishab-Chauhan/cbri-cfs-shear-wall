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
 *   Br-steel,
 *   Vr-S-screw,
 *   Vr-P-screw
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
 * @param {number} inputs.vrSScrew
 *        Screw shear strength (N)
 *
 * @param {number} inputs.vrPScrew
 *        Screw pullout strength (N)
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
    vrSScrew,
    vrPScrew,
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
    vrSScrew,
    vrPScrew,
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
  const shearScrew = Number(vrSScrew);
  const pulloutScrew = Number(vrPScrew);


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
  // 3. SCREW SHEAR STRENGTH
  // ============================================================

  const vrSScrewResult = shearScrew;


  // ============================================================
  // 4. SCREW PULLOUT STRENGTH
  // ============================================================

  const vrPScrewResult = pulloutScrew;


  // ============================================================
  // GOVERNING CONNECTION STRENGTH
  // ============================================================

  const strengths = {
    sheathingBearing: brSheathing,
    steelBearing: brSteel,
    screwShear: vrSScrewResult,
    screwPullout: vrPScrewResult,
  };


  const governingStrength = Math.min(
    brSheathing,
    brSteel,
    vrSScrewResult,
    vrPScrewResult
  );


  // ============================================================
  // GOVERNING FAILURE MODE
  // ============================================================

  let governingMode = "";

  if (governingStrength === brSheathing) {
    governingMode = "Sheathing Bearing";
  } else if (governingStrength === brSteel) {
    governingMode = "Steel Bearing";
  } else if (governingStrength === vrSScrewResult) {
    governingMode = "Screw Shear";
  } else if (governingStrength === vrPScrewResult) {
    governingMode = "Screw Pullout";
  }


  // ============================================================
  // RETURN RESULTS
  // ============================================================

  return {

    success: true,

    // Individual failure modes
    brSheathing,
    brSteel,
    vrSScrew: vrSScrewResult,
    vrPScrew: vrPScrewResult,

    // Governing result
    vr: governingStrength,

    governingMode,

  };
}