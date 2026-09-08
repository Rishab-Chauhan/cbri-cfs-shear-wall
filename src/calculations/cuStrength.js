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
  totalScrews,
}) {
  const h = Number(panelHeight);
  const l = Number(panelLength);
  const nCInput = Number(totalScrews);

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

  if (!Number.isFinite(nCInput) || nCInput <= 0) {
    return {
      success: false,
      error: "Total number of screws must be greater than zero.",
    };
  }

  let locations = screwLocations;

  if (!Array.isArray(locations) || locations.length === 0) {
    locations = generateManualControlLayout(h, l, nCInput);
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
    generatedForCu: !screwLocations || screwLocations.length === 0,
  };
}

function generateManualControlLayout(panelHeight, panelLength, nC) {
  const locations = [];

  const addScrew = (x, y, location) => {
    const exists = locations.some(
      (point) =>
        Math.abs(point.x - x) < 1e-9 && Math.abs(point.y - y) < 1e-9
    );

    if (!exists) {
      locations.push({ x, y, location, type: "generated" });
    }
  };

  const perimeterCount = Math.max(4, Math.floor(nC * 0.75));
  const internalCount = Math.max(1, nC - perimeterCount);

  for (let i = 0; i < perimeterCount; i += 1) {
    const position = i / perimeterCount;
    const perimeter = 2 * (panelLength + panelHeight);
    const distance = position * perimeter;

    let x;
    let y;
    let location;

    if (distance <= panelLength) {
      x = distance;
      y = 0;
      location = "Bottom edge";
    } else if (distance <= panelLength + panelHeight) {
      x = panelLength;
      y = distance - panelLength;
      location = "Right edge";
    } else if (distance <= 2 * panelLength + panelHeight) {
      x = panelLength - (distance - panelLength - panelHeight);
      y = panelHeight;
      location = "Top edge";
    } else {
      x = 0;
      y = panelHeight - (distance - 2 * panelLength - panelHeight);
      location = "Left edge";
    }

    addScrew(x - panelLength / 2, y - panelHeight / 2, location);
  }

  const xMiddle = 0;

  for (let i = 0; i < internalCount; i += 1) {
    const y =
      (i / Math.max(internalCount - 1, 1)) * panelHeight - panelHeight / 2;
    addScrew(xMiddle, y, "Intermediate stud");
  }

  let extraIndex = 1;

  while (locations.length < nC) {
    const y = (extraIndex / (nC + 1)) * panelHeight - panelHeight / 2;
    addScrew(xMiddle, y, "Intermediate stud");
    extraIndex += 1;
  }

  return locations.slice(0, nC);
}
