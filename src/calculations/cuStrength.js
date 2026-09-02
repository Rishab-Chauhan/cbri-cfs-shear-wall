export function calculateCu({
  panelHeight,
  panelLength,
  screwLocations = [],
  totalScrews,
}) {
  const h = Number(panelHeight);
  const l = Number(panelLength);
  const nC = Number(totalScrews);

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

  if (!Number.isFinite(nC) || nC <= 0) {
    return {
      success: false,
      error:
        "Total number of screws must be greater than zero.",
    };
  }

  let locations = screwLocations;

  /*
   * MANUAL SCREW MODE
   *
   * If the user supplied only nC,
   * generate a default control-specimen
   * distribution for the Cu calculation.
   */
  if (
    !Array.isArray(locations) ||
    locations.length === 0
  ) {
    locations =
      generateManualControlLayout(
        h,
        l,
        nC
      );
  }

  /*
   * Make sure the number used in the
   * Cu calculation agrees with the
   * actual coordinate set.
   */
  const actualNC =
    locations.length;

  if (actualNC === 0) {
    return {
      success: false,
      error:
        "Unable to generate screw-group coordinates.",
    };
  }

  const xCenter = l / 2;
  const yCenter = h / 2;

  const coordinates =
    locations.map((screw) => ({
      xCi:
        Number(screw.x) -
        xCenter,

      yCi:
        Number(screw.y) -
        yCenter,
    }));

  // J = Σ(xCi² + yCi²)

  const J =
    coordinates.reduce(
      (sum, point) =>
        sum +
        Math.pow(point.xCi, 2) +
        Math.pow(point.yCi, 2),
      0
    );

  // Source procedure:
  // M0 = Px * ey(0)
  //
  // For the current panel:
  // ey(0) = panel length

  const Px = 1;

  const ey0 = l;

  const M0 =
    Px * ey0;

  // δy = Px J / (nC M0)

  const deltaY =
    (Px * J) /
    (actualNC * M0);

  // ey = ey(0) + δy

  const ey =
    ey0 + deltaY;

  // Mp = Px ey

  const Mp =
    Px * ey;

  // Calculate di for every screw

  const screwDistances =
    coordinates.map((point) => {
      const dyi =
        point.yCi + deltaY;

      const di =
        Math.sqrt(
          Math.pow(point.xCi, 2) +
          Math.pow(dyi, 2)
        );

      return {
        xCi: point.xCi,
        yCi: point.yCi,
        dyi,
        di,
      };
    });

  // Mu = 0.93 Σdi

  const normalizedForce = 0.93;

  const Mu =
    normalizedForce *
    screwDistances.reduce(
      (sum, point) =>
        sum + point.di,
      0
    );

  // Cu = Mu / Mp

  const Cu =
    Mp !== 0
      ? Mu / Mp
      : 0;

  return {
    success: true,

    nC: actualNC,

    xCenter,
    yCenter,

    J,
    M0,

    ey0,
    deltaY,
    ey,

    Mp,
    Mu,

    Cu,

    normalizedForce,

    screwDistances,

    generatedForCu:
      screwLocations.length === 0,
  };
}

function generateManualControlLayout(
  panelHeight,
  panelLength,
  nC
) {
  const locations = [];

  /*
   * Default control-specimen layout.
   *
   * The layout is generated around the
   * panel perimeter plus an internal
   * vertical screw line.
   *
   * This is only used when the user
   * provides nC without coordinates.
   */

  const addScrew = (x, y) => {
    const exists =
      locations.some(
        (point) =>
          Math.abs(point.x - x) < 1e-9 &&
          Math.abs(point.y - y) < 1e-9
      );

    if (!exists) {
      locations.push({ x, y });
    }
  };

  /*
   * First generate a regular distribution
   * of exactly nC points around the
   * control-specimen perimeter/internal line.
   *
   * For now we use normalized positions.
   */

  const perimeterCount =
    Math.max(
      4,
      Math.floor(nC * 0.75)
    );

  const internalCount =
    Math.max(
      1,
      nC - perimeterCount
    );

  // -------------------------------
  // Perimeter
  // -------------------------------

  for (
    let i = 0;
    i < perimeterCount;
    i++
  ) {
    const position =
      i / perimeterCount;

    const perimeter =
      2 *
      (panelLength + panelHeight);

    const distance =
      position * perimeter;

    let x;
    let y;

    if (
      distance <= panelLength
    ) {
      x = distance;
      y = 0;
    } else if (
      distance <=
      panelLength + panelHeight
    ) {
      x = panelLength;
      y =
        distance -
        panelLength;
    } else if (
      distance <=
      2 * panelLength +
        panelHeight
    ) {
      x =
        panelLength -
        (
          distance -
          panelLength -
          panelHeight
        );

      y = panelHeight;
    } else {
      x = 0;

      y =
        panelHeight -
        (
          distance -
          2 * panelLength -
          panelHeight
        );
    }

    addScrew(x, y);
  }

  // -------------------------------
  // Internal vertical line
  // -------------------------------

  const xMiddle =
    panelLength / 2;

  for (
    let i = 0;
    i < internalCount;
    i++
  ) {
    const y =
      (i /
        Math.max(
          internalCount - 1,
          1
        )) *
      panelHeight;

    addScrew(
      xMiddle,
      y
    );
  }

  /*
   * If duplicate removal changed the
   * count, add points along the
   * centre line until nC is reached.
   */

  let extraIndex = 1;

  while (
    locations.length < nC
  ) {
    const y =
      (
        extraIndex /
        (nC + 1)
      ) *
      panelHeight;

    addScrew(
      xMiddle,
      y
    );

    extraIndex++;
  }

  /*
   * If the generated layout somehow
   * exceeds nC, trim it.
   */

  return locations.slice(
    0,
    nC
  );
}