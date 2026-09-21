/**
 * sectionProperties.js
 *
 * Unified dynamic section-property calculation engine for Cold-Formed Steel (CFS).
 *
 * Core Engineering Methodology:
 * 1. Geometry is broken into valid non-overlapping area elements (rectangles or thin strips).
 * 2. Each element has area A_i, centroid (x_i, y_i), and local centroidal inertias (Ix_local, Iy_local).
 * 3. All constituent elements are fed into calculateGenericSectionProperties(elements).
 * 4. The generic engine calculates:
 *      Total Area: A_total = Σ A_i
 *      Global Centroid: X̄ = Σ(A_i * x_i) / A_total
 *                       Ȳ = Σ(A_i * y_i) / A_total
 *      Parallel-Axis Inertias:
 *                       Ix = Σ [Ix_local + A_i * (y_i - Ȳ)²]
 *                       Iy = Σ [Iy_local + A_i * (x_i - X̄)²]
 *
 * Works dynamically for C-sections, I-sections, Grid Layouts, and arbitrary thin-walled sections.
 * All intermediate calculations use full JavaScript 64-bit floating-point precision.
 *
 * Units:
 *   Length   = mm
 *   Area     = mm²
 *   Inertia  = mm⁴
 */

/**
 * Central generic calculation engine.
 * Receives an array of geometric area elements and evaluates section properties
 * using the parallel-axis theorem without intermediate rounding.
 *
 * Each element should provide:
 *   - area: number (> 0)
 *   - x: number (element centroid X)
 *   - y: number (element centroid Y)
 *   - IxLocal: number (element local centroidal Ix)
 *   - IyLocal: number (element local centroidal Iy)
 */
export function calculateGenericSectionProperties(elements) {
  if (!Array.isArray(elements) || elements.length === 0) {
    return null;
  }

  let totalArea = 0;
  let sumAx = 0;
  let sumAy = 0;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const a = Number(el.area);
    const x = Number(el.x);
    const y = Number(el.y);

    if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    totalArea += a;
    sumAx += a * x;
    sumAy += a * y;
  }

  if (totalArea <= 0 || !Number.isFinite(totalArea)) {
    return null;
  }

  const centroidX = sumAx / totalArea;
  const centroidY = sumAy / totalArea;

  let Ix = 0;
  let Iy = 0;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const a = Number(el.area);
    const x = Number(el.x);
    const y = Number(el.y);
    const IxLocal = Number.isFinite(el.IxLocal) ? Number(el.IxLocal) : 0;
    const IyLocal = Number.isFinite(el.IyLocal) ? Number(el.IyLocal) : 0;

    if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    const dy = y - centroidY;
    const dx = x - centroidX;

    Ix += IxLocal + a * (dy * dy);
    Iy += IyLocal + a * (dx * dx);
  }

  return {
    area: totalArea,
    centroidX,
    centroidY,
    Ix,
    Iy,
  };
}

/**
 * Builds the 5 non-overlapping rectangular elements for a single C-section.
 *
 * Idealized sharp-corner geometry:
 *   1. Web:           width = t,     height = h
 *   2. Top flange:    width = b - t, height = t
 *   3. Bottom flange: width = b - t, height = t
 *   4. Top lip:       width = t,     height = c
 *   5. Bottom lip:    width = t,     height = c
 *
 * Coordinate reference:
 *   X = 0 at outer face of web
 *   Y = 0 at bottom face of bottom flange
 *
 * @param {Object} section - { webLength, flangeWidth, lipLength, thickness }
 * @param {number} [xOffset=0] - optional shift along X
 * @param {number} [direction=1] - +1 for standard (flanges right), -1 for mirrored (flanges left)
 * @returns {Array<Object>|null}
 */
