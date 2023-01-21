//////////////////////////////////////////////////////////////////////////////////
// "ideal" constraints that simply perform the relevant calculation all at once //
//////////////////////////////////////////////////////////////////////////////////
class IdealComplexAdder extends OperatorConstraint { // :Constraint<Coord>
    constructor() {
        let subL = function(d) { return d[2].subtract(d[1]); };
        let subR = function(d) { return d[2].subtract(d[0]); };
        let add = function(d) { return d[0].translate(d[1]); };
        let eq = function(z1, z2) { return z1.equals(z2); };
        let cp = function(zIn, zOut) { zOut.mut_sendTo(zIn); };
        let check = function(d) { return eq(add(d),d[2]); }
        super([subL, subR, add], eq, cp, check);
    }
}

class IdealComplexMultiplier extends OperatorConstraint { // :Constraint<Coord>
    constructor() {
        let divL = function(d) { return d[2].divide(d[1]); };
        let divR = function(d) { return d[2].divide(d[0]); };
        let mult = function(d) { return d[0].multiply(d[1]); }
        let eq = function(z1, z2) { return z1.equals(z2); };
        let cp = function(zIn, zOut) { zOut.mut_sendTo(zIn); };
        let check = function(d) { return eq(mult(d),d[2]); }
        super([divL, divR, mult], eq, cp, check);
    }

    accepts(data) {
        // if constraint is in a division mode, check for 0 divisor
        if ((this.bound==0 && data[1].isOrigin()) ||
            (this.bound==1 && data[0].isOrigin())) {
            return false;
        } else {
            return super.accepts(data);
        }
    }
}

class IdealComplexConjugator extends OperatorConstraint { // :Constraint<Coord>
    constructor() {
        let conjL = function(d) { return d[1].conjugate(); };
        let conjR = function(d) { return d[0].conjugate(); };
        let eq = function(z1, z2) { return z1.equals(z2); };
        let cp = function(zIn, zOut) { zOut.mut_sendTo(zIn); }; 
        let check = function(d) { return eq(conjL(d),d[0]); };
        super([conjL, conjR], eq, cp, check);
    }
}

///////////////////////////////////////////////////////////////////////
// "naive" constraints that update iteratively at a given resolution //
///////////////////////////////////////////////////////////////////////

class IterativeComplexAdder extends IdealComplexAdder { // :Constraint<Coord>
    constructor(stepSize, iters) {
        super();
        this.stepSize = stepSize; // :number
        this.iters = iters;       // :nat
    }

    update(data) {
        for (let i=0; i<this.iters; i++) {
            data = this.iterate(data);
        }
        return data;
    }
    
    iterate(data) {
        switch (this.bound) {
        case 0:
            data[0] = this.iterateDiff(data[2], data[1], data[0]);
            break;
        case 1:
            data[1] = this.iterateDiff(data[2], data[0], data[1]);
            break;
        case 2:
            data[2] = this.iterateSum(data[0], data[1], data[2]);
            break;
        default:
            // should not get here
        }
        return data;
    }

    iterateSum(z1, z2, guess) {
        let sum = z1.translate(z2);
        if (sum.isNear(guess, this.stepSize)) {
            return guess.mut_sendTo(sum);
        } else {
            let theta = sum.subtract(guess).getTh();
            return guess.mut_translate(new Polar(this.stepSize, theta));
        }
    }

    iterateDiff(z, zsub, guess) {
        let diff = z.subtract(zsub);
        if (diff.isNear(guess, this.stepSize)) {
            return guess.mut_sendTo(diff);
        } else {
            let theta = diff.subtract(guess).getTh();
            return guess.mut_translate(new Polar(this.stepSize, theta));
        }
    }
}

class IterativeComplexMultiplier extends IdealComplexMultiplier { // :Constraint<Coord>
    constructor(stepSize, iters) {
        super();
        this.stepSize = stepSize; // :number
        this.iters = iters;       // :nat
    }

    update(data) {
        for (let i=0; i<this.iters; i++) {
            data = this.iterate(data);
        }
        return data;
    }
    
    iterate(data) {
        switch (this.bound) {
        case 0:
            data[0] = this.iterateQuot(data[2], data[1], data[0]);
            break;
        case 1:
            data[1] = this.iterateQuot(data[2], data[0], data[1]);
            break;
        case 2:
            data[2] = this.iterateProd(data[0], data[1], data[2]);
            break;
        default:
            // should not get here
        }
        return data;
    }

    iterateProd(z1, z2, guess) {
        let prod = z1.multiply(z2);
        if (prod.isNear(guess, this.stepSize)) {
            return guess.mut_sendTo(prod);
        } else {
            let theta = prod.subtract(guess).getTh();
            return guess.mut_translate(new Polar(this.stepSize, theta));
        }
    }

    iterateQuot(z, zdiv, guess) {
        // if dividing by 0, just move the quotient towards infinity
        if (zdiv.isOrigin()) {
            return guess.mut_translate(new Polar(this.stepSize, guess.getTh()));
        }
        
        let quot = z.divide(zdiv);
        if (quot.isNear(guess, this.stepSize)) {
            return guess.mut_sendTo(quot);
        } else {
            let theta = quot.subtract(guess).getTh();
            return guess.mut_translate(new Polar(this.stepSize, theta));
        }
    }
}

class IterativeComplexConjugator extends IdealComplexConjugator { // :Constraint<Coord>
    constructor(stepSize, iters) {
        super();
        this.stepSize = stepSize; // :number
        this.iters = iters;       // :nat
    }
    
    update(data) {
        for (let i=0; i<this.iters; i++) {
            data = this.iterate(data);
        }
        return data;
    }
    
    iterate(data) {
        data[this.bound] = this.iterateConj(data[1-this.bound], data[this.bound]);
        return data;
    }

    iterateConj(z, guess) {
        let conj = z.conjugate();
        if (conj.isNear(guess, this.stepSize)) {
            return guess.mut_sendTo(conj);
        } else {
            let theta = conj.subtract(guess).getTh();
            return guess.mut_translate(new Polar(this.stepSize, theta));
        }
    }
}

////////////////////////////////////////////////////////////////////////////
// "differential" constraints that update with automatic differentiation  //
//  (note that this algorithm is not compatible with basic Coord class)   //
// right now calling update on this constraint ONLY updates differentials //
////////////////////////////////////////////////////////////////////////////

class DifferentialComplexAdder extends IdealComplexAdder { // :Constraint<LinkagePoint>
    constructor() {
        super();
    }

    update(data) {
        switch (this.bound) {
        case 0:
            data[0].delta = data[2].delta.subtract(data[1].delta);
            break;
        case 1:
            data[1].delta = data[2].delta.subtract(data[0].delta);
            break;
        case 2:
            data[2].delta = data[0].delta.translate(data[1].delta);
            break;
        default:
            // should not get here
        }
        return data;
    }
}

class DifferentialComplexMultiplier extends IdealComplexMultiplier { // :Constraint<LP>
    constructor() {
        super();
    }

    update(data) {
        let fprimeg, fgprime, gsquare;
        switch (this.bound) {
        case 0:
            fprimeg = data[2].delta.multiply(data[1]);
            fgprime = data[2].multiply(data[1].delta);
            gaquare = data[1].multiply(data[1]);
            data[0].delta = fprimeg.subtract(fgprime).divide(gsquare);
            break;
        case 1:
            fprimeg = data[2].delta.multiply(data[0]);
            fgprime = data[2].multiply(data[0].delta);
            gaquare = data[0].multiply(data[0]);
            data[1].delta = fprimeg.subtract(fgprime).divide(gsquare);
            break;
        case 2:
            fprimeg = data[0].delta.multiply(data[1]);
            fgprime = data[0].multiply(data[1].delta);
            data[2].delta = fprimeg.translate(fgprime);
            break;
        default:
            // should not get here
        }
        return data;
    }
}

class DifferentialComplexConjugator extends IdealComplexConjugator { // :Constraint<LP>
    constructor() {
        super();
    }

    update(data) {
        let deltaIn = data[1-this.bound].delta;
        data[this.bound].delta = new Coord(deltaIn.getX(), deltaIn.getY()*-1);
        return data;
    }
}

