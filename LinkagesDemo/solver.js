class Solver {
    constructor(oper, sens) {
        this.r1 = oper.myInput1.getReal();
	this.i1 = oper.myInput1.getImaginary();
	this.r2 = oper.myInput2.getReal();
	this.i2 = oper.myInput2.getImaginary();
	this.rout = oper.myOutput.getReal();
	this.iout = oper.myOutput.getImaginary();

        this.mode = oper.mode;
        this.relation = oper.type;
        
        // not sure exactly how this will be used yet
        this.sensitivity = sens;
    }

    iterate() {
        if (this.relation==ADDER) { this.iterateSum(); }
        else if (this.relation==MULTIPLIER) { this.iterateProd(); }
    }

    iterateSum() {
        let leftX, rightX, upperY, lowerY;

        switch (this.mode) {
	case DEFAULT:
	    leftX = (this.rout - searchSize) - (this.r1 + this.r2);
	    rightX = (this.rout + searchSize) - (this.r1 + this.r2);

	    upperY = (this.iout + searchSize) - (this.i1 + this.i2);
	    lowerY = (this.iout - searchSize) - (this.i1 + this.i2);

            this.rout += pixelToAxisX(compareShifts(leftX, rightX));
            this.iout += pixelToAxisY(compareShifts(upperY, lowerY));
	    return;
	    
	case REVERSE1:
	    leftX = (this.r1 - searchSize) - (this.rout - this.r2);
	    rightX = (this.r1 + searchSize) - (this.rout - this.r2);
	    upperY = (this.i1 + searchSize) - (this.iout - this.i2);
	    lowerY = (this.i1 - searchSize) - (this.iout - this.i2);

            this.r1 += pixelToAxisX(compareShifts(leftX, rightX));
            this.i1 += pixelToAxisY(compareShifts(upperY, lowerY));
	    return;
	    
	case REVERSE2: 
	    leftX = (this.r2 - searchSize) - (this.rout - this.r1);
	    rightX = (this.r2 + searchSize) - (this.rout - this.r1);
	    upperY = (this.i2 + searchSize) - (this.iout - this.i1);
	    lowerY = (this.i2 - searchSize) - (this.iout - this.i1);
            this.r2 += pixelToAxisX(compareShifts(leftX, rightX));
            this.i2 += pixelToAxisY(compareShifts(upperY, lowerY));
	    return;
	    
	case COLLAPSED: 
            
	    leftX = (this.rout - searchSize) - (this.r1 * 2);
	    rightX = (this.rout + searchSize) - (this.r1 * 2);
	    upperY = (this.iout + searchSize) - (this.i1 * 2);
	    lowerY = (this.iout - searchSize) - (this.i1 * 2);
            this.r1 += pixelToAxisX(compareShifts(leftX, rightX));
            this.i1 += pixelToAxisY(compareShifts(upperY, lowerY));
	    return;
	    
	case REVCOLLAPSED: 
            // dependent node is 1
	    leftX = (this.r1 - searchSize) - (this.rout / 2);
	    rightX = (this.r1 + searchSize) - (this.rout / 2);
	    upperY = (this.i1 + searchSize) - (this.iout / 2);
	    lowerY = (this.i1 - searchSize) - (this.iout / 2);
            this.r1 += pixelToAxisX(compareShifts(leftX, rightX));
            this.i1 += pixelToAxisY(compareShifts(upperY, lowerY));
	    return;
	    
	case IDENTITY1:
	case IDENTITY2:
	    return;
	    
	default:
	    // should not get here
	}
    }

    iterateProd() {
        // TODO
    }

    
}


//compares nearby points to see if its profitable to move in a given direction,
// and determines the appropriate shift...
function compareShifts(neg,pos) {
    if (abs(neg) < abs(pos)){
	return -1;
    } else if (abs(neg) > abs(pos)){
	return 1;
    } else {
	return 0;
    }
}