export function buildCShapeElements(section, xOffset = 0, direction = 1) {
  const h = Number(section.webLength);
  const b = Number(section.flangeWidth);
  const c = Number(section.lipLength);
  const tw = Number(section.webThickness ?? section.thickness);
  const tf = Number(section.flangeThickness ?? section.thickness);

  if (
    !Number.isFinite(h) ||
    !Number.isFinite(b) ||
    !Number.isFinite(c) ||
    !Number.isFinite(tw) ||
    !Number.isFinite(tf)
  ) {
    return null;
  }

  if (h <= 0 || b <= 0 || c < 0 || tw <= 0 || tf <= 0) {
    return null;
  }

  if (tw >= b || (2 * tf) >= h) {
    return null;
  }

  // 1. Web: width tw, height h
  const webX = xOffset + direction * (tw / 2);
  const webY = h / 2;
  const web = {
    name: direction === 1 ? "Web" : "Mirrored Web",
    width: tw,
    height: h,
    area: tw * h,
    x: webX,
    y: webY,
    IxLocal: (tw * Math.pow(h, 3)) / 12,
    IyLocal: (h * Math.pow(tw, 3)) / 12,
  };

  // 2. Top Flange: width (b - tw), height tf
  const flangeW = b - tw;
  const flangeX = xOffset + direction * (tw + flangeW / 2);
  const topFlangeY = h - tf / 2;
  const topFlange = {
    name: direction === 1 ? "Top Flange" : "Mirrored Top Flange",
    width: flangeW,
    height: tf,
    area: flangeW * tf,
    x: flangeX,
    y: topFlangeY,
    IxLocal: (flangeW * Math.pow(tf, 3)) / 12,
    IyLocal: (tf * Math.pow(flangeW, 3)) / 12,
  };

  // 3. Bottom Flange: width (b - tw), height tf
  const bottomFlangeY = tf / 2;
  const bottomFlange = {
    name: direction === 1 ? "Bottom Flange" : "Mirrored Bottom Flange",
    width: flangeW,
    height: tf,
    area: flangeW * tf,
    x: flangeX,
    y: bottomFlangeY,
    IxLocal: (flangeW * Math.pow(tf, 3)) / 12,
    IyLocal: (tf * Math.pow(flangeW, 3)) / 12,
  };

  const elements = [web, topFlange, bottomFlange];

  // 4 & 5. Lips (if c > 0)
  if (c > 0) {
    const lipThickness = tf;
    const lipX = xOffset + direction * (b - lipThickness / 2);
    const topLipY = h - tf - c / 2;
    const bottomLipY = tf + c / 2;

    const topLip = {
      name: direction === 1 ? "Top Lip" : "Mirrored Top Lip",
      width: lipThickness,
      height: c,
      area: lipThickness * c,
      x: lipX,
      y: topLipY,
      IxLocal: (lipThickness * Math.pow(c, 3)) / 12,
      IyLocal: (c * Math.pow(lipThickness, 3)) / 12,
    };

    const bottomLip = {
      name: direction === 1 ? "Bottom Lip" : "Mirrored Bottom Lip",
      width: lipThickness,
      height: c,
      area: lipThickness * c,
      x: lipX,
      y: bottomLipY,
      IxLocal: (lipThickness * Math.pow(c, 3)) / 12,
      IyLocal: (c * Math.pow(lipThickness, 3)) / 12,
    };

    elements.push(topLip, bottomLip);
  }

  return elements;
}

/**
 * Builds the 10 constituent non-overlapping rectangular elements for a built-up
 * I-section composed of two C-sections placed back-to-back at their webs (X = 0).
 *
 * Right C (direction = +1): extends into X > 0
 * Left C (direction = -1): extends into X < 0
 *
 * @param {Object} section - single C-section parameters
 * @returns {Array<Object>|null}
 */
export function buildIShapeElements(section) {
  const rightElements = buildCShapeElements(section, 0, 1);
  const leftElements = buildCShapeElements(section, 0, -1);

  if (!rightElements || !leftElements) {
    return null;
  }

  return [...rightElements, ...leftElements];
}

/**
 * Calculate geometric properties of a CFS C-section dynamically.
 * Generates 5 non-overlapping rectangles and passes them to the generic engine.
 * Also computes the double-C built-up section for downstream frame IF_end.
 *
 * @param {Object|Array} sectionOrElements
 */
