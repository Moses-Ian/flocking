const flock = [];
const obstacles = [];
let ray;
let qt;

let alignmentWeight, cohesionWeight, separationWeight;
let alignmentPerception, cohesionPerception, separationPerception;
let collisionPerception;

let boundary;

function setup() {
  // put setup code here
	let canvas = createCanvas(400, 400);
	canvas.parent('sketch-container');

	collisionPerception = 75;
	
	//these random ranges were determined experimentally
	alignmentWeight = random(.56, .80);
	cohesionWeight = random(.24, .07);
	separationWeight = random(.12, .21);
	
	alignmentPerception = random(59, 76);
	cohesionPerception = 127;
	separationPerception = random(168, 189);

	boundary = new Rectangle(width/2, height/2, width/2, height/2);

	//create obstacles
	for (let i=0; i<0; i++) {
		obstacles.push(new Boundary(
			random(width),
			random(height),
			random(width),
			random(height)
		));
	}

	//create boids
	for(let i=0; i<200; i++)
		flock.push(new Boid());
}

function draw() {
	qt = new QuadTree(boundary);
	
  // background
	background(51);
	
	//obstacles
	obstacles.forEach(wall => wall.show());
	
	//boids
	flock.forEach(boid => {
		// boid.flock(flock, obstacles);
		// boid.update();
		// boid.edges();
		qt.insert(boid);
		// return boid;
	});
	
	//quadtree
	qt.show();
	
	//test rectangle
	stroke(0, 255, 0);
	rectMode(CENTER);
	let range = new Rectangle(mouseX, mouseY, 25, 25);
	rect(range.x, range.y, range.w*2, range.h*2);
	let points = qt.query(range);
	// console.log(points);
	
	flock.forEach(boid => boid.show());
	points.forEach(boid => boid.highlight());
}


















