// Import Three.js library
import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Create a WebGLRenderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a grid
const gridSize = 100;
const gridSpacing = 10;
const gridGeometry = new THREE.BufferGeometry();
for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
  gridGeometry.vertices.push(new THREE.Vector3(i, 0, -gridSize));
  gridGeometry.vertices.push(new THREE.Vector3(i, 0, gridSize));
  gridGeometry.vertices.push(new THREE.Vector3(-gridSize, 0, i));
  gridGeometry.vertices.push(new THREE.Vector3(gridSize, 0, i));
}
const gridMaterial = new THREE.LineBasicMaterial({ color: 0xAAAAAA });
const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
scene.add(grid);

// Function to create a cylindrical agent
const createAgent = (position, path) => {
  const agentRadius = 2;
  const agentHeight = 10;
  const agentGeometry = new THREE.CylinderGeometry(agentRadius, agentRadius, agentHeight, 32);
  const agentMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
  const agent = new THREE.Mesh(agentGeometry, agentMaterial);
  agent.position.copy(position);
  scene.add(agent);

  let pathIndex = 0;
  const animateAgent = () => {
    const target = path[pathIndex];
    const direction = target.clone().sub(agent.position).normalize();
    agent.position.add(direction);
    agent.lookAt(target);
    if (agent.position.distanceTo(target) < 0.1) {
      pathIndex = (pathIndex + 1) % path.length;
    }
  };

  return {
    agent,
    animateAgent
  };
};

// Create agent 1 with starting position and path
const agent1StartPosition = new THREE.Vector3(-50, 0, -50);
const agent1Path = [
  new THREE.Vector3(-50, 0, -50),
  new THREE.Vector3(-50, 0, 50),
  new THREE.Vector3(50, 0, 50),
  new THREE.Vector3(50, 0, -50)
];
const agent1 = createAgent(agent1StartPosition, agent1Path);

// Create agent 2 with starting position and path
const agent2StartPosition = new THREE.Vector3(50, 0, -50);
const agent2Path = [
  new THREE.Vector3(50, 0, -50),
  new THREE.Vector3(50, 0, 50),
  new THREE.Vector3(-50, 0, 50),
  new THREE.Vector3(-50, 0, -50)
];
const agent2 = createAgent(agent2StartPosition, agent2Path);

// Create an animate function to update the scene
const animate = () => {
  agent1.animateAgent();
  agent2.animateAgent();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

// Start the animation
animate();
