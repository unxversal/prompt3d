export const REPLICAD_DOCS_BASE_FUNCTIONS = `
### Drawing

Let's start in two dimensions only, we will add the third one soon enough. replicad provides some classes and functions to draw in the plane.

Let's start with the powerful draw API.

**The draw function and the Drawing API**
With the drawing API you can draw straight lines and several types of curves. It currently supports:

- straight lines
- arcs of circles
- arcs of ellipses
- bezier curves

And for each of these categories it provides a set of functions that should help you draw stuff quickly - or give you as much power as you need. Have a look at the detailed API documentation to see what it can do.

**A simple drawing**
Let's draw something simple:

\`\`\`javascript
const { draw } = replicad;
const main = () => {
  return draw().hLine(25).halfEllipse(0, 40, 5).hLine(-25).close();
};
\`\`\`

What have we done?
- We start drawing (at the origin, for instance \`draw([10, 10])\` would start at another point.
- We then draw an horizontal line of 25 millimeters of length.
- Then, we draw an half ellipse, from the last point of the line, moving, by 0 horizontally and by 40 vertically - but drawing an arc of an ellipse with an axis length of 5.
- We then go back of 25 horizontally
- We finally close the drawing, going from the current last point to the first point with a straight line.

**Let's play with the drawing**
To understand what the different parameters do, let's play with them:
- close with a mirror instead of a straight line with \`.closeWithMirror\` instead of \`close\`
- replace the second horizontal line by a sagitta line (an arc or circle) \`.hSagittaArc(-25, 10)\`
- change the origin to another point (with \`draw([10, 10])\` for instance).

**Drawing functions**
In addition to the draw API, replicad provides some drawing functions to draw common and useful shapes. You can for instance:
- draw a rectangle \`drawRoundedRectangle\`
- draw a polygon \`drawPolysides\`
- circle \`drawCircle\` or ellipse \`drawEllipse\`
- draw some text in a ttf font \`drawText\`
- draw based on a parametric function \`drawParametricFunction\`

---

### Planes and Sketches

We have so far drawn on the 2D plane. But we want to put these drawings in 3D space. For this we will need to define a plane and sketch the drawing into it.

**Sketching**
In order to show the planes we will need to sketch on them.

\`\`\`javascript
const { drawRoundedRectangle } = replicad;

const main = () => {
  return drawRoundedRectangle(100, 50).sketchOnPlane();
};
\`\`\`
By default this sketches on the XY plane.

**Planes**
Now that we know what sketching is, we can see the way to create planes.

**Standard planes**
There are a bunch of standard planes defined as a string.

\`\`\`javascript
const { drawRoundedRectangle, makePlane } = replicad;

const main = () => {
  const rect = drawRoundedRectangle(100, 50);
  return [
    { shape: rect.sketchOnPlane(makePlane("XY")), name: "XY", color: "blue" },
    { shape: rect.sketchOnPlane(makePlane("XZ")), name: "XZ", color: "green" },
    { shape: rect.sketchOnPlane(makePlane("YZ")), name: "YZ", color: "red" },
  ];
};
\`\`\`

**Planes parallel to the standard one**
There are a bunch of standard planes defined as a string.

\`\`\`javascript
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
\`\`\`

**Sketching shortcut**
As these are common ways to sketch a drawing, we have implemented a shortcut within the \`sketchOnPlane\` method.
\`\`\`javascript
const { drawRoundedRectangle } = replicad;

const main = () => {
  return drawRoundedRectangle(100, 50).sketchOnPlane("XZ", 10);
};
\`\`\`

**Opposite standard planes**
In addition to the standard planes there are their opposite (YX is the opposite of XY). These are the same planes, but with their axis inverted – which also means top and bottom are inverted.

\`\`\`javascript
const { drawRoundedRectangle, makePlane } = replicad;

const main = () => {
  const rect = drawRoundedRectangle(100, 50);
  return [
    { shape: rect.sketchOnPlane("XY", 20), name: "XY at 20", color: "green" },
    { shape: rect.sketchOnPlane("YX", 20), name: "YX at 20", color: "red" },
  ];
};
\`\`\`
We can see that the rectangle has been rotated to match the axis, but also that the direction of the plane is reversed.

**Transforming planes**
We might want to use planes more different than translations of the origin along the normal of a plane. Note that the order in which you apply these transformations might change the final result.

- **Translations**: We might want to translate the origin of an arbitrary position. Note that the general direction of the plane is the same. Only the origin point has been changed.
  \`\`\`javascript
  const { drawRoundedRectangle, makePlane } = replicad;

  const main = () => {
    const plane = makePlane("XZ").translate(-50, 50, 20);
    return drawRoundedRectangle(100, 50).sketchOnPlane(plane);
  };
  \`\`\`
- **Pivot**: We might want to give an angle to our plane. In order to do this, we can pivot the plane around its origin and an axis (which can be a standard direction X, Y, Z, or a generic direction \`[1, 1, 0]\`).
  \`\`\`javascript
  const { drawRoundedRectangle, makePlane } = replicad;

  const main = () => {
    const plane = makePlane("XY").pivot(30, "Y");
    return drawRoundedRectangle(100, 50).sketchOnPlane(plane);
  };
  \`\`\`
- **Axes rotation**: There is a last operation that can be done on a plane - it is the rotation of its axes around the origin.
  \`\`\`javascript
  const { drawRoundedRectangle, makePlane } = replicad;

  const main = () => {
    const plane = makePlane("XY").rotate2DAxes(30, "Y");
    return drawRoundedRectangle(100, 50).sketchOnPlane(plane);
  };
  \`\`\`

---

### Adding depth

Once you have a sketch, you want to add some depth to it. replicad offers all the standard methods to do this.

**Extrusion**
The simplest way to "add depth" is to take the face that we have and add thickness, to extrude it in other words.
\`\`\`javascript
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
\`\`\`
Variations on the extrusion:
- \`the direction of the extrusion\`: .extrude(10, { extrusionDirection: [0, 1, 0.5] })
- \`add a twisting motion\`: .extrude(10, { twistAngle: 10 })

**Revolution**
Let's make this shape rotate on an axis, which is, by default the Z axis.
\`\`\`javascript
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
\`\`\`

**Loft**
With a loft we make a smooth transition between two sketches.
\`\`\`javascript
const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const rect = drawRoundedRectangle(5, 10).sketchOnPlane();
  const circle = drawCircle(3).sketchOnPlane("XY", 10);
  return rect.loftWith(circle);
};
\`\`\`
Variations on the loft:
- By adding a point at the end (or the start) of the loft:
  \`\`\`javascript
  const { drawRoundedRectangle, drawCircle } = replicad;
  const main = () => {
    const rect = drawRoundedRectangle(5, 10).sketchOnPlane();
    const circle = drawCircle(3).sketchOnPlane("XY", 10);

    return rect.loftWith(circle, { endPoint: [2, 2, 15] });
  };
  \`\`\`
- By having multiple lofted sketches:
  \`\`\`javascript
  const { drawRoundedRectangle, drawCircle } = replicad;
  const main = () => {
    const rect = drawRoundedRectangle(5, 10).sketchOnPlane();
    const circle = drawCircle(3).sketchOnPlane("XY", 10);
    const rect2 = drawRoundedRectangle(5, 10, 1).sketchOnPlane("XY", 20);

    return rect.loftWith([circle, rect2]);
  };
  \`\`\`

---

### Transformations

Now that we have a 3D shape it is time to move it around. For this part of the tutorial we will create a weird, non symmetrical shape:
\`\`\`javascript
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
\`\`\`

- **Translate**: We have a shape, we translate it on the axes (or on a vector).
  \`return shape.translateZ(20);\`
- **Rotate**:
  \`return shape.rotate(45, [0, 0, 0], [1, 0, 0]);\`
  The shape is rotated 45 degrees around an axis going through the origin and in the X direction.
- **Mirror**:
  \`return shape.mirror("XZ");\`

---

### Combinations

It is now time to introduce a way to combine shapes together, the main operations of constructive geometry, also known as the boolean operations.

**Fuse (Pasting shapes together)**
\`\`\`javascript
const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const cylinder = drawCircle(20).sketchOnPlane().extrude(50);
  const box = drawRoundedRectangle(60, 90).sketchOnPlane().extrude(25);

  return box.fuse(cylinder);
};
\`\`\`

**Cut (Cutting one shape with another)**
\`\`\`javascript
const { drawRoundedRectangle, drawCircle } = replicad;
const main = () => {
  const cylinder = drawCircle(20).sketchOnPlane().extrude(50);
  const box = drawRoundedRectangle(60, 90).sketchOnPlane().extrude(25);

  return box.cut(cylinder);
};
\`\`\`

**Intersect (Intersecting two shapes)**
\`\`\`javascript
const { drawCircle } = replicad;
const main = () => {
  const cylinder = drawCircle(20).sketchOnPlane().extrude(50);
  const sideCylinder = cylinder.clone().rotate(90, [0, 0, 20], [1, 0, 0]);

  return sideCylinder.intersect(cylinder);
};
\`\`\`
---

### Finders

In code CAD, we need to find features like faces and edges programmatically. This is what finders are for.
For this tutorial we will use a simple house shape:
\`\`\`javascript
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
\`\`\`

**Finding faces**
To find faces, we create a face finder object. Let's find the face of the door:
\`\`\`javascript
  // const house = ...
  return {
    shape: house,
    highlightFace: (f) => f.inPlane("XZ", 35),
  };
\`\`\`
There are many different types of filters like \`inPlane\`. For instance:
- \`f.ofSurfaceType("CYLINDRE")\` will return the inside of the window.
- \`f.containsPoint([0, -15, 80])\` will return both sides of the roof.

**Finding edges**
To find edges, it works in the same way, you just work with an EdgeFinder. For instance, to find the top of the roof:
\`\`\`javascript
  // const house = ...
  // const findRooftop = new EdgeFinder() // In full example
  return {
    shape: house,
    highlightEdge: e => e.containsPoint([0, -15, 80])
  };
\`\`\`

**Combining filters**
By default you can chain different filter conditions (AND). For instance, to find the window of the back of the house:
\`\`\`javascript
  // const house = ...
  return {
    shape: house,
    highlightEdge: e => e.ofCurveType("CIRCLE").inPlane("XZ")
  };
\`\`\`
- **Either condition (OR)**: \`(f) => f.either([(f) => f.inPlane("YZ", 50), (f) => f.inPlane("YZ", -50)]);\`
- **Negating a condition (NOT)**: \`const frontWindow = (e) => e.ofCurveType("CIRCLE").not((f) => f.inPlane("XZ"));\`

**Finding a specific face/edge**
You can also find a specific face to return it as a new shape.
\`\`\`javascript
const { FaceFinder } = replicad;
// ... house definition
return new FaceFinder().inPlane("XZ", 30).find(house);
\`\`\`

---

### Modifications

It is also possible to apply some advanced modifications to shapes. These modifications use finders to filter out which face or edges they need.

**Fillet and chamfer**
Adding fillet (rounded edges) and chamfers (beveled edges) is a very common operation.
\`\`\`javascript
const { drawRoundedRectangle } = replicad;
const main = () => {
  return drawRoundedRectangle(30, 50).sketchOnPlane().extrude(20).fillet(2);
};
\`\`\`
When configuring a fillet with a number, all the edges of the shape will be filleted. To target specific edges, use a finder:
\`\`\`javascript
const { drawRoundedRectangle } = replicad;
const main = () => {
  return drawRoundedRectangle(30, 50)
    .sketchOnPlane()
    .extrude(20)
    .fillet(2, (e) => e.inPlane("XY", 20));
};
\`\`\`

**Multiple radii**
You can apply different radii for different edges:
\`\`\`javascript
const { drawRoundedRectangle, EdgeFinder, combineFinderFilters } = replicad;
const main = () => {
  const [filters] = combineFinderFilters([
    { filter: new EdgeFinder().inPlane("XY", 20), radius: 2 },
    { filter: new EdgeFinder().inDirection("Z"), radius: 9 },
  ]);

  return drawRoundedRectangle(30, 50)
    .sketchOnPlane()
    .extrude(20)
    .fillet(filters);
};
\`\`\`

**Asymmetric chamfer**
\`\`\`javascript
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
\`\`\`
The selected face corresponds to the face on which the first distance will be applied.

**Fillet with radius evolution**
You can also have a fillet vary along the edge.
\`\`\`javascript
const { makeBaseBox } = replicad;

export default function main() {
  let base = makeBaseBox(30, 50, 10);
  return base.fillet([4, 1], (e) => e.inPlane("YZ", 15).inDirection("Y"));
}
\`\`\`

**Shell**
With a shell you can hollow out a full shape. You need to specify a face that will be hollow.
\`\`\`javascript
const { drawRoundedRectangle } = replicad;
const main = () => {
  return drawRoundedRectangle(30, 50)
    .sketchOnPlane()
    .extrude(20)
    .shell(5, (f) => f.inPlane("XY", 20));
};
\`\`\`
`;

