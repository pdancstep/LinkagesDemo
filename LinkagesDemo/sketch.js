function setup() {
    createCanvas(1600,900);
}

//background color and debug variable...
const indicator = 50;

//how far to look in each direction
const searchSize = .1;

//how many iterations to run before updating
const iterations = 100;

//extra number of loops for updating positions, helps with rigidity...
const updateCycles = 3;

//center coords.
const centerX = 650;
const CENTER_X = 650;
const centerY = 450;
const CENTER_Y = 450;
//global scale (standard, 50px = 1 unit)
var globalScale = 50;
const GLOBAL_SCALE = 50;

//double tap reference (sketch level)
var tappedOnce = false;
var currentTime;
var doubleTapTimer = 300;

//press and hold references
var pressAndHold = false;
var timerStart ;
var holdLength = 700;

// mode-switch boolean, for going into state of switching a dependency
var reversingOperator = false;

var indicatorFlash = false;

//turns off cartesian coordinates when focusing on polar coordinates...
var supressCoords = false;

function draw() {
    //manage double tap
    if(tappedOnce){
	if((millis()-currentTime)>doubleTapTimer){
	    tappedOnce=false;
	}
    }
    
    //look for bind opportunities
    if(pressAndHold){
  	if((millis()-timerStart)>holdLength){
  	    findMerge();
  	}
    }
    
    // update operators multiple times,
    // so they have a chance to react to each other
    for (m=0; m<updateCycles; m++){
	for (const oper of myOperators) {
	    oper.checkMouseover();
	    oper.update();
	}
    }
    
    background(indicator);

    if(!myLevels[level].coordinatesOff){
        //background grid
        for (i=-30; i<30; i++){
            strokeWeight(1);
            stroke(75);
            noFill();
            line(CENTER_X+i*GLOBAL_SCALE, 0, CENTER_X+i*GLOBAL_SCALE, height);
            line(0, CENTER_Y+i*GLOBAL_SCALE, width, CENTER_Y+i*GLOBAL_SCALE);
        }
        
        //axes,unit circle
        noFill();
        stroke(200);
        strokeWeight(1);
        line(0, CENTER_Y, width, CENTER_Y);
        line(CENTER_X, 0, CENTER_X ,height);
        ellipse(CENTER_X, CENTER_Y, 2*GLOBAL_SCALE, 2*GLOBAL_SCALE); // unit circle
    }
    
    //draw operators
    for (const oper of myOperators) {
	oper.display();
    }
    
    //coordinate data
    if(!myLevels[level].coordinatesOff){
        textSize(15);
        textAlign(CENTER,CENTER);
        for (i=-30; i<30; i++){
            fill(150);
            noStroke();
            ellipse(CENTER_X+i*GLOBAL_SCALE, CENTER_Y, 5, 5);
            ellipse(CENTER_X, CENTER_Y+i*GLOBAL_SCALE, 5, 5);
            if(!supressCoords){
                text(i, CENTER_X+i*GLOBAL_SCALE, CENTER_Y-16);
                text(-i+"i", CENTER_X-20, CENTER_Y+i*GLOBAL_SCALE);
            }
        }
    }

    //buttons
    textSize(15);
    textAlign(LEFT,CENTER);

    noStroke();
    fill(200)
    ellipse(30,30,20,20);
    text("clear",45,30);

    fill(30,200,255);
    ellipse(30,60,20,20);
    text("adder",45,60);

    fill(255,100,0);
    ellipse(30,90,20,20);
    text("multiplier",45,90);

    //digital readout for existing operators
    printToPlot();
    
    if(indicatorFlash){
	background(0);
	indicatorFlash = false;
    }
    
    //display mode while alternative dependency...
    if (reversingOperator){
	background(0,150);
	for (const node of freeNodes) {
	    node.freeNodeDisplay();
	}
    }

    //make tutorials run on top of this interactive canvas...
    runTutorial();
}

function printToPlot(){
    //On-canvas DRO for operators...
    textAlign(CENTER,CENTER);
    textSize(30);
    for(i=0;i<myOperators.length;i++){

        fill(150)
        
        text("(" + round(myOperators[i].myInput1.real)
	     + "," + round(myOperators[i].myInput1.imaginary) + "i)",
	     50,
	     height - 40*(i+1));

        if(myOperators[i].type==ADDER){
            text("+",115,height-40*(i+1));
        }else{
            text("x",115,height-40*(i+1));
        }

        text("(" + round(myOperators[i].myInput2.real)
	     + "," + round(myOperators[i].myInput2.imaginary) + "i)",
	     175,
	     height - 40*(i+1));

        text("=",230,height-40*(i+1));
        
        if(myOperators[i].type==ADDER){
            fill(30,200,255);
        }else{
            fill(255,0,0);
        }
        text("(" + round(myOperators[i].myOutput.real)
	     + "," + round(myOperators[i].myOutput.imaginary) + "i)",
	     285,
	     height - 40*(i+1));
    }
}

function keyPressed(){
    //n for 'next'
    if((keyCode === 78)&&(level!=(myLevels.length-1))){
        level++;
    }
    
    //p for 'previous'
    if((keyCode === 80)&&(level!=0)){
        level--;
    }
}

function touchStarted() {
    if (reversingOperator) {
	closeReversal();
    }
    
    if (dist(mouseX,mouseY,30,30) < 10) {
	myOperators = [];
    }
    if (dist(mouseX,mouseY,30,60) < 10) {
	new Operator(ADDER);
    }
    if (dist(mouseX,mouseY,30,90) < 10) {
	new Operator(MULTIPLIER);
    }

    pressAndHold = true;
    timerStart = millis();
    
    if(!tappedOnce) {
	tappedOnce = true;
	currentTime = millis();
    }else{
	tryReversal();
	tappedOnce = false;
    }

    for (const oper of myOperators) {
	oper.notifyClick();
    }

    //update tutorial...
    tutorialClick();
}

function touchMoved() {
    pressAndHold = false;
    return false;
}

function touchEnded(){
    pressAndHold = false;
    for (const oper of myOperators){
	oper.notifyRelease();
    }
}
