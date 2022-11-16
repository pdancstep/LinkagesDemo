
// overall graph lives in these two global arrays
var myNumbers = [];
var myOperators = [];


// nodes to potentially give up control of when in reversal mode
var freeNodes = [];
var freeNodePaths = [];
var reversingOperator = false;

function registerNode(node) {
    myNumbers.push(node);
}

function registerOperator(oper) {
    let i = myOperators.length;
    myOperators.push(oper);
    return i;
}

function findMerge() {
    // index of first bindable node we find
    let first = false;

    // find two nodes to bind together
    for (let i=0; i < myNumbers.length; i++) {
	let node = myNumbers[i];
	if (node.checkMouseover()) {
	    if (first===false) {
		first = i;
	    } else if (mergeNodes(first, i)) {
		indicatorFlash = true;
		return;
	    }
	}
    }
}

var _attempts = 0;

// combine two nodes (essentially, add the second node's properties to the first)
// returns true if a merge was successfully performed
function mergeNodes(idx1, idx2) {
    // don't keep trying if we've already made 2 recursive calls
    if (_attempts >= 2) {
	_attempts = 0;
	return false;
    }

    // get the nodes to be merged
    let node1 = myNumbers[idx1];
    let node2 = myNumbers[idx2];
    
    if (node1.free && node2.free) {
	// replace node2 with node1 in all of node2's operators
	for (oper of node2.operators) {
	    if (node1.operators.includes(oper)) {
		oper.collapse(node1, node2);
	    }else{
		oper.replace(node1, node2);
		node1.operators.push(oper);
	    }
	}
	
	// remove node2 from the graph
	myNumbers.splice(idx2, 1);
	return true;
    } else if (node1.free) {
	// node2 is bound and should be reversed before merge
	return _reverseAndMerge(idx2, idx1);
    } else if (node2.free) {
	// node1 is bound and should be reversed before merge
	return _reverseAndMerge(idx1, idx2);
    } else {
	// cannot merge: both nodes are dependent
	return false;
    }
}

// helper for correctly merging a bound and a free node
// only call from mergeNodes
function _reverseAndMerge(idx_torev, idx_other) {
    let node_bound = myNumbers[idx_torev];
    let node_free = myNumbers[idx_other];
    let giveupnode;

    let revdone = node_bound.controller.reverseOperator();
    if (revdone) {
	if (reversingOperator) { // more than one possible reversal
	    // complete the reversal
	    giveupnode = freeNodes[0]; // TODO try more than one possibility
	    reverseByPath(freeNodePaths[0]);
	    reversingOperator = false;
	} else {
	    giveupnode = freeNodes[0];
	}
    }
    freeNodes = [];
    freeNodePaths = [];
    if (!revdone) { // could not reverse
	return false;
    }
    
    // reversal complete; try merge again
    _attempts++;
    if (!mergeNodes(idx_torev, idx_other)) {
	// recursive merge failed
	return false;
    }
    
    // we accomplished the merge, now regain control of the node we gave up
    // NOTE don't use indices into myNumbers after this point,
    // and remember that one of the two nodes is now garbage
    giveupnode.mouseover = true;
    node_bound.mouseover = false;
    node_free.mouseover = false;
    let rev2done = giveupnode.controller.reverseOperator();
    if (rev2done) {
	if (reversingOperator) { // more than one possible reversal
	    // complete the reversal
	    let found = false;
	    for (let i = 0; i < freeNodes.length; i++)
	    {
		if (freeNodes[i] === node_bound || freeNodes[i] === node_free) {
		    found = true;
		    reverseByPath(freeNodePaths[i]);
		    break;
		}
	    }
	    if (!found) { // couldn't undo reversal perfectly so just do something
		reverseByPath(freeNodePaths[0]);
	    }
	    reversingOperator = false;
	}
    }
    freeNodes = [];
    freeNodePaths = [];
    if (!rev2done) {
	// is it possible for the second reverse to fail? well, we still did the merge
	return true;
    }
    
    return true;
}

// tell each operator to see if it's being asked to perform a reversal
// if no operator reports a choice is needed from the user, clear freeNode data
function tryReversal() {
    let rev = false;
    for (const oper of myOperators) {
	rev = oper.reverseOperator();
	if (rev) break;
    }
    if (!reversingOperator) {
	freeNodes = [];
	freeNodePaths = [];
    }
}

// check freeNodes for user selection. clear freeNode data.
function closeReversal() {
    for (let i = 0; i < freeNodes.length; i++) {
	if (freeNodes[i].checkMouseover()) {
	    reverseByPath(freeNodePaths[i]);
	}
    }
    reversingOperator = false;
    freeNodes = [];
    freeNodePaths = [];
}

// instruct each operator along the designated freeNodePath to reverse
function reverseByPath(path) {
    while (path.length > 1) {
	let argument = path.pop();
	let operator = path.pop();
	operator.finishReversal(argument);
    }
}
