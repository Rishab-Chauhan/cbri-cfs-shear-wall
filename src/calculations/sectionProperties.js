/**
 * Calculate geometric properties of a CFS C-section.
 *
 * Geometry:
 *
 *      ┌──────────────┐
 *      │              │  ← Top flange + lip
 *      │
 *      │
 *      │              │
 *      └──────────────┘  ← Bottom flange + lip
 *
 * The section is treated as a sharp-cornered section
 * when radius = 0.
 *
 * Dimensions:
 *   h = web length
 *   b = flange width
 *   c = lip length
 *   t = thickness
 *
 * Units:
 *   Length  = mm
 *   Area    = mm²
 *   Inertia = mm⁴
 */

export function calculateSectionProperties(section) {
  const h = Number(section.webLength);
  const b = Number(section.flangeWidth);
  const c = Number(section.lipLength);
  const t = Number(section.thickness);
  const radius = Number(section.radius) || 0;

  // ------------------------------------------------------------
  // INPUT VALIDATION
  // ------------------------------------------------------------

  if (
    !Number.isFinite(h) ||
    !Number.isFinite(b) ||
    !Number.isFinite(c) ||
    !Number.isFinite(t)
  ) {
    return null;
  }

  if (h <= 0 || b <= 0 || c < 0 || t <= 0) {
    return null;
  }

  if (t >= h || t >= b) {
    return null;
  }

  /*
   * Current calculation assumes sharp corners.
   *
   * Radius will be incorporated separately when we implement
   * rounded-corner geometry.
   */
  if (radius !== 0) {
    console.warn(
      "Corner radius is currently not included in the section property calculation."
    );
  }

  // ------------------------------------------------------------
  // RECTANGULAR COMPONENTS
  // ------------------------------------------------------------
  //
  // We divide the C-section into 5 non-overlapping rectangles:
  //
  // 1. Web
  // 2. Top flange
  // 3. Bottom flange
  // 4. Top lip
  // 5. Bottom lip
  //
  // This avoids double-counting material at the intersections.
  // ------------------------------------------------------------

  const rectangles = [
    {
      name: "Web",

      width: t,
      height: h,

      // centroid coordinates
      x: t / 2,
      y: h / 2,
    },

    {
      name: "Top Flange",

      width: b - t,
      height: t,

      x: t + (b - t) / 2,
      y: h - t / 2,
    },

    {
      name: "Bottom Flange",

      width: b - t,
      height: t,

      x: t + (b - t) / 2,
      y: t / 2,
    },

    {
      name: "Top Lip",

      width: t,
      height: c,

      x: b - t / 2,
      y: h - t - c / 2,
    },

    {
      name: "Bottom Lip",

      width: t,
      height: c,

      x: b - t / 2,
      y: t + c / 2,
    },
  ];

  // ------------------------------------------------------------
  // AREA
  // ------------------------------------------------------------

  rectangles.forEach((rect) => {
    rect.area = rect.width * rect.height;
  });

  const area = rectangles.reduce(
    (sum, rect) => sum + rect.area,
    0
  );

  // ------------------------------------------------------------
  // CENTROID
  // ------------------------------------------------------------

  const centroidX =
    rectangles.reduce(
      (sum, rect) => sum + rect.area * rect.x,
      0
    ) / area;

  const centroidY =
    rectangles.reduce(
      (sum, rect) => sum + rect.area * rect.y,
      0
    ) / area;

  // ------------------------------------------------------------
  // MOMENT OF INERTIA
  // ------------------------------------------------------------
  //
  // Rectangle centroidal inertias:
  //
  // Ix = b h³ / 12
  // Iy = h b³ / 12
  //
  // Parallel axis theorem:
  //
  // Ix = Ix_local + A(dy)²
  // Iy = Iy_local + A(dx)²
  // ------------------------------------------------------------

  let Ix = 0;
  let Iy = 0;

  rectangles.forEach((rect) => {
    const IxLocal =
      (rect.width * Math.pow(rect.height, 3)) / 12;

    const IyLocal =
      (rect.height * Math.pow(rect.width, 3)) / 12;

    const dx = rect.x - centroidX;
    const dy = rect.y - centroidY;

    Ix += IxLocal + rect.area * Math.pow(dy, 2);
    Iy += IyLocal + rect.area * Math.pow(dx, 2);
  });

  // ------------------------------------------------------------
  // RADIUS
  // ------------------------------------------------------------

  /*
   * For now radius = 0 is the intended calculation.
   *
   * We return it so the rest of the application knows which
   * geometry was used.
   */

  return {
    area,
    centroidX,
    centroidY,
    Ix,
    Iy,

    radius,

    // Useful for debugging / future calculations
    rectangles,
  };
}