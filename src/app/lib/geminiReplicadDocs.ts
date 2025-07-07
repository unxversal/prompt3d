export const REPLICAD_DOCS = `
/*
  Replicad Language Guide for AI Models

  This document provides a comprehensive but concise guide to Replicad, a code-first 3D modeling library.
  It is designed to teach an AI how to generate replicad code by focusing on core concepts, a condensed API reference, and practical examples.
  The fundamental workflow is:
  1. Create a 2D shape using the Drawing API (e.g., draw().hLine(10)...).
  2. Place the 2D Drawing onto a 3D Plane to create a Sketch (e.g., .sketchOnPlane("XY")).
  3. Generate a 3D Solid from the Sketch (e.g., .extrude(5)).
  4. Modify or combine the Solid (e.g., .fillet(1), .cut(otherSolid)).
*/

// =================================================================
// 1. CORE CONCEPTS & WORKFLOW
// =================================================================

// The basic workflow from a 2D drawing to a 3D solid.
// This is the most common pattern in replicad.
const { drawEllipse } = replicad;
const main = () => {
  // 1. Draw a 2D ellipse
  const myDrawing = drawEllipse(20, 30);

  // 2. Sketch it on the default XY plane to make it a 3D face
  const mySketch = myDrawing.sketchOnPlane();

  // 3. Extrude the sketch to create a 3D solid
  const mySolid = mySketch.extrude(50);

  // 4. Modify the solid by filleting all its edges
  const finalShape = mySolid.fillet(2);

  return finalShape;
};


// =================================================================
// 2. 2D DRAWING
// =================================================================
/*
  Create 2D shapes using the 'draw()' function which returns a chainable DrawingPen.
  These are pure 2D constructs until they are sketched on a plane.
*/

// --- Drawing with the DrawingPen ---
const { draw } = replicad;
const main = () => {
  return draw() // Start drawing at origin [0,0] or from a point e.g. draw([10,0])
    .hLine(25) // Horizontal line of 25mm
    .vLine(30) // Vertical line of 30mm
    .lineTo([10, 10]) // Line to an absolute point [10, 10]
    .smoothSpline(-15, -15, { endTangent: [-1, 0] }) // A smooth curve (B-spline)
    .close(); // Close the shape with a straight line to the start
};

// --- Common DrawingPen Methods ---
// .hLine(distance), .vLine(distance): Draw horizontal/vertical lines.
// .line(dx, dy), .lineTo([x, y]): Draw lines relative to the last point or to an absolute point.
// .tangentArc(dx, dy), .threePointsArc([x_end, y_end], [x_via, y_via]): Draw arcs.
// .smoothSpline(dx, dy, {config}), .bezierCurveTo([x,y], [ctrls]): Draw complex curves.
// .close(): Closes the path with a line to form a closed shape.
// .closeWithMirror(): Closes the path by mirroring the existing drawing.
// .done(): Ends the drawing without closing it (for open profiles like a sweep path).


// --- Pre-baked 2D Shapes ---
// These functions directly return a 'Drawing' object.
const { drawCircle, drawRoundedRectangle, drawPolysides, drawText } = replicad;
const main = () => {
  const circle = drawCircle(10); // A circle with radius 10.
  const rect = drawRoundedRectangle(50, 30, 5); // A 50x30 rectangle with corner radius 5.
  const hexagon = drawPolysides(15, 6); // A hexagon with a 15mm outer radius and 6 sides.
  const text = drawText("Hi", { fontSize: 12 }); // Draw text.

  return [
    { shape: circle.translate(-30, 0) },
    { shape: rect.translate(40, 0) },
    { shape: hexagon.translate(-30, 40) },
    { shape: text.translate(40, 40) },
  ];
};

// --- 2D Boolean Operations & Offsets ---
// Drawings can be combined before being turned into 3D shapes.
const { drawCircle, drawRectangle } = replicad;
const main = () => {
  const circle = drawCircle(20);
  const rectangle = drawRectangle(25, 25);

  // Subtract the rectangle from the circle.
  const cutShape = circle.cut(rectangle);

  // Create a 2mm thick wall by offsetting outwards and cutting the original shape.
  const wall = cutShape.offset(2).cut(cutShape);

  return wall;
  // Other 2D booleans: .fuse(otherDrawing), .intersect(otherDrawing)
};


// =================================================================
// 3. PLANES & SKETCHING
// =================================================================
/*
  Drawings exist in 2D. To use them in 3D, you must "sketch" them onto a 3D Plane.
  A Sketch is a flat 3D object (a Face or a Wire) that can be extruded, revolved, etc.
*/

// --- Creating and Using Planes ---
// A plane is a 2D coordinate system within 3D space.
const { drawRoundedRectangle, makePlane } = replicad;
const main = () => {
  const rect = drawRoundedRectangle(100, 50, 5);

  // Sketch on standard planes with optional offsets.
  const sketchXY = rect.sketchOnPlane("XY"); // Default XY plane at Z=0.
  const sketchXZ_offset = rect.sketchOnPlane("XZ", 20); // XZ plane, shifted 20 along its normal (the Y-axis).
  const sketchYZ = rect.sketchOnPlane("YZ");

  // Create and transform a custom plane for more complex positioning.
  const customPlane = makePlane("XY") // Start with a standard XY plane.
    .translateZ(50) // Move its origin up by 50.
    .pivot(30, "Y"); // Pivot it 30 degrees around the global Y-axis.

  const customSketch = rect.sketchOnPlane(customPlane);

  return [
    { shape: sketchXY, name: "XY Plane Sketch" },
    { shape: sketchXZ_offset, name: "XZ at Y=20" },
    { shape: customSketch, name: "Custom Plane Sketch" },
  ];
};


// =================================================================
// 4. CREATING 3D SOLIDS
// =================================================================
/*
  Turn 2D Sketches into 3D Solids using extrusion, revolution, lofting, or sweeping.
*/

// --- Extrusion ---
// Adds depth to a sketch, with optional twisting or tapering.
const { draw } = replicad;
const main = () => {
  const shape = draw()
    .hLine(25).halfEllipse(0, 40, 5).hLine(-25).close()
    .sketchOnPlane("XZ");

  // Simple extrusion by 10mm.
  const simpleExtrusion = shape.extrude(10);

  // Extrusion with a 90-degree twist.
  const twistedExtrusion = shape.extrude(50, { twistAngle: 90 });

  return [
    { shape: simpleExtrusion.translateX(-30) },
    { shape: twistedExtrusion.translateX(30) },
  ];
};

// --- Revolution ---
// Revolves a sketch around an axis to create a lathed shape.
const { draw } = replicad;
const main = () => {
  const profile = draw([10, 0]) // Start away from the Z-axis
    .vLine(40).hLine(15).vLine(-10).close().sketchOnPlane("XZ");

  // Revolve the profile around the default Z-axis.
  return profile.revolve();
};

// --- Loft ---
// Creates a smooth solid that transitions between multiple sketches.
const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const sketch1 = drawRoundedRectangle(20, 30).sketchOnPlane("XY", 0);
  const sketch2 = drawCircle(8).sketchOnPlane("XY", 20);
  const sketch3 = drawRoundedRectangle(30, 20, 2).sketchOnPlane("XY", 40);

  // Loft through all three sketches in order.
  return sketch1.loftWith([sketch2, sketch3]);
};

// --- Sweep ---
// Sweeps a profile sketch along a path sketch to create complex solids.
const { draw, sketchRectangle } = replicad;
const main = () => {
  // 1. Define a path (as an open drawing).
  const path = draw().hLine(50).smoothSpline(30, 30).done().sketchOnPlane("XY");

  // 2. Sweep a rectangular profile along the path.
  // The function argument provides the plane at each point along the path.
  const sweptShape = path.sweepSketch((plane) => {
    return sketchRectangle(5, 10, { plane });
  });

  return sweptShape;
};


// --- Pre-baked 3D Solids ---
const { makeBox, makeCylinder, makeSphere } = replicad;
const main = () => {
  const box = makeBox(30, 40, 50);
  const cylinder = makeCylinder(10, 50); // radius, height
  const sphere = makeSphere(20);

  return [
    { shape: box },
    { shape: cylinder.translateX(40) },
    { shape: sphere.translateX(80) },
  ];
};


// =================================================================
// 5. 3D OPERATIONS (TRANSFORM, COMBINE, MODIFY)
// =================================================================

// --- Transformations ---
// Solids can be moved, rotated, mirrored, and scaled.
const { makeBox } = replicad;
const main = () => {
  const box = makeBox(20, 30, 40);

  const translated = box.clone().translate(50, 0, 0);
  const rotated = box.clone().rotate(45, [0,0,0], [0,0,1]); // 45 deg around Z-axis through origin.
  const mirrored = box.clone().mirror("XY").translate(0, 50, 0); // Mirror across XY plane.

  return [box, translated, rotated, mirrored];
};

// --- Boolean Operations (CSG) ---
// Combine solids using fuse (union), cut (difference), and intersect.
const { makeBox, makeCylinder } = replicad;
const main = () => {
  const box = makeBox(50, 50, 50);
  const cylinder = makeCylinder(20, 60);

  const fused = box.fuse(cylinder);
  const cut = box.cut(cylinder);
  const intersected = box.intersect(cylinder);

  return [
    { shape: fused.translateX(-60), name: "Fuse" },
    { shape: cut, name: "Cut" },
    { shape: intersected.translateX(60), name: "Intersect" },
  ];
};

// --- Modifications (Fillet, Chamfer, Shell) ---
/*
  Modifications require selecting specific faces or edges. This is done with Finders.
  A finder is defined as a function passed to the modification method, e.g., (e) => e.inPlane("XY", 10).
  'e' represents an edge, 'f' represents a face.
*/

// --- Finders ---
// Find geometry based on properties. Chain filters to be more specific.
// Common filters: .inPlane(), .inDirection(), .ofSurfaceType(), .ofCurveType(), .containsPoint()
// Combine filters: .either([finder1, finder2]) for OR, .not(finder) for negation.
const { makeBox } = replicad;
const main = () => {
  const box = makeBox(30, 30, 30);
  return {
    shape: box,
    // Highlight the top face: finds faces in the XY plane at z=15.
    highlightFace: (f) => f.inPlane("XY", 15),
    // Highlight vertical edges: finds edges aligned with the Z-axis.
    highlightEdge: (e) => e.inDirection("Z"),
  };
};

// --- Fillet & Chamfer ---
// Rounds (fillet) or bevels (chamfer) selected edges.
const { makeBox } = replicad;
const main = () => {
  const box = makeBox(30, 30, 30);
  // Fillet only the edges on the top face of the box.
  const filletedBox = box.fillet(3, (e) => e.inPlane("XY", 15));
  return filletedBox;
};

// --- Shell ---
// Hollows a solid by removing a selected face and giving the walls a thickness.
const { makeBox } = replicad;
const main = () => {
  const box = makeBox(30, 30, 30);
  // Create a 2mm thick shell, opening it from the top face.
  const shelledBox = box.shell(2, (f) => f.inPlane("XY", 15));
  return shelledBox;
};


// =================================================================
// 6. RECIPES (COMMON PATTERNS)
// =================================================================

// --- Polar Array ---
// Creates circular copies of a shape. Works for both 2D and 3D shapes.
const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;
  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

// --- Fuse All ---
// Fuses an array of shapes into a single solid.
const fuseAll = (shapes) => {
  if (!shapes || shapes.length === 0) return null;
  let result = shapes[0];
  for (let i = 1; i < shapes.length; i++) {
    result = result.fuse(shapes[i]);
  }
  return result;
};


// =================================================================
// 7. FULL EXAMPLES
// =================================================================
/*
  These examples demonstrate how to combine the above concepts to create complex models.
  They are excellent references for structure and advanced techniques.
*/

// --- Example: Watering Can ---
// Demonstrates: revolve, loft, planes, booleans, fillets, and shelling.
const { makePlane, makeCylinder, draw, drawCircle } = replicad;
const main = () => {
  // 1. Body: Revolve a 2D profile.
  const profile = draw().hLine(20).line(10, 5).vLine(3).lineTo([8, 100]).hLine(-8).close();
  const body = profile.sketchOnPlane("XZ").revolve();

  // 2. Filler: Loft between 3 circles on different, transformed planes.
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);
  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);
  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);
  const filler = topCircle.loftWith([middleCircle, bottomCircle]);

  // 3. Spout: Create and position a simple cylinder.
  const spout = makeCylinder(5, 70).translateZ(100).rotate(45, [0, 0, 100], [0, 1, 0]);

  // 4. Combine: Fuse the parts and fillet the intersections.
  let wateringCan = body
    .fuse(filler)
    .fillet(30, (e) => e.inPlane("XY", 100))
    .fuse(spout)
    .fillet(10, (e) => e.inBox([20, 20, 100], [-20, -20, 120]));

  // 5. Hollow: Shell the final shape from its openings.
  const spoutOpeningPoint = [ Math.cos(45 * Math.PI / 180) * 70, 0, 100 + Math.sin(45 * Math.PI / 180) * 70 ];
  wateringCan = wateringCan.shell(-1, (f) =>
    f.either([
      (f) => f.containsPoint(spoutOpeningPoint),
      (f) => f.inPlane(topPlane),
    ])
  );
  return wateringCan;
};

// --- Example: Code CAD Birdhouse ---
// Demonstrates: shell, fillet, booleans, and combining transformed parts.
const { drawCircle, draw, makePlane } = replicad;
const defaultParams = { height: 85.0, width: 120.0, thickness: 2.0, holeDia: 50.0 };
function main(r, { width, height, thickness, holeDia }) {
  const length = width;
  const tobleroneShape = draw([-width / 2, 0])
    .lineTo([0, height])
    .lineTo([width / 2, 0])
    .close()
    .sketchOnPlane("XZ", -length / 2)
    .extrude(length)
    .shell(thickness, (f) => f.parallelTo("XZ"))
    .fillet(thickness / 2, (e) => e.inDirection("Y"));

  const hole = drawCircle(holeDia / 2)
    .sketchOnPlane(makePlane("YZ").translate([-length / 2, 0, height / 3]))
    .extrude(length);

  const base = tobleroneShape.cut(hole);
  const body = base.clone().fuse(base.rotate(90));
  return body;
}

// --- Example: Wavy Vase (Parametric Design) ---
// Demonstrates: drawPolysides, twisted extrusions, and parametric design.
const { drawPolysides, drawCircle } = replicad;
const defaultParams = { height: 150, radius: 40, sidesCount: 12, sideRadius: -2, sideTwist: 6, wallThickness: 2 };
const main = (r, { height, radius, sidesCount, sideRadius, sideTwist, wallThickness }) => {
  const twistAngle = (360 / sidesCount) * sideTwist;

  let vase = drawPolysides(radius, sidesCount, -sideRadius)
    .sketchOnPlane()
    .extrude(height, { twistAngle, extrusionProfile: { profile: "s-curve", endFactor: 1.5 } });

  if (wallThickness > 0) {
    vase = vase.shell(wallThickness, (f) => f.inPlane("XY", height));
  }
  return vase;
};

// --- Example: Gridfinity Box ---
// Demonstrates: sweeps, helper functions, and assembly-like construction.
const { draw, drawRoundedRectangle, makeSolid, assembleWire, makeFace, EdgeFinder } = replicad;
const SIZE = 42.0, CORNER_RADIUS = 4, SOCKET_HEIGHT = 5, CLEARANCE = 0.5;

const socketProfile = draw().vLine(-1.8).line(-0.8, -0.8).done();

const buildSocket = () => {
  const base = drawRoundedRectangle(SIZE - CLEARANCE, SIZE - CLEARANCE, CORNER_RADIUS).sketchOnPlane();
  const side = base.sweepSketch(p => socketProfile.sketchOnPlane("XZ", p.origin), { withContact: true });
  const startFace = new EdgeFinder().inPlane("XY", 0).find(side);
  const endFace = new EdgeFinder().inPlane("XY", -SOCKET_HEIGHT).find(side);
  return makeSolid([side, makeFace(assembleWire(startFace)), makeFace(assembleWire(endFace))]);
};

const cloneOnGrid = (shape, xSteps, ySteps) => {
  const xCorr = ((xSteps - 1) * SIZE) / 2;
  const yCorr = ((ySteps - 1) * SIZE) / 2;
  const clones = [];
  for (let i = 0; i < xSteps; i++) {
    for (let j = 0; j < ySteps; j++) {
      clones.push(shape.clone().translate(i * SIZE - xCorr, j * SIZE - yCorr, 0));
    }
  }
  return clones;
};

const main = (r, { xSize = 2, ySize = 1, heigthUnits = 3, wallThickness = 1.2 }) => {
  const stdHeight = heigthUnits * 7;
  
  let box = drawRoundedRectangle(
    xSize * SIZE - CLEARANCE, ySize * SIZE - CLEARANCE, CORNER_RADIUS
  ).sketchOnPlane().extrude(stdHeight)
   .shell(wallThickness, (f) => f.inPlane("XY", stdHeight));

  const sockets = cloneOnGrid(buildSocket(), xSize, ySize);
  const base = fuseAll(sockets);

  return base.fuse(box.translateZ(SOCKET_HEIGHT));
};
`;