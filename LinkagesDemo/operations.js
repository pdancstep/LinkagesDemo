//////////////////////////////////////////////////////////////////////////////////
// "ideal" constraints that simply perform the relevant calculation all at once //
//////////////////////////////////////////////////////////////////////////////////
class IdealComplexAdder extends OperatorConstraint { // :Constraint<Coord>
    constructor() {
        let subL = function(d) { return d[2].subtract(d[1]); };
        let subR = function(d) { return d[2].subtract(d[0]); };
        let add = function(d) { return d[0].translate(d[1]); };
        let eq = function(z1, z2) { return z1.equals(z2); };
        let check = function(d) { return eq(add(d),d[2]); }
        super([subL, subR, add], eq, check);
    }
}

class IdealComplexMultiplier extends OperatorConstraint { // :Constraint<Coord>
    constructor() {
        let divL = function(d) { return d[2].divide(d[1]); };
        let divR = function(d) { return d[2].divide(d[0]); };
        let mult = function(d) { return d[0].multiply(d[1]); }
        let eq = function(z1, z2) { return z1.equals(z2); };
        let check = function(d) { return eq(mult(d),d[2]); }
        super([divL, divR, mult], eq, check);
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
        let check = function(d) { return eq(conjL(d),d[0]); };
        super([conjL, conjR], eq, check);
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
            return sum;
        } else {
            let theta = sum.subtract(guess).getTh();
            return guess.translate(new Polar(this.stepSize, theta));
        }
    }

    iterateDiff(z, zsub, guess) {
        let diff = z.subtract(zsub);
        if (diff.isNear(guess, this.stepSize)) {
            return diff;
        } else {
            let theta = diff.subtract(guess).getTh();
            return guess.translate(new Polar(this.stepSize, theta));
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
            return prod;
        } else {
            let theta = prod.subtract(guess).getTh();
            return guess.translate(new Polar(this.stepSize, theta));
        }
    }

    iterateQuot(z, zdiv, guess) {
        // if dividing by 0, just move the quotient towards infinity
        if (zdiv.isOrigin()) {
            return guess.translate(new Polar(this.stepSize, guess.getTh()));
        }
        
        let quot = z.divide(zdiv);
        if (quot.isNear(guess, this.stepSize)) {
            return quot;
        } else {
            let theta = quot.subtract(guess).getTh();
            return guess.translate(new Polar(this.stepSize, theta));
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
            return conj;
        } else {
            let theta = conj.subtract(guess).getTh();
            return guess.translate(new Polar(this.stepSize, theta));
        }
    }
}

///////////////////////////////////////////////////////////////////////////
// "differential" constraints that update with automatic differentiation //
///////////////////////////////////////////////////////////////////////////

//TODO
// do we want some kind of resolution parameter? should there be two versions?
