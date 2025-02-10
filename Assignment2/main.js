  import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
/**
 * CHECKLIST:
 * Exercise 1 (2.5 points): Fill in the rest of positions, normals and vertices to form a full cube. [DONE]
 * Exercise 2 (5 points): Tilt each cubes 10 degrees to the left with respect to the previous cube in the stack. Make sure the top left corner of each cube is in perfect contact to the bottom left corner of the next cube. 
 * Exercise 3 (5 points): Make the cubes taller using the scaling matrix transform. [DONE]
 * Exercise 4 (2.5 points) Make the cube swing to the left and back to the center.  [DONE]
 * Exercise 5 (5 points): Finish the wirefreme cube, and replace the Mesh() cube by the new LineSegments cube. [DONE]
 * Exercise 6 (5 points): Switch between Wireframe and Mesh view when the w key is pressed. [DONE]
 * Need to implement the following:
 * align cubes to the left of the previous cube when rotating
 * ask about whether the wireframe cube should be visible or is included in animation toggle view
 */

const scene = new THREE.Scene();

//THREE.PerspectiveCamera( fov angle, aspect ratio, near depth, far depth );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10);
controls.target.set(0, 5, 0);

// Rendering 3D axis
const createAxisLine = (color, start, end) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
};
const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 0, 0)); // Red
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)); // Green
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 3)); // Blue
scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);


// ***** Assignment 2 *****
// Setting up the lights
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5); // Position the light
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, .0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050);  // Soft white light
scene.add(ambientLight);

const phong_material = new THREE.MeshPhongMaterial({
    color: 0x00ff00, // Green color
    shininess: 100   // Shininess of the material
});


// Start here.

const l = 0.5
const positions = new Float32Array([
    // Front face
    -l, -l,  l, // 0 (-.5, -.5, .5)
     l, -l,  l, // 1 (.5, -.5, .5)
     l,  l,  l, // 2 (.5, .5, .5)
    -l,  l,  l, // 3 (-.5, .5, .5)

    // Left face
    -l, -l, -l, // 4 (-.5, -.5, -.5)
    -l, -l,  l, // 5 (-.5, -.5, .5)
    -l,  l,  l, // 6 (-.5, .5, .5) 
    -l,  l, -l, // 7 (-.5, .5, -.5)
  
    // Top face
    -l, l, -l, // 8 (-.5, .5, -.5)
    -l, l,  l, // 9 (-.5, .5, .5)
    l, l,  l, // 10 (.5, .5, .5)
    l, l, -l, // 11 (.5, .5, -.5)

    // Bottom face
    -l, -l, -l, // 12 (-.5, -.5, -.5)
    l, -l,  -l, // 13 (-.5, -.5, .5)
    l, -l,  l, // 14 (.5, -.5, .5)
    -l, -l, l, // 15 (.5, -.5, -.5)
  
    // Right face
    l, -l, -l, // 16 (.5, -.5, -.5)
    l,  l,  -l, // 17 (.5, -.5, .5)
    l,  l,  l, // 18 (.5, .5, .5)
    l,  -l, l, // 19 (.5, .5, -.5)

     // Back face
      -l, -l, -l, // 20 (-.5, -.5, -.5)
      -l, l, -l, // 21 (.5, -.5, -.5)
      l,  l, -l, // 22 (.5, .5, -.5)
      l,  -l, -l // 23 (-.5, .5, -.5) 
  ]);
  
  const indices = [

    // Front face
    0, 1, 2,
    0, 2, 3,
  
    // Left face
    4, 5, 6,
    4, 6, 7,
  
    // Top face
    8, 9, 10,
    8, 10, 11, 

    // Bottom face
    12, 13, 14,
    12, 14, 15, 
  
    // Right face
    16, 17, 18,
    16, 18, 19,

    // Back face
    20, 21, 22,
    20, 22, 23 
  ];
  
  // Compute normals
  const normals = new Float32Array([
    // Front face
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  
    // Left face
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
  
    // Top face
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
  
    // Bottom face
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
  
    // Right face
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // Back face
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
  ]);

const custom_cube_geometry = new THREE.BufferGeometry();
custom_cube_geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
custom_cube_geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
custom_cube_geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

