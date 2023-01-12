// data structure for representing relations
// this base class is a trivial relation that only cares about the number of members
class Constraint { // :Constraint<T>
    constructor(arity) {
        this.arity = arity; // :index
    }

    ///////////////////////////////////////
    // methods that should be overridden //
    ///////////////////////////////////////
    
    // checks if two pieces of data are equal for purposes of this constraint
    eq(dat1, dat2) { // :T -> T -> bool
        return true;
    }

    // checks if the given data exactly satisfies the constraint
    accepts(data) { // :[T] -> bool
        return this.checkArity(data);
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

    /////////////////////
    // utility methods //
    /////////////////////
    
    checkArity(data) { // :[T] -> bool
        return this.arity == data.length;
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
    constructor(updaters, eq, check) {
        super(updaters.length);
        this.ops = updaters; // :[[T] -> T]
        this.eq = eq;        // :T -> T -> bool
        this.check = check;  // :[T] -> bool
        this.bound = updaters.length-1; // :index
    }

    accepts(data) {
        return super.accepts(data) && this.check(data);
    }

    getDependencies() {
        let deps = super.getDependencies();
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
        data[this.bound] = this.ops[this.bound](data);
        return data;
    }
}
