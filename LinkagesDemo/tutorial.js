
// array holding sequential level specifications
var myLevels = [];

//counter for incrementing through the tutorials...
var level = 0;

//variables for transformation overlays...
//Anchor is where the mouse sets down
var anchorX;
var anchorY;

var anchorRadius;
var anchorTheta;
var scaleFactor;
var offsetTheta;

//special modes - FIX: move these into level javascript objects?

//input tracers
var tracer1 = [];
var tracer2 = [];
//output tracers
var tracer3 = [];

var tracerLimit = 100;

//variables for measuring multiplier radii, booleans for nominal distances...
var input1Radius;
var input1OnCircle = false;
var input2Radius;
var input2OnCircle = false;
var outputRadius;


//Functions for running tutorial levels...

function runTutorial() {


    //set scale
    if(myLevels[level].customScale){
      globalScale = myLevels[level].customScale;
    }else{
      globalScale = 50;
    }


    //decorating the unit circle with angles
    if(myLevels[level].radians){
        //turn off cartesian coordinates...
        supressCoords = true;
        textSize(20);
        noStroke();
        fill(150);
        for(i=0;i<8;i++){
            ellipse(centerX+globalScale*cos(i*TWO_PI/8),centerY+globalScale*sin(i*TWO_PI/8),10,10)
        }
        text("0",centerX+1.1*globalScale,centerY);
        text("𝝅/4",centerX+1.1*globalScale*cos(-TWO_PI/8),centerY+1.1*globalScale*sin(-TWO_PI/8));
        text("𝝅/2",centerX,centerY+1.1*globalScale*sin(-TWO_PI/4));
        text("3𝝅/4",centerX+1.1*globalScale*cos(-3*TWO_PI/8),centerY+1.1*globalScale*sin(-3*TWO_PI/8));
        text("𝝅",centerX+1.1*globalScale*cos(PI),centerY);
        text("5𝝅/4",centerX+1.1*globalScale*cos(-5*TWO_PI/8),centerY+1.1*globalScale*sin(-5*TWO_PI/8));
        text("3𝝅/2",centerX,centerY+1.1*globalScale*sin(-3*PI/2));
        text("7𝝅/4",centerX+1.1*globalScale*cos(-7*TWO_PI/8),centerY+1.1*globalScale*sin(-7*TWO_PI/8));
    }else if(myLevels[level].degrees){
        //turn off cartesian coordinates...
        supressCoords = true;
        textSize(20);
        noStroke();
        fill(150);
        for(i=0;i<8;i++){
            ellipse(centerX+globalScale*cos(i*TWO_PI/8),centerY+globalScale*sin(i*TWO_PI/8),10,10)
        }
        text("0°",centerX+1.1*globalScale,centerY);
        text("45°",centerX+1.1*globalScale*cos(-TWO_PI/8),centerY+1.1*globalScale*sin(-TWO_PI/8));
        text("90°",centerX,centerY+1.1*globalScale*sin(-TWO_PI/4));
        text("135°",centerX+1.1*globalScale*cos(-3*TWO_PI/8),centerY+1.1*globalScale*sin(-3*TWO_PI/8));
        text("180°",centerX+1.1*globalScale*cos(PI),centerY);
        text("225°",centerX+1.1*globalScale*cos(-5*TWO_PI/8),centerY+1.1*globalScale*sin(-5*TWO_PI/8));
        text("270°",centerX,centerY+1.1*globalScale*sin(-3*PI/2));
        text("315°",centerX+1.1*globalScale*cos(-7*TWO_PI/8),centerY+1.1*globalScale*sin(-7*TWO_PI/8));
    }else{
        supressCoords = false;
    }


    //semi-transparent translationg and scale/rotationg overlays
    if(myLevels[level].overlay){
        transformOverlay();
    }

    //concentric circles that light up when multiplier nodes touch them...
    if(myLevels[level].concentricCircles){
        if(myOperators.length==1
            &&myOperators[0].type==MULTIPLIER){

                //measure relevant radii
                input1Radius = sqrt(dist(axisToPixelX(myOperators[0].myInput1.real),axisToPixelY(myOperators[0].myInput1.imaginary),centerX,centerY)*dist(axisToPixelX(myOperators[0].myInput1.real),axisToPixelY(myOperators[0].myInput1.imaginary),centerX,centerY));
                input2Radius = sqrt(dist(axisToPixelX(myOperators[0].myInput2.real),axisToPixelY(myOperators[0].myInput2.imaginary),centerX,centerY)*dist(axisToPixelX(myOperators[0].myInput2.real),axisToPixelY(myOperators[0].myInput2.imaginary),centerX,centerY));
                outputRadius = sqrt(dist(axisToPixelX(myOperators[0].myOutput.real),axisToPixelY(myOperators[0].myOutput.imaginary),centerX,centerY)*dist(axisToPixelX(myOperators[0].myOutput.real),axisToPixelY(myOperators[0].myOutput.imaginary),centerX,centerY));

                //determine if inputs are on a nominal circle
                input1OnCircle = input2OnCircle = false;
                for(i=0;i<20;i++){
                    if(abs(input1Radius-(i*globalScale))<2){
                        input1OnCircle = true;
                    }
                    if(abs(input2Radius-(i*globalScale))<2){
                        input2OnCircle = true;
                    }
                }

                noFill();

                //draw circles...
                for(i=0;i<30;i++){
                    if((abs(input1Radius-(i*globalScale))<2)
                        ||(abs(input2Radius-(i*globalScale))<2)){
                        stroke(255,100,0,200);
                        strokeWeight(3);
                    }else if(abs(outputRadius-(i*globalScale))<10
                        &&input1OnCircle
                        &&input2OnCircle){
                            stroke(255,0,0,200);
                            strokeWeight(3);
                    }else{
                        stroke(255,100,0,100);
                        strokeWeight(1);
                    }
                    ellipse(centerX,centerY,2*i*globalScale,2*i*globalScale);
                }



                //show circle radii if close to a nominal value
                noStroke();
                textSize(15);
                fill(0);

                if(input1OnCircle){
                    text(round(input1Radius/globalScale),axisToPixelX(myOperators[0].myInput1.real),axisToPixelY(myOperators[0].myInput1.imaginary));
                }
                if(input2OnCircle){
                    text(round(input2Radius/globalScale),axisToPixelX(myOperators[0].myInput2.real),axisToPixelY(myOperators[0].myInput2.imaginary));
                }
                if(input1OnCircle&&input2OnCircle){
                    text(round(outputRadius/globalScale),axisToPixelX(myOperators[0].myOutput.real),axisToPixelY(myOperators[0].myOutput.imaginary));
                }

        }
    }

    //fill parallelogram in adder
    if(myLevels[level].parallelogram){
        if(myOperators.length==1
            &&myOperators[0].type==ADDER){
                fill(0,200,225,150);
                beginShape();
                    vertex(centerX,centerY);
                    vertex(myOperators[0].myInput1.getRealPx(), myOperators[0].myInput1.getImaginaryPx());
                    vertex(myOperators[0].myOutput.getRealPx(), myOperators[0].myOutput.getImaginaryPx());
                    vertex(myOperators[0].myInput2.getRealPx(), myOperators[0].myInput2.getImaginaryPx());
                endShape(CLOSE);

        }
    }

    //fill similar triangles in multiplier


    if(myLevels[level].similarTriangles1){
        if(myOperators.length==1
            &&myOperators[0].type==MULTIPLIER){
                
                fill(255,100,0,100);
                
                beginShape();
                    vertex(centerX,centerY);
                    vertex(centerX+globalScale,centerY);
                    vertex(myOperators[0].myInput1.getRealPx(), myOperators[0].myInput1.getImaginaryPx());
                endShape(CLOSE);

                fill(255,0,0,100);

                beginShape();
                    vertex(centerX,centerY);
                    vertex(myOperators[0].myOutput.getRealPx(), myOperators[0].myOutput.getImaginaryPx());
                    vertex(myOperators[0].myInput2.getRealPx(), myOperators[0].myInput2.getImaginaryPx());
                endShape(CLOSE);

        }
    }


    if(myLevels[level].similarTriangles2){
        if(myOperators.length==1
            &&myOperators[0].type==MULTIPLIER){

                fill(255,100,0,100);

                if(myOperators[0].myInput1.dragging){
                        
                        beginShape();
                            vertex(centerX,centerY);
                            vertex(myOperators[0].myOutput.getRealPx(), myOperators[0].myOutput.getImaginaryPx());
                            vertex(myOperators[0].myInput1.getRealPx(), myOperators[0].myInput1.getImaginaryPx());
                        endShape(CLOSE);

                }else if(myOperators[0].myInput2.dragging){

                    beginShape();
                        vertex(centerX,centerY);
                        vertex(myOperators[0].myOutput.getRealPx(), myOperators[0].myOutput.getImaginaryPx());
                        vertex(myOperators[0].myInput2.getRealPx(), myOperators[0].myInput2.getImaginaryPx());
                    endShape(CLOSE);

                }

        }
    }




    //side panel for lessons
    fill(35);
    noStroke();
    rect(1300,0,300,height);

    //Top level instructions...
    textAlign(CENTER,CENTER);
    fill(200);
    text(myLevels[level].instructions, 1325, 25, 250, 300);

    //make wedges (should this be separate from "Unit Circle" designation?)
    if(myLevels[level].showWedges
        &&myOperators.length==1
        &&myOperators[0].type==MULTIPLIER){
            makeWedges();
    }

    if(myLevels[level].wedgeRO
        &&myOperators.length==1
        &&myOperators[0].type==MULTIPLIER){
            compareWedges();
    }



    if(myLevels[level].adderProjection){
        if(myOperators.length==1
            &&myOperators[0].type==ADDER){

            strokeWeight(2);

            //vertical projections...
            noStroke();
            fill(180,110,225);
            ellipse(myOperators[0].myInput1.getRealPx(),centerY,15,15);
            ellipse(myOperators[0].myInput2.getRealPx(),centerY,15,15);

            fill(150,0,255);
            ellipse(myOperators[0].myOutput.getRealPx(),centerY,15,15);

            noFill();
            stroke(180,110,225);
            line(myOperators[0].myInput1.getRealPx(),myOperators[0].myInput1.getImaginaryPx(),myOperators[0].myInput1.getRealPx(),centerY);
            line(myOperators[0].myInput2.getRealPx(),myOperators[0].myInput2.getImaginaryPx(),myOperators[0].myInput2.getRealPx(),centerY);

            stroke(150,0,255);
            line(myOperators[0].myOutput.getRealPx(),myOperators[0].myOutput.getImaginaryPx(),myOperators[0].myOutput.getRealPx(),centerY);


            //horizontal projections...
            noStroke();
            fill(160,200,150);
            ellipse(centerX,myOperators[0].myInput1.getImaginaryPx(),15,15);
            ellipse(centerX,myOperators[0].myInput2.getImaginaryPx(),15,15);

            fill(100,200,100);
            ellipse(centerX,myOperators[0].myOutput.getImaginaryPx(),15,15);

            noFill();
            stroke(160,200,150);
            line(myOperators[0].myInput1.getRealPx(),myOperators[0].myInput1.getImaginaryPx(),centerX,myOperators[0].myInput1.getImaginaryPx());
            line(myOperators[0].myInput2.getRealPx(),myOperators[0].myInput2.getImaginaryPx(),centerX,myOperators[0].myInput2.getImaginaryPx());

            stroke(100,200,100);
            line(myOperators[0].myOutput.getRealPx(),myOperators[0].myOutput.getImaginaryPx(),centerX,myOperators[0].myOutput.getImaginaryPx());

            //DRO
            textAlign(RIGHT,CENTER);
            noStroke();
            fill(180,110,225);
            text(nfc(myOperators[0].myInput1.getReal(),1)+"+"+nfc(myOperators[0].myInput2.getReal(),1)+"=",1500,300);
            fill(160,200,150);
            text(nfc(myOperators[0].myInput1.getImaginary(),1)+"+"+nfc(myOperators[0].myInput2.getImaginary(),1)+"=",1500,350);


            textAlign(LEFT,CENTER);
            fill(150,0,255);
            text(nfc(myOperators[0].myOutput.getReal(),1),1500,300);
            fill(100,200,100);
            text(nfc(myOperators[0].myOutput.getImaginary(),1),1500,350);

        }
    }




    //drawing tracers...
    if(myOperators.length==1&&myLevels[level].tracers){
        makeTracers();
    }

    //places a dot on the board
    if(myLevels[level].targetDot){
        mouseRadius = sqrt((dist(mouseX,mouseY,centerX,centerY)/globalScale)*(dist(mouseX,mouseY,centerX,centerY)/globalScale));
        fill(0,255,0,100);
        ellipse(axisToPixelX(myLevels[level].outputTargetX),
		axisToPixelY(myLevels[level].outputTargetY),
		25,
		25);
    }

    //message that appears when operator is in the middle of being reversed...
    if(myLevels[level].reverseMessage){
        if(reversingOperator){
            fill(200);
            noStroke();
            textSize(15);
            text(myLevels[level].reverseMessage, 1325, 475, 250, 300);
        }
    }

    //DRO for output
    if(myLevels[level].DRO){
        if(myLevels[level].testComplete()) {
            fill(100);
            stroke(0,255,0);
            rect(1360,360,170,80);
            noStroke();
            fill(0,255,0);
            ellipse(1550,400,25,25);
            textAlign(LEFT,BOTTOM);
            textSize(12);
            text("Correct answer", 1360, 360);
        }else{
            fill(100);
            noStroke();
            rect(1360,360,170,80);
            ellipse(1550,400,25,25);
            textAlign(LEFT,BOTTOM);
            textSize(12);
            text("Current output", 1360, 360);
        }

        //readout of dependent variable
        textSize(50)
        textAlign(CENTER, CENTER);
        if(myOperators.length==1) {
            noStroke();

	    // set readout fill
	    switch (myOperators[0].mode) {
	    case DEFAULT:
	    case COLLAPSED:
		if (myOperators[0].type==ADDER) fill(30,200,255);
		else fill(255,0,0); // MULTIPLIER
		break;
	    case REVCOLLAPSED:
		if (myOperators[0].type==ADDER) fill(200,255,200);
		else fill(255,200,0); // MULTIPLIER
		break;
	    default:
		// what about other operator modes?
	    }

	    // display value
	    let dep = myOperators[0].dependentNode();
	    if (round(dep.imaginary)==0) {
                text(round(dep.real), 1325, 350, 250, 100);
            } else if (round(dep.real)==0) {
                text(round(dep.imaginary) + "i", 1325, 350, 250, 100);
            }else{
                text("(" + round(dep.real) + "," + round(dep.imaginary) + "i)",
		     1325, 350, 250, 100);
            }
	    
        } else if (myOperators.length>1) {
            fill(200);
            textSize(30);
            text("Too many operators on the board.\n Clear, and begin again.",
		 1325, 300, 250, 400);
        }
    }

    //end state for completed level, appearance of "next" button    
    if (myLevels[level].testComplete()) {
        textAlign(CENTER,CENTER);
        if (myLevels[level].explanation) {
            fill(200);
            noStroke();
            textSize(15);
            text(myLevels[level].explanation, 1325, 475, 250, 300);
            
            fill(150);
            rect(1400,800,100,50,5)
            fill(50);
            textSize(15);
            text("Next",1450,825)
        }else{
            fill(150);
            noStroke();
            rect(1400,475,100,50,5);
            fill(50);
            textSize(15);
            text("Next",1450,500);
        }
    }
}

