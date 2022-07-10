class Boid {
	
	constructor() {
		this.position = createVector(random(width), random(height));
		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(random(2, 4));
		// this.velocity = createVector(0, 0);
		this.acceleration = createVector();
		this.maxForce = .05;
		this.maxSpeed = 4;
		this.r = 8;
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
	
	flock(boids) {
		let alignment = this.align(boids);
		let cohesion = this.cohesion(boids);
		let separation = this.separation(boids);
		
		alignment.mult(alignmentWeight);
		cohesion.mult(cohesionWeight);
		separation.mult(separationWeight);
		
		this.acceleration = alignment;
		this.acceleration.add(cohesion);
		this.acceleration.add(separation);
		this.acceleration.limit(this.maxForce);
	}
	
	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed);
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
	}
}