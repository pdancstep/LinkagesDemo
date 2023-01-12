// graph structure that tracks free/bound dependency for multiple relations
// (technically this structure is a directed hypergraph, not strictly a graph)  
class RelGraph { // :RelGraph<T>
    // eq :T -> T -> bool - notion of equality for vertex data
    constructor(eq = function(x,y) { return x===y; }) {
        this.vertices = []; // :[Vertex<T>]
        this.edges = []; // :[Edge<T>]

        // internal
        this.eq = eq; // :T -> T -> bool
        this.history = [] // :[index(this.edges)]
    }

    // add a new vertex that is not connected to any relation
    // returns the vertex
    addFree(datum) { // :T -> Vertex<T>
        let v = new Vertex(datum, this.vertices.length, []);
        this.vertices.push(v);
        return v;
    }

    // add a set of vertices and a constraint relating them to the graph as an edge
    // returns the edge, or null if given data do not satisfy given constraint
    addRelated(data, constraint) { // :[T] -> Constraint<T> -> Edge<T>
        if (constraint.accepts(data)) {
            // add all the needed vertices to the graph
            let vs = []; // :[Vertex<T>]
            for (let i=0; i<data.length; i++) {
                vs.push(this.addFree(data[i]));
            }
            return this._addEdge(vs, constraint);
        } else {
            return null;
        }
    }

    getFreeVertices() { // :-> [Vertex<T>]
        return this.vertices.filter(function(v) { return v.isFree(); });
    }

    getBoundVertices() { // :-> [Vertex<T>]
        return this.vertices.filter(function(v) { return v.isBound(); });
    }

    // link two free vertices to the same datum by adding an equality constraint
    // returns the new Edge, or null if unification could not be performed
    unify(v1, v2) { // :Vertex<T> -> Vertex<T> -> Edge<T>
        if (v1.isFree() && v2.isFree()) {
            return this._unify(v1, v2);
        } else {
            return null; // can only unify free vertices
        }
    }

    // remove the most recently created unification involving vertex v
    // returns true if disunification successful, false if not
    // WARNING: repeated unification & disunification creates a small memory leak
    disunify(v) { // :Vertex<T> -> bool
        return this._disunify(v);
    }

    // returns a list of vertices that should be able to invert with the given bound vertex
    getDepends(v) { // :Vertex<T> -> [Vertex<T>]
        return this._leafDeps(v).map(function(p) { return this.vertices[p[0]]; });
    }
    
    // attempt to gain control of a vertex by giving up control of another vertex
    // returns true if successful
    invert(take, give) { // :Vertex<T> -> Vertex<T> -> bool
        // if vertex to take is already free, nothing to do
        if (take.isFree()) { return true; }
        // can't give up control of an already-bound vertex
        if (give.isBound()) { return false; }
        
        return this._invert(take, give, true);
    }

    // tell all the edges to run their constraints a given number of times
    // if given a negative argument, run until equilibrium
    // note multiple iterations are often necessary because of interdepenent contraints
    // BE CAREFUL RUNNING INDEFINITE ITERATIONS, YOU PROBABLY DON'T WANT THIS
    // IF YOUR GRAPH HAS ANY INSTABILITY OR MARGIN FOR ERROR
    update(iters = 1) { // : nat -> void
        if (iters<0) {
            let changes = true;
            while (changes) {
                changes = false;
                for (let e of this.edges) {
                    let changed = e.update();
                    changes = changes || changed;
                }
            }
        } else {
            for (let i=0; i<iters; i++) {
                for (let e of this.edges) {
                    e.update();
                }
            }
        }
    }
    
    //////////////////////
    // internal methods //
    //////////////////////
    
    // find free nodes in the given vertex's dependency tree
    _leafDeps(v) { // :Vertex<T> -> [index(this.vertices) x index(this.edges)]
        let deps = [];
        for (const p of v.deps) {
            if (this.vertices[p[0]].isFree()) {
                deps.push(p);
            } else {
                deps = deps.concat(this._leafDeps(this.vertices[p[0]]));
            }
        }
        return deps;
    }

    // find bound nodes in the given vertex's dependency tree
    _intermedDeps(v) { // :Vertex<T> -> [index(this.vertices) x index(this.edges)]
        let deps = [];
        for (const p of v.deps) {
            if (this.vertices[p[0]].isFree()) {
                continue;
            } else {
                deps.push(p);
                deps = deps.concat(this._intermedDeps(this.vertices[p[0]]));
            }
        }
        return deps;
    }

    _addEdge(vs, constraint) { // :[Vertex<T>] -> Constraint<T> -> Edge<T>
        let e = new Edge(vs, constraint, this.edges.length);
        this.edges.push(e);
        e.updateDependencies();
        return e;
    }
    
    _unify(v1, v2) { // :Vertex<T> -> Vertex<T> -> Edge<T>
        this.history.unshift(this.edges.length); // history is LIFO
        let e = new Edge([v1, v2], new EqualityConstraint(this.eq));
        this.edges.push(e);
        e.updateDependencies();
        return e;
    }
    
