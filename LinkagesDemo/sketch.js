function setup() {
    createCanvas(1600,900);
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
  	    findMerge();
  	}
    }
    
    // update operators multiple times,
    // so they have a chance to react to each other
    for (m=0; m<updateCycles; m++){
	for (const oper of myOperators) {
	    oper.update();
	}
    }
    
    background(indicator);

    drawGrid();
    
    //draw operators
    for (const oper of myOperators) {
	oper.display();
    }

    drawButtons();

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
        closeReversal();
    }

    let i = myOperators.length;
    if (CLEAR_BUTTON.isNear(getMousePx(), 10)) {
        myOperators = [];
    }
    if (ADDER_BUTTON.isNear(getMousePx(), 10)) {
        myOperators.push(new Operator(ADDER, i));
    }
    if (MULTR_BUTTON.isNear(getMousePx(), 10)) {
        myOperators.push(new Operator(MULTIPLIER, i));
    }

    pressAndHold = true;
    timerStart = millis();
    
    if (!tappedOnce) {
        tappedOnce = true;
        currentTime = millis();
    } else {
        tryReversal();
        tappedOnce = false;
    }

    for (const n of myNumbers) {
        if (n.notifyClick()) {
            break;
        }
    }

    //update tutorial...
    // tutorialClick();
}

function touchMoved() {
    pressAndHold = false;
    return false;
}

function touchEnded(){
    pressAndHold = false;
    for (const n of myNumbers){
	n.notifyRelease();
    }
}
