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

	collisionPerception = 300;
	
	//these random ranges were determined experimentally
	alignmentWeight = random(.56, .80);
	cohesionWeight = random(.07, .24);
	separationWeight = random(.18, .21);
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
	for (let i=0; i<5; i++) {
		let x1 = random(150, width-150);
		let y1 = random(150, height-150);
		let x2 = random(x1-100, x1+100);
		let y2 = random(y1-100, y1+100);
		obstacles.push(new Boundary(x1, y1, x2, y2));
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
		boid.flock(closeBoids, obstacles);
		boid.update();
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


















