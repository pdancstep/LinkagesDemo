// data structure for representing points in the complex plane
// and relations between those points
// (technically this structure is a directed hypergraph, not strictly a graph)  
class Graph {
    constructor() {
        this.vertices = [];
        this.edges = [];
    }

    // add a new vertex that is not connected to any relation
    // returns the vertex
    addFreeNode(coord, data = {}) {
        let v = new Number(coord.getX(), coord.getY(), [], true, data)
        this.points.push(v);
        return v;
    }

    // zip an array of coordinates and an array of their corresponding data
    // and add them to the graph. returns the edge representing the relation
    addRelation(coords, data, constraint) {
        let idx = this.edges.length;
        let vertices = [];
        for (let i=0; i<coords.length; i++) {
            let v = new Number(coords[i].getX(), coords[i].getY(), [idx], false, data[i]);
            vertices.push(v);
        }
        let e = new Edge(vertices);
        this.edges.push(e);
        return e;
    }

}

// placeholder for parent class to Operator
class Edge {
    constructor(v) {
        this.vertices = v;
    }
}
