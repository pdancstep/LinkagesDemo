function drawGrid() {
    if (!myLevels[level].coordinatesOff) {
        //background grid
        for (i=-30; i<30; i++){
            strokeWeight(1);
            stroke(75);
            noFill();
            line(CENTER_X + i*globalScale, 0, CENTER_X + i*globalScale, height);
            line(0, CENTER_Y + i*globalScale, width, CENTER_Y + i*globalScale);
        }
        
        //axes,unit circle
        noFill();
        stroke(200);
        strokeWeight(1);
        line(0, CENTER_Y, width, CENTER_Y);
        line(CENTER_X, 0, CENTER_X ,height);
        ellipse(CENTER_X, CENTER_Y, 2*globalScale, 2*globalScale); // unit circle

        //coordinate data
        textSize(15);
        textAlign(CENTER,CENTER);
        for (i=-30; i<30; i++){
            fill(150);
            noStroke();
            ellipse(CENTER_X + i*globalScale, CENTER_Y, 5, 5);
            ellipse(CENTER_X, CENTER_Y + i*globalScale, 5, 5);
            if (!supressCoords){
                text(i, CENTER_X+i*globalScale, CENTER_Y-16);
                text(-i+"i", CENTER_X-20, CENTER_Y+i*globalScale);
            }
        }
    }
}

const CLEAR_BUTTON = new Coord(30, 30);
const ADDER_BUTTON = new Coord(30, 60);
const MULTR_BUTTON = new Coord(30, 90);

function drawButtons() {
    textSize(15);
    textAlign(LEFT,CENTER);

    noStroke();
    fill(200)
    ellipse(30,30,20,20);
    text("clear",45,30);

    fill(30,200,255);
    ellipse(30,60,20,20);
    text("adder",45,60);

    fill(255,100,0);
    ellipse(30,90,20,20);
    text("multiplier",45,90);
}

function printToPlot() {
    //On-canvas DRO for operators...
    textAlign(CENTER,CENTER);
    textSize(30);
    
    for (i=0; i<myOperators.length; i++){
        fill(150);
        let h = height - 40*(i+1);
        
        text("(" + round(myOperators[i].myInput1.getX()) +
             "," + round(myOperators[i].myInput1.getY()) + "i)",
             50, h);

        if (myOperators[i].type==ADDER) {
            text("+", 115, h);
        }else{
            text("x",115, h);
        }

        text("(" + round(myOperators[i].myInput2.getX()) +
             "," + round(myOperators[i].myInput2.getY()) + "i)",
             175, h);
        
        text("=", 230, h);
        
        if (myOperators[i].type==ADDER){
            fill(30,200,255);
        } else if (myOperators[i].type==MULTIPLIER) {
            fill(255,0,0);
        }
        text("(" + round(myOperators[i].myOutput.getX()) +
             "," + round(myOperators[i].myOutput.getY()) + "i)",
             285, h);
    }
}