export const REPLICAD_DOCS_WIKI = `
## 1.1 Purpose

This document contains a beginner's guide for users of the Replicad (https://replicad.xyz/) libary and tools. Its purpose is mainly to demonstrate how models can be build using the tools, the so-called "studio", that are offered alongside the library. If you want to use this document to generate a separate manual, use one of the tools available to generate a simple document out of a github wiki repository.

At the Replicad website some documentation is offered as well as links to the detailed documentation of the API (Application Progamming Interface) of the library (see https://replicad.xyz/docs/api/). Nevertheless it can be quite daunting to collect all information for people that are just interested in modelling and are less experienced in reading computer code or building applications.

Using the Replicad tools it is possible to build complicated mechanical parts and even free form geometry. Two examples are shown below. Throughout the guide some examples will be given how the commands discussed in each chapter can be applied to real modelling examples.

For additional help you can visit https://github.com/sgenoud/replicad and in particular the discussions area. There are sections labelled "Q&A" and "modelling help" where you can post your question.

To understand how the library can be included in new applications please consult the replicad website at https://replicad.xyz/. A very nice example how the library can be used can be visited at https://blingmything.sgenoud.com/.

## 1.2 What is Replicad?

Replicad is a software library that allows the user to enter a kind of script to create a 3D model. This model can then be exported in several formats, allowing the user to create nice images (renders) or to send the shape to a 3D printer.

The approach to model a 3D shape with code (or script) has become popular through the availability of a software package called OpenSCAD. OpenSCAD uses a technique called Constructive Solid Geometry (CSG), which indicates that 3D shapes are created by combining simple geometric shapes such as boxes, spheres, cylinders into more complex shapes. The operations used to combine these shapes are called boolean operations.

Replicad takes this approach a step further. It still retains the approach that shapes are created with a simple script, but it uses a more advanced 3D kernel that allows BRep (Boundary Representation) modelling. In this type of 3D kernel a solid is represented as a collection of surface elements - described using a mathematical equation - that define the boundary between interior and exterior points.

The advantage of a BRep kernel is that in addition to the simple boolean operations it is possible to define how the surfaces are linked to each other. This allows a more easy creation of angled edges (chamfers) or rounded edges (fillets).

## 1.3 Tools to work with Replicad

A model in Replicad is built using a javascript input file. The best way for a beginner is to use the studio tools which come in two flavours namely the workbench and a visualizer.

### 1.3.1 Workbench
The workbench, available at https://studio.replicad.xyz/workbench , is a complete design environment that includes a code editor with a pane to visualize the result of the input file. The result can be exported to STL and STEP formats.

### 1.3.2 Visualizer
For people that prefer to edit the input files on their own computer using their preferred code editor, a visualizer is offered at https://studio.replicad.xyz/visualiser that can be used to show the results of processing an input file.

## 1.4 File template

The template to create and display a 3D part in Replicad looks like this.

\`\`\`javascript
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

You can also use the arrow notation for the javascript function.

\`\`\`javascript
const defaultParams = { ... }

const main = (
  { Sketcher, sketchRectangle, ... },
  { height, basewidth, ....        }
) => {
    // add code to describe the shape
    return  shape
}
\`\`\`

If you want to display multiple shapes, the returned variable should be an array of all shapes. In this array it is possible to define the variable name of the shape, the name of the shape as a "string", the color of the shape, and the opacity (1 is visible, 0 is transparent).

An example of an array is:
\`\`\`javascript
let shapeArray = [
{shape: plunge, name: "plunge", color:"steelblue", opacity: 0.5},
{shape: body, color: "orange",opacity:0.5},
{shape: filler, color: "red"}]
\`\`\`

## 2.1 How to create 3D parts?

The process to create a 3D solid part in Replicad looks like this:
1.  **Create a 2 dimensional sketch**: The normal flow to define a solid part is to start with a 2-dimensional sketch.
2.  **Create a solid shape**: By using a method like extruding, lofting, revolving or sweeping, the 2D sketch is translated into a 3-dimensional solid.
3.  **Use simple predefined drawings or solids**: A beginner can start with pre-baked shapes, i.e. standard shapes, to shorten the path.
4.  **Modify the solid shape**: The 3D shape can then be modified, for example by rounding or chamfering sharp edges.
5.  **Move or transform the solid shapes**: After their creation, solid shapes can be moved and rotated.
6.  **Combine parts**: Different parts can be combined to create new shapes using boolean operations.

## 2.2 Comparing the Replicad approach with other tools

For users that have used a CAD program, the terminology will sound very familiar. Tools like Solidworks, OnShape, or FreeCad use a very similar approach, although they do not use code to determine the shape but visual interaction. The list of parameters and features in a visual CAD program contains the same information as is represented in the code of Replicad.

Replicad is built upon the OpenCascade 3D modelling kernel. One of the most referenced shortcomings of OpenCascade is referred to as the "Topological Naming Problem" (or TNP). Whenever a model is modified so that the number of faces or edges change, the internal names of faces and edges are changed by the kernel. If your model relies on referencing the edges or faces by their old name, rebuilding the model will fail.

## 3.1 Create a new sketch or drawing

To start a sketch, use the \`new Sketcher\` command. Note the keyword \`new\` that is required to create a new object of the type \`Sketcher\`.
\`\`\`javascript
let sketch = new Sketcher("XZ",-5)
".sketchCommands"
.close()
.done()
.closeWithMirror()
\`\`\`
The definition of a sketch refers to a plane in 3D space where the sketch is drawn (e.g., "XY", "XZ", "YZ").

An alternative and often preferred method is to use the function \`draw()\` to create a drawing. A drawing is considered a pure 2D shape that can be placed on a plane after its creation.
\`\`\`javascript
const shape1 = draw()
    .lineTo([20,0])
    // ... more drawing commands
    .close()
\`\`\`
After its creation, a drawing has to be placed on a plane, using the method \`.sketchOnPlane\`.
\`\`\`javascript
const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);
\`\`\`
The full set of commands to create and position planes is:
| method | description |
|---|---|
| \`.sketchOnPlane(plane,offset)\` | place the drawing on a given plane |
| \`makePlane()\` | create a basic plane, default is on the XY plane |
| \`.pivot(degrees, axis)\` | rotate the plane x degrees around the given axis |
| \`.translate\` | translate the plane |
| \`.translateZ\` | translate the plane along the Z-axis |
| \`.translateY\` | translate the plane along the Y-axis |
| \`.translateX\` | translate the plane along the X-axis |

## 3.2 Create straight lines

Straight lines can be sketched using the line functions.
| method | description |
|---|---|
| \`.movePointerTo([x,y])\` | move pointer without drawing, can only be used at start |
| \`.lineTo([x,y])\` | line to absolute coordinates |
| \`.line(dx,dy)\` | line to relative coordinates |
| \`.vLineTo(y)\` | vertical line to absolute y |
| \`.vLine(dy)\` | vertical line to relative y |
| \`.hLineTo(x)\` | horizontal line to absolute x |
| \`.hLine(dx)\` | horizontal line to relative x |
| \`.polarLineTo([r,theta])\`| line to absolute polar coordinates |
| \`.polarLine(dist,angle)\` | line to relative polar coordinates |
| \`.tangentLine(distance)\` | tangent extension over distance |

## 3.3 Create arcs and ellipses

| method | description |
|---|---|
| \`.threePointsArcTo(end,mid)\` | arc from current to end via mid, absolute coordinates|
| \`.sagittaArcTo(end,sagitta)\` | arc from current to end with sag, absolute coordinates|
| \`.tangentArcTo([x,y])\` | arc tangent to current line to end, absolute coordinates|
| \`.ellipseTo([x,y],r_hor,r_vert)\` | ellipse from current to end, absolute coordinates|
| \`.halfEllipse(dx,dy,r_min)\` | half ellipse with r_min as sag, relative coordinates|

## 3.4 Fillets and chamfers in 2D

Creating a rounded edge or fillet in sharp corners of your sketch can be achieved with \`customCorner(radius)\`. This method should be placed between the two methods used to define the corner.
\`\`\`javascript
const { draw } = replicad;
const main = () => {
  return draw([20,0])
    .hLine(30)
    .customCorner(5.45)
    .vLine(11)
    .close();
}
\`\`\`
To create chamfers, add a second argument: \`customCorner(radius, "chamfer")\`.

## 3.5 Free form curves

Free form curves can be created with Bezier and Spline methods.
| method | description |
|---|---|
| \`.bezierCurveTo([x,y],points[])\` | Bezier curve to end along control points |
| \`.quadraticBezierCurveTo([x,y],[x_ctrl,y_ctrl])\` | Quadratic bezier curve to end with one control point |
| \`.cubicBezierCurveTo([x,y],p_ctrl_start,p_ctrl_end)\` | Cubic bezier curve with begin and end control points |
| \`.smoothSplineTo([x,y],splineconfig)\` | smooth spline to end, absolute coordinates |
| \`drawPointsInterpolation(points[])\` | create a curve that interpolates all points in the array|

## 3.6 Pre-baked sketches and drawings

Standard functions are available to simplify creating standard shapes like rectangles, circles, and ellipses.
| method | description |
|---|---|
| \`sketchRectangle(length,width)\` | create a sketch of a rectangle |
| \`sketchCircle(radius,{config?})\` | create a sketch of a circle |
| \`drawRoundedRectangle(l, w, r)\` | Draw a rounded rectangle centered at [0,0] |
| \`drawCircle(radius)\` | Draw a circle with a given radius, centered at [0,0] |
| \`drawPolysides(radius, sidesCount)\` | Creates the Drawing of a polygon |
| \`drawText("text",{...options}) \`| Draw a 2D text |

## 3.7 Methods for drawings

Drawings support additional methods compared to sketches.
| method | description |
|---|---|
| \`.clone()\` | create a copy of the shape |
| \`.offset(r)\` | create a 2D offset with radius r |
| \`.mirror([center/dir],[origin])\` | create a mirror image |
| \`.translate(xDist,yDist)\` | translate the shape |
| \`.rotate(angle,[center])\` | rotate the shape |
| \`.cut(cuttingDrawing)\` | 2D boolean subtraction |
| \`.intersect(drawing)\` | 2D boolean intersection |
| \`.fuse(other)\` | 2D boolean union |
| \`.sketchOnPlane()\` | place the drawing on a plane |

## 4.1 Create wires in 3D

These functions create a wire in 3D, which can be used as a path for a sweep operation.
| method | description |
|---|---|
| \`makeLine([p1],[p2])\` | Create a straight 3D line |
| \`makeCircle(radius,[c],[n])\`| Create a 3D circle wire |
| \`makeHelix(pitch,h,r)\` | Create a 3D helix |
| \`makeTangentArc(start,tan,end)\`| Create a 3D tangent arc |
| \`assembleWire([Edges])\` | Create a continuous edge from separate wires |

## 4.2 Create faces in 3D

You can also create complete faces in 3D.
| method | description |
|---|---|
| \`makeFace(wire)\` | Create a face from a wire |
| \`makePolygon(points[])\` | Create a face from an array of points in a plane |
| \`makeSolid(faces[]/shell)\` | Create a solid from an array of faces or a shell |

## 5.1 What is a shape or solid?

A solid in OpenCascade is a 3D volume that is closed. Closed means that the infinitely thin surfaces that build the shape enclose the volume completely.

## 5.2 Methods to add thickness to a 2D sketch

| method | description |
|---|---|
| \`.extrude(dist,{config?})\` | extrude a face over a distance normal to the face. |
| \`.loftWith([sketches],{cfg?})\`| build a solid by lofting between different wires |
| \`.revolve(axis?,{config?})\` | revolve a drawing around an axis to create a solid. |
| \`.sweepSketch(sketchFunction)\`| Sweep a sketch along the path of another sketch. |

## 6.1 What are modifications?

This section explains how to modify a 3D solid.
| method | description |
|---|---|
| \`.fillet(radius,filter?)\` | round an edge of a shape. |
| \`.chamfer(radius,filter?)\`| create a beveled transitional face on an edge. |
| \`.shell(thickness, faceFilter)\`| create a thin walled object, removing the indicated face. |
| \`makeOffset(shape,thickness)\`| create a shape that is offset from the original. |

## 6.2 Selecting faces or edges for modification

Most modification methods require selecting an edge or face. In Replicad a filter mechanism is used to find these features.

### 6.2.1 Selecting faces
Faces can be selected using a \`FaceFinder\` object or an arrow function.
\`\`\`javascript
// Arrow notation
let hollowShape = solidShape.shell(thickness, (f) => f.inPlane("YZ",-20));
\`\`\`
Face selection methods:
| method | description |
|---|---|
| \`.inPlane("XZ",35)\` | select all faces in a given plane and offset |
| \`.ofSurfaceType("CYLINDRE")\`| select all faces of a certain surface type |
| \`.containsPoint([0,-15,80])\`| select a face that contains a given point |

### 6.2.2 Selecting edges
Selecting edges works similarly to selecting faces, using an \`EdgeFinder\`.
| method | description |
|---|---|
| \`.inDirection("Z")\` | find all edges that have a certain direction |
| \`.ofLength(number)\` | find all edges with a particular length |
| \`.inBox(corner1,corner2)\` | finds all edges (partly) within a box |
| \`.ofCurveType("CIRCLE")\` | find all edges of a certain curve type |

### 6.2.3 Combine filters
Filters can be combined with \`and\` (default chaining), \`either\` (OR), and \`not\` (negation).
\`\`\`javascript
const frontWindow = new EdgeFinder().ofCurveType("CIRCLE").not((f) => f.inPlane("XZ"));
\`\`\`

## 7. Transformations
The transform functions require a 2D face or a 3D shape.
\`\`\`javascript
transformedShape = shape."transformCommand"
\`\`\`
| method | description |
|---|---|
| \`.translate([dx,dy,dz])\`| Translate a part over a distance |
| \`.rotate(angle,axisOrigin,axisEnd)\`| Rotate a part over degrees along an axis |
| \`.scale(number)\`| Scale the part equally in all directions |
| \`.mirror("YZ",[-10,0])\`| Mirror the part in a given plane |

## 8.1 Overview of methods to combine solids

Replicad offers a number of methods to combine solids using boolean operations.
| method | description |
|---|---|
| \`.cut(tool)\` | cut the tool-shape from the base shape (subtraction) |
| \`.fuse(otherShape)\` | fuse the other shape with the base shape (union) |
| \`.intersect(tool)\` | find the volume common to both shapes (intersection) |
| \`makeCompound(shapeArray[])\`| combine an array of shapes into a single entity |

## 9. Functions and Recipes

### 9.1 Define points based on directions and distances
\`\`\`javascript
function Polar(currentPoint,distance,angleDegToX)
{
    let newPoint = [];
    let angleRad = angleDegToX * Math.PI/180;
    newPoint[0]  = currentPoint[0] + distance * Math.cos(angleRad);
    newPoint[1]  = currentPoint[1] + distance * Math.sin(angleRad);
    return newPoint
}
\`\`\`

### 9.2 Circles joined with tangent lines
This function can be used to draw two circle-arcs connected with tangent lines.
\`\`\`javascript
function dropView(radius1, radius2, distance)
{
    let sinus_angle = (radius1 - radius2) / distance
    let angle = Math.asin(sinus_angle);
    // ... logic to calculate points
    let dropDrawing = draw(p1)
                    .lineTo(p2)
                    .threePointsArcTo(p4,p3)
                    .lineTo(p5)
                    .threePointsArcTo(p1,p6)
                    .close();
    return dropDrawing
}
\`\`\`

### Create a polar array
This script creates a polar array of shapes.
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

## 10.1 Exporting shapes
Replicad offers three options to save your work: STL, STEP, and JSON format.

### 10.1.1 Exporting for 3D printing
For 3D printing, you need a polygonal format like STL. Replicad can export directly to STL. The resolution can be adjusted in the underlying code if needed.

### 10.1.2 Exporting for further modification
To transfer a model to other 3D design software, STEP format is preferred as it accurately describes the shape with curves and faces.

## 10.2 Importing shapes

### 10.2.1 Importing 2D shapes
Replicad currently offers no direct option to import 2D sketches. A workaround is to analyze an SVG file exported from another program and manually translate the path commands into Replicad drawing methods.

### 10.2.2 Importing 3D shapes
Replicad can import STEP and STL files.
\`\`\`javascript
let shapeFromSTEP = await importSTEP(blobFile)
let shapeFromSTL  = await importSTL(blobFile)
\`\`\`
These functions are asynchronous and require a Blob object as input. A common method is to convert a file to a base64 string, then convert that string to a Blob in the code.
\`\`\`javascript
let {importSTEP} = replicad

async function main()
{
    let stepFile = "SVNPLTEwMzAzLTIxOwpIRUFERVI7..."; // a very long base64 string

    // function to convert base64 to blob
    const base64ToBlob = async (base64, type = 'text/html') =>
      fetch(\`data:\${type};base64,\${base64}\`)
      .then(res => res.blob())

    const blobFile = await base64ToBlob(stepFile)

    let shape = await importSTEP(blobFile)
    let shapeRounded = shape.clone().fillet(8).mirror("XZ",10)

    return [shape,shapeRounded]
}
\`\`\`
`;

