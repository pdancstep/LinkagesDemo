var mainGraph = null;
var activeVertex = null;

function setup() {
    createCanvas(1600,900);
    mainGraph = new LinkageGraph(UPDATE_IDEAL);
}

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
  	    indicatorFlash = mainGraph.findUnify();
  	}
    }

    mainGraph.update(updateCycles);
    
    background(indicator);

    drawGrid();
    drawButtons();
    
    //display mode while alternative dependency...
    if (reversingOperator){
	background(0,150);
    }

    mainGraph.display(reversingOperator);


    //digital readout for existing operators
    printToPlot();
    
    if(indicatorFlash){
	background(0);
	indicatorFlash = false;
    }
    
    //make tutorials run on top of this interactive canvas...
    //    runTutorial();
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
        mainGraph.completeReversal();
        reversingOperator = false;
    mainGraph._printDeps();
        return;
    }

    if (CLEAR_BUTTON.isNear(getMousePx(), 10)) {
        mainGraph = new LinkageGraph();
    mainGraph._printDeps();
        return;
    }
    if (ADDER_BUTTON.isNear(getMousePx(), 10)) {
        mainGraph.addOperation(ADDER);
    mainGraph._printDeps();
        return;
    }
    if (MULTR_BUTTON.isNear(getMousePx(), 10)) {
        mainGraph.addOperation(MULTIPLIER);
    mainGraph._printDeps();
        return;
    }
    if (CONJ_BUTTON.isNear(getMousePx(), 10)) {
        mainGraph.addOperation(CONJUGATOR);
    mainGraph._printDeps();
        return;
    }

    pressAndHold = true;
    timerStart = millis();
    
    if (!tappedOnce) {
        tappedOnce = true;
        currentTime = millis();
    } else {
        reversingOperator = mainGraph.startReversal();
        tappedOnce = false;
    }

    activeVertex = mainGraph.findMouseover();
    if (activeVertex) {
        activeVertex.value.notifyClick(); // should probably check this returned true
    }
    
    //update tutorial...
    // tutorialClick();
    mainGraph._printDeps();
}

function touchMoved() {
    pressAndHold = false;
    if (activeVertex) {
        activeVertex.value.sendToMouse();
    }
    return false;
}

function touchEnded(){
    pressAndHold = false;
    if (activeVertex) {
        activeVertex.value.notifyRelease();
        activeVertex = null;
    }
}
