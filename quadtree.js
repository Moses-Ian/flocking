class Rectangle {
	constructor(x,y,w,h) {
		//rectmode center
		this.x = x;
		this.y = y;
		//half the total width/height
		this.w = w;
		this.h = h;
	}
	
	contains(point) {
		return (point.position.x >= this.x - this.w &&
			point.position.x < this.x + this.w &&
			point.position.y >= this.y - this.h &&
			point.position.y < this.y + this.h);
	}
	
	intersects(range) {
		//change to accept range as a circle
		return collideRectCircle(
			this.x - this.w,
			this.y - this.h,
			this.w*2,
			this.h*2,
			range.x,
			range.y,
			range.r
		);
	}
}

class Circle {
	constructor(x,y,r) {
		//ellipsemode center
		this.x = x;
		this.y = y;
		this.r = r;
	}
	
	contains(point) {
		return collidePointCircle(
			point.position.x,
			point.position.y,
			this.x,
			this.y,
			this.r
		);
	}
}

class QuadTree {
	constructor(boundary) {
		this.boundary = boundary;
		this.capacity = 4;
		this.points = [];
		this.divided = false;
	}
	
	subdivide() {
		let {x, y, w, h} = this.boundary;
		
		let nw = new Rectangle(x+w/2, y-h/2, w/2, h/2);
		let ne = new Rectangle(x-w/2, y-h/2, w/2, h/2);
		let sw = new Rectangle(x+w/2, y+h/2, w/2, h/2);
		let se = new Rectangle(x-w/2, y+h/2, w/2, h/2);
		this.nw = new QuadTree(nw);
		this.ne = new QuadTree(ne);
		this.sw = new QuadTree(sw);
		this.se = new QuadTree(se);

		this.divided = true;
	}
	
	insert(point) {
		if (!this.boundary.contains(point))
			return;
		
		if (this.points.length < this.capacity) {
			this.points.push(point);
		} else {
			if (!this.divided) 
				this.subdivide();
			this.nw.insert(point);
			this.ne.insert(point);
			this.sw.insert(point);
			this.se.insert(point);
		} 
	}
	
	query(range) {
		let found = [];
		
		if (!this.boundary.intersects(range)) return found;	
		
		this.points.forEach(p => {
			if (range.contains(p)) {
				found.push(p);
			}
		});
		
		if (this.divided) {
			found = found.concat(this.nw.query(range));
			found = found.concat(this.ne.query(range));
			found = found.concat(this.sw.query(range));
			found = found.concat(this.se.query(range));
		}
		
		return found;
	}
	
	show() {
		stroke(255);
		noFill();
		strokeWeight(1);
		rectMode(CENTER);
		rect(this.boundary.x, this.boundary.y, this.boundary.w*2, this.boundary.h*2);
		if (this.divided) {
			this.nw.show();
			this.ne.show();
			this.sw.show();
			this.se.show();
		}
		this.points.forEach(pt => pt.show());
	}
}