export const REPLICAD_EXAMPLES = [
`
// A simple vase
// This is a simple vase that shows off the smoothSpline API.
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
`,
`
// Code CAD Birdhouse
// This is the birdhouse used to demonstrate many different code cad tools.
const { drawCircle, draw, makePlane } = replicad;

const defaultParams = {
  height: 85.0,
  width: 120.0,
  thickness: 2.0,
  holeDia: 50.0,
  hookHeight: 10.0,
};

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
`,
`
// Opencascade bottle
// If you have dabbled in opencascade you have read the bottle tutorial.
// So what does it look like with replicad?
const { draw, makeCylinder, makeOffset, FaceFinder } = replicad;

const defaultParams = {
  width: 50,
  height: 70,
  thickness: 30,
};

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
`,
`
// The CadQuery cycloidal gear
// As in CadQuery replicad supports sketching parametric functions,
// we can implement this gear as well.
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
`,
`
// Wavy vases
// A more complex vase generator that uses twisted extrusion.
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
    if (holeMode === 1) {
      const insideRadius =
        polysideInnerRadius(radius, sidesCount, sideRadius) - wallThickness;
      const hole = drawCircle(insideRadius).sketchOnPlane().extrude(holeHeight, {
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
`,
`
// Gridfinity boxes generator
// From the gridfinity system. This is a fairly complex build.
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
const CORNER_RADIUS = 4;
const SOCKET_HEIGHT = 5;
const SOCKET_SMALL_TAPER = 0.8;
const SOCKET_BIG_TAPER = 2.4;
const SOCKET_VERTICAL_PART =
  SOCKET_HEIGHT - SOCKET_SMALL_TAPER - SOCKET_BIG_TAPER;

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
  
  // This is a simplified version of the full example for brevity
  return box;
}
`,
`
// Watering can
// This model is inspired by Robert Bronwasser's watering can.
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
`,
`
// Orthographic Projections
// Replicad supports projections into a drawing (and therefore a projection as an SVG).
// This code follows the first angle convention.
const { drawProjection, draw } = replicad;

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
`,
`
// Custom perspectives
// You can also have nice looking perspectives on your shapes.
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
`
];

