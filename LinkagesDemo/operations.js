//////////////////////////////////////////////////////////////////////////////////
// "ideal" constraints that simply perform the relevant calculation all at once //
/////////////////////////////////////////////////////////////////////////////////
class IdealComplexAdder extends OperatorConstraint { // :Constraint<Coord>
    constructor() {
        let op = function(z1, z2) { return z1.translate(z2); };
        let inv = function (z, zsub) { return z.subtract(zsub); };
        let eq = function(z1, z2) { return z1.equals(z2); };
        super(op, inv, inv, eq);
    }
}

class IdealComplexMultiplier extends OperatorConstraint { // :Constraint<Coord>
    constructor() {
        let op = function(z1, z2) { return z1.multiply(z2); }
        let inv = function(z, zdiv) { return z.divide(zdiv); };
        let eq = function(z1, z2) { return z1.equals(z2); };
        super(op, inv, inv, eq);
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

class IdealComplexConjugator extends Constraint { // :Constraint<Coord>
    constructor() {
        super(2);
        this.primaryLeft = true;
    }

    eq(z1, z2) { return z1.equals(z2); }

    accepts(data) {
        return super.accepts(data) && this.eq(data[0].conjugate(), data[1]);
    }

    getDependencies() {
        return [!this.primaryLeft, this.primaryLeft];
    }

    invert(take, give) {
        if (super.invert(take, give)) {
            this.primaryLeft = !this.primaryLeft;
            return true;
        } else {
            return false;
        }
    }

    update(data) {
        if (this.primaryLeft) {
            data[1] = data[0].conjugate();
        } else {
            data[0] = data[1].conjugate();
        }
    }
}

///////////////////////////////////////////////////////////////////////
// "naive" constraints that update iteratively at a given resolution //
///////////////////////////////////////////////////////////////////////

//TODO

///////////////////////////////////////////////////////////////////////
// "differential" constraints that update with whatsitcalled
///////////////////////////////////////////////////////////////////////

//TODO
// do we want some kind of resolution parameter? should there be two versions?