export function calculateSectionProperties(sectionOrElements) {
  // Support passing an arbitrary element array directly
  if (Array.isArray(sectionOrElements)) {
    const generic = calculateGenericSectionProperties(sectionOrElements);
    if (!generic) return null;
    return {
      success: true,
      ...generic,
      IF_intermediate: generic.Iy,
      IF_end: 2 * generic.Iy,
      IF: 2 * generic.Iy,
      sectionType: "custom",
      rectangles: sectionOrElements,
    };
  }

  const section = sectionOrElements;
  if (!section || typeof section !== "object") {
    return null;
  }

  const h = Number(section.webLength);
  const b = Number(section.flangeWidth);
  const c = Number(section.lipLength);
  const tw = Number(section.webThickness ?? section.thickness);
  const tf = Number(section.flangeThickness ?? section.thickness);
  const radius = Number(section.radius) || 0;

  const rectangles = buildCShapeElements(section, 0, 1);
  if (!rectangles) {
    return null;
  }

  if (radius !== 0) {
    console.warn(
      "Corner radius is currently not included in the section property calculation."
    );
  }

  const generic = calculateGenericSectionProperties(rectangles);
  if (!generic) {
    return null;
  }

  // Calculate built-up double-C section to obtain exact IF_end dynamically
  const iElements = buildIShapeElements(section);
  const iGeneric = iElements ? calculateGenericSectionProperties(iElements) : null;
  const IF_end = iGeneric ? iGeneric.Iy : 2 * generic.Iy;
  const IF_intermediate = generic.Iy;

  return {
    success: true,
    area: generic.area,
    centroidX: generic.centroidX,
    centroidY: generic.centroidY,
    centroidXRect: generic.centroidX,
    centroidYRect: generic.centroidY,
    Ix: generic.Ix,
    Iy: generic.Iy,
    IF_intermediate,
    IF_end,
    IF: IF_end,
    radius,
    rectangles,
    webLength: h,
    flangeWidth: b,
    lipLength: c,
    webThickness: tw,
    flangeThickness: tf,
    thickness: tf,
    sectionType: "C",
  };
}

/**
 * Built-up I-section = two C-sections placed back-to-back at the web.
 *
 * Dynamically generates all 10 constituent non-overlapping rectangle elements
 * in a mirrored coordinate system and passes ALL 10 elements to the generic engine.
 * Centroid and inertias are calculated from the complete geometry, NOT hardcoded.
 */
export function calculateISectionProperties(section) {
  if (!section || typeof section !== "object") {
    return null;
  }

  const iElements = buildIShapeElements(section);
  if (!iElements) {
    return null;
  }

  const generic = calculateGenericSectionProperties(iElements);
  if (!generic) {
    return null;
  }

  const singleC = calculateSectionProperties(section);

  const h = Number(section.webLength);
  const b = Number(section.flangeWidth);
  const c = Number(section.lipLength);
  const tw = Number(section.webThickness ?? section.thickness);
  const tf = Number(section.flangeThickness ?? section.thickness);
  const radius = Number(section.radius) || 0;

  return {
    success: true,
    area: generic.area,
    centroidX: generic.centroidX,
    centroidY: generic.centroidY,
    Ix: generic.Ix,
    Iy: generic.Iy,
    IF_intermediate: singleC ? singleC.IF_intermediate : generic.Iy,
    IF_end: generic.Iy,
    IF: generic.Iy,
    webLength: h,
    flangeWidth: b,
    lipLength: c,
    webThickness: tw,
    flangeThickness: tf,
    thickness: tf,
    radius,
    sectionType: "I",
    singleC,
    rectangles: iElements,
  };
}

function parseGridNodes(nodes) {
  const nodeMap = new Map();

  (nodes || []).forEach((node) => {
    const id = Number(node.id);
    const x = Number(node.x);
    const y = Number(node.y);

    if (!Number.isFinite(id) || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }

    nodeMap.set(id, { id, x, y });
  });

  return nodeMap;
}

