// graph structure that tracks free/bound dependency for multiple relations
// (technically this structure is a directed hypergraph, not strictly a graph)  
class RelGraph { // :RelGraph<T>
    // eq :T -> T -> bool - notion of equality for vertex data
    constructor(eq = function(x,y) { return x===y; }) {
        this.vertices = []; // :[T]
        this.shadows = []; // :[index(this.vertices)]
        this.deps = [] // :[Tree<index(this.vertices) x index(this.edges)>]
        this.edges = []; // :[Edge<T>]
        this.eq = eq; // :T -> T -> bool
        this.history = [] // :[index(this.edges)]
    }

    // add a new vertex that is not connected to any relation
    // returns the vertex
    addFree(datum) { // :T -> Vertex<T>
        let v = new Vertex(datum, this.vertices.length);
        this.vertices.push(v);
        this.shadows.push(-1);
        this.deps.push(new Tree([v.id, -1]));
        return v;
    }

    // add a set of vertices and a constraint relating them to the graph as an edge
    // returns the edge, or null if given data do not satisfy given constraint
    addRelated(data, constraint) { // :[T] -> Constraint<T> -> Edge<T>
        if (constraint.accepts(data)) {
            // add all the needed vertices to the graph,
            // recording the IDs for those in free positions
            let vs = []; // :[Vertex<T>]
            let deps = constraint.getDependencies(); // :[bool]
            let frees = []; // :[index(this.vertices)]
            for (let i=0; i<data.length; i++) {
                let v = this.addFree(data[i]);
                vs.push(v);
                if (!deps[i]) {
                    frees.push([v.id, this.edges.length]);
                }
            }
            // build the edge that captures the relation between the vertices
            let e = new Edge(vs, constraint);
            this.edges.push(e);
            for (let i=0; i<this.vertices.length; i++) {
                // vertices in bound positions note free positions as their dependencies
                if (e._dependentAt(this.vertices[i])) {
                    this.deps[i].setChildData(frees);
                }
            }
            return e;
        } else {
            return null;
        }
    }

    // is this vertex in a bound position of any edge?
    _dependentAt(idx) { // :index(this.vertices) -> bool
        return !this.deps[idx].isLeaf();
    }

    // link two vertices to the same datum by adding an equality relation
    // the second argument is marked as a shadow of the first argument
    // (so that a UI implementation can hide it if desired)
    // returns true if unification successful, false if not
    unify(v1, v2) { // :Vertex<T> -> Vertex<T> -> bool
        v1 = this._getPrimary(v1);
        v2 = this._getPrimary(v2);
        if (v1===null || this._dependentAt(v1.id) ||
            v2===null || this._dependentAt(v2.id)) {
            return false;
        }        
        this.shadows[v2.id] = v1.id;
        this.history.unshift(this.edges.length);
        this.deps[vs.id] = new Tree([v1.id, this.edges.length]);
        this.edges.push(new Edge([v1, v2], new EqualityConstraint(this.eq)));
        return true;
    }

    // remove the most recently created unification involving vertex v
    // returns true if disunification successful, false if not
    disunify(v) { // :Vertex<T> -> bool
        let vpr = this._getPrimary(v);
        if (vpr===null || this._dependentAt(vpr.id)) {
            return false;
        }

        for (let i=0; i<this.history.length; i++) {
            let e = this.edges[this.history[i]];
            if (!e instanceof EqualityConstraint) {
                continue;
            }

            // since we know e is an EqualityConstraint, p can only be -1, 0, or 1
            let p = e.positionOf(vpr); // :index(e)
            // not sure if this "2nd try" is necessary, wrong, or neither
            //if (p<0) {
            //    p = e.positionOf(v);
            //}
            
            if (p<0) { continue; } // not the edge we're looking for
            let v2 = e.vertices[1-p]; // :Vertex<T>

            if (this.shadows[v2.id] == vpr.id) {
                this.shadows[v2.id] = -1;
            } else {
                console.log("Warning: found unexpected shadow when disunifying vertices");
            }
            this.deps[v2.id] = new Tree([v2.id, -1]);

            this.edges.splice(this.history[i], 1);
            this.history.splice(i, 1);
            return true;
        }
        return false;
    }
    
    // get the primary vertex representing a set of unified vertices 
    _getPrimary(v) { // :Vertex<T> -> Vertex<T>
        for (let i=0; i<this.shadows.length; i++) { // loop detection
            if (this.shadows[v.id] >= 0) {
                v = this.vertices[this.shadows[v.id]];
            }
        }
        if (this.shadows[v.id] >= 0) { // can't terminate, got stuck in a loop
            return null;
        } else {
            return v;
        }
    }

    // returns vertices that could potentially become bound
    // to allow this vertex to become free 
    _leafDeps(id) { // :index(this.vertices) -> [index(this.vertices)]
        if (this._dependentAt(id)) {
            return this.deps[id].getLeafData().map(function(p) { return p[0]; });
        } else {
            return [];
        }
    }

    _directDeps(id) { // :index(this.vertices) -> [index(this.vertices)]
        if (this._dependentAt(id)) {
            return this.deps[id].getChildData().map(function(p) { return p[0]; });
        } else {
            return [];
        }
    }

    // attempt to gain control of a vertex by giving up control of another vertex
    // returns true if successful
    invert(take, give) { // :Vertex<T> -> Vertex<T> -> bool
        // check argument validity
        take = this._getPrimary(take);
        give = this._getPrimary(give);
        if (take===null || give===null) {
            return false;
        }
        if (!this._dependentAt(take.id)) {
            return true; // already free, nothing to do
        }
        if (this._dependentAt(give.id)) {
            return false; // can't give up control of an already-bound vertex
        }

        // check if inversion is possible
        if (!this._leafDeps(take.id).includes(give.id)) {
            // "give" vertex is not in the dependency tree for "take" vertex, can't invert
            return false;
        }

        // "give" is an immediate dependency of "take", so we can try inverting directly
        if (this._directDeps(id).includes(give.id)) {
            let successes = []; // :index(this.edges)
            // most of the time this loop amounts to just finding the single edge
            // where the dependency is, and inverting that
            for (let i=0; i<this.edges.length; i++) {
                let e = this.edges[i];
                
                let idx_t = e.positionOf(take);
                if (idx_t<0 || !e._dependentAt(idx_t)) {
                    // vertex we're trying to take is absent or already free in this edge
                    continue;
                }
                let idx_g = e.positionOf(give);
                if (idx_g<0 || e.dependentAt(idx_g)) {
                    // should not get here, since dependency is supposed to be direct
                    return false;
                }

                let result = e._invert(idx_t, idx_g);
                if (result) {
                    successes.push(i);
                } else { // failed to invert, unwind previous successes and report failure
                    while (successes.length>0) {
                        this.edges[successes.pop()]._invert(idx_g, idx_t);
                    }
                    break;
                }
            }
            // we successfully inverted something! go home
            if (success.length>0) { return true; }
        }
        
        // indirect dependency: need to find an intermediate vertex to invert through
        // TODO
    }
}

class Vertex { // :Vertex<T>
    constructor(datum, id) { // :T -> Vertex<T>
        this.value = datum; // :T
        this.id = id; // :index(graph)
    }
}

class Edge { // :Edge<T>
    constructor(v, c) {
        this.vertices = v; // :[Vertex<T>]
        this.constraint = c; // :Constraint<T>
    }

    // where in this edge does the given vertex appear?
    // returns -1 if the edge does not involve this vertex
    positionOf(v) { // :Vertex<T> -> index(edge)
        for (let i=0; i<this.vertices.length; i++) {
            if (v.id == this.vertices[i].id) {
                return i;
            }
        }
        return -1;
    }

    // is the given position a bound/output position for this edge? 
    _dependentAt(i) { // :index(edge) -> bool
        return this.constraint.getDependencies()[i];
    }

    _getFreeVertices() { // :-> [Vertex<T>]
        let deps = this.constraint.getDependencies();
        let free = [];
        for (let i=0; i<this.vertices.length; i++) {
            if (!deps[i]) {
                free.push(this.vertices[i]);
            }
        }
        return free;
    }
    
    // invert this edge's constraint by exchanging free/bound status of two positions
    // returns true if successful
    _invert(take, give) { // :index(edge) -> index(edge) -> bool
        return this.constraint.invert(take, give);
    }

    // use the constraint to update vertex data in bound positions
    // returns true if any data was changed
    // argument is the notion of equality by which changes are checked 
    _update(eq) { // : (T -> T -> bool) -> bool
        let data = [];
        for (let i=0; i<this.vertices.length; i++) {
            data.push(this.vertices[i].value);
        }
        let changed = false;
        data = this.constraint.update(data);
        for (let i=0; i<this.vertices.length; i++) {
            if (!eq(this.vertices[i], data[i])) {
                this.vertices[i].value = data[i];
                changed = true;
            }
        }
        return changed;
    }
}
