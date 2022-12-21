// data structure for representing relations
class Constraint { // :Constraint<T>
    constructor( ) {
        
    }

    // checks if the given data exactly satisfies the constraint
    accepts(data) { // :[T] -> bool
        
    }

    // returns an array representation of the dependency structure of the relation
    // array values mean:
    //   false - free/independent/input
    //   true - bound/dependent/output
    getDependencies() { // :-> [bool]
    }

    
}

// constraint specifying that two data must be equal
class EqualityConstraint extends Constraint {
    // eq - notion of equality
    constructor(eq) {
        
    }
}
