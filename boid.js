class Boid {
	
	constructor() {
		this.position = createVector(random(width), random(height));
		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(random(2, 4));
		this.acceleration = createVector();
		this.maxForce = .05;
		this.maxSpeed = 4;
		this.r = 8;
		
		//ray stuff
		// let spacing = PI / 10;
		// this.rays = [];
		// the first half of the array is the front, the second half is the back
		// for (let a=this.velocity.heading()-HALF_PI; a<this.velocity.heading()+PI+HALF_PI; a+=spacing) {
			// this.rays.push(new Ray(this.position, a));
		// }
		
		//ray stuff 2
		this.ray = new Ray(this.position, this.velocity.heading());
	}
	
	edges() {
		if (this.position.x > width)
			this.position.x = 0;
		else if (this.position.x < 0)
			this.position.x = width;
		if (this.position.y > height)
			this.position.y = 0;
		else if (this.position.y < 0)
			this.position.y = height;
	}
	
	speedUp() {
		let steering = this.velocity.copy().setMag(this.maxSpeed);
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
		if (!closest) return createVector();
		let {pt, wall} = closest;
		let wallVector = p5.Vector.sub(wall.a, wall.b);
		let angle = this.velocity.angleBetween(wallVector);
		let desired;
		if (abs(angle) > HALF_PI && abs(angle) < PI+HALF_PI) {
			desired = wallVector.rotate(PI);
		} else {
			desired = wallVector;
		}
		desired.setMag(this.velocity.mag());
		let steering = p5.Vector.sub(desired, this.velocity);
		let brakes = this.velocity.copy().mult(-this.maxSpeed);
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
		if (closest) {
			this.ray.show(closest.pt);
		}
		return closest;
	}

	// this will be more useful when i start doing a render view
	// look(walls) {
		// let points = [];
		// this.rays.forEach((ray, index) => {
			// let record = Infinity;
			// let closest = null;
			// walls.forEach(wall => {
				// const pt = ray.cast(wall);
				// if (pt.x) {
					// const d = dist(this.position.x, this.position.y, pt.x, pt.y);
					// if (d < record) {
						// record = d;
						// closest = pt;
					// }
				// }
			// });
			// if (closest) {
				// let point = createVector(closest.x, closest.y);
				// point.front = index >= this.rays.length / 2;
				// points.push(point);
				// ray.show(closest);
			// }
		// });
		// return points;
	// }
	
	// rotateRays(angle) {
		// this.rays.forEach(ray => {
			// ray.rotate(angle);
		// });
	// }
	
	rotateRay(angle) {
		this.ray.rotate(angle);
	}
	
	flock(boids, obstacles) {
		let speedUp = this.speedUp();
		let alignment = this.align(boids);
		let cohesion = this.cohesion(boids);
		let separation = this.separation(boids);
		let avoidance = this.avoidance(obstacles);
		
		alignment.mult(alignmentWeight);
		cohesion.mult(cohesionWeight);
		separation.mult(separationWeight);
		avoidance.mult(1);
		
		this.acceleration = speedUp;
		this.acceleration.add(alignment);
		this.acceleration.add(cohesion);
		this.acceleration.add(separation);
		this.acceleration.add(avoidance);
		this.acceleration.limit(this.maxForce);
	}
	
	update() {
		let oldVelocity = createVector(this.velocity.x, this.velocity.y);
		this.position.add(this.velocity);
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
	}

	highlight() {
		strokeWeight(1);
		stroke(255);
		fill(0, 255, 0, 100);
		push();
			translate(this.position);
			rotate(this.velocity.heading());
			triangle(-this.r, -this.r/2, -this.r, this.r/2, this.r, 0);
		pop();
		
		// this.rays.forEach(ray => ray.show());
	}
}