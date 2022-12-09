class DifferentialSolver extends Solver {
    constructor(oper, sens) {
        super(oper, sens);
    }

    solve() {
        if (this.relation==ADDER) { this.differentiateSum(); }
        else if (this.relation==MULTIPLIER) { this.differentiateProduct(); }
        for (i=0; i<DIFF_ITERS; i++) {
            this.iterate();
        }
    }

    differentiateSum() {
        switch (this.mode) {
        case DEFAULT:
            this.output.delta = this.input1.delta.translate(this.input2.delta);
            this.output.applyDifferential();
            return;
        case REVERSE1:
            this.input1.delta = this.output.delta.subtract(this.input2.delta);
            this.input1.applyDifferential();
            return;
        case REVERSE2:
            this.input2.delta = this.output.delta.subtract(this.input1.delta);
            this.input2.applyDifferential();
            return;
        case COLLAPSED:
            this.output.delta = this.input1.delta.scale(2);
            this.output.applyDifferential();
            return;
        case REVCOLLAPSED:
            this.input2.delta = this.input1.delta = this.output.delta.scale(1/2);
            this.input1.applyDifferential();
            this.input2.applyDifferential();

        case IDENTITY1:
        case IDENTITY2:
            return;
            
        default:
            // should not get here
        }
    }

    differentiateProduct() {
        let fprimeg, fgprime, gsquare;

        switch (this.mode) {
        case DEFAULT:
            fprimeg = this.input1.delta.multiply(this.input2);
            fgprime = this.input1.multiply(this.input2.delta);
            this.output.delta = fprimeg.translate(fgprime);
            this.output.applyDifferential();
            return;

        case REVERSE1:
            fprimeg = this.output.delta.multiply(this.input2);
            fgprime = this.output.multiply(this.input2.delta);
            gsquare = this.input2.multiply(this.input2);
            this.input1.delta = fprimeg.subtract(fgprime).divide(gsquare);
            this.input1.applyDifferential();
            return;

        case REVERSE2:
            fprimeg = this.output.delta.multiply(this.input1);
            fgprime = this.output.multiply(this.input1.delta);
            gsquare = this.input1.multiply(this.input1);
            this.input2.delta = fprimeg.subtract(fgprime).divide(gsquare);
            this.input2.applyDifferential();
            return;

        case COLLAPSED:
            fprimeg = this.input1.delta.multiply(this.input1);
            this.output.delta = fprimeg.scale(2);
            this.output.applyDifferential();
            return;

        case REVCOLLAPSED:
            fprimeg = this.output.delta.multiply(this.input1);
            fgprime = this.output.multiply(this.input1.delta);
            gsquare = this.input1.multiply(this.input1);
            this.input1.delta
                = this.input2.delta = fprimeg.subtract(fgprime).divide(gsquare);
            this.input1.applyDifferential();
            this.input2.applyDifferential();
            return;

        case IDENTITY1:
        case IDENTITY2:
            return;
            
        default:
            // should not get here
        }
    }
}
