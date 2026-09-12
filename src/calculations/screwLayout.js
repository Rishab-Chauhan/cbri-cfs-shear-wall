/**
 * screwLayout.js
 *
 * Generates screw coordinates for the shear-wall panel.
 *
 * Coordinate system (thesis / test03.py):
 *   (0, 0) = centre of wall / fastener group
 *   x = horizontal direction
 *   y = vertical direction
 *
 * Units: mm
 */

function nearestInteger(value) {
  return Math.floor(value + 0.5);
}

/**
 * Generate equally spaced positions from 0 to totalLength.
 * The final segment may be shorter than the specified spacing.
 */
function createLinePositions(totalLength, spacing) {
  const positions = [0];
  let position = spacing;

  while (position < totalLength) {
    positions.push(position);
    position += spacing;
  }

  if (positions[positions.length - 1] !== totalLength) {
    positions.push(totalLength);
  }

  return positions;
}

function addScrew(locations, x, y, type, location) {
  const exists = locations.some(
    (point) =>
      Math.abs(point.x - x) < 1e-9 &&
      Math.abs(point.y - y) < 1e-9
  );

  if (!exists) {
    locations.push({
      x,
      y,
      type,
      location,
    });
  }
}

function toCenterOrigin(locations, panelLength, panelHeight) {
  return locations.map((point) => ({
    ...point,
    x: point.x - panelLength / 2,
    y: point.y - panelHeight / 2,
  }));
}

/**
 * Thesis control specimen (test03.py).
 *
 * Perimeter screws at EDGE spacing (equalized).
 * One centered intermediate stud.
 * Field screws at FIELD spacing (equalized).
 * Origin at the wall centre.
 */
function generateThesisControlLayout({
  panelHeight,
  panelLength,
  perimeterSpacing,
  fieldSpacing,
}) {
  const L = panelLength;
  const H = panelHeight;

  let nx = Math.max(1, nearestInteger(L / perimeterSpacing));
  let ny = Math.max(2, nearestInteger(H / perimeterSpacing));

  if (ny % 2 !== 0) {
    ny += 1;
  }

  const actualXSpacing = L / nx;
  const actualYSpacing = H / ny;

  let nField = Math.max(2, nearestInteger(H / fieldSpacing));

  if (nField % 2 !== 0) {
    nField += 1;
  }

  const actualFieldSpacing = H / nField;
  const screws = [];

  for (let i = 0; i <= nx; i += 1) {
    screws.push({
      x: -L / 2 + i * actualXSpacing,
      y: H / 2,
      type: "perimeter",
      location: "Top edge",
    });
  }

  for (let j = 1; j < ny; j += 1) {
    screws.push({
      x: L / 2,
      y: H / 2 - j * actualYSpacing,
      type: "perimeter",
      location: "Right edge",
    });
  }

  for (let i = nx; i >= 0; i -= 1) {
    screws.push({
      x: -L / 2 + i * actualXSpacing,
      y: -H / 2,
      type: "perimeter",
      location: "Bottom edge",
    });
  }

  for (let j = ny - 1; j > 0; j -= 1) {
    screws.push({
      x: -L / 2,
      y: -H / 2 + j * actualYSpacing,
      type: "perimeter",
      location: "Left edge",
    });
  }

  for (let k = 1; k < nField; k += 1) {
    const y = -H / 2 + k * actualFieldSpacing;

    if (Math.abs(y - H / 2) < 1e-9) {
      continue;
    }

    if (Math.abs(y + H / 2) < 1e-9) {
      continue;
    }

    screws.push({
      x: 0.0,
      y,
      type: "field",
      location: "Intermediate stud",
    });
  }

  return {
    screws,
    nx,
    ny,
    nField,
    actualXSpacing,
    actualYSpacing,
    actualFieldSpacing,
  };
}

/**
 * Intermediate bracing specimen.
 *
 * Generated in bottom-left origin, then converted to centre origin.
 */
function generateIntermediateBracingLayout({
  panelHeight,
  panelLength,
  perimeterSpacing,
  fieldSpacing,
  horizontalSpacing,
}) {
  const locations = [];

  const perimeterX = createLinePositions(panelLength, perimeterSpacing);
  const perimeterY = createLinePositions(panelHeight, perimeterSpacing);

  perimeterX.forEach((x) => {
    addScrew(locations, x, 0, "perimeter", "Bottom edge");
    addScrew(locations, x, panelHeight, "perimeter", "Top edge");
  });

  perimeterY.forEach((y) => {
    addScrew(locations, 0, y, "perimeter", "Left edge");
    addScrew(locations, panelLength, y, "perimeter", "Right edge");
  });

  const intermediateX = panelLength / 2;
  const fieldY = createLinePositions(panelHeight, fieldSpacing);

  fieldY.forEach((y) => {
    addScrew(locations, intermediateX, y, "field", "Intermediate stud");
  });

  const horizontalY = createLinePositions(panelHeight, horizontalSpacing);

  horizontalY.forEach((y) => {
    if (y === 0 || y === panelHeight) {
      return;
    }

    const horizontalX = createLinePositions(panelLength, fieldSpacing);

    horizontalX.forEach((x) => {
      addScrew(locations, x, y, "horizontal-field", "Horizontal bracing");
    });

    addScrew(locations, 0, y, "horizontal-field", "Horizontal bracing");
    addScrew(locations, panelLength, y, "horizontal-field", "Horizontal bracing");
  });

  return toCenterOrigin(locations, panelLength, panelHeight);
}

export function calculateScrewLayout(inputs) {
  const {
    panelHeight,
    panelLength,
    specimenType = "control",
    perimeterSpacing,
    fieldSpacing,
    horizontalSpacing,
  } = inputs;

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

  const perimeter = Number(perimeterSpacing);
  const field = Number(fieldSpacing);

  if (!Number.isFinite(perimeter) || perimeter <= 0) {
    return {
      success: false,
      error: "Perimeter screw spacing must be greater than zero.",
    };
  }

  if (!Number.isFinite(field) || field <= 0) {
    return {
      success: false,
      error: "Field/intermediate screw spacing must be greater than zero.",
    };
  }

  if (specimenType === "control") {
    const layout = generateThesisControlLayout({
      panelHeight: h,
      panelLength: l,
      perimeterSpacing: perimeter,
      fieldSpacing: field,
    });

    const screws = layout.screws.map((screw, index) => ({
      ...screw,
      number: index + 1,
    }));

    return {
      success: true,
      origin: "center",
      specimenType,
      totalScrews: screws.length,
      screwLocations: screws,
      nx: layout.nx,
      ny: layout.ny,
      nField: layout.nField,
      actualXSpacing: layout.actualXSpacing,
      actualYSpacing: layout.actualYSpacing,
      actualFieldSpacing: layout.actualFieldSpacing,
    };
  }

  if (specimenType === "intermediateBracing") {
    const horizontal = Number(horizontalSpacing);

    if (!Number.isFinite(horizontal) || horizontal <= 0) {
      return {
        success: false,
        error: "Horizontal intermediate spacing must be greater than zero.",
      };
    }

    const screwLocations = generateIntermediateBracingLayout({
      panelHeight: h,
      panelLength: l,
      perimeterSpacing: perimeter,
      fieldSpacing: field,
      horizontalSpacing: horizontal,
    });

    const numbered = screwLocations.map((screw, index) => ({
      ...screw,
      number: index + 1,
    }));

    return {
      success: true,
      origin: "center",
      specimenType,
      totalScrews: numbered.length,
      screwLocations: numbered,
      nx: null,
      ny: null,
      nField: null,
      actualXSpacing: null,
      actualYSpacing: null,
      actualFieldSpacing: null,
    };
  }

  return {
    success: false,
    error: "Invalid specimen type.",
  };
}
