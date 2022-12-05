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
            
            this.rout += compareShifts(leftX, rightX)/GLOBAL_SCALE;
            this.iout += compareShifts(lowerY, upperY)/GLOBAL_SCALE;
	    return;
	    
	case REVERSE1:
	    leftX = (this.r1 - searchSize) - (this.rout - this.r2);
	    rightX = (this.r1 + searchSize) - (this.rout - this.r2);
	    upperY = (this.i1 + searchSize) - (this.iout - this.i2);
	    lowerY = (this.i1 - searchSize) - (this.iout - this.i2);

            this.r1 += compareShifts(leftX, rightX)/GLOBAL_SCALE;
            this.i1 += compareShifts(lowerY, upperY)/GLOBAL_SCALE;
            return;
	    
	case REVERSE2: 
	    leftX = (this.r2 - searchSize) - (this.rout - this.r1);
	    rightX = (this.r2 + searchSize) - (this.rout - this.r1);
	    upperY = (this.i2 + searchSize) - (this.iout - this.i1);
	    lowerY = (this.i2 - searchSize) - (this.iout - this.i1);
            this.r2 += compareShifts(leftX, rightX)/GLOBAL_SCALE;
            this.i2 += compareShifts(lowerY, upperY)/GLOBAL_SCALE;
	    return;
	    
	case COLLAPSED: 
	    leftX = (this.rout - searchSize) - (this.r1 * 2);
	    rightX = (this.rout + searchSize) - (this.r1 * 2);
	    upperY = (this.iout + searchSize) - (this.i1 * 2);
	    lowerY = (this.iout - searchSize) - (this.i1 * 2);
            this.rout += compareShifts(leftX, rightX)/GLOBAL_SCALE;
            this.iout += compareShifts(lowerY, upperY)/GLOBAL_SCALE;
	    return;
	    
	case REVCOLLAPSED: 
	    leftX = (this.r1 - searchSize) - (this.rout / 2);
	    rightX = (this.r1 + searchSize) - (this.rout / 2);
	    upperY = (this.i1 + searchSize) - (this.iout / 2);
	    lowerY = (this.i1 - searchSize) - (this.iout / 2);
            this.r2 = this.r1 += compareShifts(leftX, rightX)/GLOBAL_SCALE;
            this.i2 = this.i1 += compareShifts(lowerY, upperY)/GLOBAL_SCALE;
	    return;
	    
	case IDENTITY1:
	case IDENTITY2:
	    return;
	    
	default:
	    // should not get here
	}
    }

    iterateProd() {
	let rprod = (this.r1 * this.r2) - (this.i1 * this.i2);
	let iprod = (this.r1 * this.i2) + (this.i1 * this.r2);

	let leftX, rightX, upperY, lowerY, denominator, rquot, iquot;
	
	switch (this.mode) {
	case DEFAULT:
	case COLLAPSED:
	    //check whether moving left or right better fits constraints...
	    leftX = (this.rout - searchSize) - rprod;
	    rightX = (this.rout + searchSize) - rprod;
	    //...same for up or down movement...
	    upperY = (this.iout + searchSize) - iprod;
	    lowerY = (this.iout - searchSize) - iprod;
	    //decide whether/where to shift ouput position.
            this.rout += compareShifts(leftX, rightX)/GLOBAL_SCALE;
            this.iout += compareShifts(lowerY, upperY)/GLOBAL_SCALE;
            return;
	    
	case REVERSE1: 
	    denominator = (this.r2 * this.r2) + (this.i2 * this.i2);
	    rquot = ((this.rout * this.r2) + (this.iout * this.i2)) / denominator;
	    iquot = ((this.iout * this.r2) - (this.rout * this.i2)) / denominator;
	    
	    leftX = (this.r1 - searchSize) - rquot;
	    rightX = (this.r1 + searchSize) - rquot;
	    upperY = (this.i1 + searchSize) - iquot;
	    lowerY = (this.i1 - searchSize) - iquot;

            this.r1 += compareShifts(leftX, rightX)/GLOBAL_SCALE;
            this.i1 += compareShifts(lowerY, upperY)/GLOBAL_SCALE;
            return;
	    
	case REVERSE2: 
	    denominator = (this.r1 * this.r1) + (this.i1 * this.i1);
	    rquot = ((this.rout * this.r1) + (this.iout * this.i1)) / denominator;
	    iquot = ((this.iout * this.r1) - (this.rout * this.i1)) / denominator;
	    
	    leftX = (this.r2 - searchSize) - rquot;
	    rightX = (this.r2 + searchSize) - rquot;
	    upperY = (this.i2 + searchSize) - iquot;
	    lowerY = (this.i2 - searchSize) - iquot;

            this.r2 += compareShifts(leftX, rightX)/GLOBAL_SCALE;
            this.i2 += compareShifts(lowerY, upperY)/GLOBAL_SCALE;
            return;
	    
	case REVCOLLAPSED:
	    // adjust input in two stages
	    // (not actually sure how this works -J)
            this.r1 += (this.r1 - this.r2) * .4;
            this.i1 += (this.i1 - this.i2) * .4;
            this.r2 = this.r1;
            this.i2 = this.i1;
            
	    denominator = (this.r2 * this.r2) + (this.i2 * this.i2);
	    rquot = ((this.rout * this.r2) + (this.iout * this.i2)) / denominator;
	    iquot = ((this.iout * this.r2) - (this.rout * this.i2)) / denominator;
            
	    leftX = (this.r1 - searchSize) - rquot;
	    rightX = (this.r1 + searchSize) - rquot;
	    upperY = (this.i1 + searchSize) - iquot;
	    lowerY = (this.i1 - searchSize) - iquot;
            this.r2 = this.r1 += compareShifts(leftX, rightX)/GLOBAL_SCALE;
            this.i2 = this.i1 += compareShifts(lowerY, upperY)/GLOBAL_SCALE;
            return;

	case IDENTITY1:
	case IDENTITY2:
	    return;
	    
	default:
	    // should not get here
	}
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
