// operator type
const ADDER = 0;
const MULTIPLIER = 1;
const CONJUGATOR = 2;

// these should be in settings.js
const STEP_SIZE = searchSize;
const ITERATIONS = iterations;

class LinkageOp extends Edge { // :Edge<LinkagePoint>
    constructor(v, type, id) {
        let c = null;
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
        default:
            console.log("Warning: Unsupported Operator Type");
            c = new Constraint(2);
        }
        super(v, c, id);
        this.type = type;

        this.hidden = false;
    }

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
        } else {
        }

        for (const v of this.vertices) {
            v.value.display();
        }
    }

    toString() {
        if (this.type==ADDER) {
            return ("(" + round(this.vertices[0].value.getX()) +
                    "," + round(this.vertices[0].value.getY()) + "i) + " +
                    "(" + round(this.vertices[1].value.getX()) +
                    "," + round(this.vertices[1].value.getY()) + "i) = " +
                    "(" + round(this.vertices[2].value.getX()) +
                    "," + round(this.vertices[2].value.getY()) + "i)")
        } else if (this.type==MULTIPLIER) {
            return ("(" + round(this.vertices[0].value.getX()) +
                    "," + round(this.vertices[0].value.getY()) + "i) x " +
                    "(" + round(this.vertices[1].value.getX()) +
                    "," + round(this.vertices[1].value.getY()) + "i) = " +
                    "(" + round(this.vertices[2].value.getX()) +
                    "," + round(this.vertices[2].value.getY()) + "i)");
        } else if (this.type==CONJUGATOR) {
            return ("conj(" + round(this.vertices[0].value.getX()) +
                    "," + round(this.vertices[0].value.getY()) + "i) = " +
                    "(" + round(this.vertices[1].value.getX()) +
                    "," + round(this.vertices[1].value.getY()) + "i)");
        }
    }
}
