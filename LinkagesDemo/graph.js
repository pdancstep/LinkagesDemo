// graph structure that tracks free/bound dependency for multiple relations
// (technically this structure is a directed hypergraph, not strictly a graph)  
class RelGraph { // :RelGraph<T>
    // eq :T -> T -> bool - notion of equality for vertex data
    constructor(eq = function(x,y) { return x===y; }) {
        this.vertices = []; // :[Vertex<T>]
        this.edges = []; // :[Edge<Vertex<T>>]

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
                let v = this.addFree(data[i]);
                vs.push(v);
            }
            // build the edge that captures the relation between the vertices
            let e = new Edge(vs, constraint);
            this.edges.push(e);

            // vertices in bound positions note free positions as their dependencies
            let bound = e._getBoundVertices();
            let free = e._getFreeVertices();
            for (const v of bound) {
                v.deps = free.slice();
            }
            return e;
        } else {
            return null;
        }
    }

    getFreeVertices() {
        this.vertices.filter(function(v) { return v.isFree(); });
    }

    getBoundVertices() {
        this.vertices.filter(function(v) { return v.isBound(); });
    }

    // is this vertex in a bound position of any edge?
    _dependentAt(idx) { // :index(this.vertices) -> bool
        return this.vertices[idx].isBound();
    }

    // link two vertices to the same datum by adding an equality relation
    // the second argument is marked as a shadow of the first argument
    // (so that a UI implementation can hide it if desired)
    // returns true if unification successful, false if not
    unify(v1, v2) { // :Vertex<T> -> Vertex<T> -> bool
        // can only unify free vertices
        if (v1.isBound() || v2.isBound()) {
            return false;
        }        

        this.history.unshift(this.edges.length);
        v2.deps.push([v1.id, this.edges.length]);
        this.edges.push(new Edge([v1, v2], new EqualityConstraint(this.eq)));
        return true;
    }

    // remove the most recently created unification involving vertex v
    // returns true if disunification successful, false if not
    // WARNING: repeated unification & disunification creates a small memory leak
    disunify(v) { // :Vertex<T> -> bool
        for (let i=0; i<this.history.length; i++) {
            let idxE = this.history[i]; // :index(this.edges)
            let e = this.edges[idxE];
            if (!e instanceof EqualityConstraint) {
                continue;
            }

            // since we know e is an EqualityConstraint, pos can only be -1, 0, or 1
            let pos = e.positionOf(v, this.eq); // :index(e.vertices)
            
            if (pos<0) { continue; } // not the edge we're looking for

            let v2 = e.vertices[1-pos]; // :Vertex<T>

            // we've found the unification to remove: e relates v1 with v2

            // remove the dependency resulting from e
            v.deps = v.deps.filter(function (p) { return p[1]!=idxE; });
            v2.deps = v2.deps.filter(function (p) { return p[1]!=idxE; });

            // remove the undone unification from the history
            this.history.splice(i, 1);

            // we don't want to actually delete an edge since we're tracking stuff
            // based on indexing into this.edges, so we'll just replace the
            // equality constraint with a basic constraint (this is the memory leak)
            this.edges[idxE].constraint = new Constraint(2);
            return true;
        }
        return false;
    }
    
    // returns indices of vertices that could potentially become bound
    // to allow this vertex to become free 
    _leafDeps(id) { // :index(this.vertices) -> [index(this.vertices)]
        let deps = [];
        for (const p of this.vertices[id].deps) {
            let i = p[0]; // :index(this.vertices)
            if (this.vertices[i].isFree()) {
                deps.push(i);
            } else {
                deps.concat(this._leafDeps(i));
            }
        }
        return deps;
    }

    _directDeps(id) { // :index(this.vertices) -> [index(this.vertices)]
        return this.vertices[id].deps.map(function(p) { return p[0]; });
    }

    // attempt to gain control of a vertex by giving up control of another vertex
    // returns true if successful
    invert(take, give) { // :Vertex<T> -> Vertex<T> -> bool
        // check argument validity
        if (take.isFree()) {
            return true; // already free, nothing to do
        }
        if (give.isBound()) {
            return false; // can't give up control of an already-bound vertex
        }

        // check if inversion is possible
        if (!this._leafDeps(take.id).includes(give.id)) {
            // "give" vertex is not in the dependency tree for "take" vertex, can't invert
            return false;
        }

        // "give" is an immediate dependency of "take", so we can try inverting directly
        if (this._directDeps(take.id).includes(give.id)) {
            let success = false;
            for (const p of take.deps) {
                if (p[0]!=give.id) { continue; }
                let e = this.edges[p[1]];
                let idxT = e.positionOf(take);
                if (idxT<0 || !e._dependentAt(idxT)) {
                    // should not get here: it means the take vertex thinks it is bound in
                    // this edge, but the edge thinks the vertex is absent or already free
                    continue;
                }
                let idxG = e.positionOf(give);
                if (idxG<0) {
                    // vertex we're trying to give up is not here
                    continue;
                }
                if (!e._dependentAt(idxG)) {
                    // should not get here, this edge believes something weird
                    console.log("Warning: Relational graph is out of sync with itself.");
                    return success;
                }

                if (success) {
                    // we already succeeded?? so somehow there are *multiple* edges
                    // binding these two vertices to each other
                    console.log("Warning: Improper dependency structure detected.");
                    return true;
                }

                success = e._invert(idxT, idxG);
                if (success) {
                    // update dependencies
                    // TODO
                }
            }
        }
        if (success) { return true; }
        
        // indirect dependency: need to find an intermediate vertex to invert through
        for (const p of take.deps) {
            let idxM = p[0];
            let idxE = p[1];
            if (this._leafDeps(idxM).includes(give.id)) {
                // we have a candidate for our intermediate vertex! give it a shot
                if (this.invert(this.vertices[child], give)) {
                    // recursive call successful, now do the last step
                    if (this.invert(take, this.vertices[child])) {
                        return true;
                    } else {
                        // last step failed, so undo the recursive step
                        this.invert(give, this.vertices[child]);
                        return false;
                    }
                }
            }
        }
        // failed to find a path to invert
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
}

