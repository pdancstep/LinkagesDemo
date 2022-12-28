class Tree { // :Tree<T>
    constructor(value) {
        this.value = value; // :T
        this.children = []; // :[Tree<T>]
    }

    isLeaf() { // :-> bool
        return this.children.length==0;
    }

    getNodeData() { // :-> T
        return this.value;
    }

    getChildren() { // :-> [Tree<T>]
        return this.children;
    }
    
    // returns an array of the values for this node's immediate children
    getChildData() { // :-> [T]
        return this.children.map(function(t) { return t.value; });
    }

    // returns an array of the values for this node's leaves
    getLeafData() { // :-> [T]
        if (this.isLeaf()) {
            return [this.value];
        } else {
            let leaves = [];
            for (const t of this.children) {
                leaves.concat(t.getLeafData);
            }
        } 
    }

    // returns all the values from this tree as an array
    flatten() { // :-> [T]
        let leaves = [this.value];
        for (const t of this.children) {
            leaves.concat(t.flatten());
        }
        return leaves;
    }
    
    // replaces this.children with leaves that have the values supplied in the array
    // returns: this tree
    setChildData(ar) { // :[T] -> Tree<T>
        this.children = ar.map(function(v) { return new Tree(v); });
        return this;
    }

    // apply a function to each node's data
    // returns the result as a new tree
    map(f) { // :(T -> S) -> Tree<S>
        let tree = new Tree(f(this.value));
        return tree.setChildData(this.children.map(function(tr) { return tr.map(f); }));
    }
}