/**
 * IMPORTANT — GRID JUNCTIONS
 *
 * For arbitrary Grid Layout geometry, do not blindly assume that simply
 * summing L × t for every connected segment always represents the exact
 * physical area.
 *
 * Connected segments may overlap at their junctions.
 *
 * The implementation must use a consistent thin-walled idealization.
 *
 * For the current version, if the Grid Layout is intended to represent
 * centerline thin-walled members, document and maintain the centerline-strip
 * idealization consistently.
 *
 * Do not silently mix:
 * - centerline geometry
 * - outer-edge geometry
 * - overlapping full rectangles
 *
 * The same geometric convention must be used consistently for:
 * Area, Centroid, Ix, Iy.
 *
 * If the current Grid input represents centerline elements, retain that
 * convention and do not introduce arbitrary overlap subtraction.
 *
 * This should be kept architecturally separate so that exact finite-width
 * geometry/junction treatment can be introduced later if required.
 *
 * @param {Array<Object>} nodes - [{ id, x, y }]
 * @param {Array<Object>} edges - [{ startNode, endNode, thickness }]
 */
export function calculateGridSectionProperties(nodes, edges) {
  const nodeMap = parseGridNodes(nodes);
  const elements = [];

  (edges || []).forEach((edge) => {
    const start = nodeMap.get(Number(edge.startNode));
    const end = nodeMap.get(Number(edge.endNode));
    const t = Number(edge.thickness);

    if (!start || !end || start.id === end.id) {
      return;
    }

    if (!Number.isFinite(t) || t <= 0) {
      return;
    }

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const L = Math.hypot(dx, dy);

    if (L <= 0) {
      return;
    }

    const area = L * t;
    const xm = (start.x + end.x) / 2;
    const ym = (start.y + end.y) / 2;
    const theta = Math.atan2(dy, dx);

    const IPerpendicular = (t * Math.pow(L, 3)) / 12;
    const IParallel = (L * Math.pow(t, 3)) / 12;

    const cos = dx / L;
    const sin = dy / L;
    const cos2 = cos * cos;
    const sin2 = sin * sin;

    // Transform local inertias to global axes based on segment angle θ
    const IxLocal = IPerpendicular * sin2 + IParallel * cos2;
    const IyLocal = IPerpendicular * cos2 + IParallel * sin2;

    elements.push({
      area,
      x: xm,
      y: ym,
      L,
      t,
      theta,
      cos,
      sin,
      IxLocal,
      IyLocal,
      startNode: edge.startNode,
      endNode: edge.endNode,
    });
  });

  if (elements.length === 0) {
    return {
      success: false,
      error: "Add at least one valid edge with thickness greater than zero.",
    };
  }

  const generic = calculateGenericSectionProperties(elements);
  if (!generic) {
    return {
      success: false,
      error: "Failed to calculate properties from the given grid elements.",
    };
  }

  const IF_intermediate = generic.Iy;
  const IF_end = 2 * generic.Iy;

  return {
    success: true,
    area: generic.area,
    centroidX: generic.centroidX,
    centroidY: generic.centroidY,
    Ix: generic.Ix,
    Iy: generic.Iy,
    IF_intermediate,
    IF_end,
    IF: IF_end,
    thickness: elements[0]?.t ?? null,
    sectionType: "grid",
    elementCount: elements.length,
    elements,
  };
}

/**
 * Dispatcher to calculate section properties based on method / section type.
 */
export function calculateSectionFromInputs({
  method,
  sectionType,
  section,
  nodes,
  edges,
}) {
  if (method === "grid") {
    return calculateGridSectionProperties(nodes, edges);
  }

  if (sectionType === "I") {
    const result = calculateISectionProperties(section);
    return (
      result || {
        success: false,
        error: "Please enter valid I-section dimensions.",
      }
    );
  }

  const result = calculateSectionProperties(section);
  return (
    result || {
      success: false,
      error: "Please enter valid C-section dimensions.",
    }
  );
}
