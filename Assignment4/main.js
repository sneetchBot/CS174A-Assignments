import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, -8);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

class Texture_Rotate {
    vertexShader() {
        return `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `;
    }

    fragmentShader() {
        return `
        uniform sampler2D uTexture;
        uniform float animation_time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {    
            // 2.c Rotate the texture map around the center of each face at a rate of 8 rpm.
            vec2 new_vUv = vUv;
            float angle = -2.0 * 3.14159265359 * animation_time / 7.5;

            // Translate UV coordinates to the center of the face
            new_vUv -= 0.5;

            // Rotate the UV coordinates
            float cosAngle = cos(angle);
            float sinAngle = sin(angle);
            new_vUv = vec2(
                new_vUv.x * cosAngle - new_vUv.y * sinAngle,
                new_vUv.x * sinAngle + new_vUv.y * cosAngle
            );

            // Translate UV coordinates back
            new_vUv += 0.5;

            // 1.b Load the texture color from the texture map
            vec4 tex_color = texture2D(uTexture, new_vUv);
            
            // 2.d Add the outline of a black square in the center of each texture that moves with the texture
            if(new_vUv.x > 0.15 && new_vUv.x < 0.85 && new_vUv.y > 0.15 && new_vUv.y < 0.85) {
                if (!(new_vUv.x > 0.25 && new_vUv.x < 0.75 && new_vUv.y > 0.25 && new_vUv.y < 0.75)) {
                tex_color = vec4(0.0, 0.0, 0.0, 1.0);
                }         
            }
            
            gl_FragColor = tex_color;
        }
        `;
    }
}

class Texture_Scroll_X {
    vertexShader() {
        return `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `;
    }

    fragmentShader() {
        return `
        uniform sampler2D uTexture;
        uniform float animation_time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            // 2.a Shrink the texture by 50% so that the texture is repeated twice in each direction
            vec2 uv = vUv * 2.0;

            // 2.b Translate the texture varying the s texture coordinate by 4 texture units per second
            uv.x -= 4.0 * animation_time;

            // 1.b Load the texture color from the texture map
            vec4 tex_color = texture2D(uTexture, uv);

            // 2.d Add the outline of a black square in the center of each texture that moves with the texture
            vec2 mod_uv = mod(uv, 1.0); // Get the fractional part of the UV coordinates
            if (mod_uv.x > 0.25 && mod_uv.x < 0.75 && mod_uv.y > 0.25 && mod_uv.y < 0.75) {
                if (!(mod_uv.x > 0.35 && mod_uv.x < 0.65 && mod_uv.y > 0.35 && mod_uv.y < 0.65)) {
                    tex_color = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }

            gl_FragColor = tex_color;
        }
        `;
    }
}

let animation_time = 0.0;

const cube1_geometry = new THREE.BoxGeometry(2, 2, 2);

// 1.a Load texture map 
const cube1_texture = new THREE.TextureLoader().load('assets/stars.png');

// 1.c Apply Texture Filtering Techniques to Cube 1
// Nearest Neighbor Texture Filtering
cube1_texture.minFilter = THREE.NearestFilter;
cube1_texture.magFilter = THREE.NearestFilter;

const cube1_uniforms = {
    uTexture: { value: cube1_texture },
    animation_time: { value: animation_time }
};
const cube1_shader = new Texture_Rotate();
const cube1_material = new THREE.ShaderMaterial({
    uniforms: cube1_uniforms,
    vertexShader: cube1_shader.vertexShader(),
    fragmentShader: cube1_shader.fragmentShader(),
});

const cube1_mesh = new THREE.Mesh(cube1_geometry, cube1_material);
cube1_mesh.position.set(2, 0, 0)
scene.add(cube1_mesh);

const cube2_geometry = new THREE.BoxGeometry(2, 2, 2);

// 1.a Load texture map 
const cube2_texture = new THREE.TextureLoader().load('assets/earth.gif');

// 1.c Apply Texture Filtering Techniques to Cube 2
// Linear Mipmapping Texture Filtering
cube2_texture.minFilter = THREE.LinearMipMapLinearFilter;

// 2.a Enable texture repeat wrapping for Cube 2
cube2_texture.wrapS = THREE.RepeatWrapping;
cube2_texture.wrapT = THREE.RepeatWrapping;

const cube2_uniforms = {
    uTexture: { value: cube2_texture },
    animation_time: { value: animation_time }
};
const cube2_shader = new Texture_Scroll_X();
const cube2_material = new THREE.ShaderMaterial({
    uniforms: cube2_uniforms,
    vertexShader: cube2_shader.vertexShader(),
    fragmentShader: cube2_shader.fragmentShader(),
});

const cube2_mesh = new THREE.Mesh(cube2_geometry, cube2_material);
cube2_mesh.position.set(-2, 0, 0)
scene.add(cube2_mesh);

const clock = new THREE.Clock();
let previousElapsedTime = 0;

function animate() {
    controls.update();

    // Update uniform values
    const elapsedTime = clock.getElapsedTime();
    cube1_uniforms.animation_time.value = elapsedTime;
    cube2_uniforms.animation_time.value = elapsedTime;

    // Calculate the time difference between frames
    const deltaTime = elapsedTime - previousElapsedTime;
    previousElapsedTime = elapsedTime;

    // Rotate the cubes if the key 'c' is pressed to start the animation
    if (isAnimating) {
        // Cube #1 should rotate around its own X-axis at a rate of 15 rpm.
        cube1_mesh.rotation.x += 2 * Math.PI * (15 / 60) * deltaTime;
        // Cube #2 should rotate around its own Y-axis at a rate of 40 rpm
        cube2_mesh.rotation.y += 2 * Math.PI * (40 / 60) * deltaTime;
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Keyboard Event Listener
// Press 'c' to start and stop the rotating both cubes
let isAnimating = false;
window.addEventListener('keydown', onKeyPress);
function onKeyPress(event) {
    if (event.key === 'c') {
        isAnimating = !isAnimating;
    }
}