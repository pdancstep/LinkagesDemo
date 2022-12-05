class Number extends Coord {
    constructor(x, y, op, free) {
        // position of point
        super(x,y);
        
        // is this point user-movable?
        this.free = free;
        // which operator relations have this point as a member?
        this.operators = [op];
        // if this is a bound (dependent) node, which operator controls it?
        this.controller = this.free ? false : op;	    

        this.dragging = false;
        this.mouseover = false;
        this.hidden = false;

        registerNode(this);
    }

    isFree() {
        return this.free;
    }

    // check whether the number is under the mouse
    checkMouseover() {
        if (this.hidden) { return false; }
        
        this.mouseover = getMousePx().distance(axisToPixel(this)) < 25;
	return this.mouseover;
    }

    // check if this node is within tolerancePx pixels of the given point
    isWithinPx(targetX, targetY, tolerancePx) {
	return (dist(this.getXPx(), this.getYPx(),
		     axisToPixelX(targetX), axisToPixelY(targetY)) < tolerancePx);
    }

    // tell the number that it has been clicked on.
    // returns the current dragging state
    notifyClick() {
        if (this.hidden) { return false; }
        
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
	    this.x = getMouse().getX();
	    this.y = getMouse().getY();
	}	
    }

    //updates for operator with inputs locked on x,y axes, for cartesian coordinates.
    xAxisUpdate() {
    	if (this.dragging){
	    this.x = getMouse().getX();
	}	
    }
    
    yAxisUpdate() {
    	if (this.dragging){
            this.y = getMouse().getY();
	}	
    }

    //updates for oeprator with inputs on positive reals, unit circle, for polar coordinates
    magUpdate(){
    	if (this.dragging){
            this.x = getMouse().getX();
    	}
    }
    
    argUpdate(){
        if (this.dragging){
            this.x = cos(getMouse().getTh());
            this.y = sin(getMouse().getTh());
        }
    }

    // draw the circle for this Number's coordinates
    drawNode() {
        noStroke();
        ellipse(this.getXPx(), this.getYPx(), 15, 15);
    }
    
    // draw the encircling ring used to indicate free node draggability
    drawRing() {
	noFill();
	stroke(255,200);
	strokeWeight(3);
	ellipse(this.getXPx(), this.getYPx(), 20, 20);
    }
    
    // externally-used display function
    display() {
        if (this.hidden) { return; }
        
	// TODO: change color if merged node?
	this.drawNode();
	if (this.free){
	    this.drawRing();
	}
    }
    
    // display this node in reversing-mode style
    freeNodeDisplay() {
        if (this.hidden) { return; }
        
        fill(255);
	this.drawNode();
    }
}
