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
 * Intermediate-stud IF  = MATLAB Iy of one C-section
 * Double end-stud IF    = 2 × MATLAB double-C expression
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

  if (radius !== 0) {
    console.warn(
      "Corner radius is currently not included in the section property calculation."
    );
  }

  const w = h;
  const f = b;
  const l = c;
  const TST = t;

  // --------------------------------------------------------
  // STUD CALCULATIONS -- same as MATLAB / test03.py
  // --------------------------------------------------------

  const ta =
    (2 * (l - TST * 0.5 + f - TST) + w - TST) * TST;
  const aw = (w - 2 * TST) * TST;
  const af = f * TST;
  const al = (l - TST) * TST;

  // Centre of mass -- origin at left bottom corner
  const xcm =
    (2 * al * TST * 0.5 + 2 * af * f * 0.5 + aw * (f - TST * 0.5)) /
    ta;

  const ycm =
    (
      af * 0.5 * TST +
      al * (TST * 3 - l) * 0.5 +
      aw * w * 0.5 +
      af * (w - TST * 0.5) +
      al * (w + 0.5 * TST - l * 1.5)
    ) / ta;

  // --------------------------------------------------------
  // MOMENT OF INERTIA OF ONE C-SECTION -- MATLAB Iy
  // --------------------------------------------------------

  const Iy =
    (w * f ** 3 / 12.0 + w * f * (f * 0.5 - xcm) ** 2) -
    (
      ((f - TST * 2) ** 3 * (w - TST * 2)) / 12.0 +
      (f - TST * 2) *
        (w - TST * 2) *
        ((f - TST * 2) * 0.5 + TST - xcm) ** 2 +
      ((w - 2 * l) * TST ** 3) / 12.0 +
      (w - 2 * l) * TST * (TST * 0.5 - xcm) ** 2
    );

  // --------------------------------------------------------
  // DOUBLE END-STUD -- exact MATLAB expression
  // --------------------------------------------------------

  const IF_intermediate = Iy;

  const IF_end =
    2.0 *
    (
      (w * f ** 3 / 12.0 + w * f * (f * 0.5) ** 2) -
      (
        ((f - TST * 2) ** 3 * (w - TST * 2)) / 12.0 +
        (f - TST * 2) *
          (w - TST * 2) *
          ((f - TST * 2) * 0.5 + TST) ** 2 +
        ((w - 2 * l) * TST ** 3) / 12.0 +
        (w - 2 * l) * TST * (TST * 0.5 - f) ** 2
      )
    );

  // --------------------------------------------------------
  // RECTANGULAR COMPONENTS -- Ix via parallel-axis theorem
  // --------------------------------------------------------

  const rectangles = [
    {
      name: "Web",
      width: t,
      height: h,
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

  rectangles.forEach((rect) => {
    rect.area = rect.width * rect.height;
  });

  const area = rectangles.reduce(
    (sum, rect) => sum + rect.area,
    0
  );

  const centroidXRect =
    rectangles.reduce(
      (sum, rect) => sum + rect.area * rect.x,
      0
    ) / area;

  const centroidYRect =
    rectangles.reduce(
      (sum, rect) => sum + rect.area * rect.y,
      0
    ) / area;

  let Ix = 0;

  rectangles.forEach((rect) => {
    const IxLocal =
      (rect.width * Math.pow(rect.height, 3)) / 12;
    const dy = rect.y - centroidYRect;
    Ix += IxLocal + rect.area * Math.pow(dy, 2);
  });

  return {
    area,
    centroidX: xcm,
    centroidY: ycm,
    centroidXRect,
    centroidYRect,
    Ix,
    Iy,
    IF_intermediate,
    IF_end,
    radius,
    rectangles,
    webLength: w,
    flangeWidth: f,
    lipLength: l,
    thickness: TST,
  };
}
