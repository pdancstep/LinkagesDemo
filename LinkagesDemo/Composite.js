class Composite extends Operator {
    // comps - array of component operators
    // args - 3 numbers that are to be input and output nodes for the combined operator
    // bound -  which element of args is the bound node? this should be 0, 1, or 2
    constructor(comps, args, bound) {
	super(COMPOSITE);

	// hide internal operators
	let this.internal = comps;
	for (const oper of comps) {
	    oper.hidden = true;
	}

	// determine which nodes are contained within internal operators
	let this.nodes = [];
	for (const node of myNumbers) {
	    let contained = true;
	    for (const op of node.operators) {
		if (myOperators.includes(op)) {
		    contained = false;
		    break;
		}
	    }
	    if (contained) {
		this.nodes.push(node);
		if (!args.includes(node)) { node.hidden = true; }
	    }
	}

	// set up arguments
	for (const node of args) {
	    node.operators.push(this);
	    // TODO special handling for collapsed composite? i.e. args[1]===args[2]
	}
	this.myInput1 = args[1]; // bound in mode REVERSE1
	this.myInput2 = args[2]; // bound in mode REVERSE2
	this.myOutput = args[0]; // bound in mode DEFAULT
	this.mode = bound;

	// TODO put some error checking in here? need to have 2 free and 1 bound node
    }

    display() {
	if (this.hidden) { return; }

	if (this.mode==DEFAULT || this.mode==REVERSE1 || this.mode==REVERSE2) {
	    // TODO how should a composite node display?
	    // maybe we, say, find the midpoint of the 3 nodes and connect them each to it?
	}else{
	    // TODO how should a collapsed composite node display?
	}
    }
}
