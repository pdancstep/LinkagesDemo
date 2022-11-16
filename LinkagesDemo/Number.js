class Number {
    constructor(x, y, op, free) {
	// position of point
	this.real = x;
	this.imaginary = y;
	
	// is this point user-movable?
	this.free = free;
	// which operator relations have this point as a member?
	this.operators = [op];
	// if this is a bound (dependent) node, which operator controls it?
	this.controller = this.free ? false : op;	    

	this.dragging = false;
	this.mouseover = false;

	registerNode(this);
    }

    // check whether the number is under the mouse
    checkMouseover() {
	this.mouseover = dist(mouseX,
			      mouseY,
			      axisToPixelX(this.real),
			      axisToPixelY(this.imaginary)) < 25;
	return this.mouseover;
    }

    // check if this node is within tolerancePx pixels of the given point
    isWithinPx(targetX, targetY, tolerancePx) {
	return (dist(this.getRealPx(), this.getImaginaryPx(),
		     axisToPixelX(targetX), axisToPixelY(targetY)) < tolerancePx);
    }

    // tell the number that it has been clicked on.
    // returns the current dragging state
    notifyClick() {
	if (this.mouseover && this.free) {
	    this.dragging = true;
	}
	return this.dragging;
    }

    // release mouse
    notifyRelease() {
	this.dragging = false;
    }

    // if we're dragging this point, move its location to the mouse's location
    update() {
	if (this.dragging){
	    this.real = pixelToAxisX(mouseX);
	    this.imaginary = pixelToAxisY(mouseY);
	}	
    }

    //updates for operator with inputs locked on x,y axes, for cartesian coordinates.
    xAxisUpdate() {
    	if (this.dragging){
	    	this.real = pixelToAxisX(mouseX);
	}	
    }
    
    yAxisUpdate() {
    	if (this.dragging){
	    	this.imaginary = pixelToAxisY(mouseY);
	}	
    }

    //updates for oeprator with inputs on positive reals, unit circle, for polar coordinates
    magUpdate(){
    	if (this.dragging){
    		this.real = sqrt((dist(mouseX,mouseY,centerX,centerY)/globalScale)*(dist(mouseX,mouseY,centerX,centerY)/globalScale));
    	}
    }

    argUpdate(){
    	if (this.dragging){
    		this.real = cos(atan2(mouseY-centerY,mouseX-centerX));
    		this.imaginary = -sin(atan2(mouseY-centerY,mouseX-centerX));
    	}
    }



    // draw the circle for this Number's coordinates
    drawNode() {
	noStroke();
	ellipse(axisToPixelX(this.real), axisToPixelY(this.imaginary), 15, 15);
    }

    // draw the encircling ring used to indicate free node draggability
    drawRing() {
	noFill();
	stroke(255,200);
	strokeWeight(3);
	ellipse(axisToPixelX(this.real), axisToPixelY(this.imaginary), 20, 20);
    }
    
    // externally-used display function
    display() {
	// TODO: change color if merged node?
	this.drawNode();
	if (this.free){
	    this.drawRing();
	}
    }

    // display this node in reversing-mode style
    freeNodeDisplay() {
	fill(255);
	this.drawNode();
    }

    // wrappers for checking and setting coordinates
    getReal() { return this.real; }
    getRealPx() { return axisToPixelX(this.real); }
    getImaginary() { return this.imaginary; }
    getImaginaryPx() { return axisToPixelY(this.imaginary); }

    setReal(x) { this.real = x; }
    setRealPx(x) { this.real = pixelToAxisX(x); }
    setImaginary(y) { this.imaginary = y; }
    setImaginaryPx(y) { this.imaginary = pixelToAxisY(y); }

    shift(x,y) {
	this.real += x;
	this.imaginary += y;
    }
    
    shiftPx(x,y) {
	this.real = pixelToAxisX(axisToPixelX(this.real) + x);
	this.imaginary = pixelToAxisY(axisToPixelY(this.imaginary) + y);
    }
}
