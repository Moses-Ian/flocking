const flock = [];
const obstacles = [];
let ray;

let alignmentWeight, cohesionWeight, separationWeight;
let alignmentPerception, cohesionPerception, separationPerception;
let collisionPerception;

function setup() {
  // put setup code here
	let canvas = createCanvas(640, 360);
	canvas.parent('sketch-container');

	collisionPerception = 200;
	
	//these random ranges were determined experimentally
	alignmentWeight = random(.56, .80);
	cohesionWeight = random(-.24, -.07);
	separationWeight = random(.12, .21);
	
	alignmentPerception = random(59, 76);
	cohesionPerception = 127;
	separationPerception = random(168, 189);

	//create obstacles
	for (let i=0; i<5; i++) {
		obstacles.push(new Boundary(
			random(width),
			random(height),
			random(width),
			random(height)
		));
	}

	//create boids
	for(let i=0; i<5; i++)
		flock.push(new Boid());
	
	
}

function draw() {
  // background
	background(51);
	
	//obstacles
	obstacles.forEach(wall => wall.show());
	
	//boids
	flock.map(boid => {
		boid.look(obstacles);
		boid.flock(flock);
		boid.update();
		boid.edges();
		return boid;
	});
	
	flock.forEach(boid => boid.show());
}