class Edge { // :Edge<T>
    constructor(v, c) {
        this.vertices = v; // :[T]
        this.constraint = c; // :Constraint<T>
    }
    
    // where in this edge does the given vertex appear?
    // returns -1 if the edge does not involve this vertex
    positionOf(v, eq = this.constraint.eq) {
        // :T -> (T -> T -> bool) -> index(this.vertices)
        return this.vertices.findIndex(function (val) { return eq(v, val); });
    }
    
    // is the given position a bound/output position for this edge? 
    _dependentAt(i) { // :index(this.vertices) -> bool
        return this.constraint.getDependencies()[i];
    }

    _getFreeVertices() { // :-> [T]
        let deps = this.constraint.getDependencies();
        let free = [];
        for (let i=0; i<this.vertices.length; i++) {
            if (!deps[i]) {
                free.push(this.vertices[i]);
            }
        }
        return free;
    }

    _getBoundVertices() { // :-> [T]
        let deps = this.constraint.getDependencies();
        let bound = [];
        for (let i=0; i<this.vertices.length; i++) {
            if (deps[i]) {
                bound.push(this.vertices[i]);
            }
            return bound;
        }
    
    // invert this edge's constraint by exchanging free/bound status of two positions
    // returns true if successful
    _invert(take, give) { // :index(this.vertices) -> index(this.vertices) -> bool
        return this.constraint.invert(take, give);
    }
    
    // use the constraint to update vertex data in bound positions
    // returns true if any data was changed
    // argument is the notion of equality by which changes are checked 
    _update(eq = this.constraint.eq) { // : (T -> T -> bool) -> bool
        let changed = false;
        let data = this.constraint.update(this.vertices.slice());
        for (let i=0; i<this.vertices.length; i++) {
            if (!eq(this.vertices[i], data[i])) {
                this.vertices[i].value = data[i];
                changed = true;
            }
        }
        return changed;
    }
}
