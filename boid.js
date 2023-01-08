class Boid {
	
	constructor() {
		this.position = createVector(random(width), random(height));
		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(random(2, 4));
		this.acceleration = createVector();
		this.maxForce = .05;
		this.maxSpeed = 4;
		this.r = boidSize;
		
		//ray stuff 2
		this.ray = new Ray(this.position, this.velocity.heading());
		let memory;

		//ray stuff
		// let spacing = PI / 10;
		// this.rays = [];
		// the first half of the array is the front, the second half is the back
		// for (let a=this.velocity.heading()-HALF_PI; a<this.velocity.heading()+PI+HALF_PI; a+=spacing) {
			// this.rays.push(new Ray(this.position, a));
		// }
		
	}
	
	edges() {
		if (this.position.x > width + this.r)
			this.position.x = -this.r;
		else if (this.position.x < -this.r)
			this.position.x = width + this.r;
		if (this.position.y > height + this.r)
			this.position.y = -this.r;
		else if (this.position.y < -this.r)
			this.position.y = height + this.r;
	}
	
	speedUp() {
		let steering = this.velocity.copy().mult(1.5);
		return steering;
	}
	
	align(boids) {
		let perception = alignmentPerception;
		let count = 0;
		let steering = createVector();
		boids.forEach(boid => {
			let d = this.position.dist(boid.position);
			if (d <= perception && boid !== this) {
				steering.add(boid.velocity);
				count++;
			}
		});
		if (count !== 0) {
			steering.setMag(this.maxSpeed);
			steering.sub(this.velocity);
		}
		return steering;
	}
	
	cohesion(boids) {
		let perception = cohesionPerception;
		let count = 0;
		let steering = createVector();
		boids.forEach(boid => {
			let d = this.position.dist(boid.position);
			if (d <= perception && boid !== this) {
				steering.add(boid.position);
				count++;
			}
		});
		if (count !== 0) {
			steering.div(count); 
			steering.sub(this.position);
			steering.setMag(this.maxSpeed);
			steering.sub(this.velocity);
		}
		return steering;
	}
	
	separation(boids) {
		let perception = separationPerception;
		let count = 0;
		let steering = createVector();
		boids.forEach(boid => {
			let d = this.position.dist(boid.position);
			if (d <= perception && boid !== this) {
				let diff = p5.Vector.sub(this.position, boid.position);
				diff.div(d);
				steering.add(diff);
				count++;
			}
		});
		if (count !== 0) {
			steering.div(count); 
			steering.setMag(this.maxSpeed);
			steering.sub(this.velocity);
		}
		return steering;
	}
	
	avoidance(walls) {
		let closest = this.look(walls);
		if (!closest) {
			this.memory = null;
			return createVector();
		}
		let {pt, wall} = closest;
		let wallVector;
		if (!this.memory) {
			this.memory = pt;
			wallVector = p5.Vector.sub(wall.a, wall.b);
		} else {
			wallVector = p5.Vector.sub(this.memory, pt);
		} 
		
		let angle = this.velocity.angleBetween(wallVector);
		let desired;
		if (abs(angle) > HALF_PI && abs(angle) < PI+HALF_PI) {
			desired = wallVector.rotate(PI);
		} else {
			desired = wallVector;
		}
		desired.setMag(this.velocity.mag());
		let steering = p5.Vector.sub(desired, this.velocity);
		let brakes = this.velocity.copy().mult(-1);
		steering.add(brakes);
		return steering;
	}
	
	look(walls) {
		let points = [];
		let record = Infinity;
		let closest = null;
		walls.forEach(wall => {
			const pt = this.ray.cast(wall);
			if (pt.x) {
				const d = dist(this.position.x, this.position.y, pt.x, pt.y);
				if (d < record) {
					record = d;
					closest = {pt, wall};
				}
			}
		});
		if (this.focus && checkboxes[1].checked()) 
			if (closest) {
				push();
					strokeWeight(4);
					stroke(0, 255, 0);
					if (this.memory)
						point(this.memory.x, this.memory.y);
					this.ray.show(closest.pt);
				pop();
				
			}
		return closest;
	}

	rotateRay(angle) {
		this.ray.rotate(angle);
	}
	
	collisions() {
		// see if i've collided with any triangles
		obstacles.forEach(obst => {
			obst.triangles.forEach(tri => {
				let hit = collidePointTriangle(
					this.position.x, this.position.y,
					tri.x1, tri.y1,
					tri.x2, tri.y2,
					tri.x3, tri.y3
				);
				if (hit) {
					if (checkboxes[5].checked())
						obst.highlight(tri);
					this.collide(tri);
				}
			});
		});
	}
	
	collide(tri) {
		
		let {x1, y1, x2, y2, x3, y3} = tri;
		
		// determine the movement direction vector
		// position - center of obstacle (x1,y1)
		let steering = p5.Vector.sub(this.position, createVector(tri.x1, tri.y1));
		
		// determine the movement distance
		// distance between a point (position) and a line (x2,y2), (x3,y3)
		let distance = abs( (x3-x2) * (y2-this.position.y) - (x2-this.position.x) * (y3-y2) );
		distance /= sqrt( (x3-x2)*(x3-x2) + (y3-y2)*(y3-y2) )
		
		// move me
		steering.setMag(distance);
		this.position.add(steering);
		
		
		// adjust my velocity?
	}
	
	flock(boids, obstacles) {
		// let speedUp = this.speedUp();
		let alignment = this.align(boids);
		let cohesion = this.cohesion(boids);
		let separation = this.separation(boids);
		let avoidance = this.avoidance(obstacles);
		
		alignment.mult(alignmentWeight);
		cohesion.mult(cohesionWeight);
		separation.mult(separationWeight);
		avoidance.mult(avoidanceWeight);
		
		// this.acceleration = speedUp;
		this.acceleration.mult(0);
		this.acceleration.add(alignment);
		this.acceleration.add(cohesion);
		this.acceleration.add(separation);
		this.acceleration.add(avoidance);
		this.acceleration.git limit(this.maxForce);
	}
	
	update() {
		let oldVelocity = createVector(this.velocity.x, this.velocity.y);
		this.position.add(this.velocity);
		this.collisions();
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed);
		this.rotateRay(oldVelocity.angleBetween(this.velocity));
		// this.rotateRays(oldVelocity.angleBetween(this.velocity));
	}
	
	show() {
		strokeWeight(1);
		stroke(255);
		fill(255, 255, 255, 100);
		push();
			translate(this.position);
			rotate(this.velocity.heading());
			triangle(-this.r, -this.r/2, -this.r, this.r/2, this.r, 0);
		pop();
		
		// this.rays.forEach(ray => ray.show());
		// this.ray.show();
		// if (this.focus && checkboxes[1].checked()) {
			// if (this.memory) {
				// push();
					// strokeWeight(4);
					// stroke(0, 255, 0);
					// point(this.memory.x, this.memory.y);
				// pop();
			// }
		// }
		if (this.focus) this.highlight();
	}

	highlight() {
		push();
			strokeWeight(1);
			stroke(255);
			fill(0, 255, 0, 100);
			translate(this.position);
			rotate(this.velocity.heading());
			triangle(-this.r, -this.r/2, -this.r, this.r/2, this.r, 0);
		pop();
		
		// this.rays.forEach(ray => ray.show());
	}
}