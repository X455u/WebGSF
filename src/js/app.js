import THREE from 'three';

import Ship from './Ship';
import Planet from './Planet';
import ShotController from './ShotController';
import ParticleSystem from './ParticleSystem';

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
var ship;
let shotController = new ShotController(scene);
let particleSystem = new ParticleSystem(scene);
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
        // Thruster particles
        particleSystem.createEmitter({
          color: 0x0000ff,
          spawnRate: 1000,
          lifetime: 0.1,
          size: 0.1,
          bindTo: ship,
          offset: new THREE.Vector3(-0.8, 0.25, 0.9),
          r: 0.15,
          velocity: new THREE.Vector3(0, 0, 1.5),
          velocityRandomness: 0.4
        });
        scene.add(ship);
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
  particleSystem.update(delta);

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
