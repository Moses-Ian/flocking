const flock = [];
const obstacles = [];
let ray;
let qt;

let alignmentWeight, cohesionWeight, separationWeight;
let alignmentPerception, cohesionPerception, separationPerception;
let maxBoidPerception;
let collisionPerception;

let boundary;

function setup() {
  // put setup code here
	let canvas = createCanvas(800, 600);
	canvas.parent('sketch-container');

	collisionPerception = 75;
	
	//these random ranges were determined experimentally
	alignmentWeight = random(.56, .80);
	cohesionWeight = random(.24, .07);
	separationWeight = random(.18, .21);
	
	alignmentPerception = random(59, 76);
	cohesionPerception = 127;
	separationPerception = random(168, 189);
	maxBoidPerception = max([alignmentPerception, cohesionPerception, separationPerception]);

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
	for(let i=0; i<250; i++)
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
		let range = new Circle(
			boid.position.x, 
			boid.position.y, 
			maxBoidPerception
		);
		let closeBoids = qt.query(range);
		// boid.flock(flock, obstacles);
		boid.flock(closeBoids, obstacles);
		boid.update();
		boid.edges();
		qt.insert(boid);
	});
	
	//quadtree
	// qt.show();
	
	flock.forEach(boid => boid.show());

	//test circle
	// stroke(0, 255, 0);
	// ellipseMode(CENTER);
	// let range = new Circle(mouseX, mouseY, maxBoidPerception);
	// circle(range.x, range.y, range.r);
	// let points = qt.query(range);
	// points.forEach(boid => boid.highlight());
	
	// console.log(frameRate());
}


