    _disunify(v) { // :Vertex<T> -> bool
        for (let i=0; i<this.history.length; i++) {
            let idxE = this.history[i]; // :index(this.edges)
            let e = this.edges[idxE];
            if (!(e.constraint instanceof EqualityConstraint)) {
                continue;
            }

            // since we know e has an EqualityConstraint, pos can only be -1, 0, or 1
            let pos = e.vertices.indexOf(v); // :index(e.vertices)
            
            if (pos<0) { continue; } // not the edge we're looking for

            let v2 = e.vertices[1-pos]; // :Vertex<T>

            // we've found the unification to remove: e relates v with v2

            // remove the undone unification from the history
            this.history.splice(i, 1);

            // we don't want to actually delete an edge since we're tracking stuff
            // based on indexing into this.edges, so we'll just replace the
            // equality constraint with a base constraint (this is the memory leak)
            this.edges[idxE].constraint = new Constraint(2);
            this.edges[idxE].updateDependencies();
            return true;
        }
        return false;
    }

    _invert(take, give, recur) { // :Vertex<T> -> Vertex<T> -> bool -> bool
        // check argument validity
        if (take.isFree() || give.isBound()) {
            // should not get here: external method has already checked this,
            // and recursive calls should be well-behaved
            console.log("Warning: Tried to invert inappropriate vertices.");
            return false;
        }

        // see if a direct (single-step) dependency exists
        let idxE = take.bindingEdge(give);  // :index(this.edges)
        if (idxE>=0) {
            let e = this.edges[idxE];
            let idxT = e.vertices.indexOf(take); // :index(e.vertices)
            let idxG = e.vertices.indexOf(give); // :index(e.vertices)
            if (idxT<0 || !e.dependentAt(idxT) || // "take" should be present and bound
                idxG<0 || e.dependentAt(idxT)) {  // "give" should be present and free
                // should not get here, edge disagrees with vertex
                console.log("Warning: Relational graph is out of sync with itself.");
                return false;
            }
            
            if (e.invert(idxT, idxG)) {
                return true;
            } else {
                // should not get here; issue is probably with e.constraint
                console.log("Warning: Unexpected failure to preform inversion.");
                return false;
            }
        } else if (recur) {
            // try to find an intermediate vertex to invert through
            for (const p of this._intermedDeps(take.id)) {
                // see if this vertex can invert with the target in one step
                if (this._invert(this.vertices[p[0]], give, false)) {
                    // success! now do the rest
                    if (this._invert(take, this.vertices[p[0]]), true) {
                        return true;
                    } else {
                        // recursive step failed, so undo the last step
                        if (this._invert(give, this.vertices[p[0]], false)) {
                            console.log("Warning: Failure during multi-step inversion.");
                        } else {
                            console.log("Warning: Could not restore original state" +
                                        " after failure during inversion.");
                        }
                        return false;
                    }
                } else {
                    continue;
                }
            }
        }
        // no error, we just failed to find a way to invert as requested
        return false;
    }
}

class Vertex { // :Vertex<T>
    constructor(datum, id, deps) {
        this.value = datum; // :T
        this.id = id; // :index(graph.vertices)
        this.deps = deps; // :[index(graph.vertices) x index(graph.edges)]
    }

    isFree() { return this.deps.length==0; }
    isBound() { return this.deps.length>0; }

    // get index of the edge that captures this vertex's dependency on the given vertex
    // (i.e. return the edge index paired with v.id in this.deps) 
    // returns -1 if this vertex is not dependent on the given vertex
    bindingEdge(v) { // :Vertex<T> -> index(graph.edges)
        for (const p of this.deps) {
            if (p[0]==v.id) {
                return p[1];
            }
        }
        return -1;
    }
}

class Edge { // :Edge<T>
    constructor(v, c, id) {
        this.vertices = v; // :[Vertex<T>]
        this.constraint = c; // :Constraint<T>
        this.id = id; // :index(graph.edges)
    }
    
    // is the given position a bound/output position for this edge? 
    dependentAt(i) { // :index(this.vertices) -> bool
        return this.constraint.getDependencies()[i];
    }

    getFreeVertices() { // :-> [Vertex<T>]
        let deps = this.constraint.getDependencies();
        let free = [];
        for (let i=0; i<this.vertices.length; i++) {
            if (!deps[i]) {
                free.push(this.vertices[i]);
            }
        }
        return free;
    }

    getBoundVertices() { // :-> [Vertex<T>]
        let deps = this.constraint.getDependencies();
        let bound = [];
        for (let i=0; i<this.vertices.length; i++) {
            if (deps[i]) {
                bound.push(this.vertices[i]);
            }
        }
        return bound;
    }

    updateDependencies() { // :-> void
        let id = this.id;
        for (let v of this.vertices) {
            v.deps = v.deps.filter(function(p) { return p[1]!=id; }); 
        }
        let free = this.getFreeVertices().map(function(v) { return [v.id, id]; });
        for (let v of this.getBoundVertices()) {
            v.deps = v.deps.concat(free.slice());
        }
    }
    
    // invert this edge's constraint by exchanging free/bound status of two positions
    invert(take, give) { // :index(this.vertices) -> index(this.vertices) -> bool
        if (this.constraint.invert(take, give)) {
            this.updateDependencies();
            return true;
        } else {
            return false;
        }
    }
    
    // use the constraint to update vertex data in bound positions
    // returns true if any data was changed
    // argument is the notion of equality by which changes are checked 
    update(eq = this.constraint.eq) { // : (T -> T -> bool) -> bool
        let changed = false;
        let olddata = this.vertices.map(function (v) { return v.value; });
        let newdata = this.constraint.update(olddata.slice());
        for (let i=0; i<this.vertices.length; i++) {
            if (!eq(olddata[i], newdata[i])) {
                this.vertices[i].value = newdata[i];
                changed = true;
            }
        }
        return changed;
    }
}
