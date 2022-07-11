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
		return hit;
	}
	
	rotate(angle) {
		this.dir.rotate(angle);
	}
	
	show(pt) {
		if (!pt)
			pt = {
				x: this.pos.x + this.dir.x,
				y: this.pos.y + this.dir.y
			};
		stroke(255, 255, 255, 50);
		push();
			line(
				this.pos.x, 
				this.pos.y, 
				pt.x, 
				pt.y
			);
		pop();
	}
}