export const REPLICAD_DOCS = `# Replicad Documentation

## Core Concepts
Replicad is a JavaScript CAD library for creating 3D models programmatically. The basic workflow is:
1. Create 2D sketches/drawings
2. Add depth (extrude, revolve, loft)
3. Transform and combine shapes
4. Apply modifications (fillets, chamfers)

## File Template
\`\`\`javascript
const { draw, drawCircle, makeBaseBox } = replicad;

const defaultParams = {
  width: 50,
  height: 30,
};

function main(r, { width, height }) {
  // Your code here
  const shape = drawCircle(10).sketchOnPlane().extrude(height);
  return shape;
}
\`\`\`

## 2D Drawing API

### Basic Drawing
\`\`\`javascript
const shape = draw([x, y])  // Start at point, default [0,0]
  .lineTo([x, y])          // Line to absolute coordinates
  .line(dx, dy)            // Line with relative coordinates
  .hLine(dx)               // Horizontal line
  .vLine(dy)               // Vertical line
  .polarLine(distance, angle)  // Line at angle in degrees
  .close()                 // Close the shape
  .done();                 // End without closing
\`\`\`

### Curves and Arcs
\`\`\`javascript
draw()
  .sagittaArc(dx, dy, sagitta)        // Arc with sag distance
  .threePointsArc(dx, dy, dx_via, dy_via)  // Arc through 3 points
  .tangentArc(dx, dy)                 // Tangent to previous line
  .ellipse(dx, dy, rx, ry)            // Elliptical arc
  .smoothSpline(dx, dy, config)       // Smooth spline curve
  .bezierCurveTo([x,y], controlPoints)  // Bezier curve
\`\`\`

### 2D Fillets and Chamfers
\`\`\`javascript
draw()
  .hLine(20)
  .customCorner(5)          // 5mm radius fillet
  .vLine(10)
  .customCorner(3, "chamfer")  // 3mm chamfer
  .close()
\`\`\`

### Pre-built 2D Shapes
\`\`\`javascript
drawCircle(radius)
drawRoundedRectangle(width, height, radius)
drawPolysides(radius, sides, sagitta)
drawText("Hello", { fontSize: 16 })
\`\`\`

### 2D Operations
\`\`\`javascript
const shape1 = drawCircle(10);
const shape2 = drawRectangle(15, 15);
const result = shape1.fuse(shape2);     // Union
const result = shape1.cut(shape2);      // Subtract
const result = shape1.intersect(shape2); // Intersection
const result = shape1.offset(2);        // Offset by 2mm
\`\`\`

## Planes and 3D Sketching

### Standard Planes
\`\`\`javascript
drawing.sketchOnPlane("XY")      // Top view
drawing.sketchOnPlane("XZ")      // Front view  
drawing.sketchOnPlane("YZ")      // Side view
drawing.sketchOnPlane("XY", 10)  // XY plane at Z=10
\`\`\`

### Custom Planes
\`\`\`javascript
const plane = makePlane("XY")
  .translate(0, 0, 10)    // Move plane
  .pivot(30, "Y")         // Rotate 30° around Y axis
  .rotate2DAxes(45);      // Rotate plane's local axes
drawing.sketchOnPlane(plane);
\`\`\`

## Adding Depth (3D Operations)

### Extrusion
\`\`\`javascript
sketch.extrude(height)
sketch.extrude(height, {
  extrusionDirection: [0, 1, 0],  // Custom direction
  twistAngle: 45,                 // Twist during extrusion
  extrusionProfile: { 
    profile: "s-curve", 
    endFactor: 0.5 
  }
})
\`\`\`

### Revolution
\`\`\`javascript
sketch.revolve()                    // 360° around Z-axis
sketch.revolve([1, 0, 0])          // Around X-axis
sketch.revolve([0, 0, 1], { origin: [10, 0, 0] })  // Custom origin
\`\`\`

### Lofting
\`\`\`javascript
const profile1 = drawCircle(5).sketchOnPlane("XY", 0);
const profile2 = drawCircle(3).sketchOnPlane("XY", 10);
const shape = profile1.loftWith(profile2);

// Multiple profiles
const shape = profile1.loftWith([profile2, profile3]);

// With end points
const shape = profile1.loftWith(profile2, { 
  endPoint: [0, 0, 15] 
});
\`\`\`

### Sweeping
\`\`\`javascript
const path = draw().hLine(50).vLine(30).done().sketchOnPlane("XZ");
const shape = path.sweepSketch((plane, origin) => 
  drawCircle(5).sketchOnPlane(plane, origin)
);
\`\`\`

## Pre-built 3D Shapes
\`\`\`javascript
makeBaseBox(width, height, depth)
makeCylinder(radius, height)
makeSphere(radius)
\`\`\`

## Transformations
\`\`\`javascript
shape.translate([dx, dy, dz])
shape.translateX(dx)          // Single axis
shape.rotate(angle, [0,0,0], [0,0,1])  // Angle, origin, axis
shape.scale(factor)
shape.mirror("XZ")            // Mirror across plane
shape.mirror("XZ", [10, 0])   // With offset
\`\`\`

## Boolean Operations
\`\`\`javascript
shape1.fuse(shape2)      // Union
shape1.cut(shape2)       // Subtract shape2 from shape1
shape1.intersect(shape2) // Intersection
\`\`\`

## Finders (Selecting Faces and Edges)

### Face Finders
\`\`\`javascript
// Select faces
shape.shell(thickness, (f) => f.inPlane("XY", 10))
shape.shell(thickness, (f) => f.containsPoint([0, 0, 10]))
shape.shell(thickness, (f) => f.ofSurfaceType("CYLINDRE"))
shape.shell(thickness, (f) => f.parallelTo("XY"))
\`\`\`

### Edge Finders  
\`\`\`javascript
// Select edges
shape.fillet(radius, (e) => e.inDirection("Z"))
shape.fillet(radius, (e) => e.inPlane("XY", 10))
shape.fillet(radius, (e) => e.containsPoint([0, 0, 10]))
shape.fillet(radius, (e) => e.ofLength(20))
shape.fillet(radius, (e) => e.ofCurveType("CIRCLE"))
\`\`\`

### Combining Filters
\`\`\`javascript
// Multiple conditions (AND)
shape.fillet(radius, (e) => e.inDirection("Z").inPlane("XY", 10))

// Either condition (OR)  
shape.fillet(radius, (e) => e.either([
  (e) => e.inPlane("XY", 0),
  (e) => e.inPlane("XY", 10)
]))

// Not condition
shape.fillet(radius, (e) => e.inDirection("Z").not((e) => e.inPlane("XY", 0)))
\`\`\`

## Modifications

### Fillets and Chamfers
\`\`\`javascript
shape.fillet(radius)                    // All edges
shape.fillet(radius, edgeFilter)        // Selected edges
shape.fillet([r1, r2], edgeFilter)      // Variable radius
shape.chamfer(distance)                 // All edges
shape.chamfer(distance, edgeFilter)     // Selected edges
shape.chamfer({
  distances: [d1, d2],
  selectedFace: faceFilter
}, edgeFilter)                          // Asymmetric chamfer
\`\`\`

### Shell (Hollow Out)
\`\`\`javascript
shape.shell(thickness, faceFilter)      // Remove selected faces
shape.shell(-thickness, faceFilter)     // Negative = inward
\`\`\`

## Complete Example: Simple Box with Features
\`\`\`javascript
const { drawRoundedRectangle, drawCircle } = replicad;

function main() {
  // Create base box
  let box = drawRoundedRectangle(50, 30, 5)
    .sketchOnPlane()
    .extrude(20);
  
  // Add holes
  const hole1 = drawCircle(5).sketchOnPlane("XY", 20).extrude(-20);
  const hole2 = drawCircle(3).sketchOnPlane("YZ", 25).extrude(-10);
  
  // Boolean operations
  box = box.cut(hole1.translate(15, 0, 0))
           .cut(hole2.translate(0, 10, 0));
  
  // Add fillets
  box = box.fillet(2, (e) => e.inDirection("Z"))
           .fillet(1, (e) => e.inPlane("XY", 20));
  
  return box;
}
\`\`\`

## Common Patterns

### Polar Array
\`\`\`javascript
const polarCopies = (shape, count, radius) => {
  const copies = [];
  const angle = 360 / count;
  for (let i = 0; i < count; i++) {
    copies.push(shape.clone()
      .translate(0, radius)
      .rotate(i * angle));
  }
  return copies;
};
\`\`\`

### Fuse All Shapes
\`\`\`javascript
const fuseAll = (shapes) => {
  return shapes.reduce((result, shape) => result.fuse(shape));
};
\`\`\`

### Creating Complex Profiles
\`\`\`javascript
// Droplet/lever shape with tangent circles
function createDropShape(r1, r2, distance) {
  const angle = Math.asin((r1 - r2) / distance);
  const p1 = [r1 * Math.sin(angle), r1 * Math.cos(angle)];
  const p2 = [distance + r2 * Math.sin(angle), r2 * Math.cos(angle)];
  
  return draw(p1)
    .lineTo(p2)
    .threePointsArcTo(
      [distance + r2 * Math.sin(angle), -r2 * Math.cos(angle)],
      [distance + r2, 0]
    )
    .lineTo([r1 * Math.sin(angle), -r1 * Math.cos(angle)])
    .threePointsArcTo(p1, [-r1, 0])
    .close();
}
\`\`\`

## Surface Types for Finders
- "PLANE" - Flat surfaces
- "CYLINDRE" - Cylindrical surfaces  
- "CONE" - Conical surfaces
- "SPHERE" - Spherical surfaces
- "TORUS" - Toroidal surfaces

## Curve Types for Edge Finders
- "LINE" - Straight edges
- "CIRCLE" - Circular edges
- "BSPLINE_CURVE" - Spline curves

## Tips and Best Practices

1. **Order of Operations**: Apply fillets last to avoid topology issues
2. **Face Selection**: Use geometric properties rather than indices when possible  
3. **Error Handling**: OpenCascade kernel errors often indicate geometry issues
4. **Performance**: Clone shapes when reusing them in boolean operations
5. **Debugging**: Use return arrays to visualize intermediate shapes: \`return [shape1, shape2]\`

## Export Formats
\`\`\`javascript
// In workbench/visualizer:
// - STL for 3D printing
// - STEP for CAD interchange  
// - JSON for replicad format
\`\`\`
`; 