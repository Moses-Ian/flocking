class Boid {
	
	constructor() {
		this.position = createVector(random(width), random(height));
		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(random(2, 4));
		this.acceleration = createVector();
		this.maxForce = .05;
		this.maxSpeed = 4;
		this.maxTurn = .12;
		this.r = boidSize;
		
		//ray stuff 2
		this.ray = new Ray(this.position, this.velocity.heading());
		let memory;
		let memoryFrames;

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
		let steering = this.velocity.copy().mult(0.1);
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
		// find the closest point straight ahead
		let closest = this.look(walls, this.ray);
		if (!closest) {
			if (this.memoryFrames < 0)
				this.memory = null;
			else
				this.memoryFrames--;
			return createVector();
		}
		
		// remember the point
		this.memoryFrames = 10;
		let {pt, wall} = closest;
		let wallVector;
		if (!this.memory) 
			this.memory = pt;

		// check the perifery
		let ptLeft = this.look(walls, this.ray.copy().rotate(PI / 12));
		let ptRight = this.look(walls, this.ray.copy().rotate(-PI / 12));
		let angle;
		if (ptLeft == null)
			angle = HALF_PI / 12;
		else if (ptRight == null)
			angle = -HALF_PI / 12;
		else if (ptLeft.x * ptLeft.x + ptLeft.y * ptLeft.y > ptRight.x * ptRight.x + ptRight.y * ptRight.y)
			angle = HALF_PI / 12;
		else
			angle = -HALF_PI / 12;

		// steer away from the point
		let steering = this.velocity.copy().rotate(angle).setMag(1);
		let brakes = this.velocity.copy().mult(-2);
		steering.add(brakes);
		return steering;
	}
	
	look(walls, ray) {
		let points = [];
		let record = Infinity;
		let closest = null;
		walls.forEach(wall => {
			const pt = ray.cast(wall);
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
					
					let left = this.ray.copy().rotate(HALF_PI / 12);
					let Pleft;
					walls.forEach(wall => {
						const pt = left.cast(wall);
						if (pt.x) {
							const d = dist(this.position.x, this.position.y, pt.x, pt.y);
							if (d < record) {
								record = d;
								Pleft = {pt, wall};
							}
						}
					});
					if (Pleft)
						left.show(Pleft.pt);
						
					
					let right = this.ray.copy().rotate(-HALF_PI / 12);
					let Pright;
					walls.forEach(wall => {
						const pt = right.cast(wall);
						if (pt.x) {
							const d = dist(this.position.x, this.position.y, pt.x, pt.y);
							if (d < record) {
								record = d;
								Pright = {pt, wall};
							}
						}
					});
					if (Pright)
						right.show(Pright.pt);
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
				let frontPoint = this.frontPoint;
				let hit = collidePointTriangle(
					frontPoint.x, frontPoint.y,
					tri.x1, tri.y1,
					tri.x2, tri.y2,
					tri.x3, tri.y3
				);
				if (hit) {
					if (checkboxes[5].checked())
						obst.highlight(tri);
					this.collide(tri, frontPoint);
				}
			});
		});
	}
	
	collide(tri, frontPoint) {
		
		let {x2, y2, x3, y3} = tri;

		// get the intersection point
		let intersection = this.findIntersection(x2, y2, x3, y3, this.position.x, this.position.y, frontPoint.x, frontPoint.y);
		
		if (!intersection)
			return;
		
		// I want to set the front point to the intersection point
		// instead, set the center so that it makes sense
		let heading = this.velocity.heading();
		let newX = intersection.x - this.r * cos(heading) + 0.1;
		let newY = intersection.y - this.r * sin(heading) + 0.1;
		this.position.x = newX;
		this.position.y = newY;
		this.velocity = createVector(0, 0);
	}
	
	findIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
		// the two points of the line are the front and the center
		
		let denom = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);

		if (denom === 0) {
			// Lines are parallel or coincident
			return null;
		}

		let numX = (x1*y2 - y1*x2)*(x3-x4) - (x1-x2)*(x3*y4 - y3*x4);
		let numY = (x1*y2 - y1*x2)*(y3-y4) - (y1-y2)*(x3*y4 - y3*x4);
		
		let Px = numX / denom;
		let Py = numY / denom;

		return createVector(Px, Py);
	}
	
	flock(boids, obstacles) {
		//let speedUp = this.speedUp();
		let alignment = this.align(boids);
		let cohesion = this.cohesion(boids);
		let separation = this.separation(boids);
		let avoidance = this.avoidance(obstacles);
		
		alignment.mult(alignmentWeight);
		cohesion.mult(cohesionWeight);
		separation.mult(separationWeight);
		avoidance.mult(avoidanceWeight);
		
		//this.acceleration = speedUp;
		//this.acceleration.mult(0);
		if (this.memory) {
			this.acceleration.mult(0);
			this.acceleration.add(avoidance);
		}
		else {
			this.acceleration.mult(.1);
			this.acceleration.add(alignment);
			this.acceleration.add(cohesion);
			this.acceleration.add(separation);
		}
		this.acceleration.limit(this.maxForce);
	}
	
	update() {
		let oldVelocity = createVector(this.velocity.x, this.velocity.y);
		this.position.add(this.velocity);
		this.collisions();
		this.maxRotation();
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed);
		this.rotateRay(oldVelocity.angleBetween(this.velocity));
		// this.rotateRays(oldVelocity.angleBetween(this.velocity));
	}
	
	maxRotation() {
		let heading = this.velocity.copy().normalize();
		let accHeading = heading.copy().mult(this.acceleration.dot(heading));
		let accTurning = this.acceleration.copy().sub(accHeading);
		accTurning.limit(this.maxTurn);
		this.acceleration = accTurning.add(accHeading);
	}
	
	get frontPoint() {
		let heading = this.velocity.heading();
		let frontPointX = this.r * cos(heading) + this.position.x;
		let frontPointY = this.r * sin(heading) + this.position.y;
		return createVector(frontPointX, frontPointY);
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