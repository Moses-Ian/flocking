const flock = [];
let obstacles = [];
let ray;
let qt;
let qtb;

let boidSize = 8;

let alignmentWeight, cohesionWeight, separationWeight;
let alignmentPerception, cohesionPerception, separationPerception;
let maxBoidPerception;
let collisionPerception;

let boundary;
let obstacleChecks;

let boidCountP;
let boidCountSlider;
let oldCount;
const countArray = [1, 5, 10, 15, 25, 35, 50, 75, 85, 100, 125, 150, 175, 200, 225, 250, 300, 325, 350, 400]
let checkboxes = [];

function setup() {
  // put setup code here
	let canvas = createCanvas(800, 600);
	canvas.parent('sketch-container');

	collisionPerception = 200;
	
	//these random ranges were determined experimentally
	alignmentWeight = random(.56, .80);
	cohesionWeight = random(.07, .24);
	separationWeight = random(.19, .21);
	avoidanceWeight = 5;

	alignmentPerception = random(59, 76);
	cohesionPerception = 127;
	separationPerception = random(168, 189);
	maxBoidPerception = max([alignmentPerception, cohesionPerception, separationPerception]);

	boundary = new Rectangle(width/2, height/2, width/2, height/2);

	//create obstacles
	qtb = new QuadTreeBoundaries(boundary);
	for (let i=0; i<8; i++) {
		obstacles.push(new Obstacle());
	}
	obstacles.forEach(obst => {
		let boundaries = obst.getBoundaries();
		boundaries.forEach(b => qtb.insert(b));
	});

	//create boids
	for(let i=0; i<150; i++)
		flock.push(new Boid());
	qt = new QuadTree(boundary);
	flock.forEach(boid => qt.insert(boid));
	
	createP('Flocking Simulation with Obstacle Avoidance in p5.js').style('text-decoration', 'underline');
	createP('by Ian Moses');
	
	boidCountP = createP(`Number of Boids: 150`);
	boidCountSlider = createSlider(0, 19, 11);
	oldCount = 11;
	
	// checkbox!
	checkboxes.push(createCheckbox('Perception', false));
	checkboxes.push(createCheckbox('Avoidance', false));
	checkboxes.push(createCheckbox('Boid QuadTree', false));
	checkboxes.push(createCheckbox('Obstacle QuadTree (Queried)', false));
	checkboxes.push(createCheckbox('Obstacle QuadTree (Full)', false));
	checkboxes.push(createCheckbox('Collisions', false));
	
	flock[0].focus = true;

	createP(`Alignment Weight: ${nf(alignmentWeight, 0, 2)}`);
	createP(`Cohesion Weight: ${nf(cohesionWeight, 0, 2)}`);
	createP(`Separation Weight: ${nf(separationWeight, 0, 2)}`);
	// createP(`Avoidance Weight: ${avoidanceWeight}`);
}

function draw() {
  // background
	background(51);

	// quadtreeboundaries
	if (checkboxes[4].checked())
		qtb.show();
	
	//obstacles
	obstacles.forEach(obst => {
		obst.show();
		// obst.showTriangles();
	});
	
	//boids
	let testRange;
	flock.forEach(boid => {
		let range = new Circle(
			boid.position.x, 
			boid.position.y, 
			maxBoidPerception
		);
		if (boid.focus) testRange = range;
		let closeBoids = qt.query(range);
		let closeBoundaries = qtb.query(boid.ray.getLine(), boid.focus && checkboxes[3].checked());
		boid.flock(closeBoids, closeBoundaries);
		boid.edges();
		if (boid.focus)
			drawBoid(boid, closeBoids, closeBoundaries);
	});
	
	//boid rays
	// flock.forEach(boid => {
		// boid.rays.forEach(ray => {
			// ray.show();
		// });
	// });
	

	//quadtree
	if (checkboxes[2].checked())
		qt.show();
	
	//test circle
	// stroke(0, 255, 0);
	// ellipseMode(CENTER);
	// let range = new Circle(mouseX, mouseY, maxBoidPerception);
	// circle(range.x, range.y, range.r);
	// let points = qt.query(range);
	// circle(testRange.x, testRange.y, testRange.r);
	// let points = qt.query(testRange);
	// points.forEach(boid => boid.highlight());

	updateBoidCount();
	
	qt = new QuadTree(boundary);
	flock.forEach(boid => {
		boid.update();
		qt.insert(boid)
		boid.show()
	});

	// console.log(frameRate());
}

function mousePressed() {
	// console.log(mouseX, mouseY);
	if (mouseX > width || mouseY > height) return;
	flock.forEach(b => b.focus = false);

	range = new Circle(
		mouseX,
		mouseY,
		3*boidSize
	);
	let closeBoids = qt.query(range);
	closeBoids.forEach(b => b.focus = true);
}

function drawBoid(boid, boids, boundaries) {
	if (checkboxes[0].checked()) {
		stroke(0, 255, 0);
		ellipseMode(CENTER);
		let range = new Circle(boid.position.x, boid.position.y, maxBoidPerception);
		circle(range.x, range.y, range.r);

		boids.forEach(b => b.highlight());
	}

	if (checkboxes[3].checked())
		boundaries.forEach(cb => cb.highlight());
	
}

function updateBoidCount() {
	if (oldCount === boidCountSlider.value()) return;
		
	let mappedCount = countArray[boidCountSlider.value()];
	
	if (mappedCount > flock.length)
		for (let i=flock.length; i<mappedCount; i++)
			flock.push(new Boid());
	else
		for (let i=flock.length; i>mappedCount; i--)
			flock.pop();
		
	boidCountP.html(`Number of Boids: ${mappedCount}`);
	oldCount = boidCountSlider.value();
}












