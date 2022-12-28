// data structure for representing relations
class Constraint { // :Constraint<T>
    constructor(arity) {
        this.arity = arity;
    }

    // checks if two pieces of data are equal for purposes of this constraint
    eq(dat1, dat2) {
        return true;
    }

    // checks if the given data exactly satisfies the constraint
    accepts(data) { // :[T] -> bool
        if (this.arity != data.length) {
            return false;
        }
    }

    // returns an array representation of the dependency structure of the relation
    // array values mean:
    //   false - free/independent/input
    //   true - bound/dependent/output
    getDependencies() { // :-> [bool]
        return new Array(this.arity).fill(false);
    }

    // exchange free/bound status of two positions
    // returns true if successful
    // note: we want all constraint classes to have the property that
    //       if invert(a,b) succeeds than a subsequent invert(b,a) will also succeed
    //       (we probably also want it to give back the original constraint)
    invert(take, give) { // : index(edge) -> index(edge) -> bool
        if (take==give) { return false; }
        if (take >= this.arity || give >= this.arity) { return false;}
        return true;
    }

    // change data in bound positions to fit constraint
    update(data) { // :[T] -> [T]
        return data;
    }
}

// constraint specifying that two data must be equal
class EqualityConstraint extends Constraint { // :Constraint<T>
    // eq - notion of equality
    constructor(eq) {
        this.eq = eq; // T -> T -> bool
        super(2);
        this.primaryLeft = true; // bool
    }

    accepts(data) {
        if (super.accepts(data)) {
            return this.eq(data[0],data[1]);
        } else {
            return false;
        }
    }

    getDependencies() {
        if (this.primaryLeft) {
            return [false, true];
        } else {
            return [true, false];
        }
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
            data[1] = data[0];
        } else {
            data[0] = data[1];
        }
        return data;
    }
}

class OperatorConstraint extends Constraint { // :Constraint<T>
    constructor(op, invL, invR, eq) {
        this.op = op; // :T -> T -> T
        this.invL = invL; // :T -> T -> T
        this.invR = invR; // :T -> T -> T
        this.eq = eq; // :T -> T -> bool
        super(3);
        this.bound = 2; // index(edge)
    }

    accepts(data) {
        if (super.accepts(data)) {
            let result = this.op(data[0], data[1]);
            return this.eq(data[2], result);
        } else {
            return false;
        }
    }

    getDependencies() {
        let deps = [false, false, false];
        deps[this.bound] = true;
        return deps;
    }

    invert(take, give) {
        if (take == this.bound && super.invert(take, give)) {
            this.bound = give;
            return true;
        } else {
            return false;
        }
    }

    update(data) {
        switch (this.bound) {
        case 0:
            data[0] = this.invL(data[2], data[1]);
            break;
        case 1:
            data[1] = this.invR(data[2], data[0]);
            break;
        case 2:
            data[2] = this.op(data[0], data[1]);
            break;
        default:
            // should not get here
        }
        return data;
    }
}