// TODO: Implement wireframe geometry
const wireframe_vertices = new Float32Array([
  // Front face
      -l, -l, l,
      l, -l, l,
      l, -l, l,
      l, l, l,
      l, l, l,
      -l, l, l,
      -l, l, l,
      -l, -l, l,
  // Top face
      -l, l, -l,
      -l, l, l,
      -l, l, l,
      l, l, l,
      l, l, l,
      l, l, -l,
      l, l, -l,
      -l, l, -l,
  // Left face
      -l, -l, -l,
      -l, -l, l,
      -l, -l, l,
      -l, l, l,
      -l, l, l,
      -l, l, -l,
      -l, l, -l,
      -l, -l, -l,
  // Bottom face
      -l, -l, -l,
      l, -l, -l,
      l, -l, -l,
      l, -l, l,
      l, -l, l,
      -l, -l, l,
      -l, -l, l,
      -l, -l, -l,
  // Right face
      l, -l, -l,
      l, l, -l,
      l, l, -l,
      l, l, l,
      l, l, l,
      l, -l, l,
      l, -l, l,
      l, -l, -l,
]);

const wireframe_greometry = new THREE.BufferGeometry();
wireframe_greometry.setAttribute( 'position', new THREE.BufferAttribute( wireframe_vertices, 3 ) );

function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}

function scalingMatrix(sx, sy, sz) {
  return new THREE.Matrix4().set(
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1  
  );
}

function rotationMatrixZ(theta) {
	return new THREE.Matrix4().set(
    Math.cos(theta), -Math.sin(theta), 0, 0,
    Math.sin(theta),  Math.cos(theta), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
	);
}
let lines = [];
for (let i = 0; i < 7; i++) {
	let line = new THREE.LineSegments( wireframe_greometry);
	line.matrixAutoUpdate = false;
	lines.push(line);
	scene.add(line);
  lines[i].visible = false;
}

let cubes = [];
for (let i = 0; i < 7; i++) {
	let cube = new THREE.Mesh(custom_cube_geometry, phong_material);
	cube.matrixAutoUpdate = false;
	cubes.push(cube);
	scene.add(cube);
}

let animation_time = 0;
let delta_animation_time;
let rotation_angle;
const clock = new THREE.Clock();
let freezeFrame = false;

const MAX_ANGLE = 10 * Math.PI/180 // 10 degrees converted to radians
const T = 2 // oscilation persiod in seconds
function animate() {
    
	renderer.render( scene, camera );
    controls.update();
    if (!freezeFrame) {
      delta_animation_time = clock.getDelta();
      animation_time += delta_animation_time; 
    } else {
      animation_time = 1;
    }
    rotation_angle = MAX_ANGLE * Math.abs(Math.sin((Math.PI * animation_time) / T));

    const rotation = rotationMatrixZ(rotation_angle);
    const l2 = 1.5*l;
    const scaling = scalingMatrix(1, l2/l, 1); // Scale by 1.5 in the y direction

    let model_transformation = new THREE.Matrix4(); // model transformation matrix we will update
    model_transformation.multiplyMatrices(scaling, model_transformation);
    const translation1 = translationMatrix(.5, l2, 0);
    const translation2 = translationMatrix(0, 2*l2, 0);
    for (let i = 0; i < 7; i++) {
	    lines[i].matrix.copy(model_transformation);
      cubes[i].matrix.copy(model_transformation); 
      model_transformation.multiplyMatrices(translation1, model_transformation);
      model_transformation.multiplyMatrices(rotation, model_transformation);
      model_transformation.multiplyMatrices(translationMatrix(-.5, -l2, 0), model_transformation);
      model_transformation.multiplyMatrices(translation2, model_transformation);     
    }    
}
renderer.setAnimationLoop( animate );

let still = false;
window.addEventListener('keydown', onKeyPress); // onKeyPress is called each time a key is pressed
// Function to handle keypress
function onKeyPress(event) {
    switch (event.key) {
        case 's': // Note we only do this if s is pressed.
            freezeFrame = !freezeFrame; // Toggle the freeze state
            break;
        case 'w':
            for(let i = 0; i < lines.length; i++) {
              lines[i].visible = !lines[i].visible;
              cubes[i].visible = !cubes[i].visible;
            }
            break
        default:
            console.log(`Key ${event.key} pressed`);
    }
}