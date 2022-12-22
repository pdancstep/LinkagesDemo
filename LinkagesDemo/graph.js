// (technically this structure is a directed hypergraph, not strictly a graph)  
class Graph { // :Graph<T>
    // eq - notion of equality for vertex data
    constructor(eq = function(x,y) { return x===y; }) {
        this.vertices = []; // :[T]
        this.shadows = []; // :[index(graph)]
        this.edges = []; // :[Edge<T>]
        this.eq = eq; // :T -> T -> bool
        this.history = [] // :[index(graph)]
    }

    // add a new vertex that is not connected to any relation
    // returns the vertex
    addFree(datum) { // :T -> Vertex<T>
        let v = new Vertex(datum, this.vertices.length);
        this.vertices.push(v);
        this.shadows.push(-1);
        return v;
    }

    // add a set of vertices and a constraint relating them to the graph as an edge
    // returns the edge, or null if given data do not satisfy given constraint
    addRelated(data, constraint) { // :[T] -> Constraint<T> -> Edge<T>
        if (constraint.accepts(data)) {
            let vs = []; // :[Vertex<T>]
            for (let i=0; i<data.length; i++) {
                let v = this.addFree(data[i]);
                vs.push(v);
            }
            let e = new Edge(vs, constraint);
            this.edges.push(e);
            return e;
        } else {
            return null;
        }
    }

    // is this vertex in a bound position of any edge?
    _dependentAt(idx) { // :index(graph) -> bool
        for (const e of this.edges) {
            let i = e.positionOf(this.vertices[idx]);
            if (i>=0 && e._dependentAt(i)) {
                return true;
            }
        }
    }

    // link two vertices to the same datum by adding an equality relation
    // the second argument is marked as shadowing the first argument
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
        this.history.push(this.edges.length);
        this.edges.push(new Edge([v1, v2], new EqualityConstraint(this.eq)));
    }

    // remove the most recently created unification involving vertex v
    // returns true if disunification successful, false if not
    disunify(v) { // :Vertex<T> -> bool
        let vpr = this._getPrimary(v);
        if (vpr===null || this.dependentAt(vpr.id)) {
            return false;
        }

        for (let i=this.history.length-1; i>=0; i--) {
            let e = this.edges[this.history[i]];
            if (!e instanceof EqualityConstraint) {
                continue;
            }
            
            let p = e.positionOf(vpr);
            // not sure if this "2nd try" is necessary, wrong, or neither
            //if (p<0) {
            //    p = e.positionOf(v);
            //}
            let v2 = null;
            if (p==0) {
                v2 = e.vertices[1];
            } else if (p==1) {
                v2 = e.vertices[0];
            } else {
                continue;
            }
            if (this.shadows[v2.id] == vpr.id) {
                this.shadows[v2.id] = -1;
            } else {
                console.log("Warning: found unexpected shadow when disunifying vertices");
            }
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
    findLeaves(v) { // :Vertex<T> -> [Vertex<T>]
        return []; 
    }

    // attempt to gain control of a vertex by giving up control of another vertex
    // returns true if successful
    invert(take, give) { // :Vertex<T> -> Vertex<T> -> bool
        return false;
    }
    
    // allow each edge to propogate changes
    // iters - number of times to loop through edges
    update(iters = 1) { // : count -> void
        if (iters <=0) {
            return;
        }
        let changed = false;
        for (const e of this.edges) {
            if (e._update(this.eq)) {
                changed = true;
            }
        }
        if (changed) {
            this.update(iters-1);
        }
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