export const REPLICAD_DOCS_REMAINING_EXAMPLES_PART_1 = [
`
// Recipe: Polar array
// Sometimes you want to copy a shape with a circular pattern. This is fairly easy to do with a little bit of javascript.
// For the optimal use, take into account that we assume:
// - that your original shape is centered at the origin
// - that you want to rotate around the origin
// - that you want to go all around the circle
const polarCopies = (shape, count, radius) => {
  const base = shape.translate(0, radius);
  const angle = 360 / count;

  const copies = [];
  for (let i = 0; i < count; i++) {
    copies.push(base.clone().rotate(i * angle));
  }
  return copies;
};

// Example usage (2D):
const { drawCircle } = replicad;
function main() {
  return polarCopies(drawCircle(5), 5, 12);
}
`,
`
// Recipe: Swept profile box
// Let's say you want to start designing with a box. A way to work with a more complex shape
// is to draw the profile in 2D, and then sweep it along a base sketch.
// This code assumes:
// - the input profile is a single open line
// - the base is a single closed line
// - there is only one profile point at the coordinate of the end of the profile
// - The box will have its base in the XY plane.
const { makeSolid, makeFace, assembleWire, EdgeFinder } = replicad;

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

// Example usage:
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
`,
`
// Recipe: Fuse All
// You might find yourself in a situation where you have an array of shapes (2D or 3D)
// and you just want to fuse (or intersect) them all together. The following snippet just does this.
const fuseAll = (shapes) => {
  let result = shapes[0];
  shapes.slice(1).forEach((shape) => {
    result = result.fuse(shape);
  });
  return result;
};

// Example usage:
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
  return fuseAll(polarCopies(drawCircle(5), 5, 7));
}
`,
`
// Example: A fixation for a toy road
/** @typedef { typeof import("replicad") } replicadLib */
/** @type {replicadLib} */
const { draw, drawCircle } = replicad;

export const defaultParams = {
  width: 40,
  height: 16,
  pinBumpSize: 1,
  totalPinDiameter: 11,
  pinDistance: 22,
  pinHeight: 7,
  baseThickness: 1,
  slantHeight: 2,
  slitWidth: 1,
  slitClearance: 0.2,
  slitHeight: 10,
};

function pill(width, height) {
  const radius = height / 2;
  return draw([width / 2 - radius, -radius])
    .bulgeArc(0, height, 1)
    .hLine(-width + height)
    .bulgeArc(0, -height, 1)
    .close();
}

function pin(totalRadius, bumpSize) {
  const radius = totalRadius - bumpSize;
  const base = drawCircle(radius);
  const bump = drawCircle(bumpSize);

  return base
    .fuse(bump.translate(0, radius))
    .fuse(bump.translate(0, -radius))
    .fuse(bump.translate(-radius, 0));
}

export default function main({
  width,
  height,
  pinBumpSize,
  pinDistance,
  totalPinDiameter,
  pinHeight,
  baseThickness,
  slantHeight,
  slitWidth,
  slitClearance,
}) {
  const singlePin = pin(totalPinDiameter / 2, pinBumpSize)
    .sketchOnPlane()
    .extrude(pinHeight);
  const baseDrawing = pill(width, height);
  const baseTopDrawing = pill(
    width - slantHeight * 2,
    height - slantHeight * 2
  );

  const base = baseTopDrawing
    .sketchOnPlane()
    .loftWith([
      baseDrawing.sketchOnPlane("XY", slantHeight),
      baseDrawing.sketchOnPlane("XY", baseThickness + slantHeight),
    ]);

  const slitDrawing = draw([slitWidth / 2, 0]).vLine(0.2).line(slantHeight - 0.2, slantHeight - 0.2).hLine(-slitWidth - 2 * slantHeight + 0.4).line(slantHeight - 0.2, -slantHeight + 0.2).vLine(-0.2).close();
  const slitShape = slitDrawing
    .offset(slitClearance)
    .sketchOnPlane("YZ", -width / 2)
    .extrude(width);

  return {
      shape: base
        .cut(slitShape)
        .fuse(
          singlePin
            .clone()
            .translate(-pinDistance / 2, 0, baseThickness + slantHeight)
        )
        .fuse(
          singlePin
            .clone()
            .rotate(180)
            .translate(pinDistance / 2, 0, baseThickness + slantHeight)
        ),
      name: "Fixation",
    };
}
`,
`
// Example: A base of a toy ship
const { draw, drawRoundedRectangle } = replicad;

export const defaultParams = {
  pinDiameter: 4.8,
  innerPinHeight: 12,
  baseHeight: 80,
  baseWidth: 30,
  baseThickness: 2,
  pinSpacing: 41,
};

export default function main({
  pinDiameter,
  innerPinHeight,
  baseHeight,
  baseWidth,
  baseThickness,
  pinSpacing,
}) {
  const pin = draw()
    .hLine(pinDiameter / 2 + 2)
    .vLine(2)
    .customCorner(0.5, "chamfer")
    .hLine(-2)
    .vLine(innerPinHeight)
    .customCorner(pinDiameter / 4)
    .hLineTo(0)
    .close()
    .sketchOnPlane("XZ")
    .revolve();
  const baseDrawing = drawRoundedRectangle(
    baseWidth,
    baseHeight,
    baseWidth / 3
  );
  const base = baseDrawing
    .sketchOnPlane("XY")
    .loftWith(
      baseDrawing.offset(-baseThickness / 2).sketchOnPlane("XY", baseThickness)
    );

  return base
    .fuse(pin.clone().translate(0, pinSpacing / 2, baseThickness))
    .fuse(pin.clone().translate(0, -pinSpacing / 2, baseThickness));
}
`,
`
// Example: CFF Cookie Cutter
// This cookie cutter is designed to make cookies in the shape of the CFF logo.
import { drawSVG } from "https://cdn.jsdelivr.net/npm/replicad-decorate/dist/studio/replicad-decorate.js";

const CFF_LOGO = \`
<svg>
<path xmlns="http://www.w3.org/2000/svg" d="M35.186 17.02h3.75l-5.047-5.163h6.265v5.163h2.96v-5.163h6.267l-5.05 5.163h3.752l6.427-6.708-6.426-6.73h-3.752l5.05 5.185h-6.266V3.583h-2.96v5.184h-6.267l5.047-5.184h-3.75l-6.43 6.73 6.43 6.707" fill="#FFF"/>
</svg>
\`;

export const defaultParams = {
  cookieWidth: 75,
  baseHeight: 1.6,
  totalHeight: 15,
  cutterWidth: 0.6,
};

export default function main({
  cookieWidth,
  baseHeight,
  cutterWidth,
  totalHeight,
}) {
  let logo = drawSVG(CFF_LOGO);
  const bbox = logo.boundingBox;
  logo = logo
    .translate(-bbox.center[0], -bbox.center[1])
    .scale(cookieWidth / bbox.width);

  const base = logo
    .offset(1)
    .cut(logo.offset(-2.5))
    .sketchOnPlane()
    .extrude(baseHeight);
  const cutter = logo
    .offset(cutterWidth)
    .cut(logo)
    .sketchOnPlane()
    .extrude(totalHeight);

  return base.fuse(cutter);
}
`,
`
// Example: Spectre monotile stamp
// A stamp to apply a spectre monotile pattern to ceramics and pottery.
import {
  pantograph,
  drawShape,
  sketchOnPlane,
} from "https://cdn.jsdelivr.net/npm/replicad-pantograph@0.7.1/dist/studio/replicad-pantograph.js";

const { draw, offset, cut, fuse } = pantograph;
const { drawRect } = drawShape;

export const defaultParams = {
  width: 30,
  depth: 10,
  gutterDepth: 2,
  gutterWidth: 2,
  bulge: 0.2,
  straightEdges: true,
};

const MED_SEG = Math.sqrt(3) / 2;
const SPECTER_FIRST_POINT_POS = [-1.5 + MED_SEG, -1.5 + MED_SEG];
const SPECTER_SHAPE = [[0,1],[-MED_SEG,0.5],[0.5,MED_SEG],[1,0],[0,1],[MED_SEG,0.5],[0.5,-MED_SEG],[-0.5,-MED_SEG],[MED_SEG,-0.5],[0,-1],[0,-1],[-MED_SEG,-0.5],[-0.5,MED_SEG],[-1,0]];

const singleBulgeSpecterTile = (bulge = 0.2) => {
  const tilePen = draw(SPECTER_FIRST_POINT_POS);
  SPECTER_SHAPE.forEach(([x, y], i) => {
    tilePen.bulgeArc(x, y, bulge * (i % 2 === 0 ? 1 : -1));
  });
  return tilePen.close();
};

const basicSpecterTile = () => {
  const tilePen = draw(SPECTER_FIRST_POINT_POS);
  SPECTER_SHAPE.forEach(([x, y]) => {
    tilePen.line(x, y);
  });
  return tilePen.close();
};

export default function main({
  width,
  gutterWidth,
  gutterDepth,
  depth,
  straightEdges,
  bulge,
}) {
  const tile = straightEdges
    ? basicSpecterTile()
    : singleBulgeSpecterTile(bulge);

  const scaleFactor = width / tile.boundingBox.width;

  const innerTiles = fuseAll(
    makeMetaTile(tile, scaleFactor).map(t => {
      const bottom = offset(t, -gutterWidth / 2);
      const top = offset(t, -0.15);
      return sketchOnPlane(bottom, "XY", depth - gutterDepth).loftWith(
        sketchOnPlane(top, "XY", depth)
      );
    })
  );

  let outerBorder = offset(fuseAll(makeMetaTile(tile, scaleFactor)), -0.1);

  return {
      shape: sketchOnPlane(outerBorder)
        .extrude(depth)
        .cut(innerTiles, { optimization: "commonFace" }),
      name: "Spectre Stamp",
    };
}
`,
`
// Example: A lamp rosette
// Designed to hide a bad paint job on a ceiling.
const { drawCircle, draw } = replicad;

export const defaultParams = {
  outerRadius: 90,
  depth: 22,
  wallThickness: 1.6,
  cableHoleRadius: 5,
  screwDiameter: 4,
  screwPosition: 60,
  screwSlitLength: 10,
};

const drawPill = (width, height) => {
  const w = width - height;
  return draw([-w / 2, -height / 2])
    .hLine(w)
    .vBulgeArc(height, 1)
    .hLine(-w)
    .vBulgeArc(-height, 1)
    .close();
};

export default function main({
  outerRadius,
  depth,
  wallThickness,
  cableHoleRadius,
  screwDiameter,
  screwSlitLength,
  screwPosition,
}) {
  const fixHoleBase = drawPill(screwSlitLength, screwDiameter);
  const fixHeadBase = fixHoleBase.offset(2);
  const fixOuterBase = fixHeadBase.offset(wallThickness);
  const fixHoleTop = fixHoleBase.offset(3);
  const fixOuterTop = fixOuterBase.offset(3);

  const fix = fixOuterTop
    .sketchOnPlane("XY")
    .loftWith(fixOuterBase.sketchOnPlane("XY", depth));

  const fixHole = fixHoleTop
    .sketchOnPlane("XY")
    .loftWith(fixHeadBase.sketchOnPlane("XY", depth - wallThickness))
    .fuse(fixHoleBase.sketchOnPlane().extrude(depth));

  const cableHole = drawCircle(cableHoleRadius).sketchOnPlane().extrude(depth);

  const slitPosition1 = [screwPosition, 0, 0];
  const slitPosition2 = [-screwPosition, 0, 0];

  const shape = drawCircle(outerRadius)
    .sketchOnPlane()
    .extrude(depth)
    .chamfer(3, e => e.inPlane("XY"))
    .fillet(3, e => e.inPlane("XY", 3))
    .shell(wallThickness, f => f.inPlane("XY", depth))
    .cut(cableHole)
    .fuse(fix.clone().translate(slitPosition2))
    .cut(fixHole.clone().translate(slitPosition2))
    .fuse(fix.rotate(90).translate(slitPosition1))
    .cut(fixHole.rotate(90).translate(slitPosition1));

  return { shape, name: "Rosette" };
}
`,
`
// Example: A training wheel for my son's bike
// The rod was not broken, so I just needed to replace the wheel.
const { drawCircle } = replicad;

export const defaultParams = {
  outerRadius: 50,
  depth: 30,
  boltRadius: 10,
  boltHoleRadius: 5.5,
  boltDepth: 10,
  endcapWidth: 1.6,
  endcapHeight: 4,
  wheelFillet: 3,
};

export default function main({
  outerRadius,
  depth,
  boltRadius,
  boltHoleRadius,
  boltDepth,
  endcapWidth,
  endcapHeight,
  wheelFillet,
}) {
  return drawCircle(outerRadius)
    .sketchOnPlane()
    .extrude(depth)
    .chamfer(wheelFillet)
    .fuse(
      drawCircle(boltHoleRadius + endcapWidth + endcapHeight)
        .sketchOnPlane("XY", depth)
        .extrude(endcapHeight)
        .chamfer(endcapHeight - 1e-9, e =>
          e.inPlane("XY", depth + endcapHeight)
        )
    )
    .cut(drawCircle(boltRadius).sketchOnPlane("XY").extrude(boltDepth))
    .cut(
      drawCircle(boltHoleRadius)
        .sketchOnPlane()
        .extrude(depth + endcapHeight)
    )
    .chamfer(3, e => e.either([e => e.withinDistance(boltRadius, [0, 0, 0])]));
}
`,
`
// Example: A fixture for a square USB hub
// I wanted to fix my i-tech USB hub to the bottom of my desk.
const { drawRoundedRectangle, draw } = replicad;

export const defaultParams = {
  squareSide: 115,
  depth: 30,
  fillet: 16,
  supportWidth: 18,
  wallThickness: 2,
  screwDiameter: 3.1,
  screwHeadDiameter: 7,
  margin: 3,
};

export default function main({
  squareSide,
  depth,
  fillet,
  wallThickness,
  supportWidth,
  margin,
  screwDiameter,
  screwHeadDiameter,
}) {
  const centerHole = drawRoundedRectangle(
    squareSide - supportWidth,
    squareSide - supportWidth,
    fillet - supportWidth / 2,
  )
    .sketchOnPlane("XY")
    .extrude(depth + wallThickness + 1);

  const sideHoleWidth = squareSide / 2 - fillet;
  const sideHoles = draw([0, depth + wallThickness])
    .hLine(sideHoleWidth)
    .line(-margin, -margin)
    .vLine(-depth + 3 * margin)
    .line(-margin, -margin)
    .hLine(-sideHoleWidth + 2 * margin)
    .closeWithMirror()
    .sketchOnPlane("XZ", -squareSide)
    .extrude(2 * squareSide);

  const screwHole = draw()
    .hLine(screwDiameter / 2)
    .line((screwHeadDiameter - screwDiameter) / 2, (screwHeadDiameter - screwDiameter) / 2)
    .vLine(depth)
    .hLineTo(0)
    .close()
    .sketchOnPlane("XZ")
    .revolve();
    
  // A simplified version of the screwSupport from the source
  const screwSupport = drawRoundedRectangle(screwHeadDiameter*2, screwHeadDiameter*2)
    .sketchOnPlane()
    .extrude(screwDiameter)
    .cut(screwHole);

  const shape = drawRoundedRectangle(
    squareSide + 2 * wallThickness,
    squareSide + 2 * wallThickness,
    fillet + wallThickness,
  )
    .sketchOnPlane("XY")
    .extrude(depth + wallThickness)
    .shell(wallThickness, (f) => f.inPlane("XY", depth + wallThickness))
    .cut(centerHole)
    .cut(sideHoles.clone().rotate(90))
    .cut(sideHoles)
    .fuse(screwSupport.clone().translate(squareSide/2, squareSide/2, depth))
    .fuse(screwSupport.clone().translate(-squareSide/2, squareSide/2, depth))
    .fuse(screwSupport.clone().translate(squareSide/2, -squareSide/2, depth))
    .fuse(screwSupport.clone().translate(-squareSide/2, -squareSide/2, depth))
    .chamfer(wallThickness / 3);

  return { shape, name: "i-tech-bracket" };
}
`,
`
// Example: Small pipe adapter
// I have some flexible pipes that I need for brewing beer. The diameter of the pipes
// did not fit, so I designed this adapter to make them fit.
const { drawCircle } = replicad;

export const defaultParams = {
  totalHeight: 13,
  borderHeight: 1,
  borderWidth: 2,
  innerDiameter: 9,
  outerDiameter: 12,
};

export default ({
  totalHeight,
  borderHeight,
  borderWidth,
  innerDiameter,
  outerDiameter,
}) => {
  const outerRadius = outerDiameter / 2;
  const innerRadius = innerDiameter / 2;

  return drawCircle(outerRadius + borderWidth)
    .sketchOnPlane()
    .extrude(borderHeight)
    .fuse(drawCircle(outerRadius).sketchOnPlane().extrude(totalHeight))
    .cut(drawCircle(innerRadius).sketchOnPlane().extrude(totalHeight));
};
`,
`
// Example: Holder for decorations
// I need a very specific shape to hold some decorations on a pole.
const { drawRoundedRectangle, draw, drawCircle } = replicad; 
  
const innerWidth = 18;
const wallThickness=2;
const holeRadius = 5.5;
const tolerance= 0.3;
const height=40;
const innerSpace = 8.1;

const main = () => { 
  const shape = draw()
    .hLine(innerWidth / 2 + wallThickness)
    .vLine(2*wallThickness)
    .bulgeArc(-wallThickness, -wallThickness, 0.5)
    .hLine(-innerWidth / 2)
    .closeWithMirror()
    .sketchOnPlane("XZ").extrude(innerWidth).translateY(innerWidth / 2);

  const holder = draw([0, -innerWidth / 2])
    .lineTo([height, 0])
    .customCorner(6)
    .lineTo([0, innerWidth / 2])
    .close()
    .sketchOnPlane("ZY")
    .extrude(innerSpace).translateX(innerSpace / 2).translateZ(wallThickness);

  return shape.fuse(holder).cut(drawCircle(holeRadius / 2 + tolerance).sketchOnPlane().extrude(height / 2 - wallThickness));
};
`
];

export const REPLICAD_DOCS_REMAINING_EXAMPLES_PART_2 = [
`
// Example: A shopping cart coin
// Many shopping carts in Switzerland require a 2CHF coin to unlock.
// I couldn’t locate any suitable alternatives online, so I decided to create one myself.
const { drawRoundedRectangle, draw, drawCircle } = replicad; 
  
const coin_dia = 27.40;
const coin_hight = 2.15;

const main = () => { 
   const coin = drawCircle(coin_dia / 2).fuse(drawRoundedRectangle(15, 30).translate(0, -15));
   const hole = draw().line(-3, 14).hLine(6).close().sketchOnPlane().extrude(coin_hight).fillet(1.5, e => e.inDirection("Z")).translateY(-32);
   return coin.sketchOnPlane().extrude(coin_hight).fillet(5, e => e.inDirection("Z")).cut(hole);
};
`,
`
// Example: Hook to hang on furniture
// This is a fairly simple object that is quite useful as a parametric model.
const { Sketcher, FaceFinder, makePlaneFromFace } = replicad;

const defaultParams = {
  wallThickness: 2,
  height: 50,
  width: 20,
  hangerDepth: 20,
  handerHeight: 25,
  hookHeight: 20,
  hookDepth: 15,
};

const simpleHook = ({
  height: totalHeight,
  width,
  hangerDepth,
  handerHeight,
  hookHeight,
  hookDepth,
  wallThickness,
} = defaultParams) => {
  const height = Math.max(totalHeight - hookDepth / 2 - wallThickness, wallThickness);
  const hookFlatPart = hookHeight - hookDepth / 2;

  let shape = new Sketcher()
    .vLine(height)
    .hSagittaArc(hookDepth, -hookDepth / 2)
    .vLine(-hookFlatPart)
    .hLine(wallThickness)
    .vLine(hookFlatPart)
    .hSagittaArc(-hookDepth - 2 * wallThickness, hookDepth / 2 + wallThickness)
    .vLine(-height + wallThickness)
    .hLine(-hangerDepth)
    .vLine(handerHeight)
    .hLine(-wallThickness)
    .vLine(-handerHeight - wallThickness)
    .close()
    .extrude(width);

  const hookFace = new FaceFinder()
    .parallelTo("YZ")
    .containsPoint([hookDepth + wallThickness, height, width / 2])
    .find(shape, { unique: true });

  const sagitta = Math.min(hookFlatPart / 3, width / 5);
  const cutout = new Sketcher(makePlaneFromFace(hookFace, [0, 0]))
    .hLine(sagitta)
    .vSagittaArc(-width, sagitta)
    .hLine(-sagitta)
    .close()
    .extrude(-wallThickness);

  return shape.cut(cutout).chamfer(wallThickness / 5);
};

export default function main(config) {
  return { shape: simpleHook(config), name: "hanger-hook" };
}
`,
`
// Example: A strainer for your sink
// I needed some kind of strainer to avoid that all the stuff that gets into the sink goes down the drain.
const { draw, drawCircle } = replicad;

export const defaultParams = {
  totalHeight: 25,
  radius: 24,
  bottomThickness: 2,
  slicesCount: 22,
  detailSize: 2,
  innerNutRadius: 7.8,
  innerNutHeight: 3.6,
};

export default function main({
  totalHeight,
  radius,
  bottomThickness,
  slicesCount,
  detailSize,
  innerNutHeight,
  innerNutRadius,
}) {
  const topRadius = 4;
  const profile = draw([0, 0])
    .hLine(radius)
    .customCorner(detailSize / 2, "chamfer")
    .vLine(bottomThickness + detailSize)
    .customCorner(detailSize / 3)
    .hLine(-detailSize)
    .customCorner(detailSize / 3)
    .line(-2 * detailSize, -detailSize)
    .hLineTo(topRadius)
    .customCorner(Math.max(radius / 4, innerNutRadius + detailSize), "chamfer")
    .vLineTo(totalHeight - topRadius)
    .tangentArc(-topRadius, topRadius)
    .close();

  const outerHoleRadius = radius - 1.2 * detailSize;
  let slice = drawCircle(outerHoleRadius).cut(drawCircle(2 * topRadius));
  const triangles = draw([0, 0]).hLine(radius).polarLineTo([radius, 360 / slicesCount]).close();

  for (let i = 0; i < slicesCount; i++) {
    slice = slice.cut(triangles.rotate((720 / slicesCount) * i));
  }
  const holes = slice.cut(triangles).sketchOnPlane().extrude(totalHeight);

  const basicShape = profile.sketchOnPlane("XZ").revolve().cut(holes);

  if (!innerNutRadius || !innerNutHeight) {
    return basicShape;
  }

  const nutHole = draw().hLine(innerNutRadius + innerNutHeight).line(-innerNutHeight, innerNutHeight).hLineTo(0).close().sketchOnPlane("XZ").revolve();
  return basicShape.cut(nutHole);
}
`,
`
// Example: Honeycomb storage wall
// This model was the original model that lead to the more complex HSW web app.
const {
  draw,
  drawPolysides,
  drawRectangle,
  EdgeFinder,
  assembleWire,
  genericSweep,
  makeFace,
  makeSolid,
} = replicad;

const INNER_WIDTH = 20;
const HEIGHT = 8;
const THICKNESS = 1.8;

export const defaultParams = {
  columns: 5,
  rows: 7,
};

// Simplified for brevity. Full code uses helper classes and more complex profiles.
const main = ({ rows, columns }) => {
  const hexRadius = (INNER_WIDTH + THICKNESS) / (2 * Math.cos(Math.PI / 6));
  const cell = drawPolysides(hexRadius, 6).rotate(30).sketchOnPlane().extrude(HEIGHT);

  let wall = null;
  const xSpacing = 2 * hexRadius * Math.cos(Math.PI / 6);
  const ySpacing = 2 * hexRadius * Math.sin(Math.PI / 6) + hexRadius;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = col * xSpacing + (row % 2) * (xSpacing / 2);
      const y = row * ySpacing;
      const newCell = cell.clone().translate(x, y);
      if (wall) {
        wall = wall.fuse(newCell);
      } else {
        wall = newCell;
      }
    }
  }

  const outerBox = drawRectangle(
    columns * xSpacing,
    rows * ySpacing + hexRadius
  ).sketchOnPlane().extrude(HEIGHT);
  
  return outerBox.cut(wall);
};
`,
`
// Example: A box to hold tiles
// This box has been thought to hold some tiles and have a lid that does not take a lot of room.
const { draw, drawRoundedRectangle } = replicad;

export const defaultParams = {
  width: 69,
  height: 34,
  depth: 25,
  wallThickness: 1.6,
  fillet: 3,
  bottomThickness: 2,
};

function tray({
  width,
  height,
  depth,
  wallThickness,
  fillet,
  bottomThickness = 2.4,
}) {
  const bottom = drawRoundedRectangle(
    height + 2 * wallThickness,
    width + 2 * wallThickness
  ).sketchOnPlane().extrude(bottomThickness);

  const sideShape = (startPoint, endPoint, h) => 
    draw([0, h]).hLine(-startPoint).vLine(-1.4).smoothSplineTo([-endPoint, 0], { endTangent: -90, startTangent: 0 }).hLine(endPoint).closeWithMirror();

  const front = drawRoundedRectangle(height + 2*wallThickness, depth).cut(sideShape(height/2-5, 16/2, depth)).sketchOnPlane("XZ").extrude(-wallThickness).translateY(width/2);
  const back = front.clone().mirror("XZ");

  const left = drawRoundedRectangle(width + 2*wallThickness, depth).cut(sideShape(width/2-5, 16/2, depth)).sketchOnPlane("YZ").extrude(wallThickness).translateX(height/2);
  const right = left.clone().mirror("YZ");

  let tray = front.fuse(back).fuse(left).fuse(right).translateZ(bottomThickness).fuse(bottom).fillet(fillet, e => e.inDirection("Z"));
  return tray;
}

export default function main(params) {
  return tray(params);
}
`,
`
// Example: Box with lid
// I made of version of this box without interior - just to print lidded boxes.
const { draw, drawRoundedRectangle } = replicad;

export const defaultParams = {
  width: 50,
  height: 100,
  depth: 15,
  bottomThickness: 2,
  wallThickness: 1.6,
  tolerance: 0.3,
  printInPlace: true,
};

function hingedWalls({ width, height, depth, wallThickness, tolerance }) {
  const outerWalls = draw([-width/2 - wallThickness, -height/2-wallThickness]).hLine(width+2*wallThickness).customCorner(wallThickness).vLine(height+2*wallThickness).customCorner(wallThickness).hLine(-width-2*wallThickness).close();

  const walls = outerWalls.cut(outerWalls.offset(-wallThickness)).sketchOnPlane().extrude(depth);
  // Simplified version of the lid logic for brevity
  const lid = drawRoundedRectangle(width, height).sketchOnPlane().extrude(wallThickness).translateZ(depth + tolerance);
  return { walls, lid };
}

export default function main({ width, height, depth, bottomThickness, wallThickness, tolerance, printInPlace }) {
  const innerTray = drawRoundedRectangle(width, height).sketchOnPlane().extrude(bottomThickness);
  const { walls, lid } = hingedWalls({ width, height, depth: depth + bottomThickness + tolerance, wallThickness, tolerance });
  const box = walls.fuse(innerTray).fillet(1, e => e.inPlane("XY", bottomThickness));
  return printInPlace ? box.fuse(lid) : box;
}
`
];

