import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';

// SCEN
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// KAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CONTROLS (rotera + zoom)
const controls = new OrbitControls(camera, renderer.domElement);

// LJUS
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5,5,5);
scene.add(light);

// LADDA MODELL
const loader = new GLTFLoader();
let brain;

loader.load('./human_brain_cerebrum__brainstem.glb', function(gltf) {
    brain = gltf.scene;
    scene.add(brain);
});

// KLICKSYSTEM
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoBox = document.getElementById("infoBox");

window.addEventListener('click', async (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {

        const clickedObject = intersects[0].object.name || "okänd del";

        infoBox.innerText = "Laddar info...";

        const text = await getBrainInfo(clickedObject);

        infoBox.innerText = text;
    }
});

// GOOGLE AI FUNKTION
async function getBrainInfo(part) {

    const API_KEY = "DIN_API_NYCKEL";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `Förklara kort och tydligt vad ${part} i hjärnan gör`
                }]
            }]
        })
    });

    const data = await response.json();

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Ingen info hittades";
}

// ANIMATION
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// RESPONSIVE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
