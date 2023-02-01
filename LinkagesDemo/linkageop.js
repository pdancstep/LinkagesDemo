// operator type
const ADDER = 0;
const MULTIPLIER = 1;
const CONJUGATOR = 2;
const EXPONENTIAL = 3;

// these should be in settings.js
const STEP_SIZE = searchSize;
const ITERATIONS = iterations;

class LinkageOp extends Edge { // :Edge<LinkagePoint>
    constructor(v, type, mode, id) {
        let c = null;
        switch (mode) {
        case UPDATE_IDEAL:
            switch (type) {
            case ADDER:
                c = new IdealComplexAdder();
                break;
            case MULTIPLIER:
                c = new IdealComplexMultiplier();
                break;
            case CONJUGATOR:
                c = new IdealComplexConjugator();
                break;
            case EXPONENTIAL:
                c = new IdealComplexExponent(false);
                break;
            default:
                console.log("Warning: Unsupported Operator Type");
                c = new Constraint(2);
            }
            break;
        case UPDATE_ITERATIVE:
            switch (type) {
            case ADDER:
                c = new IterativeComplexAdder(STEP_SIZE, ITERATIONS);
                break;
            case MULTIPLIER:
                c = new IterativeComplexMultiplier(STEP_SIZE, ITERATIONS);
                break;
            case CONJUGATOR:
                c = new IterativeComplexConjugator(STEP_SIZE, ITERATIONS);
                break;
            case EXPONENTIAL:
                c = new IterativeComplexExponent(STEP_SIZE, ITERATIONS);
                break;
            default:
                console.log("Warning: Unsupported Operator Type");
                c = new Constraint(2);
            }
            break;
        case UPDATE_DIFFERENTIAL:
            switch(type) {
            case ADDER:
                c = new DifferentialComplexAdder();
                break;
            case MULTIPLIER:
                c = new DifferentialComplexMultiplier();
                break;
            case CONJUGATOR:
                c = new DifferentialComplexConjugator();
                break;
            default:
                console.log("Warning: Unsupported Operator Type");
                c = new Constraint(2);
            }
            break;
        default:
            console.log("Warning: Invalid Update Mode");
            c = new Constraint(2);
        }
        super(v, c, id);
        this.type = type;

        this.hidden = false;
    }

    // display connecting lines related to this operation
    // note: does not draw the vertices themselves 
    display() {
        if (this.hidden) { return; }
        noFill();
        strokeWeight(1);

        if (this.type==ADDER) {
            stroke(30,200,255);
            beginShape();
            vertex(CENTER_X, CENTER_Y);
            vertex(this.vertices[0].value.getXPx(), this.vertices[0].value.getYPx());
            vertex(this.vertices[2].value.getXPx(), this.vertices[2].value.getYPx());
            vertex(this.vertices[1].value.getXPx(), this.vertices[1].value.getYPx());
            vertex(CENTER_X, CENTER_Y);
            endShape();
        } else if (this.type==MULTIPLIER) {
            stroke(255,0,0);
            line(CENTER_X, CENTER_Y,
                 this.vertices[2].value.getXPx(), this.vertices[2].value.getYPx());
            stroke(255,100,0);
            line(CENTER_X, CENTER_Y,
                 this.vertices[0].value.getXPx(), this.vertices[0].value.getYPx());
            line(CENTER_X, CENTER_Y,
                 this.vertices[1].value.getXPx(), this.vertices[1].value.getYPx());
        } else if (this.type==CONJUGATOR) {
            stroke(30,30,200);
            line(CENTER_X, CENTER_Y,
                 this.vertices[0].value.getXPx(), this.vertices[0].value.getYPx());
            line(CENTER_X, CENTER_Y,
                 this.vertices[1].value.getXPx(), this.vertices[1].value.getYPx());
            line(this.vertices[0].value.getXPx(), this.vertices[0].value.getYPx(),
                 this.vertices[1].value.getXPx(), this.vertices[1].value.getYPx());
        } else if (this.type==EXPONENTIAL) {
            stroke(200,100,200);
            if(this.vertices[0].value.dragging){

                let theta = -12*PI;
                let a = 50;
                let b = -1/tan(this.vertices[0].value.getTh());
                let r = a*exp(b*theta);

                console.log(r);

                beginShape();

                while(r<=this.vertices[1].value.getR()){

                    theta = theta + PI/50;
                    //if((b*theta)<15){
                        r = a*exp(b*theta)
                        vertex(CENTER_X+r*cos(theta),CENTER_Y+r*sin(theta));
                    //}

                }

                endShape();
/*
                //spiral
                beginShape();
                for (let theta=-12*PI;theta<12*_PI;theta=theta+((TWO_PI)/100)){
                    if((b*theta)<15){
                        r = a*exp(b*theta)
                        vertex(400+r*cos(theta),400+r*sin(theta))
                    }
                }
                endShape();
         */       



            }
            line(this.vertices[0].value.getXPx(),0,this.vertices[0].value.getXPx(),height);
            ellipse(CENTER_X,CENTER_Y,2*globalScale*this.vertices[1].value.getR(),2*globalScale*this.vertices[1].value.getR());
            //line(CENTER_X, CENTER_Y,
                 //this.vertices[0].value.getXPx(), this.vertices[0].value.getYPx());
            //line(this.vertices[0].value.getXPx(), this.vertices[0].value.getYPx(),
                 //this.vertices[1].value.getXPx(), this.vertices[1].value.getYPx());
        } else {
            // bad
        }
    }

    toString() {
        if (this.type==ADDER) {
            return (this.vertices[0].value.toString(0) + " + " +
                    this.vertices[1].value.toString(0) + " = " +
                    this.vertices[2].value.toString(0));
        } else if (this.type==MULTIPLIER) {
            return (this.vertices[0].value.toString(0) + " x " +
                    this.vertices[1].value.toString(0) + " = " +
                    this.vertices[2].value.toString(0));
        } else if (this.type==CONJUGATOR) {
            return ("conj" +
                    this.vertices[0].value.toString(0) + " = " +
                    this.vertices[1].value.toString(0));
        } else if (this.type==EXPONENTIAL) {
            return ("exp" +
                    this.vertices[0].value.toString(0) + " = " +
                    this.vertices[1].value.toString(0));
        }
    }
}
