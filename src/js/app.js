import THREE from 'three';

import Ship from './Ship';
import Planet from './Planet';
import ShotController from './ShotController';

const CAMERA_DISTANCE = 5;
const CAMERA_VELOCITY = 5;

const MAX_DELTA = 0.1; // s

let scene = new THREE.Scene();
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.setAttribute('tabIndex', '0');
renderer.domElement.focus();

let ambientLight = new THREE.AmbientLight(0x444444, 0.1);
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0.2, 0.2, 0.8);
scene.add(ambientLight);
scene.add(light);
camera.position.z = CAMERA_DISTANCE;

// prepare loader and load the model
let loader = new THREE.JSONLoader();
let texLoader = new THREE.TextureLoader();
let ship;
let shotController = new ShotController(scene);
// let textureLoader = THREE.TextureLoader();
let loadPromise = new Promise(done => {
  texLoader.load('./media/spaceship_comp.png', function(texture) {
    texLoader.load('./media/spaceship_nor.png', function(normalMap) {
      loader.load('./media/nicce_fighter.json', function(geometry) {
        let material = new THREE.MeshPhongMaterial({
          map: texture,
          normalMap: normalMap
        });
        geometry.scale(0.5, 0.5, 0.5);
        let mesh = new THREE.Mesh(geometry, material);
        ship = new Ship(mesh, shotController);
        scene.add(ship);

        // Ship thruster particles
        let particles = 5000;
        let pGeometry = new THREE.BufferGeometry();
        let partPositions = new Float32Array(particles * 3);
        let partColors = new Float32Array(particles * 3);
        let partColor = new THREE.Color(0xff0000);
        let partPosX = ship.position.x;
        let partPosY = ship.position.y;
        let partPosZ = ship.position.z;
        for (var i = 0; i < partPositions.length; i += 3) {
          partPositions[i + 0] = partPosX + Math.random(); // x
          partPositions[i + 1] = partPosY + Math.random(); // y
          partPositions[i + 2] = partPosZ + Math.random(); // z
          partColors[i + 0] = partColor.r;
          partColors[i + 1] = partColor.g;
          partColors[i + 2] = partColor.b;
        }
        pGeometry.addAttribute('position', new THREE.BufferAttribute(partPositions, 3));
        pGeometry.addAttribute('color', new THREE.BufferAttribute(partColors, 3));
        pGeometry.computeBoundingSphere();

        let pMaterial = new THREE.PointsMaterial({vertexColors: THREE.VertexColors});
        let particleSystem = new THREE.Points(pGeometry, pMaterial);
        scene.add(particleSystem);
        done();
      });
    });
  });
});

// Planet testing
let planet = new Planet(500);
planet.position.y = -550;
scene.add(planet);

// Format debugging text
let text = document.createElement('div');
text.className = 'debug';
text.innerHTML = 'Loading...';
document.body.appendChild(text);

// Game Loop
let previousTime;
function render() {
  let time = new Date().getTime();
  let delta = Math.min(MAX_DELTA, (time - previousTime) / 1000);
  previousTime = time;

  ship.update(delta);

  // Camera follow
  let direction = new THREE.Vector3(0, 0.5, 1);
  direction.normalize();
  direction.applyQuaternion(ship.quaternion).setLength(CAMERA_DISTANCE);
  let cameraTargetPosition = ship.position.clone().add(direction);
  camera.position.lerp(cameraTargetPosition, CAMERA_VELOCITY * delta);
  camera.quaternion.slerp(ship.quaternion, CAMERA_VELOCITY * delta);

  renderer.render(scene, camera);

  //Update debugging text
  text.innerHTML = 'X: ' + ship.position.x +
    '<br/>Y: ' + ship.position.y +
    '<br/>Z: ' + ship.position.z;
  requestAnimationFrame(render);
}

loadPromise.then(() => {
  previousTime = new Date().getTime();
  render();
});
