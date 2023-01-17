class LinkageGraph extends RelGraph { // :RelGraph<LinkagePoint>
    constructor() {
        super(function(z1,z2) { return z1.equals(z2); });
        this.focus = null;
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

    // must provide the hidden vertex in order to resume display
    disunify(v) {
        if (this._disunify(v)) {
            v.value.hidden = false;
            return true;
        } else {
            return false;
        }
    }

    invert(take, give) {
        if (super.invert(take, give)) {
            take.value.free = true;
            give.value.free = false;
            return true;
        } else {
            return false;
        }
    }
    
    display(reversing=false) {
        for (const e of this.edges) {
            if (e instanceof LinkageOp) {
                e.display();
            }
        }
        for (const v of this.vertices) {
            if (reversing && this.focus && this.getDepends(this.focus).includes(v)) {
                v.value.display(reversing);
            } else {
                v.value.display();
            }
        }
    }

    // returns the first free vertex close to the cursor
    // if none, returns a bound vertex close to the cursor
    // if no vertices are close to the cursor, returns null
    findMouseover() {
        let result = null;
        for (const v of this.vertices) {
            if (v.value.checkMouseover()) {
                if (v.isFree()) {
                    return v;
                } else {
                    result = v;
                }
            }
        }
        return result;
    }

    startReversal() {
        this.focus = this.findMouseover();
        if (this.focus.isBound()) {
            return true;
        } else {
            this.focus = null;
            return false;
        }
        
    }

    cancelReversal() {
        this.focus = null;
    }

    completeReversal() {
        if (this.focus) {
            let target = this.findMouseover();
            if (target && this.invert(this.focus, target)) {
                this.focus = null;
            } else {
                this.cancelReversal();
            }
        }
    }

    findUnify() {
        let v1 = this.findMouseover();
        if (v1) {
            v1.value.hidden = true;
            let v2 = this.findMouseover();
            if (v2 && this.unify(v2, v1)) {
                return true;
            } else {
                v1.value.hidden = false;
                return false;
            }
        } else {
            return false;
        }
    }
}
