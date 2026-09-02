import { calculateConnectionStrength } from "./connectionStrength";
import { calculateCu } from "./cuStrength";
import { calculateSheathingStrength } from "./sheathingStrength";
import { calculateSheathingStiffness } from "./sheathingStiffness";
import {
  calculateFrameStiffness,
  calculateFrameFailure,
} from "./frameStrength";

export function calculateLateralStrength(inputs) {
  const {
    panelHeight,
    panelLength,

    connection,

    screwLayout,

    sheathing,

    frame,
  } = inputs;

  // =================================================
  // 1. SCREW LAYOUT
  // =================================================

  const screwLocations =
  screwLayout.screwLocations || [];

const totalScrews =
  Number(screwLayout.totalScrews);

  // =================================================
  // 2. CONNECTION STRENGTH
  // =================================================

  const connectionResult =
    calculateConnectionStrength(
      connection
    );

  if (!connectionResult.success) {
    return connectionResult;
  }

  // =================================================
  // 3. Cu
  // =================================================

  const cuResult =
  calculateCu({
    panelHeight,
    panelLength,
    screwLocations,
    totalScrews,
  });

  if (!cuResult.success) {
    return cuResult;
  }

  // =================================================
  // 4. SHEATHING
  // =================================================

  const sheathingResult =
    calculateSheathingStrength({
      panelHeight,
      panelLength,
      Cu: cuResult.Cu,
      Vr: connectionResult.vr,
    });

  if (!sheathingResult.success) {
    return sheathingResult;
  }

  // =================================================
  // 5. SHEATHING STIFFNESS
  // =================================================

  const stiffnessResult =
    calculateSheathingStiffness({
      panelHeight,
      panelLength,
      thickness: sheathing.thickness,
      youngsModulus:
        sheathing.youngsModulus,
      shearModulus:
        sheathing.shearModulus,
      screwSpacing:
        sheathing.screwSpacing,
      totalScrews,
      Cu: cuResult.Cu,
    });

  if (!stiffnessResult.success) {
    return stiffnessResult;
  }

  // =================================================
  // 6. FRAME STIFFNESS
  // =================================================

  const frameStiffnessResult =
    calculateFrameStiffness({
      panelHeight,
      youngsModulus:
        frame.youngsModulus,
      endStudMomentOfInertia:
        frame.endStudMomentOfInertia,
      intermediateStudMomentOfInertia:
        frame.intermediateStudMomentOfInertia,
      numberOfIntermediateStuds:
        frame.numberOfIntermediateStuds,
    });

  if (!frameStiffnessResult.success) {
    return frameStiffnessResult;
  }

  // =================================================
  // 7. SHEATHING + FRAME
  //
  // PR = Ps (1 + Kf / Ks)
  // =================================================

  const Ps =
    sheathingResult.Ps;

  const Ks =
    stiffnessResult.Ks;

  const Kf =
    frameStiffnessResult.Kf;

  const PRSheathing =
    Ps *
    (1 + Kf / Ks);

  // =================================================
  // 8. FRAME FAILURE
  // =================================================

  const frameFailureResult =
    calculateFrameFailure({
      panelHeight,
      panelLength,
      nominalCompressionStrength:
        frame.nominalCompressionStrength,
    });

  if (!frameFailureResult.success) {
    return frameFailureResult;
  }

  const Pfc =
    frameFailureResult.Pfc;

  // =================================================
  // 9. GOVERNING FAILURE
  // =================================================

  const ultimateStrength =
    Math.min(
      PRSheathing,
      Pfc
    );

  const governingFailureMode =
    PRSheathing <= Pfc
      ? "Sheathing Failure"
      : "Frame Failure";

  // =================================================
  // 10. ULTIMATE DISPLACEMENT
  //
  // Δ = P / (Kf + Ks)
  // =================================================

  const ultimateDisplacement =
    ultimateStrength /
    (Kf + Ks);

  // =================================================
  // FINAL RESULT
  // =================================================

  return {
    success: true,

    connection: connectionResult,

    screwGroup: cuResult,

    sheathingStrength:
      sheathingResult,

    sheathingStiffness:
      stiffnessResult,

    frameStiffness:
      frameStiffnessResult,

    frameFailure:
      frameFailureResult,

    PRSheathing,

    Pfc,

    ultimateLateralStrength:
      ultimateStrength,

    governingFailureMode,

    ultimateDisplacement,

    totalScrews,

    Ks,
    Kf,
  };
}