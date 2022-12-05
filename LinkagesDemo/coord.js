class Coord {
    constructor(x,y) {
	this.x = x;
	this.y = y;
    }

    getX() { return this.x; }
    getReal() { return this.x; }
    getY() { return this.y; }
    getImaginary() { return this.y }

    getXPx() { return (this.x * GLOBAL_SCALE) + CENTER_X; }
    getYPx() { return CENTER_Y - (this.y * GLOBAL_SCALE); }
    
    getR() { return sqrt(this.x*this.x + this.y*this.y); }
    getTh() { return atan2(this.y, this.x); }
    getThDegrees() { return map(this.getTh(), -PI, PI, -180, 180); }

    translate(vector) {
	return new Coord(this.x + vector.getX(), this.y + vector.getY());
    }

    mut_translate(vector) {
        this.x += vector.getX();
        this.y += vector.getY();
        return this;
    }

    subtract(vector) {
	return new Coord(this.x - vector.getX(), this.y - vector.getY());
    }

    mut_subtract(vector) {
        this.x -= vector.getX();
        this.y -= vector.getY();
        return this;
    }

    scale(factor) {
	return new Coord(this.x * factor, this.y * factor);
    }

    mut_scale(factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }

    conjugate() {
	return new Coord(this.x, -this.y);
    }

    mut_conjugate() {
        this.y *= -1;
        return this;
    }
    
    multiply(vector) {
	let r = this.getR() * vector.getR();
	let th = this.getTh + vector.getTh();

	return new Coord(r * cos(th), r * sin(th));
    }

    mut_multiply(vector) {
        let r = this.getR() * vector.getR();
	let th = this.getTh + vector.getTh();
        this.x = r * cos(th);
        this.y = r * sin(th);
        return this;
    }

    mut_sendTo(vector) {
        this.x = vector.getX();
        this.y = vector.getY();
        return this;
    }

    isOrigin() {
	return (this.x == 0 && this.y == 0);
    }

    equals(vector) {
	return (this.x==vector.getX() && this.y==vector.getY());
    }

    distance(vector) {
        return dist(this.x, this.y, vector.x, vector.y);
    }

    isNear(coord, tolerance) {
        return this.distance(coord) < tolerance;
    }

    isNearPx(coord, tolerancePx) {
        return axisToPixel(this).distance(coord) < tolerancePx;
    }
}

function pixelToAxis(coord) {
    let x = coord.getX();
    let y = coord.getY();
    return new Coord((x - CENTER_X) / GLOBAL_SCALE, (CENTER_Y - y) / GLOBAL_SCALE);
}

function axisToPixel(coord) {
    let x = coord.getX();
    let y = coord.getY();
    return new Coord((x * GLOBAL_SCALE) + CENTER_X, CENTER_Y - (y * GLOBAL_SCALE));
}

function pixelToAxisX(coord) {
    return (coord - centerX) / globalScale;
}

function pixelToAxisY(coord) {
    return (centerY - coord) / globalScale;
}

function axisToPixelX(coord) {
    return (coord * globalScale) + centerX;
}

function axisToPixelY(coord) {
    return centerY - (coord * globalScale);
}

function getMouse() {
    return pixelToAxis(new Coord(mouseX, mouseY));
}

function getMousePx() {
    return new Coord(mouseX, mouseY);
}
