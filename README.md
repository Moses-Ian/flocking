# Flocking Simulation with Obstacle Avoidance in p5.js

## Description

This is a flocking simulation based on the flocking project by Coding Train, which is also based on the work of Craig Reynolds.

This project was created as an attempt to merge several interesting algorithms together. I started with Coding Train's flocking simulation, then added the same channel's QuadTree implementation to improve efficiency and speed. I then added my own attempt at obstacle avoidance. Finally, I implemented my own version of a QuadTree that indexes lines rather than points, to improve obstacle avoidance efficiency.

## Link

You can view the deployed page here:
[link]

## Usage

You have some options for viewing the algorithms in action.
- By checking _Perception_, you will highlight only the boids that the focused boid is responding to.
- By checking _Avoidance_, you will see how the boid reacts to the obstacle.
- Check _QuadTree_ to see the data structure that indexes the boids.
- Check _Obstacle QuadTree (Queried)_ to see only the segments that the boid considers when avoiding obstacles.
- Check _Obstacle QuadTree (Full)_ to see the structure of the indexed obstacles. 

## Brief Explanation of the Algorithms

Each boid tries at every frame to do 5 things:
- Speed up
- Align with nearby boids
- Cohese with nearby boids
- Separate from nearby boids
- Avoid Obstacles

### Speed Up

Boids try to set their velocity to their max speed.

### Alignment

Boids try to orient their velocity with the average velocity of nearby neighbors.

### Cohesion

Boids try to place themselves in the average location of their neighbors.

### Separation

Boids try to maintain distance between themselves and their neighbors.

### Avoidance

When boids see an obstacle, they try to align their velocity in the direction of the wall. In a naive approach, they end up being 'funnelled' into corners. If they remember the first location where they saw a wall, then they can instead try to align their velocity in the direction of a line created by their remembered point and the point where they currently see the wall.

This is my favorite to visualize.

## Brief Explanation of the QuadTree

The QuadTree has jurisdiction over a region of the window. As boids are inserted into the tree, they become queryable. Once more than 4 are added to the region, the tree splits into 4 equal regions. Any new boids are added to the corresponding child region. This process repeats as many times as needed.

## Brief Explanation of the Obstacle QuadTree

This is the same core idea, but for line segments. Each region of the QuadTree only holds one line before splitting. As long as the entire line fits within the region, the whole line is added. If the line crosses the region's boundaries, then the line is split into pieces, and only the segment that lies within the boundary is kept.

This algorithm is less efficient, as it takes longer to add segments and returns more segments when queried. However, since it only needs to be created once at setup, and still overall returns fewer segments to check that a linear query, the savings are worth implementing the tree.

## Credits

Coding Train Flocking: https://www.youtube.com/watch?v=mhjuuHl6qHM&t=842s
Craig Reynolds Boids: https://www.red3d.com/cwr/boids/
Coding Train Asteroids: https://www.youtube.com/watch?v=hacZU523FyM
Coding Train QuadTree: https://www.youtube.com/watch?v=OJxEcs0w_kE

## Created by Ian Moses

https://github.com/Moses-Ian

https://moses-ian.github.io/portfolio/

https://www.linkedin.com/in/moses-ian/