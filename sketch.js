const flock = [];
let obstacles = [];
let ray;
let qt;
let qtb;

let alignmentWeight, cohesionWeight, separationWeight;
let alignmentPerception, cohesionPerception, separationPerception;
let maxBoidPerception;
let collisionPerception;

let boundary;
let obstacleChecks;

function setup() {
  // put setup code here
	let canvas = createCanvas(800, 600);
	canvas.parent('sketch-container');

	collisionPerception = 200;
	
	//these random ranges were determined experimentally
	alignmentWeight = random(.56, .80);
	cohesionWeight = random(.07, .24);
	separationWeight = random(.18, .21);
	//bad .70 .18 .19
	createP(`
		${nf(alignmentWeight, 0, 2)}
		${nf(cohesionWeight, 0, 2)}
		${nf(separationWeight, 0, 2)}`
	);
	
	alignmentPerception = random(59, 76);
	cohesionPerception = 127;
	separationPerception = random(168, 189);
	maxBoidPerception = max([alignmentPerception, cohesionPerception, separationPerception]);

	boundary = new Rectangle(width/2, height/2, width/2, height/2);

	//create obstacles
	qtb = new QuadTreeBoundaries(boundary);
	for (let i=0; i<5; i++) {
		obstacles.push(new Obstacle());
	}
	obstacles.forEach(obst => {
		let boundaries = obst.getBoundaries();
		boundaries.forEach(b => qtb.insert(b));
	});

	//create boids
	for(let i=0; i<250; i++)
		flock.push(new Boid());
}

function draw() {
	qt = new QuadTree(boundary);
	
  // background
	background(51);
	// qtb.show();
	
	//obstacles
	obstacles.forEach(obst => obst.show());
	
	//boids
	flock.forEach(boid => {
		let range = new Circle(
			boid.position.x, 
			boid.position.y, 
			maxBoidPerception
		);
		let closeBoids = qt.query(range);
		let closeBoundaries = qtb.query(boid.ray.getLine());
		// closeBoundaries.forEach(cb => cb.highlight());
		boid.flock(closeBoids, closeBoundaries);
		boid.edges();
		qt.insert(boid);
	});
	
	//boid rays
	// flock.forEach(boid => {
		// boid.rays.forEach(ray => {
			// ray.show();
		// });
	// });
	
	//quadtree
	// qt.show();
	
	flock.forEach(boid => {
		boid.update();
		boid.show()
	});

	//test circle
	// stroke(0, 255, 0);
	// ellipseMode(CENTER);
	// let range = new Circle(mouseX, mouseY, maxBoidPerception);
	// circle(range.x, range.y, range.r);
	// let points = qt.query(range);
	// points.forEach(boid => boid.highlight());
	
	// console.log(frameRate());
}


















