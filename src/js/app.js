import THREE from 'three';

import Ship from './Ship';
import Planet from './Planet';
import ShotController from './ShotController';
import ParticleSystem from './ParticleSystem';

const DEBUG = false;

const CAMERA_DISTANCE = 5;
const CAMERA_VELOCITY = 5;
const CAMERA_DIRECTION = new THREE.Vector3(0, 0.5, 1).normalize();

const LIGHT_VECTOR = new THREE.Vector3(0, 1000, 0);
const SPOTLIGHT_VECTOR = new THREE.Vector3(0, 0, -300);

const SHADOWS = true;

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
let spotlight = new THREE.SpotLight(0xffffff, 3, 1000);
light.position.copy(LIGHT_VECTOR);

if (SHADOWS) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  light.castShadow = true;
  light.shadowCameraNear = 10;
  light.shadowCameraFar = 2000;
  light.shadowCameraLeft = 100;
  light.shadowCameraRight = -100;
  light.shadowCameraTop = 100;
  light.shadowCameraBottom = -100;
  light.shadowBias = -0.001;
}
if (DEBUG) {
  scene.add(new THREE.CameraHelper(light.shadow.camera));
  scene.add(new THREE.CameraHelper(spotlight.shadow.camera));
}

scene.add(ambientLight);
scene.add(spotlight);
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
        ship = new Ship(mesh, shotController, particleSystem);
        if (SHADOWS) {
          ship.receiveShadow = true;
        }
        light.target = ship;
        scene.add(ship);
        done();
      });
    });
  });
});

// Planet testing
let planet = new Planet(500);
planet.position.y = -550;
if (SHADOWS) {
  planet.castShadow = true;
}
scene.add(planet);

// Format debugging text
let text;
if (DEBUG) {
  text = document.createElement('div');
  text.className = 'debug';
  text.innerHTML = 'Loading...';
  document.body.appendChild(text);
}

// Game Loop
let previousTime;
function render() {
  let time = new Date().getTime();
  let delta = Math.min(MAX_DELTA, (time - previousTime) / 1000);
  previousTime = time;

  ship.update(delta);
  particleSystem.update(delta);

  // light/shadow map follow
  light.position.copy(ship.position.clone().add(LIGHT_VECTOR));

  // Camera follow
  let direction = CAMERA_DIRECTION.clone();
  direction.applyQuaternion(ship.quaternion).setLength(CAMERA_DISTANCE);
  let cameraTargetPosition = ship.position.clone().add(direction);
  camera.position.lerp(cameraTargetPosition, CAMERA_VELOCITY * delta);
  camera.quaternion.slerp(ship.quaternion, CAMERA_VELOCITY * delta);

  // update spotlight position and direction
  direction = SPOTLIGHT_VECTOR.clone();
  direction.applyQuaternion(ship.quaternion);
  spotlight.position.copy(ship.position);
  spotlight.target.quaternion.copy(ship.quaternion).inverse();
  spotlight.target.position.copy(ship.position.clone().add(direction));
  spotlight.target.updateMatrixWorld();

  renderer.render(scene, camera);

  //Update debugging text
  if (DEBUG) {
    text.innerHTML = ['x', 'y', 'z'].map(x => x + ': ' + ship.position[x]).join('<br/>');
  }

  requestAnimationFrame(render);
}

loadPromise.then(() => {
  previousTime = new Date().getTime();
  render();
});
