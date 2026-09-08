import { calculateConnectionStrength } from "./connectionStrength.js";
import { calculateCu } from "./cuStrength.js";
import { calculateSheathingStrength } from "./sheathingStrength.js";
import { calculateSheathingStiffness } from "./sheathingStiffness.js";
import {
  calculateFrameStiffness,
  calculateFrameFailure,
} from "./frameStrength.js";

export function calculateLateralStrength(inputs) {
  const {
    panelHeight,
    panelLength,
    connection,
    screwLayout,
    sheathing,
    frame,
    section = null,
  } = inputs;

  const screwLocations = screwLayout.screwLocations || [];
  const totalScrews = Number(screwLayout.totalScrews);

  const connectionResult = calculateConnectionStrength(connection);

  if (!connectionResult.success) {
    return connectionResult;
  }

  const cuResult = calculateCu({
    panelHeight,
    panelLength,
    screwLocations,
    totalScrews,
  });

  if (!cuResult.success) {
    return cuResult;
  }

  const sheathingResult = calculateSheathingStrength({
    panelHeight,
    panelLength,
    Cu: cuResult.Cu,
    Vr: connectionResult.vr,
  });

  if (!sheathingResult.success) {
    return sheathingResult;
  }

  const stiffnessResult = calculateSheathingStiffness({
    panelHeight,
    panelLength,
    thickness: sheathing.thickness,
    youngsModulus: sheathing.youngsModulus,
    shearModulus: sheathing.shearModulus,
    screwSpacing: sheathing.screwSpacing,
    totalScrews: cuResult.nC,
    Cu: cuResult.Cu,
  });

  if (!stiffnessResult.success) {
    return stiffnessResult;
  }

  const frameStiffnessResult = calculateFrameStiffness({
    panelHeight,
    youngsModulus: frame.youngsModulus,
    endStudMomentOfInertia: frame.endStudMomentOfInertia,
    intermediateStudMomentOfInertia: frame.intermediateStudMomentOfInertia,
    numberOfIntermediateStuds: frame.numberOfIntermediateStuds,
  });

  if (!frameStiffnessResult.success) {
    return frameStiffnessResult;
  }

  const Ps = sheathingResult.Ps;
  const Ks = stiffnessResult.Ks;
  const Kf = frameStiffnessResult.Kf;
  const PRSheathing = Ps * (1 + Kf / Ks);

  const frameFailureResult = calculateFrameFailure({
    panelHeight,
    panelLength,
    nominalCompressionStrength: frame.nominalCompressionStrength,
  });

  if (!frameFailureResult.success) {
    return frameFailureResult;
  }

  const Pfc = frameFailureResult.Pfc;
  const ultimateStrength = Math.min(PRSheathing, Pfc);
  const governingFailureMode =
    PRSheathing <= Pfc ? "Sheathing failure" : "Frame failure";
  const ultimateDisplacement = ultimateStrength / (Kf + Ks);

  return {
    success: true,
    panelHeight: Number(panelHeight),
    panelLength: Number(panelLength),
    section,
    connection: connectionResult,
    screwLayout,
    screwGroup: cuResult,
    screwDetails: cuResult.screwDetails,
    sheathingStrength: sheathingResult,
    sheathingStiffness: stiffnessResult,
    frameStiffness: frameStiffnessResult,
    frameFailure: frameFailureResult,
    PRSheathing,
    Pfc,
    Pn: frameFailureResult.Pn,
    ultimateLateralStrength: ultimateStrength,
    governingFailureMode,
    ultimateDisplacement,
    totalScrews: cuResult.nC,
    Ks,
    Kf,
    KEndEach: frameStiffnessResult.KEndEach,
    KIntermediate: frameStiffnessResult.KIntermediate,
  };
}
