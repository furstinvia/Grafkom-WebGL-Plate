const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows for realism
document.body.appendChild(renderer.domElement);

// Load background texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load('bg3.png', function(texture) {
    scene.background = texture; // Set the loaded texture as background
});

// More natural ambient light
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x555555, 0.8); // Slightly warmer color for realism
scene.add(ambientLight);

// Directional light to simulate sunlight with realistic shadows
const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.radius = 2; // Softer shadow edges
scene.add(sunLight);

// Create a reflective plane for the table
const planeSize = 20;
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);

const reflector = new THREE.Reflector(planeGeometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x889999
});
reflector.rotation.x = -Math.PI / 2;
reflector.position.y = -0.11;
scene.add(reflector);

let model;

// Load 3D model with improved material settings for realism
const loader = new THREE.GLTFLoader();
loader.load('piring.glb', function(gltf) {
    model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(5, 5, 5);

    model.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            node.material.side = THREE.DoubleSide;

            // Enhance material for realism
            node.material.roughness = 0.3; // Adds subtle glossiness
            node.material.metalness = 0.2; // Slight reflectivity for a realistic surface
        }
    });

    scene.add(model);
}, undefined, function(error) {
    console.error('Error loading GLB model:', error);
});

// Set camera position and controls
camera.position.set(3, 5, 10);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.minDistance = 1;
controls.maxDistance = 20;

function animate() {
    requestAnimationFrame(animate);

    // Rotate the model if loaded
    if (model) {
        model.rotation.y += 0.001;
    }
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Update viewport on window resize
window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Tambahkan dat.GUI
const gui = new dat.GUI();

// Background Color
const bgFolder = gui.addFolder('Background');
const bgParams = {
    color: '#000000' // Default color
};
bgFolder.addColor(bgParams, 'color').onChange((value) => {
    scene.background = new THREE.Color(value);
});
bgFolder.open();

// Lighting Controls
const lightingFolder = gui.addFolder('Lighting');
const lightParams = {
    ambientIntensity: ambientLight.intensity,
    directionalIntensity: sunLight.intensity,
    enableShadows: true
};
lightingFolder.add(lightParams, 'ambientIntensity', 0, 2).onChange((value) => {
    ambientLight.intensity = value;
});
lightingFolder.add(lightParams, 'directionalIntensity', 0, 2).onChange((value) => {
    sunLight.intensity = value;
});
lightingFolder.add(lightParams, 'enableShadows').onChange((value) => {
    sunLight.castShadow = value;
});
lightingFolder.open();

// Animation Controls
const animFolder = gui.addFolder('Animation');
const animParams = {
    autoRotate: false,
    rotationSpeed: 0.01
};
animFolder.add(animParams, 'autoRotate').onChange((value) => {
    if (!model) return;
    animParams.autoRotate = value;
});
animFolder.add(animParams, 'rotationSpeed', 0, 0.1);
animFolder.open();

// **Dynamic Scaling Controls**
const scaleFolder = gui.addFolder('Scaling');
const scaleParams = {
    scaleX: 5,
    scaleY: 5,
    scaleZ: 5,
};
scaleFolder.add(scaleParams, 'scaleX', 0.1, 10).onChange((value) => {
    if (model) model.scale.x = value;
});
scaleFolder.add(scaleParams, 'scaleY', 0.1, 10).onChange((value) => {
    if (model) model.scale.y = value;
});
scaleFolder.add(scaleParams, 'scaleZ', 0.1, 10).onChange((value) => {
    if (model) model.scale.z = value;
});
scaleFolder.open();


// Update model animation
function animate() {
    requestAnimationFrame(animate);

    // Rotate the model if autoRotate is enabled
    if (model && animParams.autoRotate) {
        model.rotation.y += animParams.rotationSpeed;
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