var input1Angle;
var input2Angle;



//center coordinates for "wedgeCompare" graphic,
var compareX = 1450;
var compareY = 400;

//

//make arcs that measure the angles of the multiplier inputs...
function makeWedges(){

    input1Angle = atan2((axisToPixelY(myOperators[0].myInput1.imaginary)-centerY),(axisToPixelX(myOperators[0].myInput1.real)-centerX));
    input2Angle = atan2((axisToPixelY(myOperators[0].myInput2.imaginary)-centerY),(axisToPixelX(myOperators[0].myInput2.real)-centerX));


    noFill();
    strokeWeight(globalScale/15);
    strokeCap(SQUARE);
    stroke(255,100,0,100);
    arc(centerX,centerY,globalScale/2,globalScale/2,input1Angle,0);
    stroke(255,200,0,100);
    arc(centerX,centerY,globalScale/3,globalScale/3,input2Angle,0);
    stroke(255,0,0,100);
    arc(centerX,centerY,2*globalScale/3,2*globalScale/3,input1Angle+input2Angle,0);

}

//a visual readout that shows how angles add...
function compareWedges(){

    input1Angle = atan2((axisToPixelY(myOperators[0].myInput1.imaginary)-centerY),(axisToPixelX(myOperators[0].myInput1.real)-centerX));
    input2Angle = atan2((axisToPixelY(myOperators[0].myInput2.imaginary)-centerY),(axisToPixelX(myOperators[0].myInput2.real)-centerX));

    noFill();
    stroke(200);
    strokeWeight(1);
    ellipse(compareX-75,compareY,100,100);
    ellipse(compareX+75,compareY,100,100);

    noStroke();
    fill(200);
    textSize(30);
    text("=",compareX,compareY);


    textSize(20);

    fill(255,100,0,100);
    arc(compareX-75,compareY,100,100,input1Angle,0);

    fill(255,100,0,175);
    text(round(degrees(convertAngleForReadout(input1Angle)))+"°",compareX-40,compareY-75);

    fill(255,200,0,100);
    arc(compareX-75,compareY,100,100,input1Angle+input2Angle,input1Angle);

    fill(255,200,0,175);
    text(round(degrees(convertAngleForReadout(input2Angle)))+"°",compareX-110,compareY-75);

    fill(255,0,0,100);
    arc(compareX+75,compareY,100,100,input1Angle+input2Angle,0);

    fill(255,0,0,175);
    text(round(degrees(convertAngleForReadout(input1Angle+input2Angle)))+"°",compareX+75,compareY-75);

    fill(255,175);
    text("+",compareX-75,compareY-75)
}




function convertAngleForReadout(angle) {
    if(angle<=0){
        return -angle;
    }else if(angle>0){
        return map(angle,0,PI,TWO_PI,PI);
    }
}



var bgAlpha;
var hairlineAlpha;


function transformOverlay(){

    //optional transparency parameter
    if(myLevels[level].overlayAlpha){
        bgAlpha = map(myLevels[level].overlayAlpha,0,100,0,10);
        hairlineAlpha = map(myLevels[level].overlayAlpha,0,100,0,75);
    }else{
        bgAlpha = 10;
        hairlineAlpha = 75;
    }




    //creates animated guides which show the geometry of operator movement...

    if(myOperators.length==1&&myOperators[0].dragging){
       
        //if operator is an adder
        if(myOperators[0].type==ADDER){

            push();

                fill(0,0,255,bgAlpha);
                noStroke();
                rect(0,0,width,height);

                translate(mouseX-anchorX,mouseY-anchorY);

                noFill();
                stroke(100,200,255,hairlineAlpha);
                strokeWeight(1);
                for(i=-20;i<30;i++){
                    line(-width,75*i,width*2,75*i);
                    line(75*i,-height,75*i,height*2);
                }       

            pop();

        //if it's a multiplier
        }else{

            scaleFactor = sqrt((dist(mouseX,mouseY,centerX,centerY)/globalScale)*(dist(mouseX,mouseY,centerX,centerY)/globalScale))/anchorRadius;
            offsetTheta = atan2(mouseY-centerY,mouseX-centerX)-anchorTheta;

            push();

                fill(255,0,0,bgAlpha);
                rect(0,0,width,height);

                translate(centerX,centerY);
                rotate(offsetTheta);
                scale(scaleFactor);

                noFill();
                stroke(255,100,0,hairlineAlpha);
                strokeWeight(1/scaleFactor);

                for(i=0;i<8;i++){
                    line(0,0,1000*cos(i*TWO_PI/8),1000*sin(i*TWO_PI/8));
                }
                for(i=0;i<16;i++){
                    ellipse(0,0,100*i,100*i);
                }

            pop();
        }
    }
}




var tracerAlpha


function makeTracers(){

    tracer1.push([axisToPixelX(myOperators[0].myInput1.real),axisToPixelY(myOperators[0].myInput1.imaginary)]);
    if(tracer1.length>tracerLimit){
        tracer1.splice(0,1);
    }
    tracer2.push([axisToPixelX(myOperators[0].myInput2.real),axisToPixelY(myOperators[0].myInput2.imaginary)]);
    if(tracer2.length>tracerLimit){
        tracer2.splice(0,1);
    }

    tracer3.push([axisToPixelX(myOperators[0].myOutput.real),axisToPixelY(myOperators[0].myOutput.imaginary)]);
    if(tracer3.length>tracerLimit){
        tracer3.splice(0,1);
    }

    strokeWeight(3);

    strokeCap(SQUARE);
    for(i=0;i<tracer1.length-1;i++){
        tracerAlpha = map(i,0,tracer1.length,0,255);
        stroke(255,tracerAlpha);
        line(tracer1[i][0],tracer1[i][1],tracer1[i+1][0],tracer1[i+1][1]);
        line(tracer2[i][0],tracer2[i][1],tracer2[i+1][0],tracer2[i+1][1]);
    }

    for(i=0;i<tracer2.length-1;i++){
        tracerAlpha = map(i,0,tracer1.length,0,255);

        if(myOperators[0].type==ADDER){
            stroke(30,200,225,tracerAlpha);
        }else{
            stroke(255,0,0,tracerAlpha);
        }

        line(tracer3[i][0],tracer3[i][1],tracer3[i+1][0],tracer3[i+1][1]);
    }

}



//respond to click events...
function tutorialClick(){


	if(myLevels[level].testComplete()&&(level!=(myLevels.length-1))){
        if(mouseX>1300){
            level++;
        }
    }


	//reference variables for transform overlay 
    //FIX: Make this conditional depending on level detials?
    if(myOperators.length==1&&myOperators[0].dragging){
        
        if(myOperators[0].type==ADDER){
            anchorX = mouseX;
            anchorY = mouseY;
        //if operator is a multiplier
        }else{
            anchorRadius = sqrt((dist(mouseX,mouseY,centerX,centerY)/globalScale)*(dist(mouseX,mouseY,centerX,centerY)/globalScale));
            anchorTheta = atan2(mouseY-centerY,mouseX-centerX);
        }
    }


}
