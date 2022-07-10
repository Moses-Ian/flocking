const flock = [];

let alignmentWeight, cohesionWeight, separationWeight;
let alignmentPerception, cohesionPerception, separationPerception;

function setup() {
  // put setup code here
	let canvas = createCanvas(640, 360);
	canvas.parent('sketch-container');
	
	for(let i=0; i<100; i++)
		flock.push(new Boid());
	
	//these random ranges were determined experimentally
	alignmentWeight = random(.56, .80);
	cohesionWeight = random(-.24, -.07);
	separationWeight = random(.12, .21);
	
	alignmentPerception = random(59, 76);
	cohesionPerception = 127;
	separationPerception = random(168, 189);
}

function draw() {
  // put drawing code here
	background(51);
	flock.map(boid => {
		boid.flock(flock);
		boid.update();
		boid.edges();
		return boid;
	});
	
	flock.forEach(boid => boid.show());
}