myLevels[0] = {

    instructions: "Default",
    explanation: "This is the generic linkages environment, with coordinates and operators filled in.",

    testComplete: function(){
    return true
    }
};

myLevels[1] = {

    coordinatesOff: true,
    operatorOff: true,

    instructions: "Everything off.",
    explanation: "This is the underlying dynamic system with no coordinates or visual cues. Create and manipulate dots in empty space. \n\n Click 'next' button or press 'p' or 'n' for previous and next.",

    testComplete: function(){
	return true
    }
};

myLevels[2] = {


    coordinatesOff: true,
    operatorOff: true,
    overlay: true,

    instructions: "Overlays.\n\n(Only works with 1 operator on the board)",
    explanation: "We can add overlays to help the eye track translation in the case of the adders, and 'rotate-and-scale' in the case of the multiplier.",

    testComplete: function(){
    return true
    }
};



myLevels[3] = {

    tracers:true,

    instructions: "Tracers",
    explanation: "Play with one operator at a time to see the tracer lines. This feature should form the basis of a variety of drawing games/challenges.",

    testComplete: function(){
    return true
    }
};

myLevels[4] = {

    customScale: 300,
    degrees: true,
    unitCircle: true,
    showWedges: true,
    wedgeRO: true,

    instructions: "Unit Circle\n\nPlace 1 multiplier on the board.",
    explanation: "One way of introducing the multiplier could be to first restrict it to the unit circle and present it as an 'angle adder'.",


    testComplete: function(){
    return true
    }
};

myLevels[5] = {

    concentricCircles: true,

    instructions: "Concentric circles",
    explanation: "The other action of the multiplier is to give the product the radial distance of its inputs. Here we can multiply circles, regardless of angle. ",

    testComplete: function(){
    return true
    }
};

myLevels[6] = {

    cartesian: true,

    instructions: "Rectangular coordinates \n Place 1 adder on the board",
    explanation: "An adder with inputs locked on the x and y axes can reach any point in the place with a unique set of coordinates.",

    testComplete: function(){
    return true
    }
};

myLevels[7] = {

    polar: true,

    instructions: "Polar coordinates \n Place 1 multiplier on the board",
    explanation: "A multiplier with inputs locked on the unit circle and positive x-axis can reach any point in the place with a unique angle and magnitude.",

    testComplete: function(){
    return true
    }
};



myLevels[8] = {

    parallelogram: true,
    similarTriangles1: true,

    instructions: "Filled operators",
    explanation: "This shows some options for emphasizing the GEOMETRY of the operators. The adder's parallelogram is filled in and multiplier is decorated with two similar triangles.",

    testComplete: function(){
    return true
    }
};

myLevels[9] = {

    parallelogram: true,
    similarTriangles2: true,

    instructions: "Filled operators 2",
    explanation: "Multiplier chooses a similar triangle for whichever input is being adjusted.",

    testComplete: function(){
    return true
    }
};

myLevels[10] = {

    adderProjection: true,
    operatorAlpha: 100,

    instructions: "Double Projection\n\nPlace 1 adder on the board",
    explanation: "Any adder can be decomposed into on additive statement on the vertical axis and another on the horizontal axis.",

    testComplete: function(){
    return true
    }
};