export const REPLICAD_DOCS_REMAINING_EXAMPLES_PART_3 = [
`
// Example: Hinged flatbox
// This is a set of experiments to make boxes to store tokens for a board game.
const fuseAll = d => {
  let out = d[0];
  d.slice(1).forEach(s => {
    out = s.fuse(out);
  });
  return out;
};

function makeFlatHinge(height, width, baseHeight, tolerance = 0.4) {
  const radius = height / 2;
  const spacer = () => replicad.draw().movePointerTo([-tolerance / 2, radius]).vLine(-radius / 3).line(-radius / 3, -radius / 3).vLine(-radius / 3).hLine(tolerance).vLine(radius / 3).line(radius / 3, radius / 3).vLine(radius / 3).close();
  let base = replicad.drawRoundedRectangle(width, radius).translate(0, radius / 2);
  base = base.cut(spacer()).cut(spacer().translate(width / 4, 0)).cut(spacer().translate(-width / 4, 0));
  const hinge = base.sketchOnPlane("XY").revolve([1, 0, 0]).translateZ(radius);
  // The full example has more details for flaps
  return { hinge, hingeWidth: radius + tolerance };
}

const main = async ({ drawRoundedRectangle }) => {
  const bottomThickness = 1;
  const wallThickness = 1.2;
  const innerHeight = 6;
  const baseWidth = 150;
  const baseHeight = 100;

  const walls = drawRoundedRectangle(baseWidth - wallThickness, baseHeight - wallThickness).sketchOnPlane().extrude(innerHeight);
  const baseSheet = drawRoundedRectangle(baseWidth, baseHeight, 3).sketchOnPlane().extrude(bottomThickness);
  const { hinge } = makeFlatHinge(2 * bottomThickness + innerHeight, 20, bottomThickness);

  const bottom = baseSheet.clone().fuse(walls).translateY(baseHeight / 2);
  const top = baseSheet.clone().mirror("XZ").translateY(-baseHeight / 2);

  return top.fuse(hinge).fuse(bottom);
};
`,
`
// Example: Hinged box for crayons or pencils
// This model has been created to keep some erasable pencils for my son.
const { draw, drawRoundedRectangle } = replicad;

export const defaultParams = {
  pencilLength: 106,
  pencilDiameter: 13,
  pencilsCount: 5,
  innerHeight: 18,
  bottomThickness: 2,
  wallThickness: 1.6,
};

function pencilsInnerTray({ pencilDiameter, pencilsCount, pencilLength, bottomThickness }) {
  const diameter = pencilDiameter + 1; // with padding
  const height = pencilDiameter / 2 + bottomThickness;
  const singleGutter = draw([-diameter/2, height]).sagittaArc(diameter, 0, -pencilDiameter / 2).vLineTo(0).hLine(-diameter).vLine(height).close();
  
  let tray = singleGutter.clone();
  for (let i = 1; i < pencilsCount; i++) {
    tray = tray.fuse(singleGutter.clone().translate(i * diameter, 0));
  }
  return tray.translate(-((pencilsCount - 1) * diameter)/2, 0).sketchOnPlane("XZ", -pencilLength / 2).extrude(pencilLength);
}

export default function main(params) {
  const { innerTray } = pencilsInnerTray(params);
  const box = drawRoundedRectangle(params.pencilsCount * (params.pencilDiameter+1) + params.wallThickness*2, params.pencilLength + params.wallThickness*2)
      .sketchOnPlane()
      .extrude(params.innerHeight + params.bottomThickness)
      .shell(params.wallThickness, f => f.inPlane("XY", params.innerHeight + params.bottomThickness));
  
  // The original has a complex hinged lid mechanism, simplified here.
  return box.fuse(innerTray);
}
`,
`
// Example: A bracket to hold my scale
// This holder is designed to be affixed with adhesive to securely hold a scale in place.
const { draw } = replicad;

export const defaultParams = {
  length: 150,
  innerHeight: 25,
  wallThickness: 2.4,
  innerWidth: 20,
};

export default function main({
  length,
  innerHeight,
  wallThickness,
  innerWidth,
}) {
  const outerHeight = innerHeight + wallThickness * 2;
  const outerWidth = innerWidth + wallThickness;
  const radius = wallThickness / 2.5;
  const bigRadius = wallThickness;

  return {
    shape: draw()
      .vLine(outerHeight)
      .hLine(outerWidth)
      .vLine(-wallThickness)
      .customCorner(radius)
      .hLine(-innerWidth)
      .customCorner(bigRadius)
      .vLine(-innerHeight)
      .customCorner(bigRadius)
      .hLine(innerWidth)
      .customCorner(radius)
      .vLine(-wallThickness)
      .customCorner(radius)
      .hLine(-outerWidth)
      .closeWithCustomCorner(radius)
      .sketchOnPlane("XZ")
      .extrude(length),
    name: "Bracket",
  };
}
`,
`
// Example: A gridfinity tray generator
// A different implementation using blueprints.
const { roundedRectangleBlueprint } = replicad;

export const defaultParams = {
  xSize: 2,
  ySize: 1,
  heigth: 0.5,
  keepFull: false,
  wallThickness: 1.2,
};

const SIZE = 42.0;
const CLEARANCE = 0.5;
const CORNER_RADIUS = 4;

export function run({ xSize = 2, ySize = 1, heigth = 0.5, keepFull = false, wallThickness = 1.2 } = {}) {
  const stdHeight = heigth * SIZE;
  let box = roundedRectangleBlueprint(
    xSize * SIZE - CLEARANCE,
    ySize * SIZE - CLEARANCE,
    CORNER_RADIUS
  )
    .sketchOnPlane()
    .extrude(stdHeight);

  if (!keepFull) {
    box = box.shell(wallThickness, f => f.inPlane("XY", stdHeight));
  }
  // The original has complex socket and top shape logic, simplified here.
  return box;
}

const main = config => {
  return { shape: run(config), name: "gridfinity box" };
};
`,
`
// Example: Corners to stack cardboard boxes
const { Sketcher, makePlaneFromFace, FaceFinder } = replicad;

const defaultParams = {
  cardboardThickness: 2,
  wallThickness: 1.8,
  height: 5,
  length: 20,
};

const shape = ({ length, wallThickness, cardboardThickness, height } = defaultParams) => {
  const sideSize = 2 * wallThickness + cardboardThickness + wallThickness;
  const base = new Sketcher()
    .vLine(length - sideSize)
    .hLine(length - sideSize)
    .vLine(sideSize)
    .hLine(-length)
    .vLine(-length)
    .hLine(sideSize)
    .close()
    .extrude(wallThickness);

  const topFace = new FaceFinder().parallelTo("XY").find(base, { unique: true });
  const fence = new Sketcher(makePlaneFromFace(topFace, [0, 0]))
    .vLine(length)
    .hLine(length)
    .vLine(-wallThickness)
    .hLine(-length + wallThickness)
    .vLine(-length + wallThickness)
    .close()
    .extrude(height);

  // The original has complex inner and outer clip logic, simplified here.
  return base.fuse(fence);
};
`,
`
// Example: Standard objects as offered in TinkerCad
const {draw,drawRectangle,drawCircle,drawPolysides, makeCylinder,makeBaseBox,makeSphere} = replicad

function main() {
  let bDim = 10;
  let hDim = 10;

  let stdCylinder = makeCylinder(bDim/2,hDim).translate([-45,0,hDim/2]);
  let stdBox = makeBaseBox(bDim,bDim,hDim).translate([-30,0,hDim/2]);
  let stdSphere = makeSphere(bDim/2).translate([-15,0,bDim/2]);
  let stdRoof = draw().hLine(bDim).line(-bDim/2,hDim).close().sketchOnPlane("XZ").extrude(bDim).translate(0,bDim/2,0);
  let stdHex = drawPolysides(bDim/2,6).sketchOnPlane("XY").extrude(hDim).translate([15,0,hDim/2]);
  let stdCone = draw().hLine(bDim/2).line(-bDim/2,hDim).close().sketchOnPlane("XZ").revolve().translate([-45, -bDim*1.5,0]);
  let piramid = drawRectangle(bDim,bDim).sketchOnPlane("XY").loftWith([], {endPoint:[0,0,hDim]}).translate(-30,-bDim*1.5,0);
  
  return [
    {shape: stdCylinder, color:"orange"},
    {shape: stdBox, color: "red"},
    {shape: stdSphere, color: "blue"},
    {shape: stdRoof, color: "green"},
    {shape: stdHex, color: "darkblue"},
    {shape: stdCone, color: "purple"},
    {shape: piramid, color: "yellow"}
  ];
}
`,
`
// Example: Created something similar to the YouTube logo
const {drawSingleCircle, makeSphere, draw} = replicad

function main() {
  let circleRight = drawSingleCircle(150).translate(150-(86.5/2)-13.4,0);
  let circleLeft = drawSingleCircle(150).translate(-150+(86.5/2)+13.4,0);
  let circleTop = drawSingleCircle(380).translate(0, -380+(51.2/2)+13.4);
  let circleBottom = drawSingleCircle(380).translate(0, +380-(51.2/2)-13.4);

  let youTubeLogo = circleRight.intersect(circleLeft).intersect(circleBottom).intersect(circleTop).sketchOnPlane("XY").extrude(20);
  let bigBall = makeSphere(400).translate([0,0,-380]);
  youTubeLogo = youTubeLogo.intersect(bigBall).fillet(13.4);

  let arrow = draw([-14,-17.8]).polarLine(35.6,30).polarLine(35.6,150).close().sketchOnPlane("XY",10).extrude(5);
  youTubeLogo = youTubeLogo.cut(arrow);

  return [{shape: youTubeLogo, color: "red"}, {shape: arrow.translateZ(-1), color: "white"}];
}
`,
`
// Example: Holder for GPS receiver
const r = replicad

const main = () => {
  let lx = 45.25, ly = 79.25, lz = 11.4;
  let lt = 0.5, th = 2;

  // shape of GNS receiver
  let receiver = r.makeBaseBox(lx+lt, ly+lt, lz+lt).fillet(((lz-lt)/2),(e)=>e.inDirection("Y")).translate([0,0,th]);
  // shape of holder
  let shape = r.makeBaseBox(lx+2*th,ly+2*th,lz+2*th).fillet((lz+2*th-lt)/2,(e)=>e.inDirection("Y"));
  // define cutter objects
  let hollow = r.makeBaseBox(lx,ly+2*th,lz).fillet(((lz-lt)/2),(e)=>e.inDirection("Y")).translate([0,th,th]);
  let cutter = r.makeBaseBox(lx*1.2,ly*0.6,lz*2).translate([0,0,2*th]).fillet(5,(e)=>e.inDirection("X"));
  // create hollow holder with cutout on side
  let shapeUnrounded = shape.cut(hollow).cut(cutter);
  // round the outer edge of the cutout
  let shapeRounded = shapeUnrounded.fillet(1.0,(e)=>e.containsPoint([0, ly*0.6/2 , lz+2*th]));
  return {shape: shapeRounded, name: "holder", color: "steelblue"};
}
`
];

