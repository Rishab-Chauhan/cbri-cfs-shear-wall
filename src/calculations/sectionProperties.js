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
    success: true,
    area,
    centroidX: xcm,
    centroidY: ycm,
    centroidXRect,
    centroidYRect,
    Ix,
    Iy,
    IF_intermediate,
    IF_end,
    IF: IF_end,
    radius,
    rectangles,
    webLength: w,
    flangeWidth: f,
    lipLength: l,
    thickness: TST,
    sectionType: "C",
  };
}

/**
 * Built-up I-section = two C-sections fastened back-to-back.
 * Reuses the existing C-section formulas; does not duplicate them.
 */
export function calculateISectionProperties(section) {
  const cSection = calculateSectionProperties(section);

  if (!cSection) {
    return null;
  }

  return {
    success: true,
    area: 2 * cSection.area,
    centroidX: 0,
    centroidY: cSection.centroidY,
    Ix: 2 * cSection.Ix,
    Iy: cSection.IF_end,
    IF_intermediate: cSection.IF_intermediate,
    IF_end: cSection.IF_end,
    IF: cSection.IF_end,
    webLength: cSection.webLength,
    flangeWidth: cSection.flangeWidth,
    lipLength: cSection.lipLength,
    thickness: cSection.thickness,
    sectionType: "I",
    singleC: cSection,
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
 * Thin-walled section properties from nodes + edges.
 * Each edge is a rectangular strip of length L and thickness t.
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

    const cos = dx / L;
    const sin = dy / L;
    const A = L * t;

    elements.push({
      A,
      xm: (start.x + end.x) / 2,
      ym: (start.y + end.y) / 2,
      L,
      t,
      cos,
      sin,
    });
  });

  if (elements.length === 0) {
    return {
      success: false,
      error: "Add at least one valid edge with thickness greater than zero.",
    };
  }

  const area = elements.reduce((sum, el) => sum + el.A, 0);
  const centroidX =
    elements.reduce((sum, el) => sum + el.A * el.xm, 0) / area;
  const centroidY =
    elements.reduce((sum, el) => sum + el.A * el.ym, 0) / area;

  let Ix = 0;
  let Iy = 0;

  elements.forEach((el) => {
    const { A, xm, ym, L, t, cos, sin } = el;
    const IAlong = (t * L ** 3) / 12;
    const IThick = (L * t ** 3) / 12;

    Ix += IAlong * sin * sin + IThick * cos * cos + A * (ym - centroidY) ** 2;
    Iy += IAlong * cos * cos + IThick * sin * sin + A * (xm - centroidX) ** 2;
  });

  const IF_intermediate = Iy;
  const IF_end = 2 * Iy;

  return {
    success: true,
    area,
    centroidX,
    centroidY,
    Ix,
    Iy,
    IF_intermediate,
    IF_end,
    IF: IF_end,
    sectionType: "grid",
    elementCount: elements.length,
  };
}

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
    return result || {
      success: false,
      error: "Please enter valid I-section dimensions.",
    };
  }

  const result = calculateSectionProperties(section);
  return result || {
    success: false,
    error: "Please enter valid C-section dimensions.",
  };
}
