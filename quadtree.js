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
	
	containsLine(line) {
		let aIsIn = (
			line.a.x < this.x + this.w &&
			line.a.x > this.x - this.w &&
			line.a.y < this.y + this.h &&
			line.a.y > this.y - this.h
		);
		let bIsIn = (
			line.b.x < this.x + this.w &&
			line.b.x > this.x - this.w &&
			line.b.y < this.y + this.h &&
			line.b.y > this.y - this.h
		);
			
		// if (!aIsIn && !bIsIn) return false;
		if (aIsIn && bIsIn) return true;
		
		let hit = collideLineRect(
			line.a.x, line.a.y,
			line.b.x, line.b.y,
			this.x - this.w, this.y - this.h,
			this.w*2, this.h*2,
			true
		);
		return hit;
	}	

	intersects(range) {
		// return collideRectCircle(
			// this.x - this.w,
			// this.y - this.h,
			// this.w*2,
			// this.h*2,
			// range.x,
			// range.y,
			// range.r
		// );
		return !(
			range.x - range.r > this.x + this.w &&
			range.x + range.r < this.x - this.w &&
			range.y - range.r > this.y + this.h &&
			range.y + range.r < this.y - this.h 
		);
	}
	
	intersectsLine(line) {
		let aIsIn = (
			line.a.x < this.x + this.w &&
			line.a.x > this.x - this.w &&
			line.a.y < this.y + this.h &&
			line.a.y > this.y - this.h
		);
		let bIsIn = (
			line.b.x < this.x + this.w &&
			line.b.x > this.x - this.w &&
			line.b.y < this.y + this.h &&
			line.b.y > this.y - this.h
		);
			
		// if (!aIsIn && !bIsIn) return false;
		if (aIsIn && bIsIn) return true;
		
		return collideLineRect(
			line.a.x, line.a.y,
			line.b.x, line.b.y,
			this.x - this.w, this.y - this.h,
			this.w*2,	this.h*2
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
		push();
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
			// this.points.forEach(pt => pt.show());
		pop();
	}
}

class QuadTreeBoundaries {
	constructor(boundary) {
		this.boundary = boundary;
		this.capacity = 1;
		this.lines = [];
		this.divided = false;
	}
	
	subdivide() {
		let {x, y, w, h} = this.boundary;
		
		let nw = new Rectangle(x+w/2, y-h/2, w/2, h/2);
		let ne = new Rectangle(x-w/2, y-h/2, w/2, h/2);
		let sw = new Rectangle(x+w/2, y+h/2, w/2, h/2);
		let se = new Rectangle(x-w/2, y+h/2, w/2, h/2);
		this.nw = new QuadTreeBoundaries(nw);
		this.ne = new QuadTreeBoundaries(ne);
		this.sw = new QuadTreeBoundaries(sw);
		this.se = new QuadTreeBoundaries(se);

		this.divided = true;
	}
	
	insert(line) {
		let hit = this.boundary.containsLine(line);
		// console.log(line, this.boundary, hit);
		if (!hit) return;
		if (hit !== true && !hit.left.x && !hit.top.x && !hit.right.x && !hit.bottom.x)
				return;
		
		if (this.lines.length < this.capacity) {
			if (hit === true) 
				this.lines.push(line);
			else {
				let segments = line.split(hit);
				if (!segments) {
					console.log(line, hit, this.boundary);
					return;
				}
				// console.log(s1, s2);
				this.insert(segments[0]);
				this.insert(segments[1]);
			}
		} else {
			if (!this.divided)
				this.subdivide();
			this.nw.insert(line);
			this.ne.insert(line);
			this.sw.insert(line);
			this.se.insert(line);			
		}
	}
	
	query(queryLine, highlight=false) {
		let found = [];
		
		if (!this.boundary.intersectsLine(queryLine)) return found;
		
		if (highlight) this.highlight();
		
		this.lines.forEach(l => {
			found.push(l);
		});
		
		if (this.divided) {
			found = found.concat(this.nw.query(queryLine, highlight));
			found = found.concat(this.ne.query(queryLine, highlight));
			found = found.concat(this.sw.query(queryLine, highlight));
			found = found.concat(this.se.query(queryLine, highlight));
		}
		
		return found;
	}
	
	show() {
		push();
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
			
			// this.lines.forEach(line => line.highlight());
		pop();
	}
	
	highlight() {
		push();
			stroke(0, 255, 0);
			noFill();
			strokeWeight(1);
			rectMode(CENTER);
			rect(this.boundary.x, this.boundary.y, this.boundary.w*2, this.boundary.h*2);
		pop();
	}
}



