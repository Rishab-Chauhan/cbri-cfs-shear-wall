/**
 * screwLayout.js
 *
 * Generates screw coordinates for the shear-wall panel.
 *
 * Coordinate system:
 *   x = panel length direction
 *   y = panel height direction
 *
 * Origin:
 *   bottom-left corner
 *
 * Units:
 *   mm
 */

/**
 * Generate equally spaced positions.
 *
 * The specified spacing is treated as the nominal spacing.
 * The final segment is allowed to be shorter than the specified spacing.
 */
function createLinePositions(totalLength, spacing) {
  const positions = [0];

  let position = spacing;

  while (position < totalLength) {
    positions.push(position);
    position += spacing;
  }

  // Always include the opposite end.
  if (positions[positions.length - 1] !== totalLength) {
    positions.push(totalLength);
  }

  return positions;
}

/**
 * Add screw location only if it does not already exist.
 */
function addScrew(locations, x, y, type) {
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
    });
  }
}

/**
 * Control specimen
 *
 * Layout:
 *
 * ●────────────●
 * │     │      │
 * │     │      │
 * │     │      │
 * ●     │      ●
 * │     │      │
 * │     │      │
 * ●─────┴──────●
 *
 * Perimeter:
 *   perimeterSpacing
 *
 * Intermediate vertical stud:
 *   fieldSpacing
 */
function generateControlLayout({
  panelHeight,
  panelLength,
  perimeterSpacing,
  fieldSpacing,
}) {
  const locations = [];

  const perimeterX = createLinePositions(
    panelLength,
    perimeterSpacing
  );

  const perimeterY = createLinePositions(
    panelHeight,
    perimeterSpacing
  );

  // Top and bottom perimeter
  perimeterX.forEach((x) => {
    addScrew(locations, x, 0, "perimeter");
    addScrew(locations, x, panelHeight, "perimeter");
  });

  // Left and right perimeter
  perimeterY.forEach((y) => {
    addScrew(locations, 0, y, "perimeter");
    addScrew(locations, panelLength, y, "perimeter");
  });

  // One vertical intermediate stud
  const intermediateX = panelLength / 2;

  const fieldY = createLinePositions(
    panelHeight,
    fieldSpacing
  );

  fieldY.forEach((y) => {
    addScrew(
      locations,
      intermediateX,
      y,
      "field"
    );
  });

  return locations;
}

/**
 * Intermediate bracing specimen
 *
 * Layout:
 *
 * ●────────────●
 * │     │      │
 * ●─────┼──────●
 * │     │      │
 * ●─────┼──────●
 * │     │      │
 * ●─────┴──────●
 *
 * Perimeter screws:
 *   perimeterSpacing
 *
 * Vertical intermediate stud:
 *   fieldSpacing
 *
 * Horizontal intermediate bracing:
 *   horizontalSpacing
 */
function generateIntermediateBracingLayout({
  panelHeight,
  panelLength,
  perimeterSpacing,
  fieldSpacing,
  horizontalSpacing,
}) {
  const locations = [];

  const perimeterX = createLinePositions(
    panelLength,
    perimeterSpacing
  );

  const perimeterY = createLinePositions(
    panelHeight,
    perimeterSpacing
  );

  // Top and bottom perimeter
  perimeterX.forEach((x) => {
    addScrew(locations, x, 0, "perimeter");
    addScrew(locations, x, panelHeight, "perimeter");
  });

  // Left and right perimeter
  perimeterY.forEach((y) => {
    addScrew(locations, 0, y, "perimeter");
    addScrew(locations, panelLength, y, "perimeter");
  });

  // Vertical intermediate stud
  const intermediateX = panelLength / 2;

  const fieldY = createLinePositions(
    panelHeight,
    fieldSpacing
  );

  fieldY.forEach((y) => {
    addScrew(
      locations,
      intermediateX,
      y,
      "field"
    );
  });

  // Horizontal intermediate bracing lines
  const horizontalY = createLinePositions(
    panelHeight,
    horizontalSpacing
  );

  horizontalY.forEach((y) => {
    if (y === 0 || y === panelHeight) {
      return;
    }

    const horizontalX = createLinePositions(
      panelLength,
      fieldSpacing
    );

    horizontalX.forEach((x) => {
      addScrew(
        locations,
        x,
        y,
        "horizontal-field"
      );
    });

    // Ensure intersections with perimeter are present.
    addScrew(
      locations,
      0,
      y,
      "horizontal-field"
    );

    addScrew(
      locations,
      panelLength,
      y,
      "horizontal-field"
    );
  });

  return locations;
}

/**
 * Main calculation.
 */
export function calculateScrewLayout(inputs) {
  const {
    mode = "manual",
    panelHeight,
    panelLength,
    totalScrews,
    specimenType,
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

  // -----------------------------
  // MANUAL MODE
  // -----------------------------

  if (mode === "manual") {
    const nC = Number(totalScrews);

    if (!Number.isFinite(nC) || nC <= 0) {
      return {
        success: false,
        error:
          "Total number of screws must be greater than zero.",
      };
    }

    return {
      success: true,
      mode: "manual",
      totalScrews: Math.floor(nC),
      screwLocations: [],
    };
  }

  // -----------------------------
  // AUTOMATIC MODE
  // -----------------------------

  if (mode !== "automatic") {
    return {
      success: false,
      error: "Invalid screw calculation mode.",
    };
  }

  const perimeter = Number(perimeterSpacing);
  const field = Number(fieldSpacing);

  if (!Number.isFinite(perimeter) || perimeter <= 0) {
    return {
      success: false,
      error:
        "Perimeter screw spacing must be greater than zero.",
    };
  }

  if (!Number.isFinite(field) || field <= 0) {
    return {
      success: false,
      error:
        "Field/intermediate screw spacing must be greater than zero.",
    };
  }

  let screwLocations = [];

  if (specimenType === "control") {
    screwLocations = generateControlLayout({
      panelHeight: h,
      panelLength: l,
      perimeterSpacing: perimeter,
      fieldSpacing: field,
    });
  }

  else if (specimenType === "intermediateBracing") {
    const horizontal = Number(horizontalSpacing);

    if (!Number.isFinite(horizontal) || horizontal <= 0) {
      return {
        success: false,
        error:
          "Horizontal intermediate spacing must be greater than zero.",
      };
    }

    screwLocations =
      generateIntermediateBracingLayout({
        panelHeight: h,
        panelLength: l,
        perimeterSpacing: perimeter,
        fieldSpacing: field,
        horizontalSpacing: horizontal,
      });
  }

  else {
    return {
      success: false,
      error: "Invalid specimen type.",
    };
  }

  return {
    success: true,
    mode: "automatic",
    specimenType,
    totalScrews: screwLocations.length,
    screwLocations,
  };
}