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
  const tl = Number(section.lipThickness ?? section.flangeThickness ?? section.thickness);

  if (
    !Number.isFinite(h) ||
    !Number.isFinite(b) ||
    !Number.isFinite(c) ||
    !Number.isFinite(tw) ||
    !Number.isFinite(tf) ||
    !Number.isFinite(tl)
  ) {
    return null;
  }

  if (h <= 0 || b <= 0 || c < 0 || tw <= 0 || tf <= 0 || (c > 0 && tl <= 0)) {
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
    const lipThickness = tl;
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
    lipThickness: Number(section.lipThickness ?? tf),
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
  const tl = Number(section.lipThickness ?? section.flangeThickness ?? section.thickness);
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
    lipThickness: tl,
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
 * Converts Grid Layout input into finite-thickness non-overlapping rectangular elements.
 *
 * Geometric Methodology:
 * 1. Each input segment between two nodes defines a finite-thickness solid strip.
 * 2. Joint intersections are resolved without double-counting material:
 *    - At corner junctions between connected segments, the dominant (longer) segment
 *      owns the joint corner without truncation.
 *    - The shorter/connecting segment is trimmed at that end by the dominant segment's thickness.
 *    - Terminal segments (such as lips with a free end) connecting to an intermediate segment
 *      (such as a flange) start from the interior face of the intermediate segment (shifted
 *      inward along their length by the flange thickness), preserving the exact flange width
 *      and lip height with zero overlap and zero void.
 * 3. The finite-thickness strip's centroid is accurately positioned in global coordinates,
 *    including inward perpendicular offset determined by the section profile.
 * 4. Local inertias (I_perp and I_par) are rotated and transformed into global IxLocal and IyLocal
 *    for arbitrary segment orientations (horizontal, vertical, diagonal).
 * 5. All elements are passed to calculateGenericSectionProperties() to compute global area,
 *    centroid, Ix, and Iy via the parallel-axis theorem.
 *
 * @param {Array<Object>} nodes - [{ id, x, y }]
 * @param {Array<Object>} edges - [{ startNode, endNode, thickness }]
 */
export function calculateGridSectionProperties(nodes, edges) {
  const nodeMap = parseGridNodes(nodes);

  const validEdges = [];
  (edges || []).forEach((edge, idx) => {
    const s = nodeMap.get(Number(edge.startNode));
    const e = nodeMap.get(Number(edge.endNode));
    const t = Number(edge.thickness);

    if (!s || !e || s.id === e.id) {
      return;
    }

    if (!Number.isFinite(t) || t <= 0) {
      return;
    }

    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const L = Math.hypot(dx, dy);

    if (L <= 0) {
      return;
    }

    validEdges.push({
      index: idx,
      id: edge.id || (idx + 1),
      startNode: s.id,
      endNode: e.id,
      s,
      e,
      t,
      L,
      dx,
      dy,
      tx: dx / L,
      ty: dy / L,
      nx: -dy / L,
      ny: dx / L,
    });
  });

  if (validEdges.length === 0) {
    return {
      success: false,
      error: "Add at least one valid edge with thickness greater than zero.",
    };
  }

  // Map incident edges per node
  const nodeIncident = new Map();
  nodeMap.forEach((n) => nodeIncident.set(n.id, []));
  validEdges.forEach((edge) => {
    nodeIncident.get(edge.startNode).push({ edge, isStart: true });
    nodeIncident.get(edge.endNode).push({ edge, isStart: false });
  });

  // Structural hierarchy classification:
  // Primary member (Level 0): Web (longest segment)
  // Secondary member (Level 1): Flange (connected directly to Web)
  // Tertiary member (Level 2): Lip / Stiffener (connected to Flange)
  let maxL = 0;
  validEdges.forEach((e) => {
    if (e.L > maxL) maxL = e.L;
  });

  const edgeLevel = new Map();
  const queue = [];
  validEdges.forEach((e) => {
    if (Math.abs(e.L - maxL) < 1e-4) {
      edgeLevel.set(e.id, 0);
      queue.push(e);
    }
  });

  while (queue.length > 0) {
    const curr = queue.shift();
    const currLevel = edgeLevel.get(curr.id);

    const neighbors = [
      ...(nodeIncident.get(curr.startNode) || []),
      ...(nodeIncident.get(curr.endNode) || []),
    ];
    for (const nb of neighbors) {
      if (!edgeLevel.has(nb.edge.id)) {
        edgeLevel.set(nb.edge.id, currLevel + 1);
        queue.push(nb.edge);
      }
    }
  }

  const elements = [];

  for (const edge of validEdges) {
    let trimStart = 0;
    let trimEnd = 0;
    let shiftStart = 0;
    let shiftEnd = 0;

    const sConns = (nodeIncident.get(edge.startNode) || []).filter(
      (c) => c.edge !== edge
    );
    const eConns = (nodeIncident.get(edge.endNode) || []).filter(
      (c) => c.edge !== edge
    );

    const isStartFree = sConns.length === 0;
    const isEndFree = eConns.length === 0;
    const level = edgeLevel.get(edge.id) || 0;

    // Check start node connection
    for (const conn of sConns) {
      const other = conn.edge;
      const otherLevel = edgeLevel.get(other.id) || 0;

      // Tertiary member (Lip, Level >= 2) with free end connecting to secondary (Flange):
      // Preserves length c by shifting inside the flange thickness
      if (isEndFree && level >= 2 && otherLevel < level) {
        shiftStart = Math.max(shiftStart, other.t);
      } else {
        // Flange attached to Web, or closed box, or dominant member:
        const otherWins =
          other.L > edge.L ||
          (Math.abs(other.L - edge.L) < 1e-6 && other.index < edge.index);
        if (otherWins) {
          trimStart = Math.max(trimStart, other.t);
        }
      }
    }

    // Check end node connection
    for (const conn of eConns) {
      const other = conn.edge;
      const otherLevel = edgeLevel.get(other.id) || 0;

      if (isStartFree && level >= 2 && otherLevel < level) {
        shiftEnd = Math.max(shiftEnd, other.t);
      } else {
        const otherWins =
          other.L > edge.L ||
          (Math.abs(other.L - edge.L) < 1e-6 && other.index < edge.index);
        if (otherWins) {
          trimEnd = Math.max(trimEnd, other.t);
        }
      }
    }

    const effectiveLength = edge.L - trimStart - trimEnd;
    if (effectiveLength <= 0) {
      continue;
    }

    // Position along segment centerline:
    const sAlong =
      trimStart + shiftStart - shiftEnd + effectiveLength / 2;
    let cx = edge.s.x + sAlong * edge.tx;
    let cy = edge.s.y + sAlong * edge.ty;

    // Inward normal determination from connected edges
    let perpSide = 0;
    for (const conn of [...sConns, ...eConns]) {
      const other = conn.edge;
      const otherDirX = conn.isStart ? other.tx : -other.tx;
      const otherDirY = conn.isStart ? other.ty : -other.ty;
      const cross = edge.tx * otherDirY - edge.ty * otherDirX;
      if (Math.abs(cross) > 0.01) {
        perpSide += Math.sign(cross);
      }
    }

    if (perpSide !== 0) {
      const sign = Math.sign(perpSide);
      cx += sign * (edge.t / 2) * edge.nx;
      cy += sign * (edge.t / 2) * edge.ny;
    }

    // Local centroidal second moments
    const IPerpendicular = (edge.t * Math.pow(effectiveLength, 3)) / 12;
    const IParallel = (effectiveLength * Math.pow(edge.t, 3)) / 12;

    const cos = edge.tx;
    const sin = edge.ty;
    const cos2 = cos * cos;
    const sin2 = sin * sin;

    // Transform local inertias to global coordinate axes
    const IxLocal = IPerpendicular * sin2 + IParallel * cos2;
    const IyLocal = IPerpendicular * cos2 + IParallel * sin2;

    elements.push({
      name: `Edge_${edge.id}`,
      area: effectiveLength * edge.t,
      x: cx,
      y: cy,
      L: effectiveLength,
      t: edge.t,
      IxLocal,
      IyLocal,
      startNode: edge.startNode,
      endNode: edge.endNode,
    });
  }

  if (elements.length === 0) {
    return {
      success: false,
      error: "Failed to generate valid finite-thickness elements from the given grid edges.",
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
    rectangles: elements,
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
