class LinkageGraph extends RelGraph { // :RelGraph<LinkagePoint>
    constructor() {
        super(function(z1,z2) { return z1.equals(z2); });
    }

    // use this instead of addRelated
    addOperation(type) {
        let vs = [];
        if (type==ADDER) {
            vs.push(this.addFree(new LinkagePoint(0,0,true)));
            vs.push(this.addFree(new LinkagePoint(0,0,true)));
            vs.push(this.addFree(new LinkagePoint(0,0,false)));
        } else if (type==MULTIPLIER) {
            vs.push(this.addFree(new LinkagePoint(1,0,true)));
            vs.push(this.addFree(new LinkagePoint(1,0,true)));
            vs.push(this.addFree(new LinkagePoint(1,0,false)));
        } else if (type==CONJUGATOR) {
            vs.push(this.addFree(new LinkagePoint(0,1,true)));
            vs.push(this.addFree(new LinkagePoint(0,-1,false)));
        } else {
            return null;
        }

        let e = new LinkageOp(vs, type, this.edges.length);
        this.edges.push(e);
        e.updateDependencies();
        return e;
    }

    unify(v1, v2) {
        if (v1.isFree() && v2.isFree()) {
            v2.hidden = true;
            return this._unify(v1, v2);
        } else {
            return null;
        }
    }

    // must provide the hidden vertex in order to resume display
    disunify(v) {
        if (this._disunify(v)) {
            v.hidden = false;
            return true;
        } else {
            return false;
        }
    }

    display() {
        for (const v of this.vertices) {
            v.value.display();
        }
        for (const e of this.edges) {
            if (e instanceof LinkageOp) {
                e.display();
            }
        }
    }

    // returns the first vertex close to the cursor
    findMouseover() {
        for (const v of this.vertices) {
            if (v.value.checkMouseover()) {
                return v;
            }
        }
        return null;
    }
}