export const REPLICAD_DOCS_MISCELLANEOUS_CONTENT = [
`
// Section: Sharing models
// This short section describes how to share models directly via the workbench.
// Direct links
// You can even open a model directly in the workbench if you click on the Open in workbench button next to the copy button!

// Working with local files
// If you prefer to use your editor of choice it is also possible.
// Create a file (model1.js for instance) somewhere on your disk, and then you can point the workbench to that file using the reload menu (left of the menu bar of the editor).
// Unfortunately, in order to have all the file reloading abilities you will need to use Chrome (or Edge). The load from disk button does not appear in Firefox and Safari.
`,
`
// Section: Making a watering can (Full Tutorial)
// This is the full step-by-step tutorial for creating the watering can, as presented on replicad.xyz.
// Drawing the body profile
const { draw } = replicad;
const main_step1 = () => {
  return draw()
    .hLine(20)
    .line(10, 5)
    .vLine(3)
    .lineTo([8, 100])
    .hLine(-8)
    .close();
};

// Filleting angles
const main_step2 = () => {
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

// Using Bézier curves
const main_step3 = () => {
  return draw([0, 100])
    .hLine(8)
    .lineTo([30, 8])
    .smoothSpline(-10, -8, { endTangent: [-1, 0], startFactor: 2 })
    .lineTo([0, 0])
    .close();
};

// Using planes for the filler
const main_step4 = () => {
  const { drawCircle, makePlane } = replicad;
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

// Creating the 3D shapes
const main_step5 = () => {
  const { makePlane, makeCylinder, draw, drawCircle } = replicad;
  const profile = draw().hLine(20).line(10, 5).vLine(3).lineTo([8, 100]).hLine(-8).close();
  const body = profile.sketchOnPlane("XZ").revolve([0, 0, 1]);
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);
  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);
  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);
  const filler = topCircle.loftWith([middleCircle, bottomCircle], { ruled: false });
  const spout = makeCylinder(5, 70).translateZ(100).rotate(45, [0, 0, 100], [0, 1, 0]);
  return [
    { shape: body, color: "blue", opacity: 0.5 },
    { shape: filler, color: "red", opacity: 0.5 },
    { shape: spout, color: "green" },
  ];
};

// Combining the shapes and creating the hollow shape
const main_final = () => {
  const { makePlane, makeCylinder, draw, drawCircle } = replicad;
  const profile = draw().hLine(20).line(10, 5).vLine(3).lineTo([8, 100]).hLine(-8).close();
  const body = profile.sketchOnPlane("XZ").revolve([0, 0, 1]);
  const topPlane = makePlane().pivot(-20, "Y").translate([-35, 0, 135]);
  const topCircle = drawCircle(12).sketchOnPlane(topPlane);
  const middleCircle = drawCircle(8).sketchOnPlane("XY", 100);
  const bottomPlane = makePlane().pivot(20, "Y").translateZ(80);
  const bottomCircle = drawCircle(9).sketchOnPlane(bottomPlane);
  const filler = topCircle.loftWith([middleCircle, bottomCircle], { ruled: false });
  const spout = makeCylinder(5, 70).translateZ(100).rotate(45, [0, 0, 100], [0, 1, 0]);
  let wateringCan = body.fuse(filler).fillet(30, (e) => e.inPlane("XY", 100)).fuse(spout).fillet(10, (e) => e.inBox([20, 20, 100], [-20, -20, 120]));
  const spoutOpening = [ Math.cos((45 * Math.PI) / 180) * 70, 0, 100 + Math.sin((45 * Math.PI) / 180) * 70 ];
  wateringCan = wateringCan.shell(-1, (face) => face.either([ (f) => f.containsPoint(spoutOpening), (f) => f.inPlane(topPlane) ]));
  return { shape: wateringCan, name: "Watering Can" };
};
`,
`
// Section: Replicad as a library
// At its core, replicad is just a library. You can then create your own viewer, editor, configurator on top of it.
// In order to show what can be done in the most simple way, you can find a sample app here: https://sample-app.replicad.xyz.

// Display of the model
// With replicad you can easily export an STL (or STEP) file to be opened in another application. Nevertheless displaying a model in your page tends to be nicer.
// For this you will need to use a 3D library. For instance, replicad has helpers to integrate with threejs.

// opencascade.js and webassembly
// Most of the complexity in using replicad as a library is that it depends on a webassembly module, opencascadejs, and the tooling around WASM is not always easy to use.
// Additionally, you should load the webassembly code from opencascadejs in a webworker. The model computation can take some time and the parallelism of a worker will allow you to offer a reactive interface during the computation.

// Injecting opencascadejs
// The important bit you need to do to have replicad work is that you need to inject an instance of opencascadejs at initialisation.
// You can have a look at the initialisation in the sample app:
let loaded = false;
const init = async () => {
  if (loaded) return Promise.resolve(true);

  // This is a placeholder for the actual opencascade.js library
  const opencascade = (config) => Promise.resolve({/* mock OC object */});
  const opencascadeWasm = "path/to/wasm";

  const OC = await opencascade({
    locateFile: () => opencascadeWasm,
  });

  loaded = true;
  // This is the crucial part
  setOC(OC);

  return true;
};
// const started = init();
// Once this is done, replicad will work.
`,
`
// Section: Replicad API List
/*
Drawing: DrawingPen, drawRectangle, draw, drawCircle, drawEllipse, drawFaceOutline, drawParametricFunction, drawPointsInterpolation, drawPolysides, drawProjection, drawRoundedRectangle, drawSingleCircle, drawSingleEllipse, drawText
Import: importSTEP, importSTL
Finders: EdgeFinder, FaceFinder, combineFinderFilters
Solids: makeBox, makeCylinder, makeEllipsoid, makeSolid, makeSphere
Measure: measureArea, measureDistanceBetween, measureLength, measureVolume
Other Classes & Types: _1DShape, _3DShape, AssemblyExporter, BaseSketcher2d, Blueprint, Blueprints, BoundingBox, BoundingBox2d, Compound, CompoundBlueprint, CompoundSketch, CompSolid, CornerFinder, Curve, Curve2D, DistanceQuery, DistanceTool, Drawing, Edge, Face, LinearPhysicalProperties, Plane, ProjectionCamera, Shape, Shell, Sketches, Solid, Surface, SurfacePhysicalProperties, Transformation, Vector, Vertex, VolumePhysicalProperties, Wire, WrappingObj, BSplineApproximationConfig, CurveLike, DrawingInterface, ExtrusionProfile, FaceTriangulation, GenericSweepConfig, LoftConfig, ShapeMesh, SketchInterface, AnyShape, ChamferRadius, Corner, CubeFace, CurveType, FilletRadius, FilterFcn, PlaneName, Point, Point2D, ProjectionPlane, RadiusConfig, ScaleMode, Shape2D, Shape3D, SimplePoint, SplineConfig, SupportedUnit, SurfaceType
Functions & Constants: DEG2RAD, HASH_CODE_MAX, makeCompound, RAD2DEG, addHolesInFace, asDir, asPnt, assembleWire, axis2d, basicFaceExtrusion, cast, complexExtrude, compoundShapes, createAssembly, createNamedPlane, cut2D, cutBlueprints, downcast, exportSTEP, fuse2D, fuseBlueprints, GCWithObject, GCWithScope, genericSweep, getFont, getOC, intersect2D, intersectBlueprints, isPoint, isProjectionPlane, isShape3D, isWire, iterTopo, loadFont, localGC, loft, lookFromPlane, makeAx1, makeAx2, makeAx3, makeBaseBox, makeBezierCurve, makeBSplineApproximation, makeCircle, makeDirection, makeEllipse, makeEllipseArc, makeFace, makeHelix, makeLine, makeNewFaceWithinFace, makeNonPlanarFace, makeOffset, makePlane, makePlaneFromFace, makePolygon, makeProjectedEdges, makeTangentArc, makeThreePointArc, makeVertex, measureShapeLinearProperties, measureShapeSurfaceProperties, measureShapeVolumeProperties, mirror, organiseBlueprints, polysideInnerRadius, polysidesBlueprint, revolution, rotate, roundedRectangleBlueprint, scale, setOC, shapeType, sketchText, supportExtrude, textBlueprints, translate, twistExtrude, weldShellsAndFaces
Sketching: BlueprintSketcher, FaceSketcher, Sketch, Sketcher, GenericSketcher, sketchCircle, sketchEllipse, sketchFaceOffset, sketchHelix, sketchParametricFunction, sketchPolysides, sketchRectangle, sketchRoundedRectangle
*/
`,
`
// Section: replicad-threejs-helper
// A set of simple function to help integrate replicad in a threejs project

// API
// This package offers a small set of functions to sync a set of BufferGeometry with meshed shapes from replicad.

// Creating geometries from a replicad object
// Typically you will create an array of replicad shapes that way (this is purely replicad code):
/*
const meshed = shapes.map((shape, i) => ({
  name: \`shape \${i + 1}\`,
  faces: shape.mesh({ tolerance: 0.05, angularTolerance: 30 }),
  edges: shape.meshEdges({ keepMesh: true }),
}));
*/
// You can then synchronise them with a set of buffer geometries (for the faces and the edges):
// const geometries = syncGeometries(meshed, []);
// The geometries will contain an array of objects with two BufferGeometry, one for the faces (the body of the solid) and one for the lines (the edges).

// Updating geometries
// If you have changes to your geometries, instead of creating new ones you can do:
// const updatedGeometries = syncGeometries(meshed, geometries);

// More control
// Instead of updating both the edges and the faces you can use the simpler individual functions:
// const facesGeometry = new BufferGeometry();
// const updatedFaces = syncFaces(facesGeometry, replicadMeshedFaces);
// or for the edges
// const edgesGeometry = new BufferGeometry();
// syncLines(edgesGeometry, replicadMeshedEdges);

// Highlighting
// These helpers also allow you to implement highlighting of faces or edges, using the groups functionality of threejs.
// You can toggle a single face or edge with this helper:
// toggleHighlight(facesGeometry, 2);
`
];