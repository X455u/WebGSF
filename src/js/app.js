import THREE from 'three';

import Ship from './Ship';
import Terrain from './Terrain';
import ShotController from './ShotController'

const CAMERA_DISTANCE = 4;
const CAMERA_VELOCITY = 5;

const MAX_DELTA = 0.1; // s

let scene = new THREE.Scene();
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.setAttribute('tabIndex', '0');
renderer.domElement.focus();

let ambientLight = new THREE.AmbientLight(0x222222, 0.1);
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0.2, 0.2, 0.8);
scene.add(ambientLight);
scene.add(light);
camera.position.z = CAMERA_DISTANCE;

// prepare loader and load the model
let loader = new THREE.ObjectLoader();
let ship;
let shotController = new ShotController(scene);
let loadPromise = new Promise(done => {
  loader.load('./media/star-wars-vader-tie-fighter.json', function(object) {
    ship = new Ship(object, shotController);
    scene.add(ship);
    done();
  });
});

// Terrain testing
let map = new Terrain();
map.rotation.x = -0.8;
map.position.x = -10;
map.position.y = -10;
map.position.z = -10;
scene.add(map);

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
