export const REPLICAD_DOCS = `Skip to main content
Replicad Logo
replicad
Documentation
API
Workbench
GitHub

Introduction
Getting Started
The workbench
Drawing
Planes and Sketches
Adding depth
Transformations
Combinations
Finders
Modifications
Sharing models
Making a watering can
Recipes
Examples
replicad as a library
Other ressources
Replicad API

Getting StartedThe workbench
The workbench
So let's use the workbench!

A first example
Let's draw using a basic replicad script. Do not worry about the details for now.

Open the workbench in a new tab and copy this:

const { drawEllipse } = replicad;
const main = () => {
  return drawEllipse(20, 30).sketchOnPlane().extrude(50).fillet(2);
};


You should see something like that:

Your first 3D model

Congratulations, you have built your first model with replicad!

tip
You can click on the Open in workbench button in most code samples to see (and edit them) within the workbench.

The workbench button
Direct links
You can even open a model directly in the workbench if you click on the Open in workbench button next to the copy button!

Working with local files
If you prefer to use your editor of choice it is also possible.

Create a file (model1.js for instance) somewhere on your disk, and then you can point the workbench to that file using the reload menu (left of the menu bar of the editor).

Unfortunately, in order to have all the file reloading abilities you will need to use Chrome (or Edge). The load from disk button does not appear in Firefox and Safari.

Edit this page
Previous
Introduction
Next
Drawing
A first example
Direct links
Working with local files
Docs
Documentation
API
More
ReplicadManual by raydeleu
GitHub
Copyright © 2025 QuaroTech.

Drawing
tip
You can click on the Open in workbench button in most code samples to see (and edit them) within the workbench.

The workbench button
Let's start in two dimensions only, we will add the third one soon enough. replicad provides some classes and functions to draw in the plane.

Let's start with the powerful draw API.

The draw function and the Drawing API
With the drawing API you can draw straight lines and several types of curves. It currently supports:

straight lines
arcs of circles
arcs of ellipses
bezier curves
And for each of these categories it provides a set of functions that should help you draw stuff quickly - or give you as much power as you need. Have a look at the detailed API documentation to see what it can do

A simple drawing
Let's draw something simple:

const { draw } = replicad;
const main = () => {
  return draw().hLine(25).halfEllipse(0, 40, 5).hLine(-25).close();
};


A simple drawing

What have we done?

We start drawing (at the origin, for instance draw([10, 10]) would start at another point.
We then draw an horizontal line of 25 millimeters of length.
Then, we draw an half ellipse, from the last point of the line, moving, by 0 horizontally and by 40 vertically - but drawing an arc of an ellipse with an axis length of 5.
We then go back of 25 horizontally
We finally close the drawing, going from the current last point to the first point with a straight line.
Let's play with the drawing
To understand what the different parameters do, let's play with them:

close with a mirror instead of a straight line with .closeWithMirror instead of close
replace the second horizontal line by a sagitta line (an arc or circle) .hSagittaArc(-25, 10)
change the origin to another point (with draw([10, 10]) for instance).
Drawing functions
In addition to the draw API, replicad provides some drawing functions to draw common and useful shapes. You can for instance:

draw a rectangle drawRoundedRectangle
draw a polygon drawPolysides
circle drawCircle or ellipse drawEllipse
draw some text in a ttf font drawText
draw based on a parametric function drawParametricFunction, with an example here
They are documented in the API

Practicing with the watering can tutorial
You can have a look at a practical example of using the drawing API with the watering can tutorial

replicad
Drawing
DrawingPen
drawRectangle
draw
drawCircle
drawEllipse
drawFaceOutline
drawParametricFunction
drawPointsInterpolation
drawPolysides
drawProjection
drawRoundedRectangle
drawSingleCircle
drawSingleEllipse
drawText
Import
importSTEP
importSTL
Finders
EdgeFinder
FaceFinder
combineFinderFilters
Solids
makeBox
makeCylinder
makeEllipsoid
makeSolid
makeSphere
Measure
measureArea
measureDistanceBetween
measureLength
measureVolume
Other
_1DShape
_3DShape
AssemblyExporter
BaseSketcher2d
Blueprint
Blueprints
BoundingBox
BoundingBox2d
Compound
CompoundBlueprint
CompoundSketch
CompSolid
CornerFinder
Curve
Curve2D
DistanceQuery
DistanceTool
Drawing
Edge
Face
LinearPhysicalProperties
Plane
ProjectionCamera
Shape
Shell
Sketches
Solid
Surface
SurfacePhysicalProperties
Transformation
Vector
Vertex
VolumePhysicalProperties
Wire
WrappingObj
BSplineApproximationConfig
CurveLike
DrawingInterface
ExtrusionProfile
FaceTriangulation
GenericSweepConfig
LoftConfig
ShapeMesh
SketchInterface
AnyShape
ChamferRadius
Corner
CubeFace
CurveType
FilletRadius
FilterFcn
PlaneName
Point
Point2D
ProjectionPlane
RadiusConfig
ScaleMode
Shape2D
Shape3D
SimplePoint
SplineConfig
SupportedUnit
SurfaceType
DEG2RAD
HASH_CODE_MAX
makeCompound
RAD2DEG
addHolesInFace
asDir
asPnt
assembleWire
axis2d
basicFaceExtrusion
cast
complexExtrude
compoundShapes
createAssembly
createNamedPlane
cut2D
cutBlueprints
downcast
exportSTEP
fuse2D
fuseBlueprints
GCWithObject
GCWithScope
genericSweep
getFont
getOC
intersect2D
intersectBlueprints
isPoint
isProjectionPlane
isShape3D
isWire
iterTopo
loadFont
localGC
loft
lookFromPlane
makeAx1
makeAx2
makeAx3
makeBaseBox
makeBezierCurve
makeBSplineApproximation
makeCircle
makeDirection
makeEllipse
makeEllipseArc
makeFace
makeHelix
makeLine
makeNewFaceWithinFace
makeNonPlanarFace
makeOffset
makePlane
makePlaneFromFace
makePolygon
makeProjectedEdges
makeTangentArc
makeThreePointArc
makeVertex
measureShapeLinearProperties
measureShapeSurfaceProperties
measureShapeVolumeProperties
mirror
organiseBlueprints
polysideInnerRadius
polysidesBlueprint
revolution
rotate
roundedRectangleBlueprint
scale
setOC
shapeType
sketchText
supportExtrude
textBlueprints
translate
twistExtrude
weldShellsAndFaces
Sketching
BlueprintSketcher
FaceSketcher
Sketch
Sketcher
GenericSketcher
sketchCircle
sketchEllipse
sketchFaceOffset
sketchHelix
sketchParametricFunction
sketchPolysides
sketchRectangle
sketchRoundedRectangle

Planes and Sketches
We have so far drawn on the 2D plane. But we want to put these drawings in 3D space. For this we will need to define a plane and sketch the drawing into it.

Sketching
In order to show the planes we will need to sketch on them.

const { drawRoundedRectangle } = replicad;

const main = () => {
  return drawRoundedRectangle(100, 50).sketchOnPlane();
};


By default this sketches on the XY plane.

Planes
Now that we know what sketching is, we can see the way to create planes.

Standard planes
There are a bunch of standard planes defined as a string

const { drawRoundedRectangle, makePlane } = replicad;

const main = () => {
  const rect = drawRoundedRectangle(100, 50);
  return [
    { shape: rect.sketchOnPlane(makePlane("XY")), name: "XY", color: "blue" },
    { shape: rect.sketchOnPlane(makePlane("XZ")), name: "XZ", color: "green" },
    { shape: rect.sketchOnPlane(makePlane("YZ")), name: "YZ", color: "red" },
  ];
};


The standard planes

Planes parallel to the standard one
There are a bunch of standard planes defined as a string

const { drawRoundedRectangle, makePlane } = replicad;

const main = () => {
  const rect = drawRoundedRectangle(100, 50);
  return [
    { shape: rect.sketchOnPlane(makePlane("XY")), name: "At 0", color: "blue" },
    {
      shape: rect.sketchOnPlane(makePlane("XY", 20)),
      name: "At 20",
      color: "green",
    },
    {
      shape: rect.sketchOnPlane(makePlane("XY", -20)),
      name: "At -20",
      color: "red",
    },
  ];
};


Sketching shortcut
As these are common ways to sketch a drawing, we have implemented a shortcut within the sketchOnPlane method.

const { drawRoundedRectangle } = replicad;

const main = () => {
  return drawRoundedRectangle(100, 50).sketchOnPlane("XZ", 10);
};


Opposite standard planes
In addition to the standard planes there are their opposite (YX is the opposite of XY). These are the same planes, but with their axis inverted – which also means top and bottom are inverted.

An example will make it more concrete

const { drawRoundedRectangle, makePlane } = replicad;

const main = () => {
  const rect = drawRoundedRectangle(100, 50);
  return [
    { shape: rect.sketchOnPlane("XY", 20), name: "XY at 20", color: "green" },
    { shape: rect.sketchOnPlane("YX", 20), name: "YX at 20", color: "red" },
  ];
};


Opposite planes

We can see that the rectangle has been rotated to match the axis, but also that the direction of the plane is reversed.

Transforming planes
We might want to use planes more different than translations of the origin along the normal of a plane. Note that the order in which you apply these transformations might change the final result.

Translations
We might want to translate the origin of an arbitrary position. Note that the general direction of the plane is the same. Only the origin point has been changed.

const { drawRoundedRectangle, makePlane } = replicad;

const main = () => {
  const plane = makePlane("XZ").translate(-50, 50, 20);
  return drawRoundedRectangle(100, 50).sketchOnPlane(plane);
};


Pivot
We might want to give an angle to our plane. In order to do this, we can pivot the plane around its origin and an axis (which can be a standard direction X, Y, Z, or a generic direction ([1, 1, 0])

const { drawRoundedRectangle, makePlane } = replicad;

const main = () => {
  const plane = makePlane("XY").pivot(30, "Y");
  return drawRoundedRectangle(100, 50).sketchOnPlane(plane);
};


Axes rotation
There is a last operation that can be done on a plane - it is the rotation of its axes around the origin.

const { drawRoundedRectangle, makePlane } = replicad;

const main = () => {
  const plane = makePlane("XY").rotate2DAxes(30, "Y");
  return drawRoundedRectangle(100, 50).sketchOnPlane(plane);
};


Summary
You can look at the different operations with the same base plane and drawing.

const { drawRoundedRectangle, makePlane } = replicad;

const main = () => {
  const rect = drawRoundedRectangle(100, 50);

  const plane = makePlane("XY", 10);
  return [
    { shape: rect.sketchOnPlane(plane), name: "Base", opacity: 0.5 },
    {
      shape: rect.sketchOnPlane(plane.translateY(-70)),
      name: "Translated",
      opacity: 0.5,
      color: "green",
    },
    {
      shape: rect.sketchOnPlane(plane.pivot(30)),
      name: "Pivoted",
      opacity: 0.5,
      color: "orange",
    },
    {
      shape: rect.sketchOnPlane(plane.rotate2DAxes(30)),
      name: "Rotated",
      opacity: 0.5,
      color: "purple",
    },
  ];
};


Practicing with the watering can tutorial
You can have a look at a practical example of using the drawing API with the watering can tutorial

Adding depth
Once you have a sketch, you want to add some depth to it. replicad offers all the standard methods to do this.

You can find the detailed API documentation here

Extrusion
The sketch extruded

The simplest way to "add depth" is to take the face that we have and add thickness, to extrude it in other words.

const { draw } = replicad;
const main = () => {
  return draw()
    .hLine(25)
    .halfEllipse(0, 40, 5)
    .hLine(-25)
    .close()
    .sketchOnPlane("XZ")
    .extrude(10);
};


This is exactly what we have done, but added a depth of 10mm.

Variations on the extrusion
We can play a bit with the extrusion as well, in addition to the extrusion length we can change:

the direction of the extrusion (by default normal to the sketching plane), .extrude(10, { extrusionDirection: [0, 1, 0.5] })
add a twisting motion to the shape (angle in degrees) .extrude(10, { twistAngle: 10 })
Revolution
The sketch revolved

Let's make this shape rotate on an axis, which is, by default the Z axis

const { draw } = replicad;
const main = () => {
  return draw()
    .hLine(25)
    .halfEllipse(0, 40, 5)
    .hLine(-25)
    .close()
    .sketchOnPlane("XZ")
    .revolve();
};


Loft
A loft between two sketches

With a loft we make a smooth transition between two sketches (simple ones, different from the one we had before).

const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const rect = drawRoundedRectangle(5, 10).sketchOnPlane();
  const circle = drawCircle(3).sketchOnPlane("XY", 10);
  return rect.loftWith(circle);
};


Variations on the loft
You can also play a bit with the loft.

By adding a point at the end (or the start) of the loft:
const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const rect = drawRoundedRectangle(5, 10).sketchOnPlane();
  const circle = drawCircle(3).sketchOnPlane("XY", 10);

  return rect.loftWith(circle, { endPoint: [2, 2, 15] });
};


By having multiple lofted sketches
const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const rect = drawRoundedRectangle(5, 10).sketchOnPlane();
  const circle = drawCircle(3).sketchOnPlane("XY", 10);
  const rect2 = drawRoundedRectangle(5, 10, 1).sketchOnPlane("XY", 20);

  return rect.loftWith([circle, rect2]);
};


Practicing with the watering can tutorial
You can have a look at a practical example of using the drawing API with the watering can tutorial

Transformations
Now that we have a 3D shape it is time to move it around. Note that usually you will transform a shape in order to align it with another shape, for instance, or to have different versions of a same basic shape.

For this part of the tutorial we will create a weird, non symmetrical shape:

const { draw } = replicad;
const main = () => {
  const shape = draw()
    .movePointerTo([50, 50])
    .hLine(-120)
    .vSagittaArc(-80, -20)
    .sagittaArc(100, 20, 60)
    .close()
    .sketchOnPlane()
    .extrude(100, { extrusionProfile: { profile: "linear", endFactor: 0.5 } });

  return shape;
};


A weird shape to transform

Let's move stuff around
This is fairly straightforward. We have a shape, we translate it on the axes (or on a vector)

return shape.translateZ(20);

You can see the 2cm between the base of the shape and the grid

Let's rotate this thing
return shape.rotate(45, [0, 0, 0], [1, 0, 0]);

The shape is rotated 45 degrees around an axis going through the origin and in the X direction. Try to move these points around to see what is going on.

Finally mirroring
return shape.mirror("XZ");

The mirror image of the shape!

Combinations
It is now time to introduce a way to combine shapes together, the main operations of constructive geometry, also known as the boolean operations.

We will play with two shapes, a box and a cylinder.

Pasting shapes together
This is what we call the fuse operation:

const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const cylinder = drawCircle(20).sketchOnPlane().extrude(50);
  const box = drawRoundedRectangle(60, 90).sketchOnPlane().extrude(25);

  return box.fuse(cylinder);
};


the box and cylinder fused

Cutting one shape with another
This is what we call the cut operation:

const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const cylinder = drawCircle(20).sketchOnPlane().extrude(50);
  const box = drawRoundedRectangle(60, 90).sketchOnPlane().extrude(25);

  return box.cut(cylinder);
};


the cylinder cut into the box

Intersecting two shapes
For the intersection we will intersect the cylinder with itself. This creates a fun shape:

const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const cylinder = drawCircle(20).sketchOnPlane().extrude(50);
  const sideCylinder = cylinder.clone().rotate(90, [0, 0, 20], [1, 0, 0]);

  return sideCylinder.intersect(cylinder);
};


the cylinder intersecting itself

Finders
When using a visual interface to draw in 3D, selecting a face or an edge is trivial - the user just needs to click it.

In the case of code CAD, this is a more complicated operation - we need to find these as features. This is what finders are for.

For this tutorial we will use this relatively complex shape (a simple house):

const { draw, drawCircle, drawRoundedRectangle } = replicad;
const main = () => {
  let house = draw()
    .hLine(50)
    .vLine(60)
    .line(-50, 20)
    .closeWithMirror()
    .sketchOnPlane("XZ")
    .extrude(30);

  const window = drawCircle(10)
    .sketchOnPlane("XZ")
    .extrude(30)
    .translate([10, 0, 50]);

  const door = drawRoundedRectangle(20, 30)
    .sketchOnPlane("XZ")
    .extrude(30)
    .translate([-20, -5, 15]);

  house = house.cut(window).fuse(door);
  return house;
};


We will use a feature of the viewer, where you can highlight programatically some faces (or edges).

the house

Basic finders usage
Finding faces
In order to find faces, we create a face finder object. Let's say we want to find the face of the door

const main = () => {
  let house = draw();
  //...

  return {
    shape: house,
    highlightFace: (f) => f.inPlane("XZ", 35),
  };
};

This was fairly easy, the door is the face parallel to the plane XZ, at the coordinate 35.

There are many different types of filters like inPlane that allow you to specify precisely which face you are interested in. For instance you can look for faces that:

have a certain type of surface f.ofSurfaceType("CYLINDRE") will return the inside of the window.
contain a certain point f.containsPoint([0, -15, 80]) will return both sides of the roof
and other methods you can find in the API documentation

Finding edges
To find edges, it works in the same way, you just work with an EdgeFinder instead of a face finder and use the methods that are documented here.

For instance, to find the top of the roof

  let house = draw()
  //...

  const findRooftop = new EdgeFinder()

  return {
    shape: house,
    highlightEdge: e => e.containsPoint([0, -15, 80])
  };
};

Combinating filters
By default you can chain different filter conditions. Only the shapes that follow all the conditions will be found. For instance, to find the window of the back of the house:

  let house = draw()
  //...

  return {
    shape: house,
    highlightEdge: e => e.ofCurveType("CIRCLE").inPlane("XZ")
  };
};

If you only use one of the filters you will see more edges highlighted.

Combinating with an either condition
In some cases you might want to combine elements with an OR condition, to find faces that fit either one condition or the other. For instance if we want to find both side faces:

(f) => f.either([(f) => f.inPlane("YZ", 50), (f) => f.inPlane("YZ", -50)]);

Negating a condition
You might also want to specify the inverse of a condition, that is what not is for. For instance, we can select the front window by just adding a not to the finder we created earlier

const frontWindow = (e) => e.ofCurveType("CIRCLE").not((f) => f.inPlane("XZ"));

Note that it works because there are only two edges that are circles in the house.

Finding faces and edges
We have created finders so far and used them to highlight faces and edges

but what are they really useful for.
This will be mostly clear in the next chapter with modifications that can make a lot of use of finders.

You can also find a specific face. For instance, we might want to have only the front face of the house. For this you will need to use the FaceFinder and EdgeFinder objects directly (instead of within a function that already declared it).

const { draw, drawCircle, drawRoundedRectangle, FaceFinder } = replicad;
const main = () => {
  let house = draw()
    .hLine(50)
    .vLine(60)
    .line(-50, 20)
    .closeWithMirror()
    .sketchOnPlane("XZ")
    .extrude(30);

  const window = drawCircle(10)
    .sketchOnPlane("XZ")
    .extrude(30)
    .translate([10, 0, 50]);

  const door = drawRoundedRectangle(20, 30)
    .sketchOnPlane("XZ")
    .extrude(30)
    .translate([-20, -5, 15]);

  house = house.cut(window).fuse(door);

  return new FaceFinder().inPlane("XZ", 30).find(house);
};

Modifications
In addition to the shape transformations and shape combinations, it is also possible to apply some advanced modifications to shapes. These modifications use finders to filter out which face or edges they need.

Fillet and chamfer
Adding fillet (rounded edges) and chamfers (beveled edges) is a very common operation when modelling in 3D. These operations are mainly configured by their radius.

const { drawRoundedRectangle } = replicad;
const main = () => {
  return drawRoundedRectangle(30, 50).sketchOnPlane().extrude(20).fillet(2);
};


When configuring a fillet with a number, all the edges of the shape will be filleted.

If you want to target specific edges you will need to configure a finder within a filter configuration. For instance to fillet only the top edges:

const { drawRoundedRectangle } = replicad;
const main = () => {
  return drawRoundedRectangle(30, 50)
    .sketchOnPlane()
    .extrude(20)
    .fillet(2, (e) => e.inPlane("XY", 20));
};


Multiple radii
What if you want to apply different radii for different edges? You can use a function that will combine filter configurations.

In this case we want to have a bigger fillet on the sides of the box and a small one at the top. You might have been able to do this with two different fillet operations, but in some cases the kernel has more difficulties finding a good solution with multiple operations.

const { drawRoundedRectangle, EdgeFinder, combineFinderFilters } = replicad;
const main = () => {
  const [filters] = combineFinderFilters([
    {
      filter: new EdgeFinder().inPlane("XY", 20),
      radius: 2,
    },
    {
      filter: new EdgeFinder().inDirection("Z"),
      radius: 9,
    },
  ]);

  return drawRoundedRectangle(30, 50)
    .sketchOnPlane()
    .extrude(20)
    .fillet(filters);
};


Asymmetric chamfer
By default chamfer operations will use a radius, the same distance on both sides of a edge. If you want to use a different distance on each side and create an asymmetric chamfer, you can use a custom radius:

const { makeBaseBox, EdgeFinder } = replicad;

export default function main() {
  let base = makeBaseBox(30, 50, 10);
  return base.chamfer(
    {
      distances: [5, 2],
      selectedFace: (f) => f.inPlane("YZ", 15),
    },
    (e) => e.inPlane("XY", 10)
  );
}


The selected face corresponds to the face on which the first distance will be applied.

Fillet with radius evolution
You can also have a fillet vary along the edge. This is done by using an array of two numbers. The first number is the radius at the start of the edge, and the second number is the radius at the end of the edge.

const { makeBaseBox } = replicad;

export default function main() {
  let base = makeBaseBox(30, 50, 10);
  return base.fillet([4, 1], (e) => e.inPlane("YZ", 15).inDirection("Y"));
}


Shell
With a shell you can hollow out a full shape (keeping a wall of a certain thickness). You need to specify a face that will be hollow, and you configure a finder for this.

const { drawRoundedRectangle } = replicad;
const main = () => {
  return drawRoundedRectangle(30, 50)
    .sketchOnPlane()
    .extrude(20)
    .shell(5, (f) => f.inPlane("XY", 20));
};

Introduction
Do you like to follow steps to learn? This tutorial is for you - it allows you to build this plunge watering can by using the replicad APIs.


Note that this model is inspired by Robert Bronwasser's watering can. The original implementation comes from our community.

If you want to follow along you can click on the workbench icon (next to copy!) in the code examples!

Drawing the body profile
tip
You can click on the Open in workbench button in most code samples to see (and edit them) within the workbench.

The workbench button
So let's start by the body of our can. We will take the general approach of drawing a profile that will then be revolved.

Let's start with our basic shape:

const { draw } = replicad;

const main = () => {
  return draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();
};


We drew a simple shape following the profile using only straight lines. We generally went for relative positioning. For instance with hLine(20) which draws an horizontal line of 20mm of length). An line(10, 5) which draws a line by going 10 horizontally and 5 vertically. But we also used lineTo([8, 100]) which moves us to the point [8, 100] - this is using absolute coordinates.

Filleting angles
The bottom of the can is rounded. We could use different methods for that. First, we will use round the corners of the previous shape (using filleting)

const { draw } = replicad;

const main = () => {
  return draw()
    .hLine(20)
    .customCorner(2)
    .line(10, 5)
    .customCorner(3)
    .vLine(3)
    .customCorner(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();
};


Arcs of circles
We can also draw arcs of a circle directly.

const { draw } = replicad;

const main = () => {
  return draw().hLine(20).tangentArc(10, 10).lineTo([8, 100]).hLine(-8).close();
};


This is not the best use of these here, but I wanted to show you for the example.

Bézier curves
Better would be to use Bézier curves with the smoothSpline method.

const { draw } = replicad;

const main = () => {
  return draw([0, 100])
    .hLine(8)
    .lineTo([30, 8])
    .smoothSpline(-10, -8, { endTangent: [-1, 0], startFactor: 2 })
    .lineTo([0, 0])
    .close();
};


We reoriented the drawing to start from the top (and to not have to compute the direction of the end tangent ourselves). By varying the startFactor we can reach a shape that we like.

Comparing the different cases
Here a just a comparison of the different profiles we achieved.

const { draw } = replicad;

const main = () => {
  // just lines
  const s1 = draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  // Using bezier curves
  const s2 = draw([0, 100])
    .hLine(8)
    .lineTo([30, 8])
    .smoothSpline(-10, -8, { endTangent: [-1, 0], startFactor: 2 })
    .lineTo([0, 0])
    .close();

  // Straight lines and fillets
  const s3 = draw()
    .hLine(20)
    .customCorner(10)
    .line(10, 5)
    .customCorner(3)
    .vLine(3)
    .customCorner(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  // Arcs
  const s4 = draw()
    .hLine(20)
    .tangentArc(10, 10)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  return [
    { shape: s1, color: "blue", name: "Straight lines" },
    { shape: s4, color: "orange", name: "Arcs" },
    { shape: s2, color: "green", name: "Bézier" },
    { shape: s3, color: "red", name: "Rounded corners" },
  ];
};


Using planes for the filler
tip
You can click on the Open in workbench button in most code samples to see (and edit them) within the workbench.

The workbench button
In order to build the filler we will need to place three circles (that will be lofted later on).

We will approach this by drawing on three different planes. The first one is simple, it corresponds to the plane parallel to the XY plane, but at a certain distance from the origin.

const { drawCircle, makePlane } = replicad;
const main = () => {
  const middlePlane = makePlane("XY", 100);
  return drawCircle(8).sketchOnPlane(middlePlane);
};


Note that sketching on a plane parallel to a standard one (XY, XZ or YZ is a common operation and you can use the shortcut

const { drawCircle } = replicad;
const main = () => {
  return drawCircle(8).sketchOnPlane("XY", 100);
};


Plane translations
What we have done here could also be done with a plane translation.

const { drawCircle, makePlane } = replicad;
const main = () => {
  const middlePlane = makePlane("XY").translateZ(100);
  return drawCircle(8).sketchOnPlane(middlePlane);
};


A translation changes the origin point of a plane (not its orientation).

Plane pivots
What if you want a plane that is not parallel to one of the standard ones? You can pivot it on it's origin following a direction.

const { drawCircle, makePlane } = replicad;
const main = () => {
  const topPlane = makePlane().pivot(-20, "Y");
  return drawCircle(12).sketchOnPlane(topPlane);
};


The circle is drawn with an angle of 20 degrees along the Y axis.

Putting it all together to build the filler
With the filler we want 3 circles, some of them pivoted. We put it all together like this:

const { drawCircle, makePlane } = replicad;

const main = () => {
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);

  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);

  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);

  return [
    { shape: topCircle, name: "Top Circle" },
    { shape: middleCircle, name: "Middle Circle" },
    { shape: bottomCircle, name: "Bottom Circle" },
  ];
};


We will want to use all these circles with a "loft" operation later on.

Edit this page


Creating the 3D shapes
tip
You can click on the Open in workbench button in most code samples to see (and edit them) within the workbench.

The workbench button
We now have the basic drawing to create our 3D shapes:

the can body for which we have a profile drawing
the filler for which we have three well positioned circles
the spout which is a simple cylinder
The spout cylinder
Creation of a cylinder
We have two different approaches we could take to create a cylinder:

draw a circle and extrude it
creating the cylinder with a direct function
Extrusion
To create a cylinder we can draw a circle, sketch it in 3D space, and then a extrude it.

const { drawCircle } = replicad;
const main = () => {
  return drawCircle(5).sketchOnPlane().extrude(70);
};


We have seen the first step in the previous page. We draw a circle and sketch it in the 3D space on a plane (here the default XY plane).

We extrude it, making a copy of itself in a certain direction and filling the sides.

using a direct creation method
const { makeCylinder } = replicad;
const main = () => {
  return makeCylinder(5, 70);
};


Positioning the shape
In the case of a circle that we extrude, we could place the plane to sketch on and then position it.

We have seen how to position a plane in 3D space, but we might want to position a 3D shape.

The operations are similar for a shape as for a plane. First, translations are identical.

const { makeCylinder } = replicad;
const main = () => {
  return makeCylinder(5, 70).translateZ(100);
};


Rotations are similar to pivots for planes - but as shapes do not have an origin point by default, we need to specify it.

const { makeCylinder } = replicad;
const main = () => {
  return makeCylinder(5, 70).translateZ(100).rotate(45, [0, 0, 100], [0, 1, 0]);
};


In order to make things more readable, we might want to rotate before we translate (with a different origin).

The can body
To create the can body we will use the profile we drew, sketch it on the XZ plane and rotate it around the Z axis:

const { draw } = replicad;

const main = () => {
  const profile = draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  return profile.sketchOnPlane("XZ").revolve([0, 0, 1]);
};


The filler
After extrusion and revolution, the filler uses a third method of 3D shape creation: lofting. We can create shapes by defining sections through which an object will pass trough.

We have defined our three circles and now we create a shape that passes through them all.

const { makePlane, drawCircle } = replicad;

const main = () => {
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);

  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);

  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);

  return topCircle.loftWith([middleCircle, bottomCircle], { ruled: false });
};


Putting it all together
Let's show all the pieces we have built so far together

const { makePlane, makeCylinder, draw, drawCircle } = replicad;

const main = () => {
  // Building the body
  const profile = draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  const body = profile.sketchOnPlane("XZ").revolve([0, 0, 1]);

  // Building the spout
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);

  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);

  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);

  const filler = topCircle.loftWith([middleCircle, bottomCircle], {
    ruled: false,
  });

  const spout = makeCylinder(5, 70)
    .translateZ(100)
    .rotate(45, [0, 0, 100], [0, 1, 0]);

  return [
    { shape: body, color: "blue", opacity: 0.5 },
    { shape: filler, color: "red", opacity: 0.5 },
    { shape: spout, color: "green" },
  ];
};

Combining the shapes
tip
You can click on the Open in workbench button in most code samples to see (and edit them) within the workbench.

The workbench button
Now that we have our three bodies we want to put them together (and smooth the corners it creates).

Fusing shapes together is easy:

const { makePlane, makeCylinder, draw, drawCircle } = replicad;

const main = () => {
  // Building the body
  const profile = draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  const body = profile.sketchOnPlane("XZ").revolve([0, 0, 1]);

  // Building the spout
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);

  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);

  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);

  const filler = topCircle.loftWith([middleCircle, bottomCircle], {
    ruled: false,
  });

  return body.fuse(filler);
};


The relevant line is just body.fuse(filler).

Selection and filleting
We want to smooth the transition between the two bodies we just merged, we will use a fillet. But for this we need to select the edges that will need to be smoothed.

const { makePlane, makeCylinder, draw, drawCircle } = replicad;

const main = () => {
  // Building the body
  const profile = draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  const body = profile.sketchOnPlane("XZ").revolve([0, 0, 1]);

  // Building the spout
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);

  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);

  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);

  const filler = topCircle.loftWith([middleCircle, bottomCircle], {
    ruled: false,
  });

  const fused = body.fuse(filler);

  return {
    shape: fused,
    highlightEdge: (e) => e.inPlane("XY", 100),
  };
};


Once we have found the edges we are concerned about using the finder API, we can fillet them like this:

const { makePlane, makeCylinder, draw, drawCircle } = replicad;

const main = () => {
  // Building the body
  const profile = draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  const body = profile.sketchOnPlane("XZ").revolve([0, 0, 1]);

  // Building the spout
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);

  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);

  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);

  const filler = topCircle.loftWith([middleCircle, bottomCircle], {
    ruled: false,
  });

  const fused = body.fuse(filler).fillet(30, (e) => e.inPlane("XY", 100));

  return {
    shape: fused,
  };
};


And then repeat the operation for the spout:

const { makePlane, makeCylinder, draw, drawCircle } = replicad;

const main = () => {
  // Building the body
  const profile = draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  const body = profile.sketchOnPlane("XZ").revolve([0, 0, 1]);

  // Building the spout
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);

  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);

  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);

  const filler = topCircle.loftWith([middleCircle, bottomCircle], {
    ruled: false,
  });

  const spout = makeCylinder(5, 70)
    .translateZ(100)
    .rotate(45, [0, 0, 100], [0, 1, 0]);

  return body
    .fuse(filler)
    .fillet(30, (e) => e.inPlane("XY", 100))
    .fuse(spout)
    .fillet(10, (e) => e.inBox([20, 20, 100], [-20, -20, 120]));
};


Creating an hollow shape
For now, we still have a full shape. We need to make it hollow - to be able to put water in it. Remember we are building a watering can.

This is similar to how we fillet, but instead of selecting edges we select the faces that will be hollowed out, and give the thickness of the walls.

We need to do a little bit of maths to find the coordinates of the end of the spout.

const { makePlane, makeCylinder, draw, drawCircle } = replicad;

const main = () => {
  // Building the body
  const profile = draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  const body = profile.sketchOnPlane("XZ").revolve([0, 0, 1]);

  // Building the filler
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);

  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);

  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);

  const filler = topCircle.loftWith([middleCircle, bottomCircle], {
    ruled: false,
  });

  // Building the spout
  const spout = makeCylinder(5, 70)
    .translateZ(100)
    .rotate(45, [0, 0, 100], [0, 1, 0]);

  let wateringCan = body
    .fuse(filler)
    .fillet(30, (e) => e.inPlane("XY", 100))
    .fuse(spout)
    .fillet(10, (e) => e.inBox([20, 20, 100], [-20, -20, 120]));

  const spoutOpening = [
    Math.cos((45 * Math.PI) / 180) * 70,
    0,
    100 + Math.sin((45 * Math.PI) / 180) * 70,
  ];

  wateringCan = wateringCan.shell(-1, (face) =>
    face.either([
      (f) => f.containsPoint(spoutOpening),
      (f) => f.inPlane(topPlane),
    ])
  );

  return {
    shape: wateringCan,
    name: "Watering Can",
  };
};


We are done!
The previous shape was the final one we were looking for! You can play with it, change some parameters and so on to create your own version!

Why recipes?
There are some operations using replicad (or any CAD tool) that are at the same time very common - but have many different configurations and edge cases.

In tools with a UI, this translates to very complex configuration boxes with multiple options that do not work well together most of the time.

In a code CAD tool like replicad, this would translate to a function with a very complex signature.

In some cases - the basic logic behind this functionality is fairly simple – but the different tweaks possible add the complexity.

Instead of offering these as a standard library with a complex interface, I propose a recipe book of code that can be easily copied and tweaked to your particular needs.

Polar array
Sometimes you want to copy a shape with a circular pattern. This is fairly easy to do with a little bit of javascript.

const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;

  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

For the optimal use, take into account that we assume

that your original shape is centered at the origin
that you want to rotate around the origin
that you want to go all around the circle
Let's show an example

const { drawCircle } = replicad;

const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;

  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

function main() {
  return polarCopies(drawCircle(5), 5, 12);
}


Note that this code works for both 2D and 3D cases. In the case of 3D, it will do the copies in the XY plane.

const { drawCircle } = replicad;

const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;

  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

function main() {
  return polarCopies(drawCircle(5).sketchOnPlane().extrude(2), 5, 12);
}

Swept profile box
Let's say you want to start designing with a box. Simple extrusion is good if you do not have a complex profile. A way to work with a more complex shape is to draw the profile in 2D, and then sweep it along a base sketch.

const { makeSolid, makeFace, assembleWire, EdgeFinder, genericSweep, Plane } =
  replicad;

function profileBox(inputProfile, base) {
  const start = inputProfile.blueprint.firstPoint;
  const profile = inputProfile.translate(-start[0], -start[1]);

  const end = profile.blueprint.lastPoint;

  const baseSketch = base.sketchOnPlane();

  // We create the side of the box
  const side = baseSketch.clone().sweepSketch(
    (plane) => {
      return profile.sketchOnPlane(plane);
    },
    {
      withContact: true,
    }
  );

  // We put all the pieces together
  return makeSolid([
    side,
    // The face generated by sweeping the end of the profile
    makeFace(assembleWire(new EdgeFinder().inPlane("XY", end[1]).find(side))),
    // The face generated by the base
    baseSketch.face(),
  ]);
}

This code assumes some things about its input:

the input profile is a single open line
the base is a single closed line
there is only one profile point at the coordinate of the end of the profile
The box will have its base in the XY plane.

Let's build an example

const { makeSolid, makeFace, assembleWire, EdgeFinder, genericSweep, Plane } =
  replicad;

function profileBox(inputProfile, base) {
  const start = inputProfile.blueprint.firstPoint;
  const profile = inputProfile.translate(-start[0], -start[1]);

  const end = profile.blueprint.lastPoint;

  const baseSketch = base.sketchOnPlane();

  // We create the side of the box
  const side = baseSketch.clone().sweepSketch(
    (plane) => {
      return profile.sketchOnPlane(plane);
    },
    {
      withContact: true,
    }
  );

  // We put all the pieces together
  return makeSolid([
    side,
    // The face generated by sweeping the end of the profile
    makeFace(assembleWire(new EdgeFinder().inPlane("XY", end[1]).find(side))),
    // The face generated by the base
    baseSketch.face(),
  ]);
}

const { draw, drawRoundedRectangle } = replicad;

function main() {
  const base = drawRoundedRectangle(30, 20, 5);

  const profile = draw()
    .line(5, 5)
    .line(2, 3)
    .hLine(-2)
    .vLine(-1)
    .bulgeArcTo([0, 1], 0.2)
    .done();

  return profileBox(profile, base);
}

Fuse All
You might find yourself in a situation where you have an array of shapes (2D or 3D) and you just want to fuse (or intersect) them all together. The following snippet just does this

const fuseAll = (shapes) => {
  let result = shapes[0];
  shapes.slice(1).forEach((shape) => {
    result = result.fuse(shape);
  });
  return result;
};

Let's show an example (also using polar copies).

const { drawCircle } = replicad;

const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;

  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

const fuseAll = (shapes) => {
  let result = shapes[0];
  shapes.slice(1).forEach((shape) => {
    result = result.fuse(shape);
  });
  return result;
};

function main() {
  return fuseAll(polarCopies(drawCircle(5), 5, 7));
}

replicad as a library
At its core, replicad is just a library. You can then create your own viewer, editor, configurator on top of it.

In order to show what can be done in the most simple way, you can find a sample app here: https://sample-app.replicad.xyz.

Display of the model
With replicad you can easily export an STL (or STEP) file to be opened in another application. Nevertheless displaying a model in your page tends to be nicer.

For this you will need to use a 3D library. For instance, replicad has helpers to integrate with threejs.

opencascade.js and webassembly
Most of the complexity in using replicad as a library is that it depends on a webassembly module, opencascadejs, and the tooling around WASM is not always easy to use.

Additionally, you should load the webassembly code from opencascadejs (or the replicad custom build) in a webworker. The model computation can take some time and the parallelism of a worker will allow you to offer a reactive interface during the computation.

Injecting opencascadejs
The important bit you need to do to have replicad work is that you need to inject an instance of opencascadejs at initialisation.

You can have a look at the initialisation in the sample app:

let loaded = false;
const init = async () => {
  if (loaded) return Promise.resolve(true);

  const OC = await opencascade({
    locateFile: () => opencascadeWasm,
  });

  loaded = true;
  setOC(OC);

  return true;
};
const started = init();

In addition to the opencascadejs boilerplate, we use the setOC function. This will inject the instance of the opencascade library into replicad.

Once this is done, replicad will work.

## 1.1 Purpose

This document contains a beginner's guide for users of the Replicad (https://replicad.xyz/) libary and tools. Its purpose is mainly to demonstrate how models can be build using the tools, the so-called "studio", that are offered alongside the library. If you want to use this document to generate a separate manual, use one of the tools available to generate a simple document out of a github wiki repository. 

At the Replicad website some documentation is offered as well as links to the detailed documentation of the API (Application Progamming Interface) of the library (see https://replicad.xyz/docs/api/). Nevertheless it can be quite daunting to collect all information for people that are just interested in modelling and are less experienced in reading computer code or building applications. 

Using the Replicad tools it is possible to build complicated mechanical parts and even free form geometry. Two examples are shown below. Throughout the guide some examples will be given how the commands discussed in each chapter can be applied to real modelling examples. The folder 
[models](https://github.com/raydeleu/ReplicadManual/tree/main/models) on the website https://github.com/raydeleu/ReplicadManual/ contains some examples on how the functions of Replicad can be applied to create models. 

![Shapes created with Replicad, both technical and freeform is possible](https://github.com/raydeleu/ReplicadManual/blob/main/images/fork-plunge.png)

For additional help you can visit https://github.com/sgenoud/replicad and in particular the discussions area. There are sections labelled "Q&A" and "modelling help" where you can post your question. The programmer of Replicad is active in responding questions from users and you can also expect some help from fellow users. 

To understand how the library can be included in new applications please consult the replicad website at https://replicad.xyz/. A very nice example how the library can be used can be visited at https://blingmything.sgenoud.com/. The code to this application is also available on github at https://github.com/sgenoud/blingmything. 

## 1.2 What is Replicad? 

Replicad is a software library that allows the user to enter a kind of script to create a 3D model. This model can then be exported in several formats,  allowing the user to create nice images (renders) or to send the shape to a 3D printer.

The approach to model a 3D shape with code (or script) has become popular through the availability of a software package called OpenSCAD (Open Scripted-Computer-Aided-Design). OpenSCAD has been used initially to model simple shapes for 3D modelling. It uses a technique called Constructive Solid Geometry (CSG), which indicates that 3D shapes are created by combining simple geometric shapes such as boxes, spheres, cylinders into more complex shapes. The operations used to combine these shapes are called boolean operations.


![Simple car model created in OpenSCAD](https://github.com/raydeleu/ReplicadManual/blob/main/images/openscad-car.jpg)

This shape is created by entering the following script:

.Code to create a car in OpenSCAD, using two boxes and 6 cylinders (4 wheels and two axles)

\`\`\` javascript
cube([60,20,10],center=true);
translate([5,0,10 - 0.001])
    cube([30,20,10],center=true);
translate([-20,-15,0])
    rotate([90,0,0])
    cylinder(h=3,r=8,center=true);
translate([-20,15,0])
    rotate([90,0,0])
    cylinder(h=3,r=8,center=true);
translate([20,-15,0])
    rotate([90,0,0])
    cylinder(h=3,r=8,center=true);
translate([20,15,0])
    rotate([90,0,0])
    cylinder(h=3,r=8,center=true);
translate([-20,0,0])
    rotate([90,0,0])
    cylinder(h=30,r=2,center=true);
translate([20,0,0])
    rotate([90,0,0])
    cylinder(h=30,r=2,center=true);
\`\`\`

Replicad takes this approach a step further. It still retains the approach that shapes are created with a simple script, but it uses a more advanced 3D kernel that allows BRep (Boundary Representation) modelling. In this type of 3D kernel a solid is represented as a collection of surface elements - described using a mathematical equation - that define the boundary between interior and exterior points.

The advantage of a BRep kernel is that in addition to the simple boolean operations it is possible to define how the surfaces are linked to each other. This allows a more easy creation of angled edges (chamfers) or rounded edges (fillets). 

![Example of Replicad shape with fillets](https://github.com/raydeleu/ReplicadManual/blob/main/images/replicad_fillets.png)

## 1.3 Tools to work with Replicad

A model in Replicad is built using a javascript input file (see section 1.4 File Template). The best way for a beginner is to use the studio tools which come in two flavours namely the workbench and a visualizer. 

### 1.3.1 Workbench
The workbench, available at https://studio.replicad.xyz/workbench , is a complete design environment that includes a code editor with a pane to visualize the result of the input file. The result can be exported to STL and STEP formats to allow further processing, for example 3D printing. The code in the editor can be downloaded as a javascript file. Use the icon with a circle and arrow going down that can be found directly on top of the editor window. Of course you can also select the code in the editor and paste it into any other editor. 

![User interface of the Replicad workbench](https://github.com/raydeleu/ReplicadManual/blob/main/images/workbench.png)

Note that the Workbench starts to interpret the code as soon as you type it in the editor window. In most cases this will result in an error message and the 3D window will show an animated cloud or "amoebe". The error found by Replicad is shown in a pane that appears directly below the editor. In some cases this is a straightforward error, for example if a function was mistyped or you forgot a closing bracket. In other cases the pane reports a "Kernel Error" followed by a number. Just continue completing the code until you see the progress indicator turning again. If the "Kernel Error" persists, try to remove instructions, for example by adding \`//\` at the beginning of this line to indicate that this is only a comment, until you get either an understandable error message or a shape again.   

An interesting feature of the workbench that is offered at the link shown above is that you can create a link to your model that includes the code. In that way you can share your model through an internet link that opens the workbench with your code in it. Others can then take your code and make modifications for their own purpose. Use the icon above the editor window that resembles a rectangle with an arrow going up. 

### 1.3.2 Visualizer
For people that prefer to edit the input files on their own computer using their preferred code editor, a visualizer is offered at https://studio.replicad.xyz/visualiser that can be used to show the results of processing an input file. Just like the workbench the visualizer supports the export of the shapes. 

![User interface of the Visualizer](https://github.com/raydeleu/ReplicadManual/blob/main/images/interface_black.png)

If the input file contains an error, the error message is shown in a pop-up window in the 3D view. 

<p align=center>
<img src= "https://github.com/raydeleu/ReplicadManual/blob/main/images/visualizer-error.png" alt="Display of an error in the visualizer" width = "500">
</p>

## 1.4 File template

The template to create and display a 3D part in Replicad looks like this.  

\`\`\` javascript
const r = replicad

const defaultParams = {                // setting the value of the parameters
  height:       100,
  baseWidth:     20,
  ...}

// next lines allow intellisense help in VS Code 
/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */

function main( 
 { Sketcher, sketchRectangle, ... },   // functions used within the main program
 { height, basewidth, ....        } )  // parameters to adjust the model
{
    // add code to describe the shape
return  shape   |  
return  {shape: [shape], highlight: [foundFeature]}
}
\`\`\`

Note that the line 

\`\`\` javascript
const r = replicad
\`\`\`
can be used to circumvent the need to list all functions that are used in the code. Prepending each function with \`r.\` directly points the compiler to the complete Replicad source code. So for example, instead of listing the function \`sketchRectangle\` at the beginning of the declaration of \`main\` you can use \`r.sketchRectangle\`. Yet another approach is to list all the functions but add this add the beginning of your code using the notation: 

\`\`\` javascript
const { draw, ... other functions ... } = replicad;

function main() 
{
    // code to describe the shape
return shape 
} 
\`\`\` 

Using this notation there is no need to remember which of the arguments in the brackets of \`function main({functions},{designparams})\` contains what. You can simply use \`main()\`. 

Alternatively to the file listing shown above, you can use the arrow notation for the javascript function. This notation can be combined with the notations shown above to shortcut the definition of functions from the Replicad library. 

\`\`\` javascript
const defaultParams = {                // setting the value of the parameters
  height:       100,
  baseWidth:     20,
  ...}

const main = (
  { Sketcher, sketchRectangle, ... },   // functions used within the main program
  { height, basewidth, ....        }    // parameters to adjust the model
) => {
    // add code to describe the shape
return  shape   |  
return  {shape: [shape], highlight: [foundFeature]}
}
\`\`\`

If you want to display multiple shapes, the returned variable should be an array of all shapes. In this array it is possible to define 

* the variable name of the shape, 
* the name of the shape as a "string", 
* the color of the shape in the Visualiser, using the X11 "color name", see https://en.wikipedia.org/wiki/X11_color_names#Color_name_chart


Example colors are black, 
grey,
dimgrey,
slategrey,
lightslategrey,
steelblue,
lightsteelblue,
red,
green,
blue,
violet,
silver, 
skyblue,
magenta,
mediumpurple. 

* the opacity, where opacity 1 is the default (visible) and 0 is fully transparant. 

An example of an array is: 

\`\`\` javascript
let shapeArray = [
{shape: plunge, name: "plunge", color:"steelblue", opacity: 0.5}, 
{shape: body, color: "orange",opacity:0.5},
{shape: filler, color: "red"}]
\`\`\`

## 2.1 How to create 3D parts? 

The purpose of using Replicad is creating a 3D representation of a solid part for visualisation or 3D printing. 
The process to create a 3D solid part in Replicad looks like this: 

![image](https://github.com/raydeleu/ReplicadManual/assets/38007983/38e3b5af-3c1f-4768-8627-afa2bbaf7084)

To understand this process, it might help to explain some terminology first. The following image shows some basic concepts that apply to almost all 3D modelling programs: 

![image](https://github.com/raydeleu/ReplicadManual/assets/38007983/6fe1449d-3261-4e0e-b1a2-e32ffdff474b)

The 3D space is defined by so-called coordinates. The coordinates are measured along three cartesian axes (see [Wikipedia Cartesian Axes](https://en.wikipedia.org/wiki/Cartesian_coordinate_system). You might think of them als length, width and height, but in 3D programs they are mostly called the X,Y and Z-axis where the Z-axis is pointing up. Using the coordinates you can define "points" in space. When these spaces are connected by a line, these lines are called "edges". When the edges completely enclose a flat area, this can be defined as a "face". In some programs such a face is referred to as a "polygon". Extruding an open edge is performed by shifting a copy of the edges. A real life comparison is creating a soap film when lifting the edges from a soap bath. The resulting 3D shape is a "shell", as it only contains walls that are infinitesimally  thin. When the edge is closed, you can consider the shape as a volume that is completely enclosed in faces. When you assume that the enclosed volume is completely filled with material, you have a "solid". 

When you now use this terminology of "points", "edges", "faces", "shells" and "solids" the process of creating 3D shapes can be explained using the following steps. Each of these steps will be explained in more detail in the next chapters of this manual. Note that as a beginner you might start at Step 3 to have quick results, although all chapters are filled with examples to get you going quickly. 

**Step 1: Create a 2 dimensional sketch** 

The normal flow to define a solid part is to start with a 2-dimensional sketch of the part. You often start with a sketch that contains most information of the 3D shape. So in case of a car, you would probably start with the side view as this tells you more about the shape than the front view. How to create a sketch in Replicad will be explained in [Chapter 3](3.-Sketch.md). [Chapter 4](4.-Create-3D-wires-and-faces.md) discusses a special type of edge, namely a socalled "wire" that can be thought of as an edge that is not necessarily in a flat plane. An example is a helix, a wire in the shape of a rotating staircase or screw. "Wires" can be used as a guide rails to sweep a face to create special 3D shapes. 

**Step 2: Create a solid shape**

By using a method like extruding, lofting, revolving or sweeping, the 2D sketch is translated into a 3-dimensional solid. The methods to add thickness to the 2D sketch are explained in [Chapter 5](5.-Create-solid-shapes.md). 

**Step 3: Use simple predefined drawings or solids**

A beginner can start with pre-baked shapes, i.e. standard shapes, to shorten the path to determine a shape. There are 2 dimensional pre-baked shapes like rectangles, rounded rectangles, circles, ellipes, and 3 dimensional shapes like boxes, spheres or cylinders. The functions to create standard 2D and 3D shapes are detailed in  respectively [Chapter 3](3.-Sketch.md) and [Chapter 5](5.-Create-solid-shapes.md). 

**Step 4: Modify the solid shape**

The 3 dimensional shape can then be modified, for example by rounding or chamfering the sharp edges. In its simplest form this modification is applied to all edges at once. A more advanced approach is to select individual edges or faces to apply the modification. The modification-methods and functions to select edges are discussed in [Chapter 6](6.-Modify-solids.md). 

**Step 5: Move or transform the solid shapes**

After their creation, solid shapes can be moved and rotated. Other transformations are scaling the part or creating a mirrored version. The transformation methods are described in [Chapter 7](7.-Transform-shapes.md). 

**Step 6: Combine parts**

Different parts can be combined to create new shapes. Combining parts can mean fusing parts together, subtracting the volume of one part from the other part, intersect parts or combine parts in a group or compound. It is like building a larger part from a set of building blocks. The methods to combine the building blocks are explained in [Chapter 8](8.-Combine-solids-to-parts.md). 

Building a complex part can also mean that the result of a particular step is fed into another step. For example, once you have combined some building blocks into a larger shape, you can go back and modify this new shape by applying fillet or chamfers. It is even possible to extract a face from the complex object and use this again as a starting point to build a new component. Therefore the process should be regarded more as a process to learn 3D modelling. Once you are comfortable with the available methods and functions, you will follow the process more or less automatically and also understand that sometimes a different order of steps is more practical.

## 2.2 Comparing the Replicad approach with other tools 

### 2.2.1 Comparing Replicad to CAD tools

For users that have used a CAD (computer aided design) program earlier, the terminology will sound very familiar. Tools like 

* Siemens SolidEdge (https://solidedge.siemens.com/en/solutions/users/hobbyists-and-makers/), 
* Dassault Solidworks (https://www.solidworks.com/), 
* OnShape (https://onshape.com)
* Autodesk Fusion 360 (https://www.autodesk.com/products/fusion-360/personal)
* FreeCad (https://www.freecad.org/) 

use a very similar approach, although they do not use code to determine the shape but visual interaction. The illustration below shows the interface of OnShape. At the left of this interface there is a list of parameters and so-called features. In fact this contains the same information as is represented in the code of Replicad. Starting from the top there are parameters that determine the dimensions of the shape, then a sketch of the sideview, an extrusion, adding fillets (rounding of edges) and then some actions to combine shapes.  

![User interface of OnShape with a sketch highlighted in the modelling history](https://github.com/raydeleu/ReplicadManual/blob/main/images/onshape_sketch.png)

### 2.2.2 Other code based tools
Users coming from OpenSCAD (https://www.openscad.org) will immediately recognize the coding approach but might be tempted to start with the prebaked 3D shapes first, as this makes modelling in OpenSCAD so fast. Go to [5.3 Pre-baked shapes](5.-Create-solid-shapes#53-pre-baked-shapes.md) to see examples how these can be used to quickly model a part by transforming (see [Chapter 7](7.-Transform-shapes.md) and combining the parts (see [Chapter 8](8.-Combine-solids-to-parts.md)). 

There is no right or wrong way to go about creating the 3 dimensional shape. Compare it to creating a 3 dimensional structure by adding material like a brick layer or painter versus removing material like a sculptor. Use the chapters to quickly find your way through the documentation to suit the approach that you prefer.

> **WARNING**
> The user should be aware that Replicad is built upon the OpenCascade 3D modelling kernel which is available as open source and may be used without paying any license fee. However, this kernel has quite some limitations compared to kernels that are developed by large companies. 

> **Topological naming problem**
> One of the most referenced shortcomings of OpenCascade is referred to as the "Topological Naming Problem" (or TNP). Whenever a model is modified so that the number of faces or edges change, the internal names of faces and edges are changed by the kernel. If your model relies on referencing the edges or faces by their old name, rebuilding the model will fail. Currently the developers of OpenCascade try to correct this issue by using a more complex identification method for faces and edges, but as this affects the complete kernel this change may take a long time. 

> **Rounding/fillets**
> Another shortcoming is related to filleting. This will be discussed in [Chapter 6](6.-Modify-solids.md). 

## 3.1 Create a new sketch or drawing 

To start a sketch, use the \`new Sketcher\` command. Note the keyword \`new\` that is required to create a new object of the type \`Sketcher\`.  

\`\`\` javascript
let sketch = new Sketcher("XZ",-5)
".sketchCommands"        (see below)
.close()                    // ends the sketch with line to starting point
.done()                     // ends the sketch without closing
.closeWithMirror()          // closes the sketch with mirror on axis from start to end
\`\`\`

The definition of a sketch refers to a plane in 3D space where the sketch is drawn. Most often this will be either the "XY" plane (top view), the "XZ" plane (front view) or the "XY" plane (side view). It is also possible to define an offset to these planes, as was done in the code sample above.  

An alternative and often preferred method to create a sketch is to use the function \`draw()\` to create a drawing. 
A drawing can be understood as an adapted version of a sketch. A sketch starts with identifying the sketching plane first and then defining a wire. As the plane is defined up front, the sketch is in fact a 3D shape from its origin. In contrast a drawing is considered a pure 2D shape that can be placed on a plane after its creation. Compared to a sketch a drawing has the following advantages: 

* drawings can be translated, rotated (in 2D space) and scaled;
* drawings can be used in 2D boolean operations;
* drawings can be exported directly in 2D formats;
* drawings can be placed on other shapes, not only planes

The drawing can be defined with the \`draw()\` function. As this function already includes the creation of a new object the \`new\` keyword is not needed. The starting point of the drawing can be defined by adding a 2D point as a parameter to the \`draw()\`, for example \`draw([5,5])\`.   

\`\`\` javascript
const shape1 = draw()
    .lineTo([20,0])
    .line(0,5)
    .hLine(10)
    .vLine(5)
    .polarLineTo([22,45])
    .polarLine(10,150)
    .halfEllipse(-10, -15, 5)
    .smoothSpline(2, -5)
    .close() 
\`\`\`    

After its creating, a drawing has to be placed on a plane, using the method \`.sketchOnPlane\`. Through this method, a drawing can also be translated and rotated in 3D space. You can achieve this by translating and pivoting the plane on which the drawing is placed. For example, using the following code: 

\`\`\` javascript
  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);
\`\`\`

first a Plane is defined, which is first pivoted by 20 degrees along the Y-axis and then translated up 80 mm on the Z-axis. Note that you can not translate or rotate the sketch after it is placed on a plane. The full set of commands to create and position planes is : 

| method                           | description                                        |
| ---------------------------------|----------------------------------------------------|
| \`.sketchOnPlane(plane,offset)\`   | place the drawing on a given plane                 | 
| \`makePlane()           \`         | create a basic plane, default is on the XY plane   |
| \`.pivot(degrees, axis) \`         | rotate the plane x degrees around the given axis   |
| \`.translate   \`                  | translate the plane                                 |
| \`.translateZ  \`                  | translate the plane along the Z-axis                |
| \`.translateY  \`                  | translate the plane along the Y-axis                |
| \`.translateX  \`                  | translate the plane along the X-axis                |


A standard plane is identified "XY", "XZ", "YZ", but using the function \`makePlane()\` you can also define a new plane with its own name. 

There are a number of ".methods" to define a sketch that can be used either on a \`new Sketcher()\` object or on a \`draw()\` object. These will be explained in the following paragraphs. 


## 3.2 Create straight lines

![](https://github.com/raydeleu/ReplicadManual/blob/main/images/lines.png)

Straight lines can be sketched using the line functions. Be aware that points are generally defined as a tuple or array, i.e. enclosed in square brackets. This array either contains the absolute distance in the x and y direction from the origin, or the distance and angle in case of polar coordinates. Relative distances to the x- and y-axis are defined as two separate values dx and dy. 

| method                           | description                                        |
| ---------------------------------|----------------------------------------------------|
| \`.movePointerTo([x,y]) \`         | move pointer without drawing, can only be used at start
| \`.lineTo([x,y])        \`         | line to absolute coordinates
| \`.line(dx,dy)          \`         | line to relative coordinates
| \`.vLineTo(y)           \`         | vertical line to absolute y
| \`.vLine(dy)            \`        | vertical line to relative y
| \`.hLineTo(x)           \`         | horizontal line to absolute x
| \`.hLine(dx)            \`         | horizontal line to relative x
| \`.polarLineTo([radius,theta])\`   | line to absolute polar coordinates. Note that the absolute polar coordinates are defined as an vector [radius,theta]
| \`.polarLine(distance,angle)\`     | line to relative polar coordinates
| \`.tangentLine(distance)\`         | tangent extension over distance


## 3.3 Create arcs and ellipses

![](https://github.com/raydeleu/ReplicadManual/blob/main/images/arcs.png)

The following commands are available to create circular and elliptical arcs in your sketch. Just as with lines be aware that points are generally defined as a tuple or array, i.e. enclosed in square brackets. Relative distances to the x- and y-axis are defined as two separate values dx and dy. 
The elliptic curves can be defined in more detail with three extra parameters. If the values are omitted the default values are used. 

| method                                     | description                                        |
| -------------------------------------------|----------------------------------------------------|
| \`.threePointsArcTo(point_end,point_mid)   \`| arc from current to end via mid, absolute coordinates|
| \`.threePointsArc(dx,dy,dx_via,dy_via)     \`| arc from current to end via mid, relative coordinate|
| \`.sagittaArcTo(point_end,sagitta)         \`| arc from current to end with sag , absolute coordinates|
| \`.sagittaArc(dx,dy,sagitta)               \`| arc from current to end with sag, relative coordinates|
| \`.vSagittaArc(dy,sagitta)                 \`| vertical line to endpoint with sag, relative y|
| \`.hSagittaArc(dx,sagitta)                 \`| horizontal line to endpoint with sag, relative x|
| \`.tangentArcTo([x,y])                     \`| arc tangent to current line to end, absolute coordinates|
| \`.tangentArc(dx,dy)                       \`| arc tangent to current line to end, relative coordinates|
| \`.ellipseTo([x,y],r_hor,r_vert)           \`| ellipse from current to end, absolute coordinates, radii to hor and vert|
| \`.ellipse(dx,dy,r_hor,r_vert)             \`| ellipse from current to end, relative coordinates, radii to hor and vert|
| \`.ellipse(dx,dy,r_h,r_v,deg rotation, long_way?, counter?\` | extra parameters ellipse, rotation around axis defined as [x,y,z] array| 
| \`.halfEllipseTo([x,y],r_min, long_way?)\`    | half ellipse with r_min as sag, absolute coordinates|    
| \`.halfEllipse(dx,dy,r_min, long_way?)            \`    | half ellipse with r_min as sag, relative coordinates|

These functions create only partial arcs as the starting point and the end point cannot be identical. To create a circle you therefore need to define two arcs. The following code shows how to draft a circle. Note that the same can be achieved with the function \`sketchCircle\` or \`drawCircle\` (see next sections). 

\`\`\` javascript
const {draw, Sketcher} = replicad

function main()
{
    let circle = new Sketcher("XY")
    .halfEllipseTo([0,20],10)
    // first half of circle, only one radius needed, 
    // long axis is defined by coordinates
    .ellipseTo([0,0],10,10)
    // second half, if r_min and r_max are equal this defines a circle
    .close()
    .extrude(5)

    return circle}
\`\`\`
### .threePointsArc

The method \`threePointsArc\` creates a circular arc through three points. It always tries to create the shortest arc possible from the current point to the end point through the second point. The arc is circular, i.e. has a constant radius, but the centerpoint of the arc is determined by the location of the three points. In most drawings, finding the third point of a curve that results in an arc that is tangent to other elements is not easy. In those cases one of the other methods might be more practical. 

![](https://github.com/raydeleu/ReplicadManual/blob/main/images/threePointsArc.png)

### .sagittaArc

The sagitta (Latin for arrow) arc is an arc defined by drawing an arc from the starting point to the end point. The "sag" of sagitta defines the distance between the arc and the straight line between the starting and end point (the socalled "chord"). Think of it as taking a flexible band between the start and end point and then flexing this band to either the right or the left side over a distance equal to the "sag". The little icon on the top of this section illustrates the "sag" of this curve. When moving in a clockwise direction, the bulge or sag of the arc is to the left of the straight line between the two outer points of the arc when the value is positive. If you want the bulge to be on the other side, you have to define a negative value for this parameter. 

![](https://github.com/raydeleu/ReplicadManual/blob/main/images/sagittaArc.png)

### .ellipse

There are several methods to create a part of an ellipse between two points. Most of the arguments to this method are straightforward, such as the definition of the endpoint (either as a point [x,y] or as a distance dx,dy) and the definition of the horizontal and vertical radius of the ellipse. Setting these two equal results in a circular arc. The rotation parameter defines the angle in degrees over which the long axis of the ellipse is rotated. The x-direction has angle 0, the y direction is +90 degrees. The following two parameters are booleans, so can be either \`true\` or \`false\`. The first of these parameters, in the API reference identified as "sweep" can be understood as taking the short way or the long way. When you fit a complete ellipse between two points, you can choose which way you traverse along the ellipse. In most cases the short way is the preferred solution, thus setting this parameter to \`false\` is the default. The last parameter defines whether the curve is drawn clockwise (\`false\`, default value) or counter-clockwise (\`true\`). 

The image below shows 4 options to draw an ellipse from the starting point (indicated with the green circle) to the end point (indicated with the red circle). 

![](https://github.com/raydeleu/ReplicadManual/blob/main/images/ellipse.png)


**Remark 1**: in the definition of SVG (scalable vector graphics) the two parameters as discussed above are also available. Here the 'sweep' parameter defines whether the starting angle of the curve is positive or negative (similar to being clockwise or counter-clockwise) and the 'long-arc' parameter defines whether the long or short path should be followed. Often setting the values by trial and error is the quickest solution. 

### .tangentArc

A tangent arc is tangent to the segment that directly precedes the arc. It will not be tangent to the line following the arc. The image below shows some examples of tangent arc. Note that in one of the cases the curve is drawn clockwise. Using the right-hand rule, the face is pointing away from the viewer. You can think of it like when you turn a screw to the right, it moves away from you. 

![](https://github.com/raydeleu/ReplicadManual/blob/main/images/tangentArc.png)

If you want to create a fillet or rounding that is tangent to two segments, use the method \`.customCorner(radius)\` that is explained in the next section. 


## 3.4 Fillets and chamfers in 2D  
Creating a rounded edge or fillet in sharp corners of your sketch can be achieved by calculating the parameters for the arc methods described in the previous paragraphs but can also be achieved with a specialized method called \`customCorner(radius)\`. This method uses the radius of the rounding as an argument and is applied to the corner defined by the last coordinate of the previous drawing command. The method should therefore be placed between the two methods used to define the corner. The following code snippet shows an example how to create a rounded shape. Note that in this case, using a rounding radius that is exactly half the height of the shape fails. If you want to achieve a semi-circle at each end you have to use the arc methods described in the previous section. 

As the method has to be placed in between two methods that describe a sharp corner, the method can not be used as the last statement before closing or ending the sketch. In the example below this is solved to shift the startpoint for the definition of the rectangle from the first corner in the bottom left to somewhere along the first line (drawing counterclockwise). Another point worth noting is that when rounding sharp edges, as is done in the example below, the result might be different from what you expect. 


<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/fillet2D.png" title="Adding 2D fillets to a sketch" width="400">

\`\`\` javascript
const { draw } = replicad;

const main = () => {
  // just lines
  const s1 = 
  draw([20,0])
    .hLine(30)
    .customCorner(5.45)
    .vLine(11)
    .customCorner(5.45)
    .hLine(-50)
    .customCorner(3)
    .line(5,-11)
    .customCorner(5)
    .close();

return [ { shape: s1, color: "blue", name: "Straight lines" }]} 
\`\`\`

The method \`.customCorner(radius)\` also supports creating chamfers. To achieve this you have to add a second argument to the method: \`customCorner(radius, "chamfer")\`. The default value of this argument is \`"fillet"\`, so it does not have to be added explicitly. The dimension of the chamfer describes the length of the straight line perpendicular to the lines that define the corner. In case of sharp corner it is difficult to predict where this corner will land and what will be the overall dimension of the resulting shape. 


<img alt="Adding 2D chamfers to a sketch" src="https://github.com/raydeleu/ReplicadManual/blob/main/images/chamfer2d.png" width="400">

\`\`\` javascript
const { draw } = replicad;

const main = () => {
  // just lines
  const s1 = 
  draw([20,0])
    .hLine(30)
    .customCorner(5, "chamfer")
    .vLine(11)
    .customCorner(5.45)
    .hLine(-50)
    .customCorner(3,"chamfer")
    .line(5,-11)
    .customCorner(5, "chamfer")
    .close();

return [
    { shape: s1, color: "blue", name: "Straight lines" }
]
} 

\`\`\`



## 3.5 Free form curves

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/curves.png" width="650">

Free form curves can be created with the methods listed below. 

| method                                                 | description                                        |
| -------------------------------------------------------|----------------------------------------------------|
| \`.bezierCurveTo([x,y],points[])\`                       | Bezier curve to end along points[]|
| \`.quadraticBezierCurveTo([x,y],[x_ctrl,y_ctrl])\`       | Quadratic bezier curve to end with control point|
| \`.cubicBezierCurveTo([x,y],p_ctrl_start,p_ctrl_end)\`   | Cubic bezier curve with begin and end control points| 
| \`.smoothSplineTo([x,y],splineconfig)\`                  | smooth spline to end, absolute coordinates |
| \`.smoothSpline(dx,dy,splineconfig)  \`                  | smooth spline to end, absolute coordinates |
| \`{startTangent:angle,endTangent:angle / "symmetric"}\`  | \`splineconfig\` = configuration of spline points| 
| \`drawPointsInterpolation(array[[pt1],[pt2]..[ptn]])\`   | create a drawing of a curve that is an interpolation of all points in the array| 

A Bezier curve is a type of curve that is defined by a set of control points. It was developed by French engineer Pierre Bezier for use in the design of Renault cars in the 1960s. The important feature of a Bezier curve is that the control points influence the shape of the curve, but the curve does not necessarily pass through these points. In case of a quadratic Bezier curve there is only one control point between the startpoint and endpoint of the curve which defines the direction of the curve at both ends. Using a cubic Bezier curve it is possible to adjust the slope of the curve at both ends. The control points may be considered as a kind of magnet, pulling the curve towards it. The further the control points are placed, the stronger the curve will deviate from a straight line between the begin and endpoints. The \`.bezierCurveTo\` method allows a large array of control points to define the shape of the curve, but adjusting these endpoints is difficult without being able to judge the effect of these points. 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/bezier_curves.png" alt="Illustration of different Bezier curves" width="700">

The \`.smoothSpline\` method defines a curve that passes through each point. The shape of the curve can be adjusted using the spline configuration. An example of the application of this function is shown in <<smoothspline>>. The startTangent and endTangent define the angle of the curve at its starting and end point. The factor defines how far the curve is drawn into the direction of the tangent. The larger the factor, the longer the curve wants to proceed in the direction of the specified tangent. 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/smoothsplinehook.png" alt="Example of the application of the smoothSpline method" width="800">  

It is not always necessary to use the configuration at the begin and end point of a smoothSpline. In the example in <<mouse>> the \`.smoothSpline\` method is used between two arcs. The \`smoothSpline\` adapts to the tangent of the previous line segment. Without any previous line segment it uses a tangent of 0 degrees, i.e. in the x-direction (assuming a drawing area aligned with x,y coordinates). The smoothSpline does not adjust the endTangent to the next segment, so without any specification the endTangent is 0 degrees, along the x-axis. In <<mouse>> this yields the intended result without any additional configuration. 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/mouse.png" alt="Using the smoothSpline between two arcs without config"> 

The code below illustrates how a \`smoothSpline\` curve is either tangent to the x-axis or follows the tangent of the previous line segment. It also demonstrates that with a factor of 2.63 the resulting curve is very close to a perfect arc.  

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/smoothSpline.png" width="800" alt="Comparison of smoothSpline curves"> 

The function \`drawPointsInterpolation(array of points)\` is a drawing function that draws a curve through all points listed in the array of 2D points. The code sample below shows an example how this function can be used to create the shape of an airfoil by creating an array that lists 2D points along the contour of the airfoil. Note that the curve starts and ends at the sharp trailing edge of the airfoil. The last point of the array has to be identical to the first point to create a closed curve for extrapolation. Closing the curve in another way is difficult as this drawing is created with a function, not a method that can be followed by any of the other drawing methods listed above.   

\`\`\` javascript
let chord = 100 
let span  = 100
let airfoilPointsLarge = airfoilPoints.map(function([x,y]){return [x*chord,y*chord]}) 
let airfoil = drawPointsInterpolation(airfoilPointsLarge).sketchOnPlane("XZ");
let wing = airfoil.extrude(span)
\`\`\`

## 3.6 Pre-baked sketches and drawings
The methods described in the previous chapter contain the building blocks that can be used to create any sketch or drawing. To simplify the creation of standard shapes like rectangles, circles and ellipses, some standard functions are available in Replicad. The function encapsulates the process to create a sketch or drawing, so only using the function with the required parameters is sufficient to create a sketch. Note that the \`draw()\` functions still have to be placed on a plane before they can be used to create 3D shapes. The sketch is always produced on the "XY" plane, centered at [0,0,0] unless this is changed using the optional configuration defined for the function (see table)

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/baked-sketch.png" width="650"> 

| method                                                     | description                                                |
| -----------------------------------------------------------|------------------------------------------------------------|
| \`sketchRectangle(length,width) \`                           | create a sketch of a rectangle with length and width       |
| \`sketchRoundedRectangle(length,width,fillet, {config?}) \`  |create a sketch of a rounded rectangle                   |
| \`sketchCircle(radius,{config?})\`                           | create a sketch of a circle                                |
| \`sketchEllipse(xRadius,yRadius,{config?})\`                 | create a sketch of an ellipse
| \`sketchPolysides(radius,numSides,sagitta?,{config?})\`      | create a sketch of a regular polygon, where the sides of the polygon are lines or arcs with a sag from the straight line. The radius is defined without the sagitta.  
| \`sketchText(string,{textConfig?},{planeConfig}\`            | create a sketch of a text. The textConfig defines the fontFamily, fontSize, startX,startY 
| \`{config?}\` = configuration of pre-baked sketch            | \`{plane:"XZ",origin:dist/[point]})\`                        | 
| \`sketchFaceOffset(shape,thickness)           \`             | create a sketch by defining an offset from an existing face in the scene
| \`sketchParametricFunction(function,{planeconfig},namedParameters?,approximation?\`| create a sketch of a parametric function

Similarly as for the sketches, some pre-baked drawings are available to speed-up the creation of standard shapes. As the draw() object also allows boolean operations the creation of more complex shapes can be achieved by combining a number of standard shapes. 

| method                           | description                                        |
| ---------------------------------|----------------------------------------------------|
| \`drawRoundedRectangle(length, width, radius) \`| Draw a rounded rectangle centered at [0,0] 
| \`drawSingleCircle(radius)                 \`| Creates the \`Drawing\` of a circle as one single curve. The circle is centered on [0, 0]
| \`drawCircle(radius)                       \`| Draw a circle with a given radius, centered at [0,0]
| \`drawSingleEllipse(majRadius,minRadius)   \`| Creates the \`Drawing\` of an ellipse as one single curve. The ellipse is centered on [0, 0], with axes aligned with the coordinates.
| \`drawPolysides(radius, sidesCount,sagitta = 0) \`| Creates the \`Drawing\` of an polygon in a defined plane. The sides of the polygon can be arcs of circle with a defined sagitta. The radius defines the out radius of the polygon without sagitta. 
| \`drawText("text",{ startX: 0, startY: 0, fontSize: 16, fontFamily: "default" }\`| Draw a 2D text. The options can be used to adjust location, fontsize and font. 
| \`drawParametricFunction(function, {options}) \`| Draw a parametric function with variable t. With the option it is possible to adjust the number of intermediate points that are used { pointsCount : 400, start : 0, stop : 1 } and the type of approximation of the curve. 
| \`drawPointsInterpolation(points2D[],{approximationConfig:})\`  | Draw a bSpline through the array of points 


## 3.7 Methods for drawings

In the introduction to the chapter on sketches and drawings it was explained that drawings support some additional methods compared to sketches. These methods are listed in the following table. 

| method                           | description                                        |
| ---------------------------------|----------------------------------------------------|
| \`.clone()\`                                 | create a copy of the shape 
| \`.offset(r)\`                               | create a 2D offset with radius r, shape is rounded with radius, negative inwards
| \`.mirror([center/dir],[origin],mode? )\`    | mode? "center" or "plane"  
| \`.translate(xDist,yDist)\`                  | translate the shape 
| \`.rotate(angle,[center])\`                  | rotate the shape
| \`.stretch(ratio,direction,origin)\`         | scale the shape in a single direction
| \`.cut(cuttingDrawing)\`                     | create a 2D boolean where the drawing listed as an argument to this method is subtracted from the drawing that this method is acting on.     
| \`.intersect(drawing)  \`                    | create a 2D intersection between two drawings   
| \`.fuse(other)         \`                    | create a 2D boolean where the drawing listed as an argument is fused to the drawing that this method is acting on
| \`.sketchOnFace(face,scaleMode)\`            | The scale mode is "original" for global coordinates, "bounds" for following UV of the receiving face or "native" for the default UV parameters of opencascade 
| \`.sketchOnPlane\`                           | place the drawing on a plane 
| \`.toSVG(margin)\`                          | format the drawing as an SVG image
| \`.toSVGPaths()\`                            | format the drawing as a list of SVG paths
| \`.toSVGViewBox\`                            | return the SVG viewbox that corresponds to this drawing

The boolean operations \`cut\`, \`fuse\` and \`intersect\` provide options to shortcut the creation of complicated drawings without the need for complex geometric calculations. 
Using boolean functions and the pre-baked drawings of a circle and rectangle, creating a shape like an axle with a keyway is very simple. Notice in de code below that a drawing needs to be placed on a plane before any other method can be applied to it. 

\`\`\` javascript
const { draw, drawCircle, drawRectangle} = replicad;

const main = () => {
let axleRadius = 11
let keySlotHeight = 6
let keySlotWidth  = 2.50  

let axleHole = drawCircle(axleRadius)
let axleHole2 = drawCircle(axleRadius).translate(3*axleRadius,0)
let keySlot  = drawRectangle(2*keySlotWidth,keySlotHeight)
.translate(-axleRadius,0)
let keySlot2  = drawRectangle(2*keySlotWidth,keySlotHeight)
.translate(-axleRadius,0).translate(3*axleRadius,0)
let axleShape = axleHole.cut(keySlot).sketchOnPlane("XZ")
let axleShape2 = axleHole2.fuse(keySlot2).sketchOnPlane("XZ",20)
let axle = axleShape.extrude(25)
let axle2 = axleShape2.extrude(25)

  return [axle,axle2];
};
\`\`\`

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/keyway.png" alt="Creating an axle with a keyway using 2D boolean functions on drawings"> 

The \`.intersect()\` method can be used to create shapes based on the intersection of two other shapes. An example is creating a curved slot (see image below). By intersecting a ring with a sector, only a segment of the ring remains. The rounded ends of the curved slot are then added by fusing circles at each end. 

<img alt="Creating a curved slot using an intersection and union of drawings" src="https://github.com/raydeleu/ReplicadManual/blob/main/images/sector_intersection.png" width="800">

The following code snippet shows the use of the 2D offset function. Offset only works on a closed curve. The curve is offset with radius r, positive values create an offset outward of the curve, negative values inward. When offsetting outward, the curve is automatically rounded with the radius r. In the code example a rounded rectangle is created by drawing a very thin rectangle, then applying an offset of 5 mm, resulting in a shape with a height of 10 mm and corners rounded with a radius of 5 mm. Then an additional shape is created with an offset of 2 mm. Finally the original shape is subtracted from the offset shape to create a thin walled shape.  

\`\`\` javascript
const {draw} = replicad

function main()
{
// frontview of receiver is just a rectangle with height 0.1 mm
let frontView = draw()
.movePointerTo([-20,7])
.hLine(40)
.vLine(0.1)
.hLine(-40)
.close()

let contourBody = frontView.offset(5) // shape is offset with r=5
let contourHolder = contourBody.offset(2) // holder is offset with r=2
// not that drawings have to placed on plane before extruding
let gpsFront = contourBody.sketchOnPlane("YZ")
let holderFront = contourHolder.sketchOnPlane("YZ")
let gpsReceiver = gpsFront.extrude(70)
let gpsHolder = holderFront.extrude(72).cut(gpsReceiver)

return [gpsReceiver,gpsHolder]
}
\`\`\` 

<img alt="Creating a thin walled shape with an offset" src="https://github.com/raydeleu/ReplicadManual/blob/main/images/offset2D.png" 
 width="500">


Have a look at https://studycadcam.blogspot.com/ for training exercise for your 2D drawing skills. 

## 4.1 Create wires in 3D 
In comparison to sketches which create wires or faces in 2D, the following functions create a wire in 3D. These wires can be used for example to create a 3-dimensional path for a sweep operation. This operation might be needed to create a tube that is bend in a 3-dimensional shape, such as the frame of a chair. 

| method                                                               | description                  |
|----------------------------------------------------------------------|------------------------------|
| \`makeLine([point],[point]) \`                                         | Create a straight 3D line    |
| \`makeCircle(radius,[center],[normal])\`                               | Create a 3D circle wire      |
| \`makeEllipse(major,minor,[center],[normal])\`                         | Create a 3D ellipse          |
| \`makeHelix(pitch,height,radius,[center],[dir],lefthand?)\`            | Create a 3D helix, center and helix a [x,y,z]|
| \`makeThreePointArc([point1],[point2],[point3])\`                      | Create 3D arc through 3 points |
| \`makeEllipseArc(major,minor,anglestart,angleEnd,[center],[normal],[xDir?])\`| Create 3D ellipsoid arc  |
| \`makeBSplineApproximation([points[],{bezierSplineApproximationConfig})\`| Create a 3D spline approximation through array of points |
| \`{tolerance:1e-3,smoothing:null/[x,y,z],degMax:6,degMin:1}\`          | bezierSplineApproximationConfig, configuration for spline | 
| \`makeBezierCurve([points[]])\`                                        | Create a 3D bezier curve through array of 3D points|
| \`makeTangentArc([startPoint],[tangentPoint],[endPoint])\`             | Create a 3D tangent arc, tangentPoint is like vector |   
| \`assembleWire([Edges])\`   \`                                          | Create a continuous edge from separate wires | 


## 4.2 Create faces in 3D

You can not only create wires in 3D but also complete faces. The difference between a wire and a face is that a face consists of a sketch or 3D wire that encloses a surface. This surface can be flat but also bend in space. 

| method                                | description                  |
|---------------------------------------|------------------------------|
| \`makeFace(wire)\`                      | Create a face from a wire consisting only of edges
| \`makeNewFaceWithinFace(face,wire)\`    | Create a face on another face using a wire   
| \`makeNonPlanarFace(wire)\`             | Create a curved surface from a non-planar wire
| \`makePolygon(points[])\`               | Create a face from an array of points in a plane
| \`makeOffset(face,offset,tolerance)\`   | Create an offset to a face
| \`makePlaneFromFace() \`                | Extend a face out to an infinite plane parallel to this face
| \`makeSolid(faces[]/shell)\`            | Create a solid from the volume that is defined by the array of faces or by a surface. 


The following code example demonstrates how faces in 3 dimensions can be created using a quite complicated algorithm. In this example, the faces consisting of triangular surfaces are assembled in such a way that they completely enclose a volume, without leaving a gap. Using the method \`makeSolid\` the volume enclosed by these faces can then be converted to a solid. In the image below this is demonstrated by cutting a sphere out of the newly created shape. Note that without this final step, the faces represent infinitely thin surfaces floating in space. This might be sufficient to create a 3D shape for visualization, but does not allow 3D printing the object. The next section will explain the concept of shapes (solids) in more detail. 

<img alt="Icosahedron shape created from faces" src="https://github.com/raydeleu/ReplicadManual/blob/main/images/icosahedron.png" width="500"> 

\`\`\` javascript
function projectOnSphere(radius, vertex) {
  // function to project a vertex on to a sphere with radius "radius"
  let x = vertex[0];
  let y = vertex[1];
  let z = vertex[2];
  let currentRadius = Math.sqrt(
    Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)
  );
  let scale = radius / currentRadius;
  let scaledVertex = [scale * x, scale * y, scale * z];
  return scaledVertex;
}

const icosahedronFaces = (radius) => {
  let golden = (1 + Math.sqrt(5)) / 2;

  let v = [
    // vertices determined by 4 rectangles
    projectOnSphere(radius, [-1, golden, 0]),
    projectOnSphere(radius, [1, golden, 0]),
    projectOnSphere(radius, [-1, -golden, 0]),
    projectOnSphere(radius, [1, -golden, 0]),

    projectOnSphere(radius, [0, -1, golden]),
    projectOnSphere(radius, [0, 1, golden]),
    projectOnSphere(radius, [0, -1, -golden]),
    projectOnSphere(radius, [0, 1, -golden]),

    projectOnSphere(radius, [golden, 0, -1]),
    projectOnSphere(radius, [golden, 0, 1]),
    projectOnSphere(radius, [-golden, 0, -1]),
    projectOnSphere(radius, [-golden, 0, 1]),
  ];

  // faces added so that they always have an edge in common
  // with the previous ones
  return [
    [v[0], v[11], v[5]],
    [v[0], v[5], v[1]],
    [v[0], v[10], v[11]],
    [v[0], v[7], v[10]],
    [v[5], v[11], v[4]],
    [v[4], v[9], v[5]],
    [v[3], v[9], v[4]],
    [v[3], v[8], v[9]],
    [v[3], v[6], v[8]],
    [v[3], v[2], v[6]],
    [v[6], v[2], v[10]],
    [v[10], v[7], v[6]],
    [v[8], v[6], v[7]],
    [v[0], v[1], v[7]],
    [v[1], v[5], v[9]],
    [v[11], v[10], v[2]],
    [v[7], v[1], v[8]],
    [v[3], v[4], v[2]],
    [v[2], v[4], v[11]],
    [v[9], v[8], v[1]],
  ];
};

const main = (
  { makeSolid, sketchRoundedRectangle, makeSphere, makePolygon },
  {}
) => {
  function makeIcosahedron(radius) {
    const faces = icosahedronFaces(radius).map((f) => makePolygon(f));
    return makeSolid(faces);
  }

  // draw the isosphere
  let icosahedron = makeIcosahedron(2.0).scale(50);
  const sphere = makeSphere(100).translate([90, 30, 20]);
  
  // cut the icosahedron with a sphere to demonstrate that the first 
  // shape is indeed a solid, no longer collection of faces
  icosahedron = icosahedron.cut(sphere)

  let shapes = [
  {shape: icosahedron, name: "icosehadron", color: "steelblue"}
  ]
  return shapes;
};

\`\`\`

## 5.1 What is a shape or solid?

A solid in OpenCascade is a 3D volume that is closed. Closed means that the infinitely thin surfaces that build the shape enclose the volume completely. 

<img src=https://github.com/raydeleu/ReplicadManual/blob/main/images/thickness.png width="800"> 

The generic command to create a 3D solid shape from a 2D sketch is based on adding thickness. This can be performed using the following basic command, where the method \`thicknessMethod\` has to be replaced with any of the methods listed in the table below. 

\`\`\` javascript
let shape = sketch.thicknessMethod
\`\`\` 

## 5.2 Methods to add thickness to a 2D sketch

The \`.thicknessMethods\` that are available to add thickness or volume to a 2D sketch are listed below. The configurations consists of a number of parameters between curly brackets. In some cases the configuration can contain other configurations. In the next sections the commands will be clarified with code examples, so the table is intended only for quick reference. The parameters with a questionmark have a default value and can be omitted when the default is applicable. 

| method                                     | description                                                                                                |
| -----------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| \`.extrude(distance,{extrusionConfig?}) \`               | extrude a face over a distance normal to the face.                                                         |
| \`{extrusionConfig}\`                                    | \`origin:[xyz], extrusionDirection[xyz],twistAngle:deg,{extrusionProfile}\`                                  |
| \`{extrusionProfile}\`                                   | {profile:"linear" / "s-curve", endFactor: scale}                                         |
| \`.loftWith([otherSketches],{loftConfig},returnShell?)\` | build a solid through lofting between different wires                                    |
| \`{loftConfig}\`                                         |{ruled: boolean, endPoint:[point],startPoint:[point]}                                     |                   
| \`.revolve(revolutionAxis:[point]?,revolveConfig?)\`     | revolve a drawing around the z-axis (or indicated axis) to create a solid shape.         |                    
| \`{revolveConfig}\`                                      | \`{origin: [xyz]}\`  origin on which axis of revolution is centered                        |   
| \`revolution(face,[origin],[direction],degrees)\`        | revolve a face around the axis identified in the function, over the angle indicated in degrees    | 
| \`.face()\`                                              | This is not really a thickness method  but a method to create the first surface from a sketch or drawing. Note that this method is not needed in most cases as a closed sketch already is translated into a face that can be used directly for extrusion, revolving or sweeping. 
| \`.sweepSketch( (plane, origin) => sketchFunction(plane,origin) )\` |  Sweep the sketch defined by the sketchFunction along the sketch used as the object for this method.
| \`makeSolid(faces[]/shell)\`                             | Create a solid from the volume that is defined by the array of faces or by a surface. 



### 5.2.1 .extrude()

Extruding adds thickness to a drawing in the direction normal to the drawing, thereby creating a solid. You can think of it like pushing dough through a hole that has the shape of the drawing. In the simplest form you only have to specify the height of the extrusion. As shown in the image below you can adapt some characteristics of the extrusion. 

<img src=https://github.com/raydeleu/ReplicadManual/assets/38007983/fa12f0de-991d-4208-ac82-b2e6b20ca13d> 

The following code explains some of the modifications that you can apply to the extrusion. The first parameter, the extrusion height determines the distance over which the extrusion is performed. In a normal situation this is also the height of the resulting object, but if the extrusion axis is tilted and not performed from the center of the object (i.e. the origin of the extrusion is different from the origin of the object) the height can be different from the extrusion distance. The \`twistAngle\`, in degrees, determines how many degrees the extrusion is twisted during the extrusion. Finally, the \`extrusionProfile\` allows to change the scale of the drawing during the extrusion and to change the profile followed between the profile at the start and the profile at the end of the extrusion. The "s-curve" profile creates a profile that starts and ends in the direction of the extrusion but adapts to the change in width of the extrusion as defined by the "endFactor".


\`\`\` javascript
// create a drawing that you want to extrude
let rectangleDrawing = drawRoundedRectangle(50,30,3)
.translate([-40,40]).sketchOnPlane("XY")

let extrudeDraft = rectangleDrawing.clone()
.extrude(30,                                                // height of the extrusion
{origin: [-40,40,0],                                        // if the drawing was translated you have to adjust the origin as well            
extrusionDirection: [0,0,1],                               // direction of the extrusion in relation to the origin
twistAngle:90,                                             // the twist applied during the extrusion 
extrusionProfile: { profile: "s-curve", endFactor: 0.5 }}) // the profile of the extrusion
\`\`\`

It is important to note that many of the modifications relate to the origin, so often it is easier to create your model at the origin and translate it after building the solid than to move the drawing and apply the extrusion later. 

To create a solid using extrusion, the sketch or drawing that you use as a base for extruding should be closed. It is possible to extrude an open wire, but this results in a shell instead of a solid. 

### 5.2.2 .revolve()

The method \`.revolve()\` creates a shape based on revolving the drawing around the z-axis. The drawing that is revolved should be closed, so the edges should completely enclose an area and form a face. Revolving an open (i.e. non-closed) drawing will result in the creation of a shell instead of a solid. The difference is shown in the image below. 

<img src=https://github.com/raydeleu/ReplicadManual/assets/38007983/d9610383-9d06-4c85-9568-2dacb504db03 width="600">

If you want to use another axis for the revolution, you can add a point that indicates the direction from the origin. If you want to use another origin for the axis of revolution this can be added in a configuration between curly brackets. In the example below the rotation is performed around the x-axis with the origin displaced to z = -10.  

\`\`\` javascript
let profileClosed = draw()
.line(20,0).line(5,5).line(0,30).line(-25,0)
.close().sketchOnPlane("XZ")
.revolve([1,0,0],{origin:[0,0,-10]})
.translate(-30,-30)
----

The \`.revolve()\` method always revolves a shape over 360 degrees. If you dig into the documentation you will find a function called \`revolution\` that allows to create a body of revolution where the angle can be defined. The function requires a face as input, so you need to add the \`face()\` method after a drawing to create a face first. The code then look like this: 

[source, javascript]
----
let {draw} = replicad
function main(){
// let solid = revolution(face,[x,y,z origin],[x,y,z direction], degrees)
let profile = draw().hLine(10).line(3,5).hLine(-13).close().sketchOnPlane("XZ")
let halfCircle =  revolution(profile.face(),[0,0,0],[0,0,1],180)
return halfCircle}
\`\`\`

### 5.2.3 .loftWith()

The method \`.loftWith(sketch/placed drawing)\` builds a loft along the sketches fed to the method.

To create a loft you need two or more (placed) drawings. In the following example three profiles are drawn and placed on different planes. Then one of the profiles is used as the parent to which the \`loftWith()\` method is applied. The method can accept multiple profiles ordered in an array. The order of the drawings in the array determines the way the loft is built. 

<img src=https://github.com/raydeleu/ReplicadManual/assets/38007983/d5da73ae-3c28-40e2-a3fc-752e4122f5d7>

In the example, the drawings used for the loft are clones (using the \`.clone()\` method) to be able to re-use or display the drawings. The loft method normally deletes the drawings after creating the loft to save memory. 

\`\`\` javascript
const {draw} = replicad

function main(){
let scale = 1/10
let baseLength = 200*scale;
let topLength = Math.sqrt((2*Math.pow((baseLength/2),2)))
let height = (1368-196.85)*scale

let baseProfile = draw()
.hLine(baseLength).vLine(baseLength).hLine(-baseLength).close()
baseProfile = baseProfile.translate([-baseLength/2,-baseLength/2]).sketchOnPlane("XY")

let midProfile = draw().hLine(baseLength/2).polarLine(topLength/2,45).vLine(baseLength/2)
.polarLine(topLength/2,135).hLine(-baseLength/2).polarLine(topLength/2,225)
.vLine(-baseLength/2).close()
midProfile = midProfile.translate([-baseLength/4,-baseLength/2]).sketchOnPlane("XY",height/2) 

let topProfile = draw().polarLine(topLength,45).polarLine(topLength,135)
.polarLine(topLength,225).close()
topProfile = topProfile.translate([0,-baseLength/2]).sketchOnPlane("XY", height)

let tower = baseProfile.clone().loftWith([midProfile.clone(),topProfile.clone()],{ruled:true})
let tower1 = baseProfile.clone().loftWith([midProfile.clone(),topProfile.clone()],{ruled:false})
.translate(30,0,0)
let tower2 = baseProfile.clone().loftWith(topProfile.clone(),{ruled:true}).translate(60,0,0)

return [{shape: baseProfile, color:"orange"},{shape:midProfile, color: "orange"}
,{shape:topProfile, color:"orange"},{shape: tower, opacity:"0.5"}
,{shape: tower1},{shape: tower2}]} 
\`\`\` 

It is also possible to use a sketch as a profile for the loft. The code below shows an extract from the definition of a watering can that is based on the \`loftWith\` method. Three circles are used to define the shape. In this case the circles are created using a \`sketch\` object. Note that you need to extract the face before creating the loft, using the \`face()\` method. Using a drawing instead of a sketch therefore is a bit more intuitive. As we will see below, you cannot use a face extracted from an object to create the loft, which seems contradictionary with the need to create a face from a sketch. 
 
\`\`\` javascript
// create cross sections of the filler for the carafe
//          used a workaround to rotate and translate the sketch to the required position
let fillHole = sketchCircle(12).face().rotate(-20,[0,0,0],[0,1,0]).translate([-35,0,135])
fillHole = sketchFaceOffset(fillHole,0);
let topBody = sketchCircle(8).face().translate([0,0,100]);   // radius 8 at 100 mm 
topBody = sketchFaceOffset(topBody,0); 
let fillBottom = sketchCircle(9).face().rotate(20,[0,0,0],[0,1,0]).translate([0,0,80]); 
fillBottom = sketchFaceOffset(fillBottom,0); 

// filler shape is created as a loft between the three wires
let filler    = fillHole.loftWith([topBody,fillBottom],{ruled: false});
\`\`\`

The configuration \`{ruled: false}\` produces a smooth line between the profiles, whereas the configuration \`{ruled: true}\` creates straight lines between the profiles. 

image::https://github.com/raydeleu/ReplicadManual/blob/5264639f36465962ddd70235d066d02764791ebb/images/loft-examples-ruled.png[]

The following source sample shows how to extract a face from an existing object and use this as part of a loft. Here a new sketch is created from the edges extracted from the face of the object. This is necessary as a face on an object can also contain holes, whereas the wire to create the loft should be closed and not contain a hole. 

<img src=https://github.com/raydeleu/ReplicadManual/assets/38007983/fb7eab29-7829-41bd-9f89-6f8f0f7a12cd>


\`\`\` javascript
const r = replicad

export default function main(p) {
  const box = r.makeBaseBox(30, 10, 20).translateY(-5)

  const triBase = new r.FaceFinder().inPlane("XZ", 0).find(box, { unique: true })
  const triMid = r.drawCircle(10).translate(0, 10). // lay onto XY plane
    sketchOnPlane("XZ", -20)
  const triTop= r.drawCircle(10).translate(0, 10). // lay onto XY plane
    sketchOnPlane("XZ", -50)

  // I should expose this as a helper \`sketchFace\` function
  const faceSketch = new r.Sketch(triBase.clone().outerWire(), { 
    defaultDirection: triBase.normalAt(triBase.center), 
    defaultOrigin: triBase.center 
  })

  const tri = triTop.clone().loftWith([triMid,faceSketch],{ruled: true})

  return [
    { shape: box, name: "sleeve", color: "green", highlightFace: (f) => f.inPlane("XZ", 10) },
    { shape: tri, name: "tri", color: "blue" },
    { shape: triBase, name: "triBase", color: "red" },]}
\`\`\`

If you want to start or end the loft with a single point, you can use the configuration setting \`startPoint\` or \`endPoint\`. The sample below demonstrates how to use this configuration. 

\`\`\` javascript
const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const rect = drawRoundedRectangle(5, 10).sketchOnPlane();
  const circle = drawCircle(3).sketchOnPlane("XY", 10);

  return rect.loftWith(circle, { endPoint: [2, 2, 15] });
};
\`\`\`

### 5.2.3 .sweepSketch()

The method \`.sweepSketch\` can be used to create a solid by sweeping a sketch along another curve. An example is the chair profile shown in the icon at the beginning of this chapter or the ringshape shown in the image below:  

<img src=https://github.com/raydeleu/ReplicadManual/blob/main/images/sweepSketch-samples.png>

The source to create these shapes is: 

\`\`\` javascript
const {Sketcher, sketchRectangle, sketchRoundedRectangle,draw}=replicad

const main = () => {
  let p0 = [0, 0];
  let p1 = [50, 100];
  let p2 = [60, -110];
  let p3 = [70, 50];
  let p4 = [100, 25];
  let points = [p1, p2, p3, p4];

// create wavy path on XZ plane
let basePath = new Sketcher("XZ")
    .movePointerTo(p0)
    .bezierCurveTo(p4, points)
    .done()

// sweep a rectangle along the wavy path
let baseShape = basePath.clone().sweepSketch((plane, origin) => 
                sketchRectangle(2, 30, { plane, origin }))
                .translate(0,-40);

// create a path consisting of rounded rectangle
let topPath = sketchRoundedRectangle(110,30,5,{plane:"XY",origin:[50,0,26]})

// create an L-shaped cross section
function ringSection(plane,origin) 
{let section = new Sketcher(plane,origin)
    .hLine(10).vLine(-3).hLine(-8)
    .vLine(-26).hLine(-2).close()
  return section}  

let ringSectionDraw=draw()
.hLine(10).vLine(-3).hLine(-8)
.vLine(-26).hLine(-2).close().sketchOnPlane("YZ")

// sweep the L-shaped section along the rounded rectangle
let topSweep   = topPath.sweepSketch((plane, origin) => ringSection(plane,origin))
.translate(0,60)

return [topSweep, baseShape, ringSectionDraw]}
\`\`\` 

As shown in the code above, the \`sketchFunction\` used in the \`.sweepSketch()\` can be derived from either a standard sketching function, such as \`sketchRectangle(2, 30, { plane, origin })\` or by defining your own closed sketch using a \`Sketcher\` object. This object should then refer to a \`(plane, origin)\` like this: 

\`\`\` javascript
            function sketchFunction(plane,origin) 
            {let section = new Sketcher(plane,origin)
                    (add sketch commands)
                    .close()
            return section}
\`\`\` 

A swept object can also be used to cut a profile in another shape. The image below shows an example where the contour of a knop is rounded with a large radius. This is achieved by creating a profile with the appropriate radius that encloses the area that should be "shaved" off. 

<img src=https://github.com/raydeleu/ReplicadManual/blob/main/images/sweep-knob.png>

The cross section is shown in red, projected on the XY plane. The object resulting from the \`.sweepSketch()\` method is displayed with a transparent material on top of the knob. 


\`\`\` javascript
// identical to side view but only top edge
// to be used as a rail to sweep the 32mm radius profile  
let sweepRail = draw()
.movePointerTo([-60,0])
.ellipse(20*Math.sin(Math.PI/6),20*Math.cos(Math.PI/6),20,20,0,0,false)
.smoothSplineTo([0,32])
.ellipse(32,-32,32,32,Math.PI/2,0,false)
.done()
.sketchOnPlane("YZ")

// create a rounded profile to shape finger of knob  
function sweepProfile(plane,origin)
{let section = new Sketcher(plane,origin)
.movePointerTo([segmentHeight,-20])
.lineTo([segmentHeight,-16])
.threePointsArcTo([segmentHeight,16],[0,0])
.lineTo([segmentHeight,20])
.lineTo([-1,20])
.lineTo([-1,-20])
.close()
return section}

let profileCut = sweepRail.clone()
.sweepSketch((plane,origin) => sweepProfile(plane,origin))
\`\`\`

The so-called boolean function to cut the material will be discussed in the Chapter [[Combine solids to parts]]. 

### 5.2.6  makeSolid()

The \`makeSolid\` function can be used to create a solid from a number of faces. The faces need to enclose a volume without any gap. The following code example shows how to create a so-called antiprism. The model represents the One World Trade Center. The following image shows the same shape but for clarity the height is reduced: 

<img src=https://github.com/raydeleu/ReplicadManual/blob/main/images/anti-prism-short.png>

The shape is created by first creating the triangles that make up the sides of the shape, using the \`makePolygon()\` method discussed in the previous chapter. The solid is then built by joining these triangles together with the square bottom and top faces. 

\`\`\` javascript
const {draw, drawRectangle, makePolygon, makeSolid} = replicad;

function main()
{
let bL = 200/10;  // base length is 200 ft
let h = 1368/10;  // height 1368 ft
let m = (60/0.3048)/10; // first 60 meters are straight, converted to feet

    function antiPrism(bLength,prismHeight,endScale)
    {
        let bL = bLength/2;
        let tL = bL/Math.sin(Math.PI/4)
        let base=[]
        base[1] = [-bL,-bL,0];
        base[2] = [bL,-bL,0];
        base[3] = [bL,bL,0];
        base[4] = [-bL,bL,0];
        base[5] = base[1]   // trick to avoid need for modulus 4

        let top=[]
        top[1] = [0  ,-tL*endScale ,prismHeight]
        top[2] = [tL*endScale  , 0  ,prismHeight]
        top[3] = [0 ,tL*endScale  ,prismHeight]
        top[4] = [-tL*endScale ,0   ,prismHeight]
        top[5] = top[1]    // trick to avoid need for modulus 4

        let face=[]
        face[1] = makePolygon([base[1],base[4],base[3],base[2]]);        
        // not defined counterclockwise to have face facing in negative z-direction
        for (let i=2 ; i<=8; i+=2)
            {
            face[i]     = makePolygon([top[i/2],base[i/2],base[i/2+1]]);
            face[i+1]   = makePolygon([base[i/2+1],top[i/2+1],top[i/2]]);
            }
        face[10] = makePolygon([top[1],top[2],top[3],top[4]]);
        return face;
        }
let faces = antiPrism(bL,h,Math.sin(Math.PI/4));
let tower = makeSolid(faces).translate(0,0,m);
let towerbase = drawRectangle(bL,bL).sketchOnPlane("XY").extrude(m)
tower = tower.fuse(towerbase)
return tower}
\`\`\` 

## 5.3 Pre-baked shapes

The methods specified above can be used to create complex shapes but also to create standard shapes like boxes, cylinders or spheres. As these shapes are often used as basic building blocks, Replicad provides a number of functions to automate the creation of the standard shapes. These functions are explained in the following table: 

| method                                                       | description                                        |
| -------------------------------------------------------------|----------------------------------------------------|
| makeCylinder(radius,height,[location],[direction])           |create a cylinder                                   |
| makeBaseBox(xLength,yLength,zLength)                         |create a box                                        |
| makeSphere(radius)                                           |create a sphere                                     |
| makeVertex([point])                                          |create a vertex/point                               |

The shapes listed above are the same shapes that are available in most CAD programs and OpenSCAD. The CAD program for beginner, offered by the company Autodesk at https://tinkercad.com) offers even more basic solids. Apart from the box, cylinder and sphere there are shapes like half domes, piramids, extruded hexagons, donuts et cetera. 


![tinkercad shapes](https://github.com/raydeleu/ReplicadManual/assets/38007983/de372431-6a53-4bf8-aae4-ade75a9907b9)

Most of these shapes can be created easily with the methods described in this chapter. The following image shows the shapes as created with functions that were described in this and the previous chapters. The only difference is the rounded cube. How all sides of the cube can be rounded will be discussed in Chapter 6. 
(The code to create these shapes can be found in the Appendix with examples). 

![image](https://github.com/raydeleu/ReplicadManual/assets/38007983/93d3a22c-7108-4fff-85a8-f89382a2c9a0)

If you want to use these shapes as quick building blocks, automating the creation of these shapes using functions will allow you to re-use these components. This will be discussed in Chapter [[9. Automate modelling with functions]]. 





<img src=https://github.com/raydeleu/ReplicadManual/blob/main/images/mm2023-parts.png>

As shown in <<img-mm2023-parts>> it is possible to create quite complicated parts by just combining simple shapes such as boxes, spheres and cylinders. The shape used in this image is an exercise called Model Mania organized by the company that created the Solidworks CAD program. There are only some fillets missing which were obviously too complicated for the OpenCascade modelling kernel. The shapes are combined using the boolean operations decribed in <<Combine shapes>>. Some of the edges of the basic shapes were rounded. How this can be achieved is explained in <<Modify shapes>>. The result is shown in the image below.  

<img src=https://github.com/raydeleu/ReplicadManual/blob/main/images/mm2023-complete.png>






## 6.1 What are modifications? 

This section explains how to modify a 3D solid that was created using the functions and methods decribed in the previous chapter. Modifications as described in this section only relate to a single shape. Combining multiple shapes, through fusing, subtracting or intersecting, will be described in the next chapter. 

The following table lists modifications that can be applied to a solid. 

| method                           | description                                        |
| ---------------------------------|----------------------------------------------------|
|\` .fillet(radiusConfig,filter?) \`                                   | round an edge of a shape with a fixed radius or a radius that is defined by a function. The filter refers to the selection mechanism defined in the next secion. It has the general shape of (e) => e.inDirection("X")  
|\` .chamfer(radiusConfig,filter?) \`                                  | take of a sharp edge by creating a transitional face, default at 45 degrees to a edge
|\` .shell(thickness, (f) => f.inPlane("YZ",-20),{tolerance:number})\` | create a thin walled object from a shape, removing the indicated face from the shape to provide access to the hollow inside. 
|\` makeOffset(shape,thickness)\`                                      | create a shape that is offset from the original shape by the thickness. A positive number results in an increased size of the shape, a negative value will result in a smaller shape
|\` .addHolesInFace(face,holeWires[])\`                                 | create a hole in a shape using the wires that are indicated in the parameters to this function. 
 

Most of the methods listed in the table require the selection of an edge or face of the shape. Therefore the next subsection will explain how edges and faces can be selected. 

## 6.2 Selecting faces or edges for modification
Some of the methods listed in the previous subsection can be used without indicating a specific face or edge.For example, if a fillet is applied to a shape, the same radius of rounding is applied to all sharp edges in the shape. However, in most cases the fillet should be applied only to specific edges. In most visual CAD programs, the edges for the fillet operation are selected with the mouse cursor in the 3D view. In Replicad a filter mechanism has to be used to find the edges. The next paragraphs explain how faces or edges can be selected. Faces are relevant to create a thin walled object (shell) or to create holes in a face. Finding edges is relevant to create rounded edges (fillets) or chamfers.  

### 6.2.1 Selecting faces

Faces can be selected using a \`FaceFinder\` object or using the so-called arrow notation of javascript. The arrow notation is a shorthand notation to define a function that changes the value of a given parameter. The following code explains this in more detail:  


\`\`\` javascript
// create a variable as a new object to which a selection-method is applied
let foundFaces = new FaceFinder().inPlane("XZ",35)
// use this variable as an input to create a shell 
let hollowShape = solidShape.shell(thickness, (f)=>foundFaces,{tolerance:number})

// use the arrow notation to select a face directly as parameter to a method to change a shape 
let hollowShape = solidShape.shell(thickness, (f) => f.inPlane("YZ",-20),{tolerance:number})
 \`\`\`

The following methods to select faces are available: 

| method                           | description                                        |
| ---------------------------------|----------------------------------------------------|
|\` .inPlane("XZ",35)\`                                           | select all faces that are positioned in a given plane and offset
|\` .parallelTo(plane/face/standardplane)\`                                        | select a face parallel to a given plane or face
|\` .ofSurfaceType("CYLINDRE")\`                                                   | select all faces of a certain type
|\` "PLANE" / "CYLINDRE" / "CONE" /"SPHERE"/ "TORUS" / "BEZIER_SURFACE"       /"BSPLINE_SURFACE"/"REVOLUTION_SURFACE"/"EXTRUSION_SURFACE"/ "OFFSET_SURFACE"/"OTHER_SURFACE" \`                                               | surface types to use with surfaceType selector 
|\` .containsPoint([0,-15,80])\`                                                   | select a face that contains a given point
|\` .atAngleWith(direction,angle)\`                                                | select a face at a certain angle to an axis or plane atAngleWith("Z",20)
|\` .atDistance(distance,point)  \`                                                | select a face at a given distance to a point 
|\` .inBox(corner1,corner2)       \`                                               | select a face that is partially located inside the given box
|\` .inList(elementList[])    \`                                                   | select a face that is in the elementList
|\` find(shape,options), options {unique: true}\`                                  | returns all the elements that fit the filters
 





### 6.2.2 Selecting edges
Selecting edges works similar to selecting faces.

\`\`\` javascript
// create a variable as a new object to which a selection-method is applied
let foundEdges = new EdgeFinder().inPlane("XZ",35)
// use this variable as an input to create a shell 
let roundedShape = solidShape.fillet(radius, (e)=>foundEdges,{tolerance:number})

// use the arrow notation to select an edge directly as parameter to a method to change a shape 
let roundedShape = solidShape.fillet(thickness, (e) => e.inPlane("YZ",-20),{tolerance:number})
 \`\`\`

The following selection mechanisms can be used to find and select edges: 

| method                           | description                                        |
| ---------------------------------|----------------------------------------------------|
|\` .inDirection([x,y,z]/"X"/"Y"/"Z")\`                     | find all edges that have the direction
|\` .atAngleWith(direction,angle)\`                        | atAngleWith("Z",20)
|\` .ofLength(number)\`                                    | find all edges with a particular length
|\` .containsPoint([0,-15,80])\`                           | find edges that go exactly through a point
|\` .atDistance(distance,point)\`                          | same as .containsPoint but allows some margin around the defined point 
|\` .inBox(corner1,corner2)\`                              | finds all edges that are (partly) within a box
|\` .inList(elementList[])\`                               | see issue https://github.com/sgenoud/replicad/issues/13, does not work yet
|\` .inPlane(inputPlane,origin)\`                          | inPlane("XY",30), find all edges that are exactly in the defined plane
|\` .ofCurveType(       )\`                                | find all edges of a certain curve type. "LINE", "BSPLINE_CURVE", "CIRCLE"
|\` .parallelTo(plane / StandardPlane e.g. "XY")\`         | find all edges parallel to a stanadard plane
|\` .shouldKeep todo?\`                                    | tbd
 

>[!NOTE]
>When you reference faces or edges with their index, using the \`.inList\` method, you may experience the issue of the Topological Naming Problem. If the change to the design parameters results in a changing number of edges or faces, the fillet will no longer be applied to the correct edges. So use this method with care, if you only allow minor changes to the design such as using a different tolerance between two parts. Note that this selector currently does not work as expected, see issue https://github.com/sgenoud/replicad/issues/13. 



### 6.2.3 Combine filters 

| method                           | description                                        |
| ---------------------------------|----------------------------------------------------|
|\`and\`                             | both filters should be applied
|\`either\`                          | only one of the filters may be applied
|\`not\`                             | select all other edges than those selected by this filter


 \`\`\` javascript       
            const houseSides = new FaceFinder().either([
            (f) => f.inPlane("YZ", 50),
            (f) => f.inPlane("YZ", -50),]);
     
             const frontWindow = new EdgeFinder()
            .ofCurveType("CIRCLE")
            .not((f) => f.inPlane("XZ"));  
 \`\`\`

Below is an example how finders can be combined in the definition of a fillet. 

 \`\`\` javascript       
let axleShape2 = axleHole2.fuse(keySlot2).sketchOnPlane("XZ",20)
let axle2 = axleShape2.extrude(25)
            .fillet(2,(e)=>e.either([
                          (e)=>e.inPlane("XZ",45),
                          (e)=>e.inPlane("XZ",20)]) )
return [axle2];
 \`\`\`

## 6.3 .fillet() 

A fillet is a rounded edge. In real products a fillet is often used to remove sharp edges that can be damaged easily and can also cause damage to people and other parts. A rounded corner is easier to coat and paint and after its application the risk of paint peeling of the corner is smaller. A fillet therefore improves the longevity of the product. The rounding on internal edges also helps to reduce stress concentrations. And finally a rounding can help to mate parts, although a chamfer (see next section) is often preferred in that case. 

The fillet method in Replicad has the following form: 

\`\`\` javascript
 let roundedBox = box.fillet(radius,(e)=>e.edgeSelectingMethod) 
\`\`\`
The \`edgeSelectionMethod\` can be a combination of one or more selection methods as described in the previous section. If the edge selection is omitted, Replicad will try to round all edges of the object. When you select an edge, Replicad uses the "tangent chain" approach to continue the rounding until it encounters a sharp corner. This is illustrated in the image below. Only the edges in the "X" direction are selected for filleting, yet all edges that have a tangent connection to these edges are also rounded. 

<img width="893" alt="image" src="https://github.com/raydeleu/ReplicadManual/assets/38007983/f032cab0-a956-42f1-88eb-0a23aec874df">

In most cases the continuation of the fillet along smoothly connected faces is the intended behaviour. If this is not the case, the order of applying the fillets should be changed. Replicad does not offer the capability to suppress the tangential chaining. 

When we take the code of the example and uncomment the additional fillet construction, fillets with three different radii will be applied to the solid. When the order of the two last instruction is changed, the fillet fails with a "kernel error". 

\`\`\` javascript
// Demonstration of tangent chain 
const {draw} = replicad

function main(){

let uShape = draw().line(40,0).customCorner(4).line(0,20)
.customCorner(2).line(-8,0).customCorner(2)
.line(0,-12).customCorner(2)
.line(-24,0).line(0,12).line(-8,0).close()
.sketchOnPlane("XY").extrude(20)

uShape = uShape.fillet(2,(e)=>e.inDirection("X"))
//uShape = uShape.fillet(1,(e)=>e.inDirection("Y"))
//uShape = uShape.fillet(3,(e)=>e.inDirection("Z"))

return uShape}
\`\`\`

Replicad currently only offers circular filets with a constant radius for each assigned edge. On internal edges the fillet is concave (hollow), providing a fluid transition between the adjacent faces. 

If you want to create a full round top on a part you should be aware that joining two fillets will mostly fail. A solution is to approximate the full rounding with a minimal straight part between the two fillets, for example by reducing the size of the fillet with a tolerance of 0.001.  


>[!NOTE]
> Users of OpenCascade, the 3D kernel used by Replicad, have noticed that fillets may often cause the program to fail. This may result in a broken geometry (which will be reported as errors in other 3D applications such as slicers for 3D printers), or in the crash of the program. The best approach reported is: 

> * if possible, try to add the fillets already in the sketching stage. The fillet mehtod for sketches is called \`customCorner()\` and is described in [Chapter 3](3.-Sketch). Alternatively you can use sketching commands such as \`tangentArc\` or \`smoothSpline\` to define arcs or smooth transitions instead of sharp corners;
> * when the rounding cannot be applied in the sketching stage, try to add the fillets to a completed shape as late as possible;
> * when a fillet fails, try to reduce the fillet size. OpenCascade cannot handle situations where a fillet completely removes an adjacent face. If you want to design such a geometry, try to find a different modelling approach to get the same result. 
> * inspect the shape closely after filleting to determine if there are faces missing. This is a clear indicator for socalled non-manifold geometry, i.e. geometry that does not fully enclose a volume. 


## 6.4 .chamfer()

A chamfer is defined as a symmetrical sloped angle applied to a sharp edge. Just like a rounding it takes away the sharp edge that is unpleasant to the touch and prone to damage. Chamfers are also often used to make it easier to assemble parts. When the chamfer is applied to a 90 degree angle it results in two 135 degree angles. When a part needs to be coated or painted, a bevel is a better finishing than a chamfer as there are still sharp angles, even though they are less sharp. 






## 6.5 .shell() 

The \`.shell()\` method creates a thin walled shape out of a solid, taking one or more faces away to provide an opening to the thin walled shape. The resulting shape is still a solid, as the walls are not infinitesimally thin as for a "shell" using the terminology as explained in [Chapter 2](2.-From-sketch-to-3D-part). 






## 6.6 makeOffset()



## 6.7 addHolesInFace()



The transform functions require a 2D face or a 3D shape. As explained in Section 3, sketches can not be transformed. If you want to transform a sketch, use the \`draw()\` function. The generic instruction to transform a face or shape is: 

\`\`\` javascript
transformedShape = shape."transformCommand"
\`\`\`  

The following transformations are offered by Replicad:

| method                                               | description                                        |
| -----------------------------------------------------|----------------------------------------------------|
| .translate([dx,dy,dz])                               | Translate a part over distance dx,dy,dz along the respective axis
| .translateX(dx)                                      | Translate a part along the x-axis only
| .translateY(dy)                                      | Translate a part along the y-axis only
| .translateZ(dz)                                      | Translate a part along the z-axis only
| .rotate(angleDeg,axisOrigin[x,y,x],axisEnd[x,y,x])   | Rotate a part over the indicated degrees along an axis defined by two points 
| .scale(number)                                       | Scale the part equally in all directions
| .mirror("YZ",[-10,0])                                | Mirror the part in a given plane




## 8.1 Overview of methods to combine solids

Replicad offers a number of methods and functions to combine solids to create a new solid or compound shape. 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/booleans-icons.png" width="500"> 

The table below provides a quick reference to the methods and functions. The sections of this chapter describe them in more detail. 

| method                           | description                                                      |
| ---------------------------------|------------------------------------------------------------------|
|\`.cut(tool,{optimisation?})\`     | cut the tool-shape from the shape, optional optimisation         |  
|\`{optimisation?\`                |\` {optimisation:"none" / "commonFace" / "sameFace"}\`              |
|\`.fuse(otherShape,.. )\`          | fuse the othershape with the shape.                              | 
|\`.intersect(tool) \`              | find the volume that is common to the two shapes considered      |
|\`compoundShapes(shapeArray[])\`   | this function is identical to makeCompound                       |
|\`makeCompound(shapeArray[])\`     | allows to combine an array of any type of shape into a single entity that can be displayed.|   

The boolean operators were already discussed in the section on sketching and drawing (see [Sketch](./3.-Sketch.md)). The methods used by Replicad (and therefore in the OpenCascade library) are fairly standard but sometimes have a different name in other programs. The following table lists some of these alternative names. 

| Method in Replicad               | Name in other applications                                      |
|----------------------------------|-----------------------------------------------------------------|
| \`.cut()\`                         | 'subtract' or 'difference'                                      | 
| \`.fuse()\`                        | \`join\` , \`union\` , \`add\` (add keeps all original geometry)      |               
| \`.intersect()\`                   | \`common\`                                                        |   

## 8.2 .cut()




## 8.3 .fuse()




## 8.4 .intersect()




## 8.5 compoundShapes() or makeCompound




<<<

## 9.1 Define points based on directions and distances

\`\`\` javascript
function Polar(currentPoint,distance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + distance * Math.cos(angleRad);
    newPoint[1]  = currentPoint[1] + distance * Math.sin(angleRad);
    return newPoint
}

function PolarX(currentPoint,xdistance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + xdistance;
    newPoint[1]  = currentPoint[1] + xdistance * Math.tan(angleRad);
    return newPoint
}

function PolarY(currentPoint,ydistance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + ydistance/Math.tan(angleRad);
    newPoint[1]  = currentPoint[1] + ydistance;
    return newPoint
}
\`\`\` 

## 9.2 Circles joined with tangent lines

This function can be used to draw to circle-arcs connected with tangent lines, as an outline for a lever or a droplet. The circle with \`radius1\` is centered on the origin, the second arc is centered along the x-axis at a distance called \`distance\`. 


![Creating a drop shape for a lever](https://github.com/raydeleu/ReplicadManual/blob/main/images/droplet1.png)

\`\`\` javascript 
function dropView(radius1, radius2, distance)
{
    let sinus_angle = (radius1 - radius2) / distance
    let angle = Math.asin(sinus_angle);

    // points of outer contour of the lever
    let p1 = [radius1 * Math.sin(angle), radius1 * Math.cos(angle)];
    let p2 = [distance + radius2 * Math.sin(angle), radius2 * Math.cos(angle)];
    let p3 = [distance + radius2, 0];
    let p4 = [distance + radius2 * Math.sin(angle), - radius2 * Math.cos(angle)];
    let p5 = [radius1 * Math.sin(angle), - radius1 * Math.cos(angle)];
    let p6 = [- radius1, 0 ];

    let dropDrawing = draw(p1)
                    .lineTo(p2)
                    .threePointsArcTo(p4,p3)
                    .lineTo(p5)
                    .threePointsArcTo(p1,p6)
                    .close();
    
    return dropDrawing}
\`\`\`


## Create a polar array 

Many CAD programs offer the function to create a polar array of shapes, for example adding holes in a circular pattern. The following script solves this (copied from https://replicad.xyz/docs/recipes/polar-array)

\`\`\` javascript
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

The code only works properly if: 

* your original shape is centered at the origin [x,y] = [0,0]
* the circular pattern is located around the origin 

The script works for any shape and therefore both for 2D and 3D shapes. In the case of 3D, it will create the copies in the XY plane (as the default rotation is defined around the z-axis). 


This section describes how to export geometric data, what file types are supported, what are possible pipelines to transfer information from Replicad to STEP to STL or OBJ format. Resolution of tesselation, difference between quality of tesselation produced by different softwares.  

## 10.1 Exporting shapes

Apart from saving the javascript input file, Replicad offers three options to save your work for further modification or 3D printing. These options are: 

* Save the shapes in STL format
* Save the shapes in STEP format
* Save the shapes in JSON format

<img src="https://github.com/raydeleu/ReplicadManual/assets/38007983/17f770fd-730a-470a-952c-a97035e82513" width="500">

Which option is best depends on the purpose of the export. Two scenario's will be discussed in the next sections.

### 10.1.1 Exporting for 3D printing

One of the reasons you might be interested in modelling with Replicad is that you want to create objects with a 3D printer or CNC (computer numerical control) machining. Replicad is perfectly suited for this task as it allows to enter exact dimensions that can be altered slightly if it turns out that your design needs modification, for example because your 3D printer requires larger tolerances or cannot handle the printing overhangs. (An additional advantage is that modelling with a "real" CAD tool often result in less modelling errors such as non-manifold meshes, which are meshes that are not completely enclosing a volume. The concept of a 3D mesh will be discussed below). 

<img src="https://github.com/raydeleu/ReplicadManual/assets/38007983/ee8d77f2-097a-47a0-90ed-f37ae58d7a03" width="800">

In the case of 3D printing you need a file that can be imported by the so-called slicing tool that you use. The most well-known slicing tools are Ultimaker Cura  (https://ultimaker.com/software/ultimaker-cura/) and Prusa Slicer (https://www.prusa3d.com/). These tools mostly require a model in a socalled polygonal format. A polygon is a small flat face, so in a polygonal model the shape is enclosed in little small faces. File formats for polygonal models are the Wavefront OBJ format and the STL (Stereo Lithography) format. (Wafefront was a 3D company, subsequently acquired by Alias which was then acquired by Autodesk). The following image shows the file formats accepted by Cura: 

<img src="https://github.com/raydeleu/ReplicadManual/assets/38007983/da40e7fa-fa52-41dc-8773-8638dddc3e75" width="300">

Replicad can export in the STL format. The STL format describes the model with a mesh of triangle-shaped polygons. It is therefore an approximation of the 3D shape and may be considered a "lossy" format: data is lost in the conversion towards STL and the original format cannot be recovered from this format. As said, to produce a polygonal model of a 3D shape, the shape has to be broken down into small faces. The granularity or resolution of these faces determines the deviation of the exported model from the accurate model in the BRep modelling tool such as Replicad. The larger the resolution, the smaller the difference between the accurate model and the approximate polygonal model. But a larger resolution will also result in longer export times and larger files. Whether the resolution of the produced file is visible in the end-product is determined both by the resolution of the data and the capabilities of the manufacturing tool. For example, a 3D printer always prints in small layers, so having a resolution much smaller than these layers makes no sense.  

The Workbench and Visualizer do not offer the option to adjust the resolution. The settings can be found hidden in de code of Replicad. So if you need to adjust the resolution of your model, you can install Replicad locally (see Appendix B) and adjust the source code. Look for the following piece of code in the source: 

\`\`\`
blobSTL({ tolerance = 1e-3, angularTolerance = 0.1 }
\`\`\`
Note that the tolerance is already set quite low, resulting in accurate models for day-to-day use, especially for 3D printing. 

If you are still not satisfied with the STL export produced by Replicad, you can take a detour using other software. In that case you would export your object in a STEP file (see next section), import the STEP file into another software and then perform the export to STL with that software. In a software like 

* Moi3D (https://moi3d.com/) you can adjust the number of faces that is produced for the STL export,
* OnShape (https://onshape.com) offers four settings ranging from fine to coarse,
* CascadeStudio (https://zalo.github.io/CascadeStudio/) allows to set the \`MeshRes\` from its interface.
* SolidEdge (https://solidedge.siemens.com/en/solutions/users/hobbyists-and-makers/) allows to set the Conversion Tolerance and the Tolerance Units.  

### 10.1.2 Exporting for further modification 

It might be that you want to provide your 3D model to another person to enable him to adapt this model in her/his software of choice. In that case transferring the information in STEP format is preferred. STEP stands for "Standard for the Exchange of Product Data" and is a format defined in ISO 10303. It can describe a shape in terms of curves and faces. Additionally it can contain information on material, tolerances and colour of the object. The STEP format is the most appropriate format to transfer the model to other 3D design software as this file most accurately describes the shape.

The following image shows the import options for Moi3D ((https://moi3d.com/)

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/moi_import.png" width="750"> 

When you import the shape into Moi3D you can see that no tesselation (break-up of the object into small faces) has occurred: 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/moi_import_step.png" width="700"> 

And here is the same shape after importing into OnShape: 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/import_step_onshape.png" width="800"> 

Using the 3D programs mentioned above, you can export in many other formats, both accurate formats (STEP, IGES) and polygonal formats (STL, OBJ, WRL, Collada DAE). 

Importing a Replicad object into another software makes sense if not all intended modelling actions such as applying fillets are possible in Replicad. Another reason could be that your object is only a part in a larger assembly which is created in the other software. The following image shows an example where Solid Edge was used to apply some additional fillets that caused a "kernel error" in Replicad. The blue object was exported as a STEP file from Replicad, the green object has the additional fillets. A benefit of this approach is that you do not need to learn the other software completely but can restrict your knowledge to applying fillets or exporting in other formats. 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/slottedlever-render.jpg" width="800"> 

As mentioned in the previous section, some of the programs that are discussed in this section allow to export the shape in a polygonal format and to determine the level of detail of these models. The following two images show the export of an object in OBJ and STL format using Moi3D. 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/moi_export_obj.png" width="400"> 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/moi_export_stl.png" width="400"> 

Notice that the OBJ format allows polygonal faces with more than 3 vertices, whereas the STL model consists completely of triangular faces. Moi3D is known for its nice algorithm for meshing objects, especially in the OBJ format. This is especially beneficial if you want to change the model in a polygonal modelling software such as Blender (https://www.blender.org). 

### 10.1.3 Exporting for visualization

When you want to create a nice rendering of your object you can use both the accurate CAD format as a polygonal format such as STL. In most cases the object will be changed into a polygonal format anyhow by the rendering engine. This is even the case in the Replicad Visualizer and Workbench. Most rendering software uses algorithms to smooth surfaces. Therefore using a model with a very high resolution often makes no sense as it just increases the  size of the model files without any noticeable effect on the rendered result. The examples in this section were all created using the output from Replicad without any enhancement. 

If you are prepared to use commercial software to create a visualization, Solid Edge is a very good choice. The software is available at no cost for "makers and hobbyists" at [solidedge.siemens.com](https://solidedge.siemens.com/en/solutions/users/hobbyists-and-makers/). The software can import the STEP files produced by Replicad and save these as a PAR file, a Parasolid part file. The software package of Solid Edge includes a restriced version of Keyshot (https://www.keyshot.com/) that can import the objects in PAR format and produce a nice rendering without much effort. Just select some materials, apply these to the objects, choose the type of lighting (product design, jewelry et cetera) and press "render". 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/keyshot-screenshot.png" width="800"> 

The result is a realistic product rendering within less than an hour of work (note that if you do not use materials like glass, you can really get a result within a few minutes): 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/keyshot-replicad9.jpg" width="800"> 

A disadvantage of Solid Edge is that you can not use the free version for commercial activities and you never know when the offer to use this software freely ends. Furthermore this software can only be used on the Windows operating system. If you are using MacOS or Linux you would have to install a virtual machine with Windows to run this software. 

An open source alternative that is available on most operating systems is Blender (https://www.blender.org). This software offers the same functionality, but is not easy to use. Things that make life easier, like material libraries and lighting setups, are available for Blender as well but in many cases require a small fee. You can find many of these libraries at https://blendermarket.com/categories/studio-lighting/browse. If you are willing to put in your own time and experiment a lot you can build everything for free. 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/blender-screenshot.png" width="800"> 

>[!NOTE]
>The commercial license to the full package of Keyshot costs around 100 US dollar per month, lower cost plans are available at 39 USD per month. A low cost commercial license to Solid Edge costs around 140 US dollar per month.  This would mean spending a small amount on a material library or studio setup for Blender is still not as costly. 

The more expensive programs like OnShape and Solid Edge can also create accurate drawings from a 3D part, which might be needed to transfer the design information to others. 

<img src="https://github.com/raydeleu/ReplicadManual/blob/main/images/drawing_onshape_v2.png" width="800"> 

>[!NOTE]
>You can also produce drawings with Replicad using the functions described in the documentation, see https://replicad.xyz/docs/examples/projections)






<img src="https://github.com/raydeleu/ReplicadManual/assets/38007983/606b44ca-be24-4533-a0c8-76fd9d5a831b" width ="500"> 

The CAD assistant (https://www.opencascade.com/products/cad-assistant/) allows an export of the shape to polygon formats such as OBJ, WRL, STL but also a format  like IGES that contains all the detail of curves and arcs. 


## 10.2 Importing shapes

This section provides an explanation how to import geometric data, what types of information can be imported, how, what are the options to use the imported shapes for further modification. What are approaches to extract geometric information from other programs if the tools provided by Replicad make modelling tasks difficult.

### 10.2.1 Importing 2D shapes

Replicad currently offers no option to import 2D sketches. Yet this functionality could be practical. Think of the following cases: 

* You are given een 3D-view (side, front, top) of an object with dimensions that assume that you have a so-called constraint based modeller. A constraint based modeller, such as most visual 3D CAD programs, allow to enter the dimensions and relations between drawing segments to end up with a fully defined shape. Without this capability, finding the coordinates of these sketches often involves tedious geometric calculations. An alternative is to seek other ways to create the same shape, to measure the coordinates from the drawing or do some trial and error until the shape looks right. But you could also use one of the freely available tools to create the 2D sketch and import this sketch into Replicad. Examples of freely available tools that support constraint based modelling are \`Freecad\`  (https://www.freecad.org/), \`Solvespace\` ([[https://solvespace.com](https://solvespace.com/index.pl)) or \`jSketcher\` (https://github.com/xibyte/jsketcher).

* It might be the case that you want to use a pattern or logo to embellish you 3D shape. The author of Replicad has implemented a basic functionality in a website called https://blingmything.sgenoud.com/ that contains this functionality. Unfortunately this functionality is (not yet) included in Replicad. 

One option to import 2D shapes from other softwares is to analyze the files and extract the relevant coordinates. As an example take the shape shown in the image below. This shape consist of two arcs, one with radius 32 mm on the right and one with radius 20 on the left. According to the original drawing this shape is based on, the two arcs are connected with a third arc, but the radius of this arc is not given in the drawing. Using a constraint based drawing tool it turns out that by entering the dimensions and constraints given in the drawing, the shape is fully defined. In the example below the drawing at the left (or top) was created in \`SolveSpace\`, the drawing at the right in \`FreeCad\` (see above). 

<img src="https://github.com/raydeleu/ReplicadManual/assets/38007983/34734cf8-00d8-4168-aef8-1ab47f3837d3" width="450">

<img src="https://github.com/raydeleu/ReplicadManual/assets/38007983/9adb59d6-a7f9-428d-98d7-7687e6b6f4a1" width="450">

SolveSpace supports the option to export the 2D view. Before exporting the shape you have to hide the construction lines (the green lines in the image) and the dimensions. The resulting SVG file then only contains the path of the shape. The SVG file is in fact a text file that can be opened in any text editor. The definition of the contour can be found by looking for the \`path\` statements. For the shape above the following path can be found in the SVG file: 

\`\`\`
<path d='
M5.000 37.000
L97.000,37.000
A32.000,32.000 0 0,0 65.000,5.000
A92.667,92.667 0 0,0 13.991,20.303
A20.000,20.000 0 0,0 5.000,37.000 ' class='s1' />
\`\`\`
For the purpose of clarity each separate statement is shown on a separate line, but in the actual file the statements are all contained in a single line. The elements of the path are identified by single characters. The following table shows that the drawing functions defined by these characters are very similar to the drawing methods available in Replicad. 

| SVG path command                                      | Replicad command                                            |
|-------------------------------------------------------|-------------------------------------------------------------|
|\`M x y\`                                                |\`.movePointerTo([x,y]) or draw([x,y]) \`                      |
|\`m dx dy\`                                              | no equivalent in Replicad other than starting new drawing   | 
|\`L x,y  \`                                              |\`.lineTo([x,y])\`                                             |
|\`l dx,dy\`                                              |\`.line(dx,dy)  \`                                             | 
|\`v y\`                                                  |\`.vLine(dy)\`                                                 |
|\`h x \`                                                 |\`.hLine(dx)\`                                                 |
|\`A rx,ry deg-rotation large-arc?,sweep-positive? x,y\`  |\`.ellipseTo([x,y],rx,ry,deg rotation, long_way?, counter?\`   | 
|\`C x1 y1 x2 y2 x y\`                                    |\`.cubicBezierCurveTo([x,y],p1_ctrl_start,p2_ctrl_end)\`       |   
|\`Q controlX controlY endX endY \`                       |\`.quadraticBezierCurveTo([x,y],[x_ctrl,y_ctrl])\`             |         
|\`q dx_control dy_control dx dy \`                       |\`.quadraticBezierCurve(dx,dy,dx_ctrl,dy_ctrl)\`               |
|\`Z\`                                                    |\`.close()\`                                                   |


Using this translation, the equivalent Replicad code is: 

\`\`\`
const {draw}  = replicad

function main()
{
let contour = draw([5,37])
.lineTo([97,37])
.ellipseTo([65,5],32,32,0,false,false)
.ellipseTo([13.991,20.303],92.667,92.667,0,false,false)
.ellipseTo([5,37],20,20,0,false,false)
.close()
.sketchOnPlane("XY")

return contour}
\`\`\`
The resulting shape in Replicad is shown below. Note that it is drawn upside down and not at the origin, but this can easily be corrected with a rotation and a translation. 

<img src="https://github.com/raydeleu/ReplicadManual/assets/38007983/4598b4a9-7f49-49ba-9c8c-f3fc3a767491" width="500">

In FreeCad you can export the shape in Open CAD format (.oca). The format of this file is very straight forward as for each line two points are given and for each arc three points.  

\`\`\`
#oca file generated from FreeCAD

# edges
L1=P(-92.0 1.2246467986490979e-15 0.0) P(0.0 0.0 0.0)
C2=ARC P(0.0 0.0 0.0) P(-9.372583002030478 22.627416997969522 0.0) P(-32.0 32.0 0.0)
C3=ARC P(-32.0 32.0 0.0) P(-58.627570729148005 28.091902430493363 0.0) P(-83.0091743119266 16.697247706422022 0.0)
C4=ARC P(-83.0091743119266 16.697247706422022 0.0) P(-89.6094219984435 9.481996460700351 0.0) P(-92.0 1.2246467986490979e-15 0.0)
# faces
\`\`\`

The approach to use another program to create a sketch does not always work, as in some cases the file will not contain arcs but pieces of straight lines that approximate a curve. In \`SolveSpace\` this seems the case when the drawing consists of splines or bezier curves instead of circular arcs. In that case converting the SVG is often not practical, as modifications of the resulting shapes with fillets - one of the modifications that cannot be performed in 3D by SolveSpace - often fails on these shapes. In that case you could still use the sketch and determine the location of starting and end points of arcs and curves in the software that you used to create the sketch. 

### 10.2.2 Importing 3D shapes

Replicad offers two basic options to import 3D shapes, namely import of STEP files and import of STL files.

\`\`\`
let shapeFromSTEP = await importSTEP(blobFile)
let shapeFromSTL  = await importSTL(blobFile)
\`\`\`

First it should be noted that these functions are preceded by the instruction \`await\`, as reading the large amount of data takes some time. To make this work within Replicad you have to define the \`main\` function as an asynchronous function, using the statement \`async function main()\` instead of the default \`function main()\`. 
Furthermore, both functions require a blob, a Binary Large Object, as its input. The main issue therefore is how to convert a file into a blob that can be fed to the import functions. 

One of the simplest approaches is to convert the file into a \`base64\` format. Base64 is an encoding of binary code or ASCII text that reduces the number of allowable characters to a standard set. This way the contents of a file can be converted into a single long string of characters. (Without the \`base64\` encoding the string would contain spaces and special characters, making it difficult to represent it as a single string of characters). The string of characters is assigned to a variable, which is then in turn decoded and turned into a \`blob\`.   

Note that on most computers (such as Linux, MacOS and Windows OS) you can encode a file using the terminal command: 

\`\`\`
openssl base64 -A -in <infile> -out <outfile>
// -A is needed to have a single large string without new lines
\`\`\`
The complete contents of the resulting file then have to be entered into the Replicad input file, for example using a statement like:

\`\`\` javascript
let stepFile = " [complete string of characters from base64 file] "
\`\`\`

The resulting string can be quite large, as due to the encoding with less characters the size increases with 33%. The next example demonstrates how this works. The code also demonstrates that if everything goes well, the resulting shape can be modified like any other shape. However, if your inputfile contains multiple shapes this might not work.

\`\`\` javascript
let {importSTEP} = replicad  

async function main()  
{  

let stepFile = "SVNPLTEwMzAzLTIxOwpIRUFERVI7CkZJTEV...C1JU08tMTAzMDMtMjE7Cg=="

// function to convert base64 to blob
const base64ToBlob = async (base64, type = 'text/html') => 
  fetch(\`data:\${type};base64,\${base64}\`)
  .then(res => res.blob())

// create blob from string above
const blobFile = await base64ToBlob(stepFile)

let shape = await importSTEP(blobFile)
console.log(shape) // check that result is DS_Solid
let shapeRounded = shape.clone().fillet(8).mirror("XZ",10)

return [shape,shapeRounded]}
\`\`\`

## 9.1 Define points based on directions and distances

\`\`\` javascript
function Polar(currentPoint,distance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + distance * Math.cos(angleRad);
    newPoint[1]  = currentPoint[1] + distance * Math.sin(angleRad);
    return newPoint
}

function PolarX(currentPoint,xdistance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + xdistance;
    newPoint[1]  = currentPoint[1] + xdistance * Math.tan(angleRad);
    return newPoint
}

function PolarY(currentPoint,ydistance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + ydistance/Math.tan(angleRad);
    newPoint[1]  = currentPoint[1] + ydistance;
    return newPoint
}
\`\`\` 

## 9.2 Circles joined with tangent lines

This function can be used to draw to circle-arcs connected with tangent lines, as an outline for a lever or a droplet. The circle with \`radius1\` is centered on the origin, the second arc is centered along the x-axis at a distance called \`distance\`. 


![Creating a drop shape for a lever](https://github.com/raydeleu/ReplicadManual/blob/main/images/droplet1.png)

\`\`\` javascript 
function dropView(radius1, radius2, distance)
{
    let sinus_angle = (radius1 - radius2) / distance
    let angle = Math.asin(sinus_angle);

    // points of outer contour of the lever
    let p1 = [radius1 * Math.sin(angle), radius1 * Math.cos(angle)];
    let p2 = [distance + radius2 * Math.sin(angle), radius2 * Math.cos(angle)];
    let p3 = [distance + radius2, 0];
    let p4 = [distance + radius2 * Math.sin(angle), - radius2 * Math.cos(angle)];
    let p5 = [radius1 * Math.sin(angle), - radius1 * Math.cos(angle)];
    let p6 = [- radius1, 0 ];

    let dropDrawing = draw(p1)
                    .lineTo(p2)
                    .threePointsArcTo(p4,p3)
                    .lineTo(p5)
                    .threePointsArcTo(p1,p6)
                    .close();
    
    return dropDrawing}
\`\`\`


## Create a polar array 

Many CAD programs offer the function to create a polar array of shapes, for example adding holes in a circular pattern. The following script solves this (copied from https://replicad.xyz/docs/recipes/polar-array)

\`\`\` javascript
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

The code only works properly if: 

* your original shape is centered at the origin [x,y] = [0,0]
* the circular pattern is located around the origin 

The script works for any shape and therefore both for 2D and 3D shapes. In the case of 3D, it will create the copies in the XY plane (as the default rotation is defined around the z-axis). 


## D.1 Three arm bracket

This is the shape from Solidworks Model Mania 2020. I had to make some adjustments to the model to make it work. The largest difference is that the cutout in each arm does end 1 mm before reaching the cylindrical part in the middle. 

![image](https://github.com/sgenoud/replicad/assets/38007983/101065c2-4504-4bcc-a2fd-a462ac15cdf8)

The model files can be found here: 
https://blogs.solidworks.com/tech/wp-content/uploads/sites/4/Model-Mania-2020-Phase1-drawing.png
https://blogs.solidworks.com/tech/wp-content/uploads/sites/4/Model-Mania-2020-Phase2-drawing.png

As usual the fillets posed the biggest challenge. I solved this by rounding the cutout first before subtracting it from the main shape. Furthermore I cut the holes after filleting the shape to avoid the need to select the edges explicitly. 

The code below contains some failed fillet experiments. The red shape shows the part that I used to create the cutouts in each arm. The green box shows a selection box that I tried to select only a few edges. Strangely enough this failed, whereas filleting the whole shape and then cutting the holes that should not be rounded succeeded. Note that I still had to restrict the rounding within a box (using the \`e.InBox\` method to avoid rounding the bottom of the shape. 

\`\`\` javascript
// Three arm as created for Model Mania 2020
// https://blogs.solidworks.com/tech/wp-content/uploads/sites/4/Model-Mania-2020-Phase1-drawing.png
// https://blogs.solidworks.com/tech/wp-content/uploads/sites/4/Model-Mania-2020-Phase2-drawing.png
// free interpretation as not all fillets were possible in Replicad
// and cutout up to central cylinder posed a problem

function main({Sketcher, 
sketchCircle,Lever,
makeCylinder,
makeBaseBox},{})
{

let r1  = 11;
let r2  = 6;
let d   = 35;
let t   = 3;
let h   = 22;
let fl  = 30;
let bb = 16/2; 
let sb = 4.5/2;
let cb = 8/2; 

// function to create a lever consisting of two circles connected with tangent lines 
// 
// radius1 = radius of circle that is located around the origin
// radius2 = radius of circle that is located at distance D along x-axis
// distance = distance between the two circles
// leverheight = distance over which lever is extruded in z-direction
// 
// note that this function creates a closed shape. If you want holes you have to create two cylinders at 
// the correct position, extrude these a bit more than the leverheight and subtract these from the shape.  

function Lever(radius1, radius2, distance, leverHeight)
{
    let sinus_angle = (radius1 - radius2) / distance
    let angle = Math.asin(sinus_angle);

    // points of outer contour of the lever
    let p1 = [radius1 * Math.sin(angle), radius1 * Math.cos(angle)];
    let p2 = [distance + radius2 * Math.sin(angle), radius2 * Math.cos(angle)];
    let p3 = [distance + radius2, 0];
    let p4 = [distance + radius2 * Math.sin(angle), - radius2 * Math.cos(angle)];
    let p5 = [radius1 * Math.sin(angle), - radius1 * Math.cos(angle)];
    let p6 = [- radius1, 0 ];

    let sketchLever = new Sketcher("XY").movePointerTo(p1)
                    .lineTo(p2)
                    .threePointsArcTo(p4,p3)
                    .lineTo(p5)
                    .threePointsArcTo(p1,p6)
                    .close();
              
    let leverBody = sketchLever.extrude(leverHeight);
       
    return leverBody
}


// function to create lever with holes with standard wallthickness around the holes
// radii refer to outer radii, the holes will be radius - wallThickness
// uses the function lever to create the basic shape 

function leverHoles(radius1,radius2,distance,leverHeight,wallThickness)
{ 
    let leverBody = Lever(radius1,radius2,distance,leverHeight);

    let orig_hole  = sketchCircle(radius1-wallThickness).extrude(leverHeight + 10);
    let dist_hole =  sketchCircle(radius2-wallThickness).extrude(leverHeight + 10).translate([distance,0,0]);
    let lever   = leverBody.cut(orig_hole)
    lever       = lever.cut(dist_hole);
    return lever
}

// function to cut part out of lever to make it lighter
// generally the size of the radii is equal to the size of the holes in the lever


function cutLever(r1,r2,d,h,ts,th)
{
    let cLever = Lever(r1-ts,r2,d,h).translate([0,0,th]);
    cLever=cLever.cut(makeCylinder(r1+ts,h+2*th,[0,0,0],[0,0,1]));
    cLever=cLever.cut(makeCylinder(r2+ts,h+2*th,[d,0,0],[0,0,1]));
    return cLever
}

// create three arms, fuse them together and round the edges in z-direction

let arm1 = Lever(r1,r2,d,h);
let arm2 = Lever(r1,r2,d,h).rotate(120,[0,0,0],[0,0,1])
let arm3 = Lever(r1,r2,d,h).rotate(240,[0,0,0],[0,0,1])
let threeArm = arm1.fuse(arm2);
threeArm = threeArm.fuse(arm3).fillet(fl,(e)=>e.inDirection("Z"));

// cut the three arms so that they slope with 22 degrees towards the end

let side = new Sketcher("XZ").movePointerTo([41,6])
.lineTo([50,6]).lineTo([50,30]).lineTo([0,30])
.lineTo([0,22]).lineTo([11,22]).lineTo([11,6+(30*Math.sin(22*Math.PI/180))])
.close()

let sideCutter = side.revolve()
// NOTE: sideCutter is rotated to avoid edge over first arm!!!
sideCutter = sideCutter.rotate(60,[0,0,0],[0,0,1]);
threeArm = threeArm.cut(sideCutter,false,false)

// fillet the top edges, leaving out the central axle
threeArm = threeArm.fillet(1,(e)=>e.inBox([50,50,2],[-50,-50,20]));

// Phase 2: make arms lighter, note that fillet is applied in this stage already
let cutLever1 = cutLever(bb+1,cb,d,h,3,4).fillet(1);
let cutLever2 = cutLever(bb+1,cb,d,h,3,4).rotate(120,[0,0,0],[0,0,1]).fillet(1);
let cutLever3 = cutLever(bb+1,cb,d,h,3,4).rotate(240,[0,0,0],[0,0,1]).fillet(1);
threeArm = threeArm.cut(cutLever1);
threeArm = threeArm.cut(cutLever2);
threeArm = threeArm.cut(cutLever3);

let selBox = makeBaseBox(5,20,12).translate([22.5,0,9])
// experiments to round edges
//threeArm = threeArm.fillet(0.4,(e)=>e.inBox([20,10,3],[25,0,15]));
//threeArm = threeArm.fillet(0.7,(e)=>e.inDirection("Z"));
//threeArm = threeArm.fillet(0.7,(e)=>e.inPlane("XY"));
threeArm = threeArm.fillet(1,(e)=>e.inBox([50,50,2],[-50,-50,21]))

let smallBore1 = makeCylinder(sb,h,[0,0,0],[0,0,1]).translate([35,0,-5]).rotate(120,[0,0,0],[0,0,1])
let smallBore2 = makeCylinder(sb,h,[0,0,0],[0,0,1]).translate([35,0,-5]).rotate(240,[0,0,0],[0,0,1])
let smallBore3 = makeCylinder(sb,h,[0,0,0],[0,0,1]).translate([35,0,-5]).rotate(360,[0,0,0],[0,0,1])
threeArm = threeArm.cut(smallBore1)
threeArm = threeArm.cut(smallBore2)
threeArm = threeArm.cut(smallBore3)

let counterBore1 = makeCylinder(cb,h,[0,0,0],[0,0,1]).translate([35,0,4])
let counterBore2 = makeCylinder(cb,h,[0,0,0],[0,0,1]).translate([35,0,4]).rotate(120,[0,0,0],[0,0,1])
let counterBore3 = makeCylinder(cb,h,[0,0,0],[0,0,1]).translate([35,0,4]).rotate(240,[0,0,0],[0,0,1])
threeArm = threeArm.cut(counterBore1)
threeArm = threeArm.cut(counterBore2)
threeArm = threeArm.cut(counterBore3)

// create holes for axles
let bigBore = sketchCircle(8).extrude(40).translate([0,0,-10]);
threeArm = threeArm.cut(bigBore);

let shapeArray =[{shape: threeArm, color: "steelblue"}
//,{shape: sideCutter, color:"grey", opacity:0.5}
,{shape: cutLever1, color:"red", opacity:0.5}
,{shape: selBox, color:"green", opacity:0.5}
]

return shapeArray;

}

\`\`\`

## D.2 Angled bracket

I created the angled bracket defined for the SolidWorks Model Mania 2001 challenge. It was indeed a challenge to model this with Replicad. I started out with combining shapes like cylinders and boxes,  but finally returned to an approach with drawings (sketches). As Solidworks supports constrained-based modelling the dimensions provided in the drawing https://blogs.solidworks.com/tech/wp-content/uploads/sites/4/Model-Mania-2001-Phase-1.jpg are not suited to create a drawing. Therefore I created three functions that allow to define points using angles and distances, either the polar distance or one of the X or Y distances. Using this function I defined points around the contour of each drawing. 

The following drawing created in SolveSpace illustrates the drawing that I needed to recreate in Replicad. The part is called "flange" in the code below.

![mm20012-side](https://github.com/sgenoud/replicad/assets/38007983/b3f4abfa-0c16-4d79-9f92-3499b5bccfb0)

I did not solve the following issues: 

* The rib, shown in the drawing below, is defined by a height of 26 mm, following the curve of the flange and then a curve with radius 55 mm to join towards the base of the shape. I used the \`tangentArc\` for this curve, but this does not allow to define a radius. I eyeballed the length of the straight segment between the two curves and used this to define the point where the \`tangentArc\` starts. I plan to define some functions to take the tedious math out of these problems. 

![mm20012-rib](https://github.com/sgenoud/replicad/assets/38007983/e4e2dbca-fde3-4219-9190-df573f4df005)

* After many attempts I was not able to create the fillets between the base block, the flange and the rib. The site https://github.com/alexneufeld/FreeCAD_modelmania/tree/main/2001 shows that it should be possible with FreeCad (based on OpenCascade), so I must be doing something wrong. 

Here is my end-result: 

![mm2001-rc-v2](https://github.com/sgenoud/replicad/assets/38007983/ae7ee1ea-ca23-4fae-85a1-ccd0cdf84baf)

And here is the code: 

\`\`\`javascript
const {draw,makeCylinder,makeBaseBox} = replicad

// Number of functions to make drawing easier
function Polar(currentPoint,distance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + distance * Math.cos(angleRad);
    newPoint[1]  = currentPoint[1] + distance * Math.sin(angleRad);
    return newPoint
}

function PolarX(currentPoint,xdistance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + xdistance;
    newPoint[1]  = currentPoint[1] + xdistance * Math.tan(angleRad);
    return newPoint
}

function PolarY(currentPoint,ydistance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + ydistance/Math.tan(angleRad);
    newPoint[1]  = currentPoint[1] + ydistance;
    return newPoint
}

function main()
{
// Model Mania 2001 part 1

// break part apart into several components

// cylinder
let startPoint = [-146,0,64];
let cylinderAngleDeg = 45
let cylinderAngle = cylinderAngleDeg*Math.PI/180;
let cylinderDirection = [Math.cos(cylinderAngle),0,Math.sin(cylinderAngle)]
let cylinderHeight = 32; 
let cylinderOuterRadius = 52/2;
let cylinderInnerRadius = 32/2

let cylinderOuter = makeCylinder(cylinderOuterRadius,
cylinderHeight+1,startPoint,cylinderDirection) 
// add millimeter to intrude into the flange
let cylinderInner = makeCylinder(cylinderInnerRadius,
cylinderHeight*2,startPoint,cylinderDirection)
cylinderOuter = cylinderOuter.cut(cylinderInner.clone())
// clone the inner cylinder as we want to re-use it to cut the flange

// base
let baseHeight = 20;
let baseWidth = 96;
let baseLength = 64;
let baseBlock = makeBaseBox(baseHeight,baseWidth,baseLength)
.translate([-baseHeight/2,0,0])

// flange
let flangeWidth = 64;
let flangeRoundingTop = 64/2;
let flangeThickness = 12;
let flangeRounding = 15;
let flangeLength = 146
let pStart = [startPoint[0],startPoint[2]] // 2D representation

let p1 = Polar(pStart,cylinderHeight,cylinderAngleDeg)   // middle of cylinder
let p2 = Polar(p1,flangeRoundingTop,cylinderAngleDeg+90) // clockwise around
let p3 = Polar(p2,flangeThickness,cylinderAngleDeg)
let p4 = PolarY(p3,-p3[1]+baseLength,cylinderAngleDeg-90)   // note that Dy is negative! 
let p5 = [-10,baseLength]
let p6 = [-10,baseLength-flangeThickness]
let p7 = PolarY(p1,-p1[1]+(baseLength-flangeThickness),cylinderAngleDeg-90)

let flange = draw(p1)
.lineTo(p2)
.lineTo(p3)
.lineTo(p4)
.customCorner(flangeRounding)
.lineTo(p5)
.lineTo(p6)
.lineTo(p7)
.customCorner(flangeRounding+flangeThickness)
.close()
.sketchOnPlane("XZ")
.extrude(flangeWidth)
.translate([0,flangeWidth/2,0])
.fillet(31.99,(e)=>e.atAngleWith("X",45).ofLength(flangeThickness))

// rib 
let ribHeight = 26;
let ribRounding = 55;

let r1 = Polar(pStart,cylinderHeight-ribHeight,45)
let r2 = PolarY(r1,-r1[1]+(64-12-26),-45)
let r8 = Polar(r1,ribHeight,45)
let r3 = [r2[0]+25,r2[1]]
let r4 = [-20,0]
let r5 = [-10,0]
let r6 = [-10,52]
let r7 = PolarY(r8,+52-r8[1],-45)

let rib = draw(r1)
.lineTo(r2)
.customCorner(53)
.lineTo(r3)
.tangentArcTo(r4)  // not possible to enter a ribRounding, depends on r3[1]
.lineTo(r5)
.lineTo(r6)
.lineTo(r7)
.customCorner(27)
.lineTo(r8)
.close()
.sketchOnPlane("XZ")
.extrude(12)
.translate([0,6,0])

// M6 outer 11,20mm depth 6mm dia 6.8 mm
let holeSpacing = 60;
let holeMarginSide = 18;
let holeRadius = 6/2;
let holeOuterRadius = 10/2;
let holeMarginFront = 32;

let holeCutter = makeCylinder(holeRadius,baseHeight*4,[0,-holeSpacing/2,holeMarginFront],[-1,0,0])
let holeCutter2 = holeCutter.clone().translate([0,holeSpacing,0])
baseBlock = baseBlock.cut(holeCutter).cut(holeCutter2) 

let counterCutter = makeCylinder(holeOuterRadius,baseHeight*4,[-14,-holeSpacing/2,holeMarginFront],[-1,0,0])
let counterCutter2 = counterCutter.clone().translate([0,holeSpacing,0])
baseBlock = baseBlock.cut(counterCutter).cut(counterCutter2) 

baseBlock = baseBlock.fuse(flange).fuse(rib).fuse(cylinderOuter)
baseBlock = baseBlock.cut(cylinderInner)
.fillet(2,(e)=>e.inDirection("X"))
//.fillet(2,(e)=>e.inDirection("Y"))
.fillet(2,(e)=>e.atAngleWith("X",45))
//.fillet(1,(e)=>e.inBox([0,-10,50],[-40,10,60]))
.rotate(90,[0,0,0],[0,1,0])

return [{shape:baseBlock, color: "steelblue"}]
}
\`\`\`

## D.3 Plunge watering can

<img width="539" alt="plunge-v6" src="https://user-images.githubusercontent.com/38007983/174858404-ee5f39ba-4d5c-4db0-8d36-e536db95e295.png">

I created this "Plunge" water carafe for plants designed by Robert Bronwasser (see https://www.robertbronwasser.com/project/spring/) in Replicad. It is not an exact copy but demonstrates the capabilities and partly also the limitations of the library. The model consists of three main parts which I called the "body", the "filler" and the "spout". The cone-like body is created as a body of revolution. The filler is built as a loft between three wires, where the middle wire coincides with the top of the body. The spout is a small cylinder at an angle. The shapes are combined in a boolean fuse operation and then filleted. I tried to create a hollow shape by identifying the filler opening and the spout opening, but I could not get that to work. So in the end I created a shell by removing only the opening of the spout. The filler was then opened using a "cutter". 

The code and some remarks regarding kernel errors are shown below"


\`\`\`\` javascript
 // Model of the Plunge watering carafe designed by Robert Bronwasser

function main({
                Sketcher,
                sketchCircle,
                sketchFaceOffset,
                makeCylinder,
                sketchRectangle,
                FaceFinder,
            })
{

// side profile of the bottom of the carafe
let p0 = [0,0]
let p1 = [20,0]
let p2 = [30,5]
let p3 = [30,8]
let p4 = [8,100]   // radius of the top at 100 mm is 8 mm
let p5 = [0,100]

let sideview = new Sketcher("XZ")
.lineTo(p1)
.lineTo(p2)
.lineTo(p3)
.lineTo(p4)
.lineTo(p5)
.close()

// sketch is created on XZ plane, revolve is per default around z-axis
let body = sideview.revolve()

// create cross sections of the filler for the carafe
//          used a workaround to rotate and translate the sketch to the required position
let fillHole = sketchCircle(12).face().rotate(-20,[0,0,0],[0,1,0]).translate([-35,0,135])
fillHole = sketchFaceOffset(fillHole,0);
let topBody = sketchCircle(8).face().translate([0,0,100]);   // radius 8 at 100 mm 
topBody = sketchFaceOffset(topBody,0); 
let fillBottom = sketchCircle(9).face().rotate(20,[0,0,0],[0,1,0]).translate([0,0,80]); 
fillBottom = sketchFaceOffset(fillBottom,0); 

// filler shape is created as a loft between the three wires
let filler    = fillHole.loftWith([topBody,fillBottom],{ruled: false});

// create spout, a cylinder with radius 5, length "lengthSpout"
let angleSpout = 45
let lengthSpout = 70
let spout = makeCylinder(5,lengthSpout,[0,0,0],[0,0,1]).rotate(angleSpout,[0,0,0],[0,1,0]).translate([0,0,100])

// // union the main body with the filler and fillet the junction with radius 30
let plunge = body.fuse(filler);
plunge = plunge.fillet(30,(e)=>e.inPlane("XY",100)) 

// union the shape with the sprout and fillet the junction with radius 10
plunge = plunge.fuse(spout).fillet(10,(e)=>e.inBox([20,20,100],[-20,-20,120]));

// Create a shell 
let pointFiller = [-35,0,135]
let spoutOpening = []
spoutOpening[0] = Math.cos(angleSpout*Math.PI/180)*lengthSpout
spoutOpening[1] = 0
spoutOpening[2] = 100 + Math.sin(angleSpout*Math.PI/180)*lengthSpout

const orifices = new FaceFinder().either([
    (f) => f.containsPoint(pointFiller),
    (f) => f.containsPoint(spoutOpening)]);

// plunge = plunge.shell(-0.5,(f)=>f.inBox([20,20,130],[[-20,-20,155]])); // Kernel Error
// plunge = plunge.shell(-0.5,(f)=>f.containsPoint(pointFiller)); // works!
// plunge = plunge.shell(-0.5,orifices); // Kernel Error
plunge = plunge.shell(-1,(f)=>f.containsPoint(spoutOpening)); // works!

// create cutter boxes 
//      approach to open up another face by subtracting a box from the shape
let cutterFiller = sketchRectangle(40,30).extrude(20).rotate(-20,[0,0,0],[0,1,0]).translate([-30,0,135])
// let cutterSpout = sketchRectangle(40,30).extrude(20).rotate(10,[0,0,0],[0,1,0]).translate([48,0,145])

plunge = plunge.cut(cutterFiller)
// plunge = plunge.cut(cutterSpout)  // resulted in Kernel error without the shell command

// let plungeInner = makeOffset(plunge,-1)  // resulted in Kernel error
// let hollowPlunge = plunge.cut(plungeInner)  // not possible as makeOffset failed

let shapeArray = [
{shape: plunge, name: "plunge", color:"steelblue"}, 
// {shape: fillHole, color:"black"},   // note that after the loft these sketches are deleted? 
// {shape: topBody, color:"black"},
// {shape: fillBottom, color: "black"},
// {shape: filler, color: "yellow"},
// {shape: sprout, color: "blue"},
// {shape: cutterFiller},
// {shape:cutterSpout},
// {shape: test}
]

return shapeArray
}

\`\`\`\`


<img width="337" alt="plunge_parts_2,png" src="https://user-images.githubusercontent.com/38007983/175698315-75023470-fa37-4d2c-853d-b06dadee22d1.png">

Using the new option to display a part with opacity I created this image that illustrates some parts that were used to construct the final shape. This option can be very useful to understand how parts are overlapping and why a boolean operation between the shapes could fail. The code above was adapted like this: 

\`\`\`\` javascript 
let shapeArray = [
//{shape: plunge, name: "plunge", color:"steelblue", opacity: 0.5}, 
// {shape: fillHole, color:"black"},   // note that after the loft these sketches are deleted? 
// {shape: topBody, color:"black"},
// {shape: fillBottom, color: "black"},
{shape: body, color: "orange",opacity:0.5},
{shape: filler, color: "red"},
{shape: spout, color: "blue"},
{shape: cutterFiller, color: "green", opacity: 0.5},
// {shape:cutterSpout},
// {shape: test}
]
\`\`\`\`
## D.4 Slotted lever

This slotted lever was created using the design from Solidworks Model Mania, https://blogs.solidworks.com/tech/wp-content/uploads/sites/4/Model-Mania-2008-Phase-1.jpg.  

![image](https://github.com/sgenoud/replicad/assets/38007983/d1bb8b31-f6dd-4b1d-9bfd-d51d0de9765f)

I used an intersection of drawings to create the circular slot. The slot is based on an intersection between to circles and a circle-segment. The keyway for the main axle, called \`axleHoleShape\` is created by fusing two drawings. The shape is missing some fillets as OpenCascade was not able to create these without error. The code still contains two lines for fillets. By uncommenting one of the lines you can check the result, adding both fillets at the same time results in a kernel error.  

\`\`\` javascript
const { draw, drawCircle, drawRectangle} = replicad;

const main = () => {

// dimensions of slotted lever
let axleHoleRadius = 22/2;
let axleRadius = 35/2;
let keySlotHeight = 6;
let keySlotWidth  = 2.50;  
let axleWidth = 30;
let dist = 100;
let slotOuterRadius = 12
let slotAngle = 30/180*Math.PI
let dh = axleRadius - slotOuterRadius
let minAngle = Math.asin(-dh/dist);
let maxAngle = minAngle + slotAngle;
let startPoint = [Math.cos(minAngle)*(dist+slotOuterRadius),Math.sin(minAngle)*(dist+slotOuterRadius)]
let endPoint = [Math.cos(maxAngle)*(dist+slotOuterRadius),Math.sin(maxAngle)*(dist+slotOuterRadius)]
let startPointCircle = [Math.cos(minAngle)*(dist),Math.sin(minAngle)*(dist)]
let endPointCircle = [Math.cos(maxAngle)*(dist),Math.sin(maxAngle)*(dist)]

let axle = drawCircle(axleRadius)
.sketchOnPlane("XZ").extrude(axleWidth);

let plate = draw()
.movePointerTo([0,-axleRadius+6])
.lineTo([0,-axleRadius])
.lineTo([100,-axleRadius])
.lineTo([90,-axleRadius+6])
.lineTo([38,-axleRadius+6])
.tangentArc(-5,30)
.tangentArc(50,28)
.polarLineTo([100,33.5])
.ellipseTo([0,axleRadius],175,175)
.lineTo([0,axleRadius-6])
.ellipseTo([0,-axleRadius+6],11,11)
.close().sketchOnPlane("XZ",3).extrude(14)

let slotOuter = drawCircle(dist+slotOuterRadius)
let slotInner = drawCircle(dist-slotOuterRadius)
let segment = draw().lineTo(startPoint).line(0,50).lineTo(endPoint).close()
let slotRing = slotOuter.cut(slotInner)  
let slotSegment = slotRing.intersect(segment)
let slotRoundStart = drawCircle(slotOuterRadius).translate(startPointCircle)
let slotRoundEnd = drawCircle(slotOuterRadius).translate(endPointCircle)
slotSegment = slotSegment.fuse(slotRoundStart)
slotSegment = slotSegment.fuse(slotRoundEnd)
let slotSegmentInner = slotSegment.offset(-6)
let slotSegmentOuter = slotSegment.cut(slotSegmentInner).sketchOnPlane("XZ",2).extrude(16)

let axleHole = drawCircle(axleHoleRadius)
let keySlot  = drawRectangle(2*keySlotWidth,keySlotHeight)
.translate(-axleHoleRadius,0)
let axleHoleShape = axleHole.fuse(keySlot).sketchOnPlane("XZ",-10)
let axleCutter = axleHoleShape.extrude(30+20)
axle = axle.cut(axleCutter)

axle = axle.fuse(slotSegmentOuter)
axle = axle.fuse(plate).fillet(0.8,(e)=>e.inPlane("XZ",2))
axle = axle.fillet(0.8,(e)=>e.inPlane("XZ",2+16))
//axle = axle.fillet(1,e=>e.containsPoint([0,-17,17.5]))
//axle = axle.fillet(1,e=>e.containsPoint([0,3,17.5]))

return [
//{shape: axleCutter, color: "silver", opacity: 0.6},
{shape: axle, color: "steelblue"}
];
};
\`\`\`



## D.5 Holder for GPS receiver

After almost losing my GNS  receiver, I decided to design a simple holder to hang the receiver on a lanyard. 

<img width="690" alt="image" src="https://github.com/sgenoud/replicad/assets/38007983/011d9314-ed00-4d82-a30d-57a29113cd21">

The code is: 

\`\`\` javascript

const defaultParams = {             
    // dimensions of GNS3000 GPS receiver
    gnsLength:     79.25,
    gnsWidth:      45.25,
    gnsHeight:      11.4,
    fit:            1.0,  // tolerance to fit receiver in holder
    thickness:      2.0,  // thickness of holder around receiver
    portionTop:     0.8, // height of holder compared to height of receiver, max 0.87    
    portionSide:    0.85,  // percentage of side cutout compared to length
    assimSide:      0    // asymmetry of side cutout (and increase in length)
    }

const r = replicad

function main(
   {  },   // functions used in main, can be empty if r.function notation is used
   { gnsLength, gnsWidth, gnsHeight, fit, 
   thickness, portionTop, portionSide,assimSide} )  // parameters to adjust the model

  { 
      let length = gnsLength + fit + assimSide;
      let width  = gnsWidth + fit;
      let height = gnsHeight + fit;
      let radius = gnsHeight/2;

    // create shape of GNS3000 receiver  
    let receiverBody = r.makeBaseBox(length,width,height)
    .fillet(radius,(e)=>e.inDirection("X"));
    
    // create holder by adding thickness to the shape of the GNS receiver
    let holder = r.makeBaseBox(length+2*thickness,width+2*thickness,height+2*thickness)
    .fillet(radius+thickness,(e)=>e.inDirection("X"))
    .translate(0,0,-thickness)
      
    // number of shapes to create cut-outs in the holder  
    let cutterTop = r.makeBaseBox(length+4*thickness, width+4*thickness, height)
    .translate(0,0,portionTop*height)
    let cutterSide= r.makeBaseBox(length*portionSide, width+4*thickness, height)
    .translate(assimSide,0,4)
    let cutterBottom = r.makeBaseBox(length,width*0.8,height)
    .fillet(3,(e)=>e.inDirection("X"))
    .translate(length/2,0,2.0)

    // create two holes for a lanyard
    let cylLength = thickness*10  // length of drill for lanyard holes
    let cylRad    = 2             // radius of drill for lanyard holes 
    let holeDist = 7             // distance between lanyard holes
    holeDist = holeDist/2        // half distance for symmetrical holes
    let cutterLanyardL = r.makeCylinder(cylRad,cylLength,[-length/2-cylLength/2,holeDist,5],[1,0,0])
    let cutterLanyardR = r.makeCylinder(cylRad,cylLength,[-length/2-cylLength/2,-holeDist,5],[1,0,0])
    let cutterLanyard = r.makeCompound([cutterLanyardL,cutterLanyardR])

    
    holder = holder.cut(receiverBody)
    holder = holder.cut(cutterTop)
    holder = holder.cut(cutterSide)
    holder = holder.cut(cutterBottom)
    holder = holder.cut(cutterLanyard)
    holder = holder.fillet(2.5,(e)=>e.inBox([length/2-5,50,3],[-length/2+5,-50,3+height]).inDirection("Y"))
    holder = holder.fillet(0.5)
    holder = holder.translate(0,0,thickness)

    let shapeArray = [
        {shape: receiverBody, name:"receiver", color:"grey" },
        {shape: cutterTop, name:"cutterTop", color: "green" , opacity: 0.5},
        {shape: cutterSide, name:"cutterSide", color: "green", opacity:0.5},
        {shape: cutterBottom, name:"cutterBottom", color: "green", opacity:0.5},
        {shape: cutterLanyard, name:"cutterLanyard", color: "green", opacity:0.5},
        {shape: holder, name:"holder", opacity: 1.0},
    ]   

    return  shapeArray
   }

\`\`\`

I tried the model earlier in CascadeStudio as I am a little bit more familiar with that environment. 

![image](https://github.com/sgenoud/replicad/assets/38007983/dafaa572-68c3-493c-bed1-9732fcbb10dc)

As I struggled with creating nice rounded edges on the top of the holder, I took the opportunity to remodel the part in Replicad. Although initially I had more success, selecting edges in Replicad was also difficult. I used the  \`\`\`inBox\`\`\` edge selection together with the \`\`\`inDirection\`\`\` statement for the edges on the side. At the end I rounded all edges with a small radius. 
However, I wonder how in Replicad a selection of just the outer edge would work. See the example in CascadeStudio  below: 

![image](https://github.com/sgenoud/replicad/assets/38007983/71e7d709-83dd-4041-b1bb-1e8f20f53928)

The new WorkBench supports the display of edge identifiers, but the \`\`\`inList\`\`\` does not seem to work for rounding edges. I still have to experiment whether the \`\`\`containsPoint\`\`\` would work. 

<img width="540" alt="image" src="https://github.com/sgenoud/replicad/assets/38007983/899e9b08-81fe-4a9d-adc8-62614d46b426">

Here is a second model for a holder for the GPS receiver. The first model required some force to click the receiver into the holder. In this second version the idea is that the receiver can slide into the holder from the top. I removed the top part from the holder so that the holder can be printed on a 3D printer without any supports. Furthermore having an unobstructed topside might aid the reception of the GPS signal. 

![image](https://github.com/sgenoud/replicad/assets/38007983/6df8aca1-b8a1-4207-a4ec-d2f9721462c5)

The code is listed below. Note that I experimented with several \`Edgefinders\` to create fillets. I used \`inDirection\`, \`inPlane\`, \`containsPoint\`, which all seem to work fine. The option \`containsPoint\` only works if the location of a point on the edge is known very accurately. Just using the coordinates displayed in the workbench upon highlighting a specific edge does not always work. The better approach is to pick a point that can be derived directly from the dimensions entered by the user. 

\`\`\` javascript


const r = replicad

const main = () => {

  let lx = 45.25    // width of gns receiver
  let ly = 79.25;   // length of gns receiver
  let lz = 11.4;    // thickness of gns receiver
  let lt = 0.5 ;    // tolerance for fit around the receiver    
  let th = 2   ;    // thickness of holder around the receiver
  
  let wholder = 20  ;    // width of lanyard holder
  let yholder = 10  ;    // amount that holder sticks out of body
  let rlanhol = 2   ;    // radius of lanyard hole
  let ycut   = 0.6  ; // portion of side length to be cut
  let rlandist = 7  ; // distance between two holes for lanyard, set to 0 for single hole  

  // add tolerances to the dimensions of object to be held
  lx = lx + lt; 
  ly = ly + lt;
  lz = lz + lt; 

  // shape of GNS receiver
  let receiver = r.makeBaseBox(lx,ly,lz)
  .fillet(((lz-lt)/2),(e)=>e.inDirection("Y"))
  .translate([0,0,th])

  // shape of object to be held, length increased to cut upper part
  let hollow = r.makeBaseBox(lx,ly+2*th,lz)
  .fillet(((lz-lt)/2),(e)=>e.inDirection("Y"))
  .translate([0,th,th])

  // shape of holder
  let shape = r.makeBaseBox(lx+2*th,ly+2*th,lz+2*th)
  .fillet((lz+2*th-lt)/2,(e)=>e.inDirection("Y"))

  let lanyardholder = r.makeBaseBox(wholder,ly+(2*th),th).translate([0,yholder,0])
  shape = shape.fuse(lanyardholder)
  
  // define two objects to cut away parts of the holder
  let cutter = r.makeBaseBox(lx*1.2,ly*ycut,lz*2).translate([0,0,2*th])
  cutter = cutter.fillet(5,(e)=>e.inDirection("X"))
  let cutterTop = r.makeBaseBox(lx*1.2,ly*1.2,lz).translate([0,0,(lz+2*th)*0.87])

  // create hollow holder with cutout on side
  let shape1 = shape.cut(hollow)
  let shapeUnrounded = shape1.cut(cutter)

  // now round the outer edge of the cutout
  // do this first as in this state you can select a complete loop with one point
  let shapeRounded = shapeUnrounded
  .fillet(1.0,(e)=>e.containsPoint([0, ly*ycut/2 , lz+2*th]))

  // to round the holder for the lanyard we combine two finders 
  // selecting first the edges in the z direction and the out of 
  // these only select the ones at the proper distance
  shapeRounded = shapeRounded.fillet(0.8*wholder/2,(e)=>e.inDirection("Z").inPlane("XZ",-(((ly+2*th)/2)+yholder)))
 
  let lanyardCutterL = r.makeCylinder(rlanhol,th*4,[rlandist/2,ly/2+yholder/2+th,-2*th],[0,0,1])
  let lanyardCutterR = r.makeCylinder(rlanhol,th*4,[-rlandist/2,ly/2+yholder/2+th,-2*th],[0,0,1])
  shapeRounded = shapeRounded.cut(lanyardCutterL)
  shapeRounded = shapeRounded.cut(lanyardCutterR)

  // now cut the top part of the holder 
  // as this overhang is difficult for the 3D printer,
  // then  round all remaining edges with a smaller radius
  shapeRounded = shapeRounded.cut(cutterTop).fillet(0.6)

  let shapeArray = 
  [ 
  {shape: receiver, name: "receiver", color: "dimgrey", opacity: 0.8},   
  {shape: shapeRounded, name: "holder", color: "steelblue", opacity: 1.0},
  ]
    
return shapeArray
  }
\`\`\`

As I wanted to create a honeycomb pattern in my model for a GPS holder, I tried different approaches: 
* using a modifier in PrusaSlicer
* using the blingmything app
* using the library presented above

The modifier approach worked fine but did not allow me to achieve a nice symmetrical pattern. Furthermore it allowed only limited control over the geometry of the pattern. The pattern just replicates what would otherwise be the fill pattern for the 3D print. 
The app at blingmything creates a nice symmetrical pattern and also allows to adjust the dimensions of the pattern. But it works on complete faces. The library presented above has the same drawback. 
As I was not able to figure out how I could modify the library, I went the hard way:  

![image](https://github.com/sgenoud/replicad/assets/38007983/f3d35f28-4895-4c06-89d2-8d1e7220c5f7)

This model is created by using a hexagonal column to create a hole, each time intersecting this column with a retangular volume before subtracing it from the shape. The result is as I wanted, but it takes some time to calculate. Using the method of the library the result appears much faster, so there is probably a way to combine the shapes first and then subtracting it in a single operation. 

The code to the shape above is: 

\`\`\` javascript
// Experiment to create a holder for GPS Receiver
// added code to create honeycomb pattern 
// within a rectangular shape

const r = replicad

const main = () => {

  // Dimensions of the GPS receiver
  let lx = 45.25;      // width of gns receiver
  let ly = 79.25;      // length of gns receiver
  let lz = 11.4;       // thickness of gns receiver
  let lt = 0.5 ;       // tolerance for fit around the receiver    
  
  let th = 2   ;       // thickness of holder around the receiver
  let wholder = 20  ;    // width of lanyard holder
  let yholder = 10  ;    // amount that holder sticks out of body

  let rlanhol = 2   ;    // radius of lanyard hole
  let ycut    = 0.6  ; // portion of side length to be cut

  let rlandist = 0  ; // distance between two holes for lanyard, set to 0 for single hole  
  
  // code to create a hexagon face 
  function Hexagon(size)
  { 
    let sketchHexagon 
    for(let i = 0 ; i <= 5 ; i += 1)
    {
        const angle = i * 2 * Math.PI / 6
        const xvalue = size * Math.cos(angle);
        const yvalue = size * Math.sin(angle);
        const point = [xvalue,yvalue];

        if (i === 0){
            sketchHexagon = new r.Sketcher("XY",-1).movePointerTo(point)
        }
        else {
            sketchHexagon.lineTo(point)
        }    
    }
    return sketchHexagon.close()
    }

    // code to create a hexagonal column, adding height to hexagon face
    function hexColumn(size,height)
    {
      return Hexagon(size).extrude(height);
    }

  // add tolerances to the dimensions of object to be held
  lx = lx + lt; 
  ly = ly + lt;
  lz = lz + lt; 

  // shape of GNS receiver
  let receiver = r.makeBaseBox(lx,ly,lz)
  .fillet(((lz-lt)/2),(e)=>e.inDirection("Y"))
  .translate([0,0,th])

  // shape of object to be held, length increased to cut upper part
  let hollow = r.makeBaseBox(lx,ly+2*th,lz)
  .fillet(((lz-lt)/2),(e)=>e.inDirection("Y"))
  .translate([0,th,th])

  // shape of holder, selected only top edges for filleting
  // so that the bottom is flat, which is better for 3D printing without supports
  let shape = r.makeBaseBox(lx+2*th,ly+2*th,lz+2*th)
  .fillet((lz+2*th-lt)/2,(e)=>e.inDirection("Y").inPlane("XY",lz+2*th))

  // create a lip on the holder to attach it to a lanyard
  let lanyardholder = r.makeBaseBox(wholder,ly+(2*th),th).translate([0,yholder,0])
  shape = shape.fuse(lanyardholder)
  
  // define two objects to cut away parts of the holder
  let cutter = r.makeBaseBox(lx*1.2,ly*ycut,lz*2).translate([0,0,2*th])
  cutter = cutter.fillet(5,(e)=>e.inDirection("X"))
  let cutterTop = r.makeBaseBox(lx*1.2,ly*1.2,lz).translate([0,0,(lz+2*th)*0.87])

  // create hollow holder with cutout on side
  let shape1 = shape.cut(hollow)
  let shapeUnrounded = shape1.cut(cutter)

  // now round the outer edge of the cutout
  // do this first as in this state you can select a complete loop with one point
  let shapeRounded = shapeUnrounded
  .fillet(1.0,(e)=>e.containsPoint([0, ly*ycut/2 , lz+2*th]))

  // to round the lip for the lanyard we combine two finders 
  // selecting first the edges in the z direction,  out of 
  // these only select the ones at the proper distance
  shapeRounded = shapeRounded.fillet(8,(e)=>e.inDirection("Z").inPlane("XZ",-(((ly+2*th)/2)+yholder)))
 
  // punch two holes in the lip, with distance rlanhol 0 it becomes one hole
  let lanyardCutterL = r.makeCylinder(rlanhol,th*4,[rlandist/2,ly/2+yholder/2+th,-2*th],[0,0,1])
  let lanyardCutterR = r.makeCylinder(rlanhol,th*4,[-rlandist/2,ly/2+yholder/2+th,-2*th],[0,0,1])
  shapeRounded = shapeRounded.cut(lanyardCutterL)
  shapeRounded = shapeRounded.cut(lanyardCutterR)

  // now cut the top part of the holder 
  // as a closed shape is difficult for the 3D printer,
  // then  round all remaining edges with a smaller radius
  // used a chamfer(0.4) instead of fillet(0.6)
  shapeRounded = shapeRounded.cut(cutterTop).fillet(0.6)

  // dimensions of honeycomb grid 
  let hc_width  = 35;
  let hc_length = 65;
  let hc_depth  = 10;  
  // note that hexagons are defined at plane XY, -1

  // number of rows and columns from center of rectangle 
  let rowNumber = 5;
  let colNumber = 2;
  // cellsize and wallthickness of honeycomb 
  let wallThickness = 1;
  let cellSize = 5;
    
  let deg30 = Math.PI / 6
  let delta_x = (1+Math.sin(deg30)) * cellSize + wallThickness*Math.cos(deg30)
  let delta_y = 0.5*wallThickness + Math.cos(deg30)*cellSize

 
  let point = [];
  let cutColumn;
  
  for(let rowCount = 1 ; rowCount <= rowNumber; rowCount += 1)
    {
      for (let colCount = 1 ;  colCount <= colNumber ; colCount += 1)
          {
          // two cells are defined and then replicated in each quadrant 
          // around the center of the grid, so 8 holes are defined each time 
          // This way the grid is always nicely symmetrical. 
          point[1] = [(colCount-1) * 2 * delta_x,(rowCount-1) * delta_y * 2 ,0];
          point[2] = [-(colCount-1) * 2 * delta_x,(rowCount-1) * delta_y * 2 ,0];
          point[3]= [(colCount-1) * 2 * delta_x,-(rowCount-1) * delta_y * 2 ,0];
          point[4] = [-(colCount-1) * 2 * delta_x,-(rowCount-1) * delta_y * 2 ,0];
          point[5] = [(((colCount-1)*2)+1) * delta_x, (rowCount-1)*delta_y*2+delta_y,0];  
          point[6] = [(((colCount-1)*2)+1) * -delta_x, (rowCount-1)*delta_y*2+delta_y,0];
          point[7] = [(((colCount-1)*2)+1) * delta_x, -(rowCount-1)*delta_y*2+delta_y,0];
          point[8] = [(((colCount-1)*2)+1) * -delta_x, -(rowCount-1)*delta_y*2+delta_y,0];
          for (let j=1; j<=8; j+=1)
            { 
              cutColumn = hexColumn(cellSize,5*th).translate(point[j]);
              // the defined column is intersected with a box to limit the grid 
              // within a rectangular shape
              cutColumn = cutColumn.intersect(r.makeBaseBox(hc_width,hc_length,hc_depth)) 
              shapeRounded = shapeRounded.cut(cutColumn);
            }
          }
    }
  
  let shapeArray = 
  [ 
  {shape: receiver, name: "receiver", color: "dimgrey", opacity: 0.8},   
  {shape: shapeRounded, name: "holder", color: "steelblue", opacity: 1.0}
  ]
    
return shapeArray
  
}

\`\`\`


replicad-threejs-helper
A set of simple function to help integrate replicad in a threejs project

Install
yarn add replicad-threejs-helper
(npm works as well, and there are some different builds that you can link from unpkg)

API
This package offers a small set of functions to sync a set of BufferGeometry with meshed shapes from replicad.

Creating geometries from a replicad object
Typically you will create an array of replicad shapes that way (this is purely replicad code):

const meshed = shapes.map((shape, i) => ({
  name: \`shape \${i + 1}\`,
  faces: shape.mesh({ tolerance: 0.05, angularTolerance: 30 }),
  edges: shape.meshEdges({ keepMesh: true }),
}));
You can then synchronise them with a set of buffer geometries (for the faces and the edges):

const geometries = syncGeometries(meshed, []);
The geometries will contain an array of objects with two BufferGeometry, one for the faces (the body of the solid) and one for the lines (the edges).

You will then need to integrate these geometries in your threejs project.

Updating geometries
If you have changes to your geometries, instead of creating new ones you can do:

const updatedGeometries = syncGeometries(meshed, geometries);
This will reuse the geometries if the number of shape has not changed, and dispose of the old ones (and recreate new ones) if the number of shapes has changed.

More control
Instead of updating both the edges and the faces you can use the simpler individual functions:

const facesGeometry = new BufferGeometry();
const updatedFaces = syncFaces(facesGeometry, replicadMeshedFaces);
or for the edges

const edgesGeometry = new BufferGeometry();
syncLines(edgesGeometry, replicadMeshedEdges);
Highlighting
These helpers also allow you to implement highlighting of faces or edges, using the groups functionality of three.

For this you will need to attach two materials for both your faces and your lines.

You can toggle a single face or edge with this helper:

toggleHighlight(facesGeometry, 2);
or

toggleHighlight(edgesGeometry, 5);



# Examples:

A simple vase
This is a simple vase that shows off the smoothSpline API.

We can have a look at the rendered shape.

And here is what the code looks like.

const { draw } = replicad;

const defaultParams = {
  height: 100,
  baseWidth: 20,
  wallThickness: 5,
  lowerCircleRadius: 1.5,
  lowerCirclePosition: 0.25,
  higherCircleRadius: 0.75,
  higherCirclePosition: 0.75,
  topRadius: 0.9,
  topFillet: true,
  bottomHeavy: true,
};

const main = (
  r,
  {
    height,
    baseWidth,
    wallThickness,
    lowerCirclePosition,
    lowerCircleRadius,
    higherCircleRadius,
    higherCirclePosition,
    topRadius,
    topFillet,
    bottomHeavy,
  }
) => {
  const splinesConfig = [
    { position: lowerCirclePosition, radius: lowerCircleRadius },
    {
      position: higherCirclePosition,
      radius: higherCircleRadius,
      startFactor: bottomHeavy ? 3 : 1,
    },
    { position: 1, radius: topRadius, startFactor: bottomHeavy ? 3 : 1 },
  ];

  const sketchVaseProfile = draw().hLine(baseWidth);

  splinesConfig.forEach(({ position, radius, startFactor, endFactor }) => {
    sketchVaseProfile.smoothSplineTo([baseWidth * radius, height * position], {
      endTangent: [0, 1],
      startFactor,
      endFactor,
    });
  });

  let vase = sketchVaseProfile
    .lineTo([0, height])
    .close()
    .sketchOnPlane("XZ")
    .revolve();

  if (wallThickness) {
    vase = vase.shell(wallThickness, (f) => f.containsPoint([0, 0, height]));
  }

  if (topFillet) {
    vase = vase.fillet(wallThickness / 3, (e) => e.inPlane("XY", height));
  }

  return vase;
};



Code CAD Birdhouse
This is the birdhouse used to demonstrate many different code cad tools.

We can have a look at the rendered shape.

And here is what the code looks like.

const defaultParams = {
  height: 85.0,
  width: 120.0,
  thickness: 2.0,
  holeDia: 50.0,
  hookHeight: 10.0,
};

const { drawCircle, draw, makePlane } = replicad;

function main(
  r,
  { width: inputWidth, height, thickness, holeDia, hookHeight }
) {
  const length = inputWidth;
  const width = inputWidth * 0.9;

  const tobleroneShape = draw([-width / 2, 0])
    .lineTo([0, height])
    .lineTo([width / 2, 0])
    .close()
    .sketchOnPlane("XZ", -length / 2)
    .extrude(length)
    .shell(thickness, (f) => f.parallelTo("XZ"))
    .fillet(thickness / 2, (e) =>
      e
        .inDirection("Y")
        .either([(f) => f.inPlane("XY"), (f) => f.inPlane("XY", height)])
    );

  const hole = drawCircle(holeDia / 2)
    .sketchOnPlane(makePlane("YZ").translate([-length / 2, 0, height / 3]))
    .extrude(length);

  const base = tobleroneShape.cut(hole);
  const body = base.clone().fuse(base.rotate(90));

  const hookWidth = length / 2;
  const hook = draw([0, hookHeight / 2])
    .smoothSplineTo([hookHeight / 2, 0], -45)
    .lineTo([hookWidth / 2, 0])
    .line(-hookWidth / 4, hookHeight / 2)
    .smoothSplineTo([0, hookHeight], {
      endTangent: 180,
      endFactor: 0.6,
    })
    .closeWithMirror()
    .sketchOnPlane("XZ")
    .extrude(thickness)
    .translate([0, thickness / 2, height - thickness / 2]);

  return body.fuse(hook);
}

Opencascade bottle
If you have dabbled in opencascade you have read the bottle tutorial. So what does it look like with replicad?

We can have a look at the rendered shape.


And here is what the code looks like.

const defaultParams = {
  width: 50,
  height: 70,
  thickness: 30,
};

const { draw, makeCylinder, makeOffset, FaceFinder } = replicad;

const main = (
  r,
  { width: myWidth, height: myHeight, thickness: myThickness }
) => {
  let shape = draw([-myWidth / 2, 0])
    .vLine(-myThickness / 4)
    .threePointsArc(myWidth, 0, myWidth / 2, -myThickness / 4)
    .vLine(myThickness / 4)
    .closeWithMirror()
    .sketchOnPlane()
    .extrude(myHeight)
    .fillet(myThickness / 12);

  const myNeckRadius = myThickness / 4;
  const myNeckHeight = myHeight / 10;
  const neck = makeCylinder(
    myNeckRadius,
    myNeckHeight,
    [0, 0, myHeight],
    [0, 0, 1]
  );

  shape = shape.fuse(neck);

  shape = shape.shell(myThickness / 50, (f) =>
    f.inPlane("XY", [0, 0, myHeight + myNeckHeight])
  );

  const neckFace = new FaceFinder()
    .containsPoint([0, myNeckRadius, myHeight])
    .ofSurfaceType("CYLINDRE")
    .find(shape.clone(), { unique: true });

  const bottomThreadFace = makeOffset(neckFace, -0.01 * myNeckRadius).faces[0];
  const baseThreadSketch = draw([0.75, 0.25])
    .halfEllipse(2, 0.5, 0.1)
    .close()
    .sketchOnFace(bottomThreadFace, "bounds");

  const topThreadFace = makeOffset(neckFace, 0.05 * myNeckRadius).faces[0];
  const topThreadSketch = draw([0.75, 0.25])
    .halfEllipse(2, 0.5, 0.05)
    .close()
    .sketchOnFace(topThreadFace, "bounds");

  const thread = baseThreadSketch.loftWith(topThreadSketch);

  return shape.fuse(thread);
};


The CadQuery cycloidal gear
As in CadQuery replicad supports sketching parametric functions, we can implement this gear as well.

We can have a look at the rendered shape.

And here is what the code looks like.

const { drawCircle, drawParametricFunction } = replicad;

const hypocycloid = (t, r1, r2) => {
  return [
    (r1 - r2) * Math.cos(t) + r2 * Math.cos((r1 / r2) * t - t),
    (r1 - r2) * Math.sin(t) + r2 * Math.sin(-((r1 / r2) * t - t)),
  ];
};

const epicycloid = (t, r1, r2) => {
  return [
    (r1 + r2) * Math.cos(t) - r2 * Math.cos((r1 / r2) * t + t),
    (r1 + r2) * Math.sin(t) - r2 * Math.sin((r1 / r2) * t + t),
  ];
};

const gear = (t, r1 = 4, r2 = 1) => {
  if ((-1) ** (1 + Math.floor((t / 2 / Math.PI) * (r1 / r2))) < 0)
    return epicycloid(t, r1, r2);
  else return hypocycloid(t, r1, r2);
};

const defaultParams = {
  height: 15,
};

const main = (r, { height }) => {
  const base = drawParametricFunction((t) => gear(2 * Math.PI * t, 6, 1))
    .sketchOnPlane()
    .extrude(height, { twistAngle: 90 });

  const hole = drawCircle(2).sketchOnPlane().extrude(height);

  return base.cut(hole);
};

Wavy vases
A more complex vase generator that uses twisted extrusion.

We can have a look at the rendered shape.

And here is what the code looks like.

const { drawCircle, drawPolysides, polysideInnerRadius } = replicad;

const defaultParams = {
  height: 150,
  radius: 40,
  sidesCount: 12,
  sideRadius: -2,
  sideTwist: 6,
  endFactor: 1.5,
  topFillet: 0,
  bottomFillet: 5,

  holeMode: 1,
  wallThickness: 2,
};

const main = (
  r,
  {
    height,
    radius,
    sidesCount,
    sideRadius,
    sideTwist,
    endFactor,
    topFillet,
    bottomFillet,
    holeMode,
    wallThickness,
  }
) => {
  const extrusionProfile = endFactor
    ? { profile: "s-curve", endFactor }
    : undefined;
  const twistAngle = (360 / sidesCount) * sideTwist;

  let shape = drawPolysides(radius, sidesCount, -sideRadius)
    .sketchOnPlane()
    .extrude(height, {
      twistAngle,
      extrusionProfile,
    });

  if (bottomFillet) {
    shape = shape.fillet(bottomFillet, (e) => e.inPlane("XY"));
  }

  if (holeMode === 1 || holeMode === 2) {
    const holeHeight = height - wallThickness;

    let hole;
    if (holeMode === 1) {
      const insideRadius =
        polysideInnerRadius(radius, sidesCount, sideRadius) - wallThickness;

      hole = drawCircle(insideRadius).sketchOnPlane().extrude(holeHeight, {
        extrusionProfile,
      });

      shape = shape.cut(
        hole
          .fillet(
            Math.max(wallThickness / 3, bottomFillet - wallThickness),
            (e) => e.inPlane("XY")
          )
          .translate([0, 0, wallThickness])
      );
    } else if (holeMode === 2) {
      shape = shape.shell(wallThickness, (f) => f.inPlane("XY", height));
    }
  }

  if (topFillet) {
    shape = shape.fillet(topFillet, (e) => e.inPlane("XY", height));
  }
  return shape;
};

Gridfinity boxes generator
From the gridfinity system. This is a fairly complex build (that uses blueprints and sweeps).

And here is what the code looks like.

const {
  draw,
  drawRoundedRectangle,
  drawCircle,
  makeSolid,
  assembleWire,
  makeFace,
  EdgeFinder,
} = replicad;

const defaultParams = {
  xSize: 2,
  ySize: 1,
  heigth: 0.5,
  withMagnet: false,
  withScrew: false,
  magnetRadius: 3.25,
  magnetHeight: 2,
  screwRadius: 1.5,
  keepFull: false,
  wallThickness: 1.2,
};

// Gridfinity magic numbers
const SIZE = 42.0;
const CLEARANCE = 0.5;
const AXIS_CLEARANCE = (CLEARANCE * Math.sqrt(2)) / 4;

const CORNER_RADIUS = 4;
const TOP_FILLET = 0.6;

const SOCKET_HEIGHT = 5;
const SOCKET_SMALL_TAPER = 0.8;
const SOCKET_BIG_TAPER = 2.4;
const SOCKET_VERTICAL_PART =
  SOCKET_HEIGHT - SOCKET_SMALL_TAPER - SOCKET_BIG_TAPER;
const SOCKET_TAPER_WIDTH = SOCKET_SMALL_TAPER + SOCKET_BIG_TAPER;

const socketProfile = (_, startPoint) => {
  const full = draw([-CLEARANCE / 2, 0])
    .vLine(-CLEARANCE / 2)
    .lineTo([-SOCKET_BIG_TAPER, -SOCKET_BIG_TAPER])
    .vLine(-SOCKET_VERTICAL_PART)
    .line(-SOCKET_SMALL_TAPER, -SOCKET_SMALL_TAPER)
    .done()
    .translate(CLEARANCE / 2, 0);

  return full.sketchOnPlane("XZ", startPoint);
};

const buildSocket = ({
  magnetRadius = 3.25,
  magnetHeight = 2,
  screwRadius = 1.5,
  withScrew = true,
  withMagnet = true,
} = {}) => {
  const baseSocket = drawRoundedRectangle(
    SIZE - CLEARANCE,
    SIZE - CLEARANCE,
    CORNER_RADIUS
  ).sketchOnPlane();

  const slotSide = baseSocket.sweepSketch(socketProfile, {
    withContact: true,
  });

  let slot = makeSolid([
    slotSide,
    makeFace(
      assembleWire(
        new EdgeFinder().inPlane("XY", -SOCKET_HEIGHT).find(slotSide)
      )
    ),
    makeFace(assembleWire(new EdgeFinder().inPlane("XY", 0).find(slotSide))),
  ]);

  if (withScrew || withMagnet) {
    const magnetCutout = withMagnet
      ? drawCircle(magnetRadius).sketchOnPlane().extrude(magnetHeight)
      : null;
    const screwCutout = withScrew
      ? drawCircle(screwRadius).sketchOnPlane().extrude(SOCKET_HEIGHT)
      : null;

    const cutout =
      magnetCutout && screwCutout
        ? magnetCutout.fuse(screwCutout)
        : magnetCutout || screwCutout;

    slot = slot
      .cut(cutout.clone().translate([-13, -13, -5]))
      .cut(cutout.clone().translate([-13, 13, -5]))
      .cut(cutout.clone().translate([13, 13, -5]))
      .cut(cutout.clone().translate([13, -13, -5]));
  }

  return slot;
};

const range = (i) => [...Array(i).keys()];
const cloneOnGrid = (
  shape,
  { xSteps = 1, ySteps = 1, span = 10, xSpan = null, ySpan = null }
) => {
  const xCorr = ((xSteps - 1) * (xSpan || span)) / 2;
  const yCorr = ((ySteps - 1) * (ySpan || xSpan || span)) / 2;

  const translations = range(xSteps).flatMap((i) => {
    return range(ySteps).map((j) => [i * SIZE - xCorr, j * SIZE - yCorr, 0]);
  });
  return translations.map((translation) =>
    shape.clone().translate(translation)
  );
};

const buildTopShape = ({
  xSize,
  ySize,
  includeLip = true,
  wallThickness = 1.2,
}) => {
  const topShape = (basePlane, startPosition) => {
    const sketcher = draw([-SOCKET_TAPER_WIDTH, 0])
      .line(SOCKET_SMALL_TAPER, SOCKET_SMALL_TAPER)
      .vLine(SOCKET_VERTICAL_PART)
      .line(SOCKET_BIG_TAPER, SOCKET_BIG_TAPER);

    if (includeLip) {
      sketcher
        .vLineTo(-(SOCKET_TAPER_WIDTH + wallThickness))
        .lineTo([-SOCKET_TAPER_WIDTH, -wallThickness]);
    } else {
      sketcher.vLineTo(0);
    }

    const basicShape = sketcher.close();

    const shiftedShape = basicShape
      .translate(AXIS_CLEARANCE, -AXIS_CLEARANCE)
      .intersect(
        drawRoundedRectangle(10, 10).translate(-5, includeLip ? 0 : 5)
      );

    // We need to shave off the clearance
    let topProfile = shiftedShape
      .translate(CLEARANCE / 2, 0)
      .intersect(drawRoundedRectangle(10, 10).translate(-5, 0));

    if (includeLip) {
      // We remove the wall if we add a lip
      topProfile = topProfile.cut(
        drawRoundedRectangle(1.2, 10).translate(-0.6, -5)
      );
    }

    return topProfile.sketchOnPlane("XZ", startPosition);
  };

  const boxSketch = drawRoundedRectangle(
    xSize * SIZE - CLEARANCE,
    ySize * SIZE - CLEARANCE,
    CORNER_RADIUS
  ).sketchOnPlane();

  return boxSketch
    .sweepSketch(topShape, { withContact: true })
    .fillet(TOP_FILLET, (e) =>
      e.inBox(
        [-xSize * SIZE, -ySize * SIZE, SOCKET_HEIGHT],
        [xSize * SIZE, ySize * SIZE, SOCKET_HEIGHT - 1]
      )
    );
};

function main(
  r,
  {
    xSize = 2,
    ySize = 1,
    heigth = 0.5,
    keepFull = false,
    wallThickness = 1.2,
    withMagnet = false,
    withScrew = false,
    magnetRadius = 3.25,
    magnetHeight = 2,
    screwRadius = 1.5,
  } = {}
) {
  const stdHeight = heigth * SIZE;

  let box = drawRoundedRectangle(
    xSize * SIZE - CLEARANCE,
    ySize * SIZE - CLEARANCE,
    CORNER_RADIUS
  )
    .sketchOnPlane()
    .extrude(stdHeight);

  if (!keepFull) {
    box = box.shell(wallThickness, (f) => f.inPlane("XY", stdHeight));
  }

  const top = buildTopShape({
    xSize,
    ySize,
    includeLip: !keepFull,
  }).translateZ(stdHeight);

  const socket = buildSocket({
    withMagnet,
    withScrew,
    magnetRadius,
    magnetHeight,
    screwRadius,
  });

  let base = null;
  cloneOnGrid(socket, { xSteps: xSize, ySteps: ySize, span: SIZE }).forEach(
    (movedSocket) => {
      if (base) base = base.fuse(movedSocket, { optimisation: "commonFace" });
      else base = movedSocket;
    }
  );
  return base
    .fuse(box, { optimisation: "commonFace" })
    .fuse(top, { optimisation: "commonFace" });
}

Watering can
Note that this model is inspired by Robert Bronwasser's watering can. The original implementation comes from our community. You can see step by step explanation on how to build it here

And here is what the code looks like.

const { makePlane, makeCylinder, draw, drawCircle } = replicad;

const defaultParams = {};

const main = () => {
  // Building the body
  const profile = draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();

  const body = profile.sketchOnPlane("XZ").revolve([0, 0, 1]);

  // Building the filler
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);

  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);

  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);

  const filler = topCircle.loftWith([middleCircle, bottomCircle], {
    ruled: false,
  });

  // Building the spout
  const spout = makeCylinder(5, 70)
    .translateZ(100)
    .rotate(45, [0, 0, 100], [0, 1, 0]);

  let wateringCan = body
    .fuse(filler)
    .fillet(30, (e) => e.inPlane("XY", 100))
    .fuse(spout)
    .fillet(10, (e) => e.inBox([20, 20, 100], [-20, -20, 120]));

  const spoutOpening = [
    Math.cos((45 * Math.PI) / 180) * 70,
    0,
    100 + Math.sin((45 * Math.PI) / 180) * 70,
  ];

  wateringCan = wateringCan.shell(-1, (face) =>
    face.either([
      (f) => f.containsPoint(spoutOpening),
      (f) => f.inPlane(topPlane),
    ])
  );

  return {
    shape: wateringCan,
    name: "Watering Can",
  };
};

Orthographic Projections
Historically technical drawing consisted of a lot of orthographic projections. In some cases it still is a great method of communication for 3D models.

Replicad support projections into a drawing (and therefore a projection as an SVG). This code follows the first angle convention.

And here is what the code looks like.

const { drawProjection, draw } = replicad;

/* This follow the "first angle projection" convention
 * https://en.wikipedia.org/wiki/Multiview_orthographic_projection#First-angle_projection
 */
const descriptiveGeom = (shape) => {
  return [
    { shape, name: "Shape to project" },
    { shape: drawProjection(shape, "front").visible, name: "Front" },
    { shape: drawProjection(shape, "back").visible, name: "Back" },
    { shape: drawProjection(shape, "top").visible, name: "Top" },
    { shape: drawProjection(shape, "bottom").visible, name: "Bottom" },
    { shape: drawProjection(shape, "left").visible, name: "Left" },
    { shape: drawProjection(shape, "right").visible, name: "Right" },
  ];
};

const main = () => {
  // This shape looks different from every angle
  const shape = draw()
    .vLine(-10)
    .hLine(-5)
    .vLine(15)
    .customCorner(2)
    .hLine(15)
    .vLine(-5)
    .close()
    .sketchOnPlane()
    .extrude(10)
    .chamfer(5, (e) => e.inPlane("XY", 10).containsPoint([10, 1, 10]));

  return descriptiveGeom(shape);
};


Custom perspectives
You can also have nice looking perspectives on your shapes.

const { drawProjection, ProjectionCamera, draw } = replicad;

const prettyProjection = (shape) => {
  const bbox = shape.boundingBox;
  const center = bbox.center;
  const corner = [
    bbox.center[0] + bbox.width,
    bbox.center[1] - bbox.height,
    bbox.center[2] + bbox.depth,
  ];
  const camera = new ProjectionCamera(corner).lookAt(center);
  const { visible, hidden } = drawProjection(shape, camera);

  return [
    { shape: hidden, strokeType: "dots", name: "Hidden Lines" },
    { shape: visible, name: "Visible Lines" },
  ];
};

const main = () => {
  const shape = draw()
    .vLine(-10)
    .hLine(-5)
    .vLine(15)
    .customCorner(2)
    .hLine(15)
    .vLine(-5)
    .close()
    .sketchOnPlane()
    .extrude(10)
    .chamfer(5, (e) => e.inPlane("XY", 10).containsPoint([10, 1, 10]));

  return prettyProjection(shape);
};


Why recipes?
There are some operations using replicad (or any CAD tool) that are at the same time very common - but have many different configurations and edge cases.

In tools with a UI, this translates to very complex configuration boxes with multiple options that do not work well together most of the time.

In a code CAD tool like replicad, this would translate to a function with a very complex signature.

In some cases - the basic logic behind this functionality is fairly simple – but the different tweaks possible add the complexity.

Instead of offering these as a standard library with a complex interface, I propose a recipe book of code that can be easily copied and tweaked to your particular needs.

Polar array
Sometimes you want to copy a shape with a circular pattern. This is fairly easy to do with a little bit of javascript.

const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;

  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

For the optimal use, take into account that we assume

that your original shape is centered at the origin
that you want to rotate around the origin
that you want to go all around the circle
Let's show an example

const { drawCircle } = replicad;

const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;

  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

function main() {
  return polarCopies(drawCircle(5), 5, 12);
}


Note that this code works for both 2D and 3D cases. In the case of 3D, it will do the copies in the XY plane.

const { drawCircle } = replicad;

const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;

  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

function main() {
  return polarCopies(drawCircle(5).sketchOnPlane().extrude(2), 5, 12);
}


Swept profile box
Let's say you want to start designing with a box. Simple extrusion is good if you do not have a complex profile. A way to work with a more complex shape is to draw the profile in 2D, and then sweep it along a base sketch.

const { makeSolid, makeFace, assembleWire, EdgeFinder, genericSweep, Plane } =
  replicad;

function profileBox(inputProfile, base) {
  const start = inputProfile.blueprint.firstPoint;
  const profile = inputProfile.translate(-start[0], -start[1]);

  const end = profile.blueprint.lastPoint;

  const baseSketch = base.sketchOnPlane();

  // We create the side of the box
  const side = baseSketch.clone().sweepSketch(
    (plane) => {
      return profile.sketchOnPlane(plane);
    },
    {
      withContact: true,
    }
  );

  // We put all the pieces together
  return makeSolid([
    side,
    // The face generated by sweeping the end of the profile
    makeFace(assembleWire(new EdgeFinder().inPlane("XY", end[1]).find(side))),
    // The face generated by the base
    baseSketch.face(),
  ]);
}

This code assumes some things about its input:

the input profile is a single open line
the base is a single closed line
there is only one profile point at the coordinate of the end of the profile
The box will have its base in the XY plane.

Let's build an example

const { makeSolid, makeFace, assembleWire, EdgeFinder, genericSweep, Plane } =
  replicad;

function profileBox(inputProfile, base) {
  const start = inputProfile.blueprint.firstPoint;
  const profile = inputProfile.translate(-start[0], -start[1]);

  const end = profile.blueprint.lastPoint;

  const baseSketch = base.sketchOnPlane();

  // We create the side of the box
  const side = baseSketch.clone().sweepSketch(
    (plane) => {
      return profile.sketchOnPlane(plane);
    },
    {
      withContact: true,
    }
  );

  // We put all the pieces together
  return makeSolid([
    side,
    // The face generated by sweeping the end of the profile
    makeFace(assembleWire(new EdgeFinder().inPlane("XY", end[1]).find(side))),
    // The face generated by the base
    baseSketch.face(),
  ]);
}

const { draw, drawRoundedRectangle } = replicad;

function main() {
  const base = drawRoundedRectangle(30, 20, 5);

  const profile = draw()
    .line(5, 5)
    .line(2, 3)
    .hLine(-2)
    .vLine(-1)
    .bulgeArcTo([0, 1], 0.2)
    .done();

  return profileBox(profile, base);
}


Fuse All
You might find yourself in a situation where you have an array of shapes (2D or 3D) and you just want to fuse (or intersect) them all together. The following snippet just does this

const fuseAll = (shapes) => {
  let result = shapes[0];
  shapes.slice(1).forEach((shape) => {
    result = result.fuse(shape);
  });
  return result;
};

Let's show an example (also using polar copies).

const { drawCircle } = replicad;

const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;

  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

const fuseAll = (shapes) => {
  let result = shapes[0];
  shapes.slice(1).forEach((shape) => {
    result = result.fuse(shape);
  });
  return result;
};

function main() {
  return fuseAll(polarCopies(drawCircle(5), 5, 7));
}

`