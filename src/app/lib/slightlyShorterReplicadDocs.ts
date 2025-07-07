export const REPLICAD_DOCS = `# Replicad Documentation - Comprehensive Reference

## Core Concepts

Replicad is a JavaScript CAD library using OpenCascade. Build 3D models through:
1. **2D Sketching** → **3D Operations** → **Modifications** → **Combinations**
2. **Coordinate System**: X, Y, Z axes (Z points up)
3. **Shapes**: Points → Edges → Faces → Shells → Solids

## File Template

\`\`\`javascript
const { draw, drawCircle, makeBaseBox, makeCylinder } = replicad;

const defaultParams = {
  height: 100,
  width: 50
};

function main(r, { height, width }) {
  // Create shapes here
  return shape; // or [shape1, shape2] for multiple
}

// Alternative syntax
const main = () => {
  const shape = drawCircle(10).sketchOnPlane().extrude(5);
  return { shape, name: "Circle", color: "blue" };
};
\`\`\`

## 2D Drawing & Sketching

### Basic Drawing Functions
\`\`\`javascript
// Pre-built 2D shapes
drawCircle(radius)
drawRoundedRectangle(width, height, radius)
drawPolysides(radius, sides, sagitta = 0)
drawText("text", { fontSize: 16, fontFamily: "default" })

// Manual drawing
draw([x, y]) // start point, or draw() for origin
  .lineTo([x, y])           // absolute coordinates
  .line(dx, dy)             // relative coordinates
  .hLine(dx)                // horizontal line
  .vLine(dy)                // vertical line
  .polarLine(distance, angle) // polar coordinates
  
  // Curves
  .threePointsArcTo([x,y], [midX,midY])
  .sagittaArc(dx, dy, sag)  // arc with sag (bulge)
  .tangentArc(dx, dy)       // tangent to previous segment
  .ellipseTo([x,y], rX, rY, rotation, longWay, counterClockwise)
  .smoothSplineTo([x,y], {startTangent: angle, endTangent: angle})
  .customCorner(radius)     // fillet corner (place between segments)
  
  .close()                  // close with line to start
  .closeWithMirror()        // mirror close
  .done()                   // end without closing
\`\`\`

### Drawing Methods
\`\`\`javascript
drawing
  .translate(dx, dy)
  .rotate(angle, [centerX, centerY])
  .mirror([dirX, dirY], [originX, originY])
  .offset(distance)         // positive = outward
  .cut(otherDrawing)        // boolean subtract
  .fuse(otherDrawing)       // boolean union
  .intersect(otherDrawing)  // boolean intersection
  .sketchOnPlane(plane, offset) // place in 3D
\`\`\`

## Planes & 3D Placement

\`\`\`javascript
// Standard planes
.sketchOnPlane("XY", offsetZ)
.sketchOnPlane("XZ", offsetY) 
.sketchOnPlane("YZ", offsetX)

// Custom planes
makePlane("XY", offset)
  .translate(x, y, z)
  .pivot(degrees, "X"|"Y"|"Z")
  .rotate2DAxes(degrees)

// Example
const tilted = makePlane("XY").pivot(30, "Y").translateZ(50);
drawCircle(10).sketchOnPlane(tilted);
\`\`\`

## 3D Shape Creation

### Extrusion
\`\`\`javascript
sketch.extrude(height, {
  extrusionDirection: [x, y, z],
  twistAngle: degrees,
  extrusionProfile: { 
    profile: "linear" | "s-curve", 
    endFactor: 0.5 
  }
})
\`\`\`

### Revolution
\`\`\`javascript
sketch.revolve([axisX, axisY, axisZ], { origin: [x, y, z] })
// Default axis is [0, 0, 1] (Z-axis)
\`\`\`

### Lofting
\`\`\`javascript
sketch1.loftWith([sketch2, sketch3], {
  ruled: true|false,     // straight vs curved surfaces
  startPoint: [x, y, z], // optional point at start
  endPoint: [x, y, z]    // optional point at end
})
\`\`\`

### Sweeping
\`\`\`javascript
pathSketch.sweepSketch((plane, origin) => {
  return profileSketch.sketchOnPlane(plane, origin);
}, { withContact: true })
\`\`\`

### Pre-built 3D Shapes
\`\`\`javascript
makeBaseBox(width, height, depth)
makeCylinder(radius, height, [centerX, centerY, centerZ], [dirX, dirY, dirZ])
makeSphere(radius)
makeSolid([face1, face2, ...]) // from faces array
\`\`\`

## Shape Modifications

### Fillets & Chamfers
\`\`\`javascript
shape
  .fillet(radius)                              // all edges
  .fillet(radius, edgeSelector)                // selected edges
  .chamfer(radius, edgeSelector)               // chamfer edges
  .shell(thickness, faceSelector)              // hollow out
\`\`\`

### Edge/Face Selection
\`\`\`javascript
// Edge selectors
(e) => e.inDirection("X"|"Y"|"Z"|[x,y,z])
(e) => e.inPlane("XY"|"XZ"|"YZ", offset)
(e) => e.ofLength(length)
(e) => e.containsPoint([x, y, z])
(e) => e.inBox([x1,y1,z1], [x2,y2,z2])
(e) => e.ofCurveType("LINE"|"CIRCLE"|"BSPLINE_CURVE")

// Face selectors  
(f) => f.inPlane("XY"|"XZ"|"YZ", offset)
(f) => f.ofSurfaceType("PLANE"|"CYLINDRE"|"SPHERE"|"CONE")
(f) => f.containsPoint([x, y, z])
(f) => f.parallelTo(plane)

// Combinators
(e) => e.either([selector1, selector2])        // OR
(e) => e.not(selector)                         // NOT
(e) => e.inDirection("Z").inPlane("XY", 10)    // AND (chaining)
\`\`\`

## Transformations

\`\`\`javascript
shape
  .translate([x, y, z])
  .translateX(dx) / .translateY(dy) / .translateZ(dz)
  .rotate(degrees, [originX, originY, originZ], [axisX, axisY, axisZ])
  .scale(factor)
  .mirror("XY"|"XZ"|"YZ", [originX, originY])
  .clone()  // create copy
\`\`\`

## Boolean Operations

\`\`\`javascript
shape1.fuse(shape2)      // union
shape1.cut(shape2)       // subtract shape2 from shape1  
shape1.intersect(shape2) // intersection
makeCompound([shape1, shape2]) // group without combining
\`\`\`

## Finders for Advanced Selection

\`\`\`javascript
const { EdgeFinder, FaceFinder } = replicad;

// Find specific elements
const edges = new EdgeFinder()
  .inDirection("Z")
  .inPlane("XY", 10)
  .find(shape);

const face = new FaceFinder()
  .inPlane("XZ", 0)
  .find(shape, { unique: true });

// Use in highlighting
return {
  shape: myShape,
  highlightEdge: (e) => e.inDirection("Z"),
  highlightFace: (f) => f.ofSurfaceType("CYLINDRE")
};
\`\`\`

## Common Patterns & Recipes

### Polar Array
\`\`\`javascript
const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;
  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};
\`\`\`

### Fuse All
\`\`\`javascript
const fuseAll = (shapes) => {
  let result = shapes[0];
  shapes.slice(1).forEach(shape => result = result.fuse(shape));
  return result;
};
\`\`\`

### Complex Profile Example
\`\`\`javascript
// Watering can profile with smooth curves
const profile = draw()
  .hLine(20)
  .line(10, 5)
  .vLine(3)
  .lineTo([8, 100])
  .hLine(-8)
  .close()
  .sketchOnPlane("XZ")
  .revolve();
\`\`\`

## Key Examples

### Basic Box with Holes
\`\`\`javascript
const main = () => {
  const box = makeBaseBox(50, 30, 20);
  const hole = makeCylinder(5, 20).translate([15, 0, 0]);
  return box.cut(hole).fillet(2);
};
\`\`\`

### Lofted Shape
\`\`\`javascript
const main = () => {
  const bottom = drawRoundedRectangle(20, 10).sketchOnPlane();
  const top = drawCircle(8).sketchOnPlane("XY", 15);
  return bottom.loftWith(top);
};
\`\`\`

### Complex Assembly
\`\`\`javascript
const main = () => {
  // Body
  const body = drawCircle(25).sketchOnPlane().extrude(50);
  
  // Handle with swept profile
  const path = draw().hLine(30).sagittaArc(0, 20, 5).done().sketchOnPlane("XZ");
  const profile = drawCircle(3);
  const handle = path.sweepSketch((plane) => profile.sketchOnPlane(plane));
  
  return body
    .fuse(handle.translate([25, 0, 25]))
    .fillet(3, (e) => e.inDirection("Z"))
    .shell(2, (f) => f.inPlane("XY", 50));
};
\`\`\`

## Display Options

\`\`\`javascript
// Single shape
return shape;

// Multiple shapes with properties
return [
  { shape: body, name: "Body", color: "blue", opacity: 0.8 },
  { shape: handle, name: "Handle", color: "red" }
];

// Shape with highlighting
return {
  shape: myShape,
  highlightEdge: (e) => e.inDirection("Z"),
  highlightFace: (f) => f.inPlane("XY", 10)
};
\`\`\`

## Best Practices & Gotchas

### Fillet Issues (OpenCascade limitation)
- Apply fillets as late as possible in modeling process
- Use 2D rounding (customCorner) in sketches when possible  
- If fillet fails, try smaller radius
- Avoid fillets that remove entire faces

### Performance
- Use .clone() when reusing shapes in arrays
- Prefer boolean operations on 2D drawings before 3D extrusion
- Use { optimisation: "commonFace" } for complex fuse operations

### Coordinate Management
- Default coordinate system: X=right, Y=forward, Z=up
- Sketches default to XY plane at origin
- Use .translate() to position after creation rather than complex plane positioning

### Error Handling
- "Kernel Error" usually means geometric impossibility
- Try simplifying operations or adjusting parameters
- Use .clone() to avoid consuming source shapes

## 3D Wires & Advanced Shapes

\`\`\`javascript
// 3D wires for complex sweeps
makeHelix(pitch, height, radius, [centerX, centerY, centerZ])
makeBSplineApproximation(points3D, { tolerance: 0.1 })
makeThreePointArc([p1], [p2], [p3])

// Face creation
makeFace(wire)              // flat face from wire
makeNonPlanarFace(wire)     // curved face
makePolygon([[x1,y1,z1], [x2,y2,z2], ...])  // face from points
\`\`\`

This condensed reference maintains comprehensive API coverage while removing verbose explanations and redundant examples. It preserves all essential methods, common patterns, important concepts, and practical guidance needed for effective Replicad code generation.`; 