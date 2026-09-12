/**
 * Cu (screw-group strength reduction factor)
 *
 * Matches the Martinez thesis simplified procedure / test03.py:
 *
 *   J  = Σ(x² + y²)
 *   ey0 = H / 2
 *   M0 = Px * ey0
 *   δy = (Px / nC) * (J / M0)
 *   ey = ey0 + δy
 *   Mp = Px * ey
 *   di = sqrt(x² + (y + δy)²)
 *   M  = 0.93 * Σ di
 *   Cu = |M / Mp|
 *
 * Coordinates are already in the wall-centre system.
 */

export function calculateCu({
  panelHeight,
  panelLength,
  screwLocations = [],
}) {
  const h = Number(panelHeight);
  const l = Number(panelLength);

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

  let locations = screwLocations;

  if (!Array.isArray(locations) || locations.length === 0) {
    return {
      success: false,
      error: "Screw coordinates must be generated from the panel layout.",
    };
  }

  const actualNC = locations.length;

  if (actualNC === 0) {
    return {
      success: false,
      error: "Unable to generate screw-group coordinates.",
    };
  }

  const Px = 1;
  const ey0 = h / 2;
  const M0 = Px * ey0;

  const J = locations.reduce(
    (sum, screw) =>
      sum + Math.pow(Number(screw.x), 2) + Math.pow(Number(screw.y), 2),
    0
  );

  const deltaY = (Px / actualNC) * (J / M0);
  const ey = ey0 + deltaY;
  const Mp = Px * ey;
  const normalizedForce = 0.93;

  const screwDetails = locations.map((screw, index) => {
    const x = Number(screw.x);
    const y = Number(screw.y);
    const dy = y + deltaY;
    const xSquared = x * x;
    const ySquared = y * y;
    const x2PlusY2 = xSquared + ySquared;
    const dySquared = dy * dy;
    const distance = Math.sqrt(xSquared + dySquared);
    const mContribution = normalizedForce * distance;

    return {
      number: index + 1,
      x,
      y,
      location: screw.location || screw.type || "",
      type: screw.type || "",
      xSquared,
      ySquared,
      x2PlusY2,
      dy,
      dySquared,
      distance,
      mContribution,
    };
  });

  const M = screwDetails.reduce(
    (sum, screw) => sum + screw.mContribution,
    0
  );

  const Cu = Mp !== 0 ? Math.abs(M / Mp) : 0;

  return {
    success: true,
    nC: actualNC,
    xCenter: 0,
    yCenter: 0,
    J,
    M0,
    ey0,
    deltaY,
    ey,
    Mp,
    Mu: M,
    M,
    Cu,
    normalizedForce,
    screwDistances: screwDetails,
    screwDetails,
  };
}
