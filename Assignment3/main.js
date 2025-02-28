import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AmbientLight, exp } from 'three/tsl';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enabled = true;
controls.minDistance = 10;
controls.maxDistance = 50;

function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}

function rotationMatrixX(theta) {
    return new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, Math.cos(theta), -Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

function rotationMatrixY(theta) {
    return new THREE.Matrix4().set(
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
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

let planets = [];
let clock = new THREE.Clock();
let attachedObject = null;
let blendingFactor = 0.1;
// Create additional variables as needed here
let sunGeometry = new THREE.SphereGeometry(1, 32, 32);
let sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000
}); 
const sun = new THREE.Mesh(
    sunGeometry,
    sunMaterial
);
sun.position.set(0, 0, 0);
scene.add(sun);

// TODO: Create sun light
let sunLight = new THREE.PointLight(0xff0000, 1, 0, 1);
scene.add(sunLight);

// Create orbiting planets
// TODO: Create Planet 1: Flat-shaded Gray Planet

let planet1Geometry = new THREE.SphereGeometry(1, 8, 6);
let planet1Material = new THREE.MeshPhongMaterial({
    color: 0x808080,
    flatShading: true,
    aoMapIntensity: 0
});
const planet1 = new THREE.Mesh(
    planet1Geometry,
    planet1Material
);
planets.push({ mesh: planet1, distance: 5, speed: 1 });
scene.add(planet1);

// TODO: Create Planet 2: Swampy Green-Blue with Dynamic Shading
/**
    Shading:
    Apply Phong Shading on Even Seconds:
    We already provide a custom Phong shader to you, where lighting calculations occur in the fragment shader. Take a look at the GLSL code in the createPhongMaterial() function.
    Apply Gouraud Shading on Odd Seconds:
    Implement a custom Gouraud shader in createGouraudMaterial() where lighting calculations occur in the vertex shader. Refer to the Phong shader's GLSL code, you should only need to add/change a few lines.
 */
let planet2Geometry = new THREE.SphereGeometry(1, 8, 8);

let planet2Material = new THREE.MeshPhongMaterial({
    color: 0x80FFFF,
    ambient: 0.0,
    diffusivity: 0.5,
    specularity: 1.0,
    smoothness: 40.0
});
const planet2 = new THREE.Mesh(
    planet2Geometry,
    planet2Material
);
planets.push({ mesh: planet2, distance: 8, speed: 5/8 });
scene.add(planet2);

// TODO: Create Planet 3: Muddy Brown-Orange Planet with Ring
let planet3Geometry = new THREE.SphereGeometry(1, 16, 16);
let planet3Material = new THREE.MeshPhongMaterial({
    color: 0xB08040,
    AmbientLight: 0,
    ambient: 0.0,
    diffusivity: 1.0,
    specularity: 1.0,
    smoothness: 100.0
});
const planet3 = new THREE.Mesh(
    planet3Geometry,
    planet3Material
);
// Planet 3 Ring
let ringGeometry = new THREE.RingGeometry(1.5, 2.5, 64);
let ringMaterial = createRingMaterial({ });
let ring = new THREE.Mesh(ringGeometry, ringMaterial);
planet3.add(ring);
planets.push({ mesh: planet3, distance: 11, speed: 5/11 });
scene.add(planet3);
// TODO: Create Planet 4: Soft Light Blue Planet
let planet4Geometry = new THREE.SphereGeometry(1, 16, 16);
let planet4Material = new THREE.MeshPhongMaterial({
    color: 0x0000D1,
    AmbientLight: 0,
    ambient: 0.0,
    diffusivity: 1.0,
    specularity: 1.0,
    smoothness: 100.0
});
const planet4 = new THREE.Mesh(
    planet4Geometry,
    planet4Material
);
scene.add(planet4);
planets.push({ mesh: planet4, distance: 14, speed: 5/14 });
// TODO: Create Planet 4's Moon
let moonGeometry = new THREE.SphereGeometry(1, 4, 2);
let moonMaterial = new THREE.MeshPhongMaterial({
    color: 0xC83CB9,
    flatShading: true
});
const moon = new THREE.Mesh(
    moonGeometry,
    moonMaterial
);
moon.position.set(0, 0, 16.5);
scene.add(moon);
planets.push({ mesh: moon, distance: 16.5, speed: 1 });

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

// Handle keyboard input
document.addEventListener('keydown', onKeyDown, false);

animate();

// TODO: Implement the Gouraud Shader for Planet 2
function createGouraudMaterial(materialProperties) {   
    const numLights = 1;
    let shape_color_representation = new THREE.Color(materialProperties.color);

    let shape_color = new THREE.Vector4(
        shape_color_representation.r,
        shape_color_representation.g,
        shape_color_representation.b,
        1.0
    ); 
    // Vertex Shader in GLSL
    let vertexShader = `
    precision mediump float;
    const int N_LIGHTS = ${numLights};
    uniform float ambient, diffusivity, specularity, smoothness;
    uniform vec4 light_positions_or_vectors[N_LIGHTS];
    uniform vec4 light_colors[N_LIGHTS];
    uniform float light_attenuation_factors[N_LIGHTS];
    uniform vec4 shape_color;
    uniform vec3 squared_scale;
    uniform vec3 camera_center;
    varying vec3 vColor;

    vec3 gouraud_model_lights(vec3 N, vec3 vertex_worldspace) {
        vec3 E = normalize(camera_center - vertex_worldspace); // View direction
        vec3 result = shape_color.xyz * ambient; // Initialize the output color with ambient component
        for(int i = 0; i < N_LIGHTS; i++) {
            vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                light_positions_or_vectors[i].w * vertex_worldspace;
            float distance_to_light = length(surface_to_light_vector); // Light distance
            vec3 L = normalize(surface_to_light_vector); // Light direction
            
            vec3 R = reflect(-L, N); // Reflect L around the normal N
            
            float diffuse = max(dot(N, L), 0.0); // Diffuse term
            float specular = pow(max(dot(R, E), 0.0), smoothness); // Specular term
            
            float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
            
            vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                    + light_colors[i].xyz * specularity * specular;
            result += attenuation * light_contribution;
        }
        return result;
    }

    uniform mat4 model_transform;
    uniform mat4 projection_camera_model_transform;

    void main() {
        vec3 N = normalize(mat3(model_transform) * normal / squared_scale);
        vec3 vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
        vColor = gouraud_model_lights(N, vertex_worldspace);
        gl_Position = projection_camera_model_transform * vec4(position, 1.0);
    }
`;
    // Fragment Shader in GLSL
    let fragmentShader = `
    precision mediump float;
    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;
    
    // Uniforms
    const uniforms = {
        ambient: { value: materialProperties.ambient },
        diffusivity: { value: materialProperties.diffusivity },
        specularity: { value: materialProperties.specularity },
        smoothness: { value: materialProperties.smoothness },
        shape_color: { value: shape_color },
        squared_scale: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        camera_center: { value: new THREE.Vector3() },
        model_transform: { value: new THREE.Matrix4() },
        projection_camera_model_transform: { value: new THREE.Matrix4() },
        light_positions_or_vectors: { value: [] },
        light_colors: { value: [] },
        light_attenuation_factors: { value: [] }
    };

    // Create the ShaderMaterial using the custom vertex and fragment shaders
    return new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms
    });
}

function createPhongMaterial(materialProperties) {
    const numLights = 1;
    
    // convert shape_color1 to a Vector4
    let shape_color_representation = new THREE.Color(materialProperties.color);
    let shape_color = new THREE.Vector4(
        shape_color_representation.r,
        shape_color_representation.g,
        shape_color_representation.b,
        1.0
    );

    // Vertex Shader
    let vertexShader = `
        precision mediump float;
        const int N_LIGHTS = ${numLights};
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale;
        uniform vec3 camera_center;
        varying vec3 N, vertex_worldspace;

        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace); // View direction
            vec3 result = vec3(0.0); // Initialize the output color
            for(int i = 0; i < N_LIGHTS; i++) {
                // Calculate the vector from the surface to the light source
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector); // Light distance
                vec3 L = normalize(surface_to_light_vector); // Light direction
                
                // Phong uses the reflection vector R
                vec3 R = reflect(-L, N); // Reflect L around the normal N
                
                float diffuse = max(dot(N, L), 0.0); // Diffuse term
                float specular = pow(max(dot(R, E), 0.0), smoothness); // Specular term
                
                // Light attenuation
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                
                // Calculate the contribution of this light source
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }

        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;

        void main() {
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);
            N = normalize(mat3(model_transform) * normal / squared_scale);
            vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
        }
    `;
    // Fragment Shader
    let fragmentShader = `
        precision mediump float;
        const int N_LIGHTS = ${numLights};
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 camera_center;
        varying vec3 N, vertex_worldspace;

        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace); // View direction
            vec3 result = vec3(0.0); // Initialize the output color
            for(int i = 0; i < N_LIGHTS; i++) {
                // Calculate the vector from the surface to the light source
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector); // Light distance
                vec3 L = normalize(surface_to_light_vector); // Light direction
                
                // Phong uses the reflection vector R
                vec3 R = reflect(-L, N); // Reflect L around the normal N
                
                float diffuse = max(dot(N, L), 0.0); // Diffuse term
                float specular = pow(max(dot(R, E), 0.0), smoothness); // Specular term
                
                // Light attenuation
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                
                // Calculate the contribution of this light source
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }

        void main() {
            // Compute an initial (ambient) color:
            vec4 color = vec4(shape_color.xyz * ambient, shape_color.w);
            // Compute the final color with contributions from lights:
            color.xyz += phong_model_lights(normalize(N), vertex_worldspace);
            gl_FragColor = color;
        }
    `;
    // Prepare uniforms
    const uniforms = {
        ambient: { value: materialProperties.ambient },
        diffusivity: { value: materialProperties.diffusivity },
        specularity: { value: materialProperties.specularity },
        smoothness: { value: materialProperties.smoothness },
        shape_color: { value: shape_color },
        squared_scale: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        camera_center: { value: new THREE.Vector3() },
        model_transform: { value: new THREE.Matrix4() },
        projection_camera_model_transform: { value: new THREE.Matrix4() },
        light_positions_or_vectors: { value: [] },
        light_colors: { value: [] },
        light_attenuation_factors: { value: [] }
    };

    // Create the ShaderMaterial using the custom vertex and fragment shaders
    return new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms
    });
}

// TODO: Finish the custom shader for planet 3's ring with sinusoidal brightness variation
function createRingMaterial(materialProperties) {
    let vertexShader = `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
    `;

    let fragmentShader = `
        uniform vec3 color;
        varying vec3 vPosition;

        void main() {
            float distance = length(vPosition.xy);
            float brightness = 0.5 + 0.5 * sin(20.0 * distance);
            vec3 finalColor = color * brightness;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    return new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xB08040) }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide
    });
}

// This function is used to update the uniform of the planet's materials in the animation step. No need to make any change
function updatePlanetMaterialUniforms(planet) {
    const material = planet.material;
    if (!material.uniforms) return;

    const uniforms = material.uniforms;

    const numLights = 1;
    const lights = scene.children.filter(child => child.isLight).slice(0, numLights);
    // Ensure we have the correct number of lights
    if (lights.length < numLights) {
        console.warn(`Expected ${numLights} lights, but found ${lights.length}. Padding with default lights.`);
    }
    
    // Update model_transform and projection_camera_model_transform
    planet.updateMatrixWorld();
    camera.updateMatrixWorld();

    uniforms.model_transform.value.copy(planet.matrixWorld);
    uniforms.projection_camera_model_transform.value.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
    ).multiply(planet.matrixWorld);

    // Update camera_center
    uniforms.camera_center.value.setFromMatrixPosition(camera.matrixWorld);

    // Update squared_scale (in case the scale changes)
    const scale = planet.scale;
    uniforms.squared_scale.value.set(
        scale.x * scale.x,
        scale.y * scale.y,
        scale.z * scale.z
    );

    // Update light uniforms
    uniforms.light_positions_or_vectors.value = [];
    uniforms.light_colors.value = [];
    uniforms.light_attenuation_factors.value = [];

    for (let i = 0; i < numLights; i++) {
        const light = lights[i];
        if (light) {
            let position = new THREE.Vector4();
            if (light.isDirectionalLight) {
                // For directional lights
                const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(light.quaternion);
                position.set(direction.x, direction.y, direction.z, 0.0);
            } else if (light.position) {
                // For point lights
                position.set(light.position.x, light.position.y, light.position.z, 1.0);
            } else {
                // Default position
                position.set(0.0, 0.0, 0.0, 1.0);
            }
            uniforms.light_positions_or_vectors.value.push(position);

            // Update light color
            const color = new THREE.Vector4(light.color.r, light.color.g, light.color.b, 1.0);
            uniforms.light_colors.value.push(color);

            // Update attenuation factor
            let attenuation = 0.0;
            if (light.isPointLight || light.isSpotLight) {
                const distance = light.distance || 1000.0; // Default large distance
                attenuation = 1.0 / (distance * distance);
            } else if (light.isDirectionalLight) {
                attenuation = 0.0; // No attenuation for directional lights
            }
            // Include light intensity
            const intensity = light.intensity !== undefined ? light.intensity : 1.0;
            attenuation *= intensity;

            uniforms.light_attenuation_factors.value.push(attenuation);
        } else {
            // Default light values
            uniforms.light_positions_or_vectors.value.push(new THREE.Vector4(0.0, 0.0, 0.0, 0.0));
            uniforms.light_colors.value.push(new THREE.Vector4(0.0, 0.0, 0.0, 1.0));
            uniforms.light_attenuation_factors.value.push(0.0);
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// TODO: Implement the camera attachment given the key being pressed
// Hint: This step you only need to determine the object that are attached to and assign it to a variable you have to store the attached object.
function onKeyDown(event) {
    switch (event.keyCode) {
        case 48: // '0' key - Detach camera
            attachedObject = null;
            break;
        case 49: // '1' key - Attach camera to Planet 1
            attachedObject = 0;
            break;
        case 50: // '2' key - Attach camera to Planet 2
            attachedObject = 1;
            break;
        case 51: // '3' key - Attach camera to Planet 3
            attachedObject = 2;
            break;
        case 52: // '4' key - Attach camera to Planet 4
            attachedObject = 3;
            break;
        case 53: // '5' key - Attach camera to the Moon
            attachedObject = 4;
            break;
        // Add more cases if needed
    }
}

function animate() {
    requestAnimationFrame(animate);

    let time = clock.getElapsedTime();

    let period10 = time % 10.0;
    let sunRadius = 1 + 2 * Math.sin(Math.PI * period10 / 10.0);
    sun.scale.set(sunRadius, sunRadius, sunRadius);
    // Animate the color from red (small radius) to white (large radius)
    let colorProgress = 1 - Math.abs(Math.sin(Math.PI * period10 / 10.0));
    let sunColor = new THREE.Color(1, 1 - colorProgress, 1 - colorProgress); // RGB from red to white
    sun.material.color.set(sunColor);

    // Update sun light
    sunLight.color.copy(sunColor);
    sunLight.power = 10 ** sunRadius;

    // Loop through all the orbiting planets and apply transformation to create animation effect
    planets.forEach(function (obj, index) {
        let planet = obj.mesh;
        let distance = obj.distance;
        let speed = obj.speed;

        let model_transform = new THREE.Matrix4();
        if (index < 4) {
            model_transform.multiply(rotationMatrixY(speed * time));
            model_transform.multiply(translationMatrix(distance, 0, 0));
        }

        if (index == 5) {
            model_transform.multiply(translationMatrix(distance, 0, 0));
            model_transform.multiply(rotationMatrixY(speed * time));
        }

        planet.matrix.copy(model_transform);
        planet.matrixAutoUpdate = false;

        // Camera attachment logic
        if (attachedObject === index) {
            let cameraTransform = new THREE.Matrix4();
            cameraTransform.copy(model_transform);
            let offset = translationMatrix(0, 0, 10);
            cameraTransform.multiply(offset);

            let cameraPosition = new THREE.Vector3();
            cameraPosition.setFromMatrixPosition(cameraTransform);
            camera.position.lerp(cameraPosition, blendingFactor);

            let planetPosition = new THREE.Vector3();
            planetPosition.setFromMatrixPosition(planet.matrix);
            camera.lookAt(planetPosition);

            controls.enabled = false;
        } else if (attachedObject === null) {
            controls.enabled = true;
        }
    });

    // Apply Gouraud/Phong shading alternatively to Planet 2
    let currentSecond = Math.floor(time);
    if (currentSecond % 2 === 0) {
        planet2.material = createPhongMaterial(planet2Material);
    } else {
        planet2.material = createGouraudMaterial(planet2Material);
    }

    // Update customized planet material uniforms
    planets.forEach(function (obj) {
        updatePlanetMaterialUniforms(obj.mesh);
    });

    if (controls.enabled) {
        controls.update();
    }

    renderer.render(scene, camera);
}