class Ray {
	constructor(pos, angle) {
		this.pos = pos;
		this.dir = p5.Vector.fromAngle(angle).setMag(collisionPerception);
	}
	
	lookAt(x, y) {
		this.dir.x = x - this.pos.x;
		this.dir.y = y - this.pos.y;
		this.dir.setMag(collisionPerception);
	}
	
	cast(wall) {
		let hit = collideLineLineVector(
			this.pos, 
			p5.Vector.add(this.pos, this.dir), 
			wall.a, 
			wall.b, 
			true
		); 
		return createVector(hit.x, hit.y);
	}
	
	rotate(angle) {
		this.dir.rotate(angle);
		return this;
	}
	
	getLine() {
		return {
			a: {
				x: this.pos.x,
				y: this.pos.y
			},
			b: {
				x: this.pos.x + this.dir.x,
				y: this.pos.y + this.dir.y
			}
		}
	}
	
	copy() {
		return new Ray(this.pos.copy(), this.dir.heading());
	}
	
	show(pt) {
		if (!pt)
			pt = {
				x: this.pos.x + this.dir.x,
				y: this.pos.y + this.dir.y
			};
		point(pt.x, pt.y);
		strokeWeight(1);
		line(
			this.pos.x, 
			this.pos.y, 
			pt.x, 
			pt.y
		);
	}
}