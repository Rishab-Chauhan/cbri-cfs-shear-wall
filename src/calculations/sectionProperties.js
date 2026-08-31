export function calculateSectionProperties(section) {
  const h = Number(section.webLength) || 0;
  const b = Number(section.flangeWidth) || 0;
  const c = Number(section.lipLength) || 0;
  const t = Number(section.thickness) || 0;
  const r = Number(section.radius) || 0;

  // ------------------------------------------------------------
  // TEMPORARY THIN-WALLED C-SECTION MODEL
  // ------------------------------------------------------------
  //
  // This is only a preliminary calculation model.
  // We will replace this with the exact geometry/equations
  // from your calculation PDF before using the results.
  //
  // ------------------------------------------------------------

  const webArea = h * t;

  const topFlangeArea = b * t;
  const bottomFlangeArea = b * t;

  const topLipArea = c * t;
  const bottomLipArea = c * t;

  const area =
    webArea +
    topFlangeArea +
    bottomFlangeArea +
    topLipArea +
    bottomLipArea;

  // Prevent division by zero
  if (area === 0) {
    return {
      area: 0,
      centroidX: 0,
      centroidY: 0,
      ix: 0,
      iy: 0,
      radius: r,
    };
  }

  // ------------------------------------------------------------
  // CENTROID
  // ------------------------------------------------------------

  /*
   * Coordinate system:
   *
   * X → from left side of web
   * Y → from top of section
   */

  const webX = t / 2;
  const webY = h / 2;

  const topFlangeX = b / 2;
  const topFlangeY = t / 2;

  const bottomFlangeX = b / 2;
  const bottomFlangeY = h - t / 2;

  const topLipX = b - t / 2;
  const topLipY = c / 2;

  const bottomLipX = b - t / 2;
  const bottomLipY = h - c / 2;

  const centroidX =
    (
      webArea * webX +
      topFlangeArea * topFlangeX +
      bottomFlangeArea * bottomFlangeX +
      topLipArea * topLipX +
      bottomLipArea * bottomLipX
    ) / area;

  const centroidY =
    (
      webArea * webY +
      topFlangeArea * topFlangeY +
      bottomFlangeArea * bottomFlangeY +
      topLipArea * topLipY +
      bottomLipArea * bottomLipY
    ) / area;

  // ------------------------------------------------------------
  // MOMENT OF INERTIA
  // ------------------------------------------------------------
  //
  // Preliminary rectangular-component calculation.
  //
  // This will later be replaced/expanded to account for the
  // exact bent geometry and radius.
  // ------------------------------------------------------------

  const webIx =
    (t * Math.pow(h, 3)) / 12 +
    webArea * Math.pow(webY - centroidY, 2);

  const webIy =
    (h * Math.pow(t, 3)) / 12 +
    webArea * Math.pow(webX - centroidX, 2);

  const topFlangeIx =
    (b * Math.pow(t, 3)) / 12 +
    topFlangeArea * Math.pow(topFlangeY - centroidY, 2);

  const topFlangeIy =
    (t * Math.pow(b, 3)) / 12 +
    topFlangeArea * Math.pow(topFlangeX - centroidX, 2);

  const bottomFlangeIx =
    (b * Math.pow(t, 3)) / 12 +
    bottomFlangeArea * Math.pow(bottomFlangeY - centroidY, 2);

  const bottomFlangeIy =
    (t * Math.pow(b, 3)) / 12 +
    bottomFlangeArea * Math.pow(bottomFlangeX - centroidX, 2);

  const topLipIx =
    (t * Math.pow(c, 3)) / 12 +
    topLipArea * Math.pow(topLipY - centroidY, 2);

  const topLipIy =
    (c * Math.pow(t, 3)) / 12 +
    topLipArea * Math.pow(topLipX - centroidX, 2);

  const bottomLipIx =
    (t * Math.pow(c, 3)) / 12 +
    bottomLipArea * Math.pow(bottomLipY - centroidY, 2);

  const bottomLipIy =
    (c * Math.pow(t, 3)) / 12 +
    bottomLipArea * Math.pow(bottomLipX - centroidX, 2);

  const ix =
    webIx +
    topFlangeIx +
    bottomFlangeIx +
    topLipIx +
    bottomLipIx;

  const iy =
    webIy +
    topFlangeIy +
    bottomFlangeIy +
    topLipIy +
    bottomLipIy;

  return {
    area,
    centroidX,
    centroidY,
    ix,
    iy,
    radius: r,
  };
}