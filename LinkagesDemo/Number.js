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
        this.hidden = false;

        registerNode(this);

        this.delta = new Coord(0,0);
    }

    applyDifferential() {
        this.mut_translate(this.delta);
    }
    
    isFree() {
        return this.free;
    }

    // check whether the number is under the mouse
    checkMouseover() {
        if (this.hidden) { return false; }
        
	return this.isNearPx(getMousePx(), 25);
    }

    // tell the number that a click has been initiated
    notifyClick() {
        if (this.hidden) { return false; }
        
        if (this.free && this.checkMouseover()) {
	    this.dragging = true;
            this.delta = new Coord(1,0);
	}
	return this.dragging;
    }

    // release mouse
    notifyRelease() {
	this.dragging = false;
        this.delta = new Coord(0,0);
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

        if (showDifferentials) {
            fill(255);
            noStroke();
            text(this.delta.toString(), this.getXPx()+10, this.getYPx()-20);
        }
    }
    
    // display this node in reversing-mode style
    freeNodeDisplay() {
        if (this.hidden) { return; }
        
        fill(255);
	this.drawNode();
    }
}
