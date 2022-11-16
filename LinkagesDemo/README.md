Attributes for Linkages Tutorial Sessions:


.instructions		Text instructions for a given level
.explanation		Text that appears when level is completed
.reverseMessage		A message that appears only when an operator is being reversed

.customScale 		(30ish-300ish) Manually sets scale (default is 50px = 1 unit)

.DRO				Makes a readout onscreen of node position
To-Do: 	Make multiple DROs
		Make addressable to certain node


.targetDot			Turns on a “target” dot on board
.targetX			x-coordinate of target	
.targetY			y-coordinate of target

.radians 			Marks the unit circle in radians
.degrees			Marks the unit circle in degrees
To-Do: 	Make numbers scale dependent



.cartesian			Locks inputs on x,y axes
.polar				Locks one input on unit circe, the other on positive x-axis
.unitCircle			Locks both inputs on unit circle
(NOTE: the above are specified in the update() function in the Operator class)
To-Do: 	Doesn’t work for reversed operators	


.operatorOff		Hides lines of an operator lines
.operatorAlpha		(0-255) Sets transparency of operator lines
(NOTE: the above are specified in the display() function in the Operator class)

.coordinatesOff		Hides coordinate system
(NOTE: the above is specified in the draw() loop of sketch.js)

			
.showWedges			Adds angular arcs to multiplier, showing angular offesets
.wedgeRO			Adds readout in side panel showing angle addition

.parallelogram		Fills in parallelogram in adder
.similarTriangles1	Fills in similar triangles in multiplier
.similarTriangles2	Fills in similar triangles in multiplier in alternative way
	
.concentricCircles	Creates a set of concentric circles, which the multiplier lights up

.overlay			Adds semi-transparent sliding or stretching/rotating overlay
.overlayAlpha		Optional transparency setting for overlay (0-100) 

.adderProjection	Creates projections of the adder onto the x,y axis. Two sums in one operator.

.tracers 			Turns on tracers
To-Do: 	Make tracers addressable to certain nodes. 
		Move tracer display into Operator class
