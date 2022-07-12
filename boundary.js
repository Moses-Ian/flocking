class Boundary {
	constructor(x1, y1, x2, y2) {
		this.a = createVector(x1, y1);
		this.b = createVector(x2, y2);
	}
	
	show() {
		stroke(255);
		strokeWeight(2);
		line(this.a.x, this.a.y, this.b.x, this.b.y);
	}
}

class Obstacle {
	constructor() {
		this.pos = createVector(random(50, width-50), random(50, height-50));
		this.r = random(10, 50);
		this.total = random(5, 15);
		this.offset = [];
		for (let i=0; i<this.total; i++) {
			this.offset[i] = random(-10, 10);
		}
	}
	
	getBoundaries() {
		let boundaries = [];
		for (let i=0; i<this.total-1; i++) {
			let angle1 = map(i, 0, this.total, 0, TWO_PI);
			let r1 = this.r + this.offset[i];
			let x1 = r1 * cos(angle1) + this.pos.x;
			let y1 = r1 * sin(angle1) + this.pos.y;
			let angle2 = map(i+1, 0, this.total, 0, TWO_PI);
			let r2 = this.r + this.offset[i+1];
			let x2 = r2 * cos(angle2) + this.pos.x;
			let y2 = r2 * sin(angle2) + this.pos.y;
			boundaries.push(new Boundary(x1, y1, x2, y2));
		}
		boundaries.push(new Boundary(
			boundaries[boundaries.length-1].b.x,
			boundaries[boundaries.length-1].b.y,
			boundaries[0].a.x,
			boundaries[0].a.y
		));
		
		return boundaries;
	}
	
	// update() {
	// }
	
	show() {
		beginShape();
		for (let i=0; i< this.total; i++) {
			let angle = map(i, 0, this.total, 0, TWO_PI);
			let r = this.r + this.offset[i];
			let x = r * cos(angle) + this.pos.x;
			let y = r * sin(angle) + this.pos.y;
			vertex(x, y);
		}
		endShape(CLOSE);
	}
}