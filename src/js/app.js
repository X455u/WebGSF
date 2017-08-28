import THREE from 'three';

import Ship from './Ship';
import Planet from './Planet';
import ShotController from './ShotController';
import ParticleSystem from './ParticleSystem';
import Crosshair from './Crosshair';
import EnemyShip from './EnemyShip';

const DEBUG = false;

const CAMERA_DISTANCE = 5;
const CAMERA_VELOCITY = 5;
const CAMERA_DIRECTION = new THREE.Vector3(0, 0.5, -1).normalize();

const LIGHT_VECTOR = new THREE.Vector3(0, 1000, 0);
const SPOTLIGHT_VECTOR = new THREE.Vector3(0, 0, 300);

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
camera.position.z = -CAMERA_DISTANCE;
camera.rotateOnAxis(camera.up, Math.PI);

// prepare loader and load the model
let loader = new THREE.JSONLoader();
let texLoader = new THREE.TextureLoader();
let ship;
let shipGeometry;
let shipMaterial;
let shotController = new ShotController(scene);
let particleSystem = new ParticleSystem(scene);
let crosshair;
let loadPromise = new Promise(done => {
  texLoader.load('./media/spaceship_comp.png', function(texture) {
    texLoader.load('./media/spaceship_nor.png', function(normalMap) {
      loader.load('./media/nicce_fighter.json', function(geometry) {
        let material = new THREE.MeshPhongMaterial({
          map: texture,
          normalMap: normalMap
        });
        geometry.scale(0.5, 0.5, 0.5);
        geometry.rotateY(Math.PI);
        let mesh = new THREE.Mesh(geometry, material);
        shipGeometry = geometry;
        shipMaterial = material;
        ship = new Ship(mesh, shotController, particleSystem);
        if (SHADOWS) {
          ship.receiveShadow = true;
        }
        light.target = ship;
        scene.add(ship);
        crosshair = new Crosshair(scene, camera, ship);
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
let fps = 60.0;
if (DEBUG) {
  text = document.createElement('div');
  text.className = 'debug';
  text.innerHTML = 'Loading...';
  document.body.appendChild(text);
}

// Enemies
let enemies = [];
function initEnemies() {
  for (let i = 0; i < 5; i++) {
    let enemy = new EnemyShip(shipGeometry, shipMaterial, shotController, particleSystem);
    let offset = new THREE.Vector3(Math.random(), Math.random(), Math.random());
    offset.multiplyScalar(i * 5);
    enemy.position.add(offset);
    enemy.target = ship;
    scene.add(enemy);
    enemies.push(enemy);
  }
}

// Game Loop
let previousTime;
function render() {
  let time = new Date().getTime();
  let delta = Math.min(MAX_DELTA, (time - previousTime) / 1000);
  previousTime = time;

  ship.update(delta);
  particleSystem.update(delta);
  crosshair.update([planet]);

  // light/shadow map follow
  light.position.copy(ship.position.clone().add(LIGHT_VECTOR));

  // Camera follow
  let direction = CAMERA_DIRECTION.clone();
  direction.applyQuaternion(ship.quaternion).setLength(CAMERA_DISTANCE);
  let cameraTargetPosition = ship.position.clone().add(direction);
  camera.position.lerp(cameraTargetPosition, CAMERA_VELOCITY * delta);
  let quaternion = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
  quaternion.multiplyQuaternions(ship.quaternion, quaternion);
  camera.quaternion.slerp(quaternion, CAMERA_VELOCITY * delta);

  // update spotlight position and direction
  direction = SPOTLIGHT_VECTOR.clone();
  direction.applyQuaternion(ship.quaternion);
  spotlight.position.copy(ship.position);
  spotlight.target.position.copy(ship.position.clone().add(direction));
  spotlight.target.updateMatrixWorld();

  // Enemies
  for (let enemy of enemies) {
    enemy.update(delta);
  }

  shotController.update(delta);

  renderer.render(scene, camera);

  //Update debugging text
  if (DEBUG) {
    text.innerHTML = ['x', 'y', 'z'].map(x => x + ': ' + ship.position[x]).join('<br/>');
    fps = fps * 9.0 / 10.0;
    fps += (1.0 / (Math.max(delta, 0.01) * 10));
    text.innerHTML += '<br/>fps: ' + fps;
  }

  requestAnimationFrame(render);
}

loadPromise.then(() => {
  initEnemies();
  previousTime = new Date().getTime();
  render();
});
