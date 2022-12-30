// data structure for representing relations
// this base class is a trivial relation that only cares about the number of members
class Constraint { // :Constraint<T>
    constructor(arity) {
        this.arity = arity; // :index
    }

    // checks if two pieces of data are equal for purposes of this constraint
    eq(dat1, dat2) { // :T -> T -> bool
        return true;
    }

    // checks if the given data exactly satisfies the constraint
    accepts(data) { // :[T] -> bool
        return this.arity == data.length;
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
    invert(take, give) { // : index -> index -> bool
        if (take==give) { return false; }
        if (take >= this.arity || give >= this.arity) { return false; }
        return true;
    }

    // change data in dependent/bound positions to fit the requirements of this constraint
    update(data) { // :[T] -> [T]
        return data;
    }
}

// constraint specifying that two data must be equal
class EqualityConstraint extends Constraint { // :Constraint<T>
    // eq - notion of equality
    constructor(eq) {
        super(2);
        this.eq = eq;            // T -> T -> bool
        this.primaryLeft = true; // bool
    }

    accepts(data) {
        return super.accepts(data) && this.eq(data[0],data[1]);
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
            data[1] = data[0];
        } else {
            data[0] = data[1];
        }
        return data;
    }
}

class OperatorConstraint extends Constraint { // :Constraint<T>
    constructor(op, invL, invR, eq,
                check = function(a, b, c) { return eq(op(a,b), c); }) {
        super(3);           //              |   a $ b = c
        this.op = op;       // :T -> T -> T |  a -> b -> c
        this.invL = invL;   // :T -> T -> T |  c -> b -> a
        this.invR = invR;   // :T -> T -> T |  c -> a -> b
        this.eq = eq;       // :T -> T -> bool
        this.check = check; // :T -> T -> T -> bool
        this.bound = 2;     // :index
    }

    accepts(data) {
        return super.accepts(data) && this.check(data[0], data[1], data[2]);
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
