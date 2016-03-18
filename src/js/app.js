import THREE from 'three';

import Ship from './Ship';
import Planet from './Planet';
import Shots from './Shots';
import ParticleSystem from './ParticleSystem';
import Crosshair from './Crosshair';
import Physics from './Physics';
import GameObjects from './GameObjects';

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

let physics = new Physics();

scene.add(ambientLight);
scene.add(spotlight);
scene.add(light);
camera.position.z = CAMERA_DISTANCE;

// prepare loader and load the model
let loader = new THREE.JSONLoader();
let texLoader = new THREE.TextureLoader();
let ship;
let shots = new Shots(scene);
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
        let mesh = new THREE.Mesh(geometry, material);
        ship = new Ship(mesh, shots, particleSystem, physics);
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
let planet = new Planet(400, physics);
planet.position.y = -500;
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

let game = {
  scene: scene,
  physics: physics,
  shots: shots
};
let objects = new GameObjects(game);
game.objects = objects;

let turret1 = objects.create('turretBasic');
turret1.physical.position.z = -50;
let turret2 = objects.create('turretBasic');
turret2.physical.position.z = -50;
turret2.physical.position.x = -50;
let turret3 = objects.create('turretBasic');
turret3.physical.position.z = -50;
turret3.physical.position.x = 50;

// Game Loop
let previousTime;
function render() {
  let time = new Date().getTime();
  let delta = Math.min(MAX_DELTA, (time - previousTime) / 1000);
  previousTime = time;

  ship.update(delta);
  particleSystem.update(delta);
  crosshair.update([planet]);
  physics.update(delta);
  objects.update(delta);
  turret1.visual.lookAt(ship.position);
  turret2.visual.lookAt(ship.position);
  turret3.visual.lookAt(ship.position);

  // light/shadow map follow
  light.position.copy(ship.position.clone().add(LIGHT_VECTOR));

  // Camera follow
  // let direction = CAMERA_DIRECTION.clone();
  // direction.applyQuaternion(ship.quaternion).setLength(CAMERA_DISTANCE);
  // let cameraTargetPosition = ship.position.clone().add(direction);
  // // camera.position.lerp(cameraTargetPosition, CAMERA_VELOCITY * delta);
  // camera.position.copy(cameraTargetPosition);
  // camera.quaternion.slerp(ship.quaternion, CAMERA_VELOCITY * delta);

  // An effort to smoothen camera behaviour
  let currentV = new THREE.Vector3(0, 0, -1);
  currentV.applyQuaternion(camera.quaternion);
  currentV.normalize();
  let targetV = new THREE.Vector3();
  targetV.subVectors(ship.position, camera.position);
  targetV.normalize();
  let rotQuaternion = new THREE.Quaternion();
  rotQuaternion.setFromUnitVectors(currentV, targetV);
  let targetQuaternion = new THREE.Quaternion();
  targetQuaternion.copy(camera.quaternion);
  targetQuaternion.multiply(rotQuaternion);
  camera.quaternion.slerp(targetQuaternion, 0.1);

  // let newForwardUnit = new THREE.Vector3();
  // newForwardUnit.subVectors(ship.position, camera.position);
  // let rotAxis = new THREE.Vector3();
  // let avatarForwardUnit = new THREE.Vector3(0, 0, -1);
  // avatarForwardUnit.applyQuaternion(camera.quaternion);
  // rotAxis.crossVectors(avatarForwardUnit.normalize(), newForwardUnit.normalize());
  // let rotAngle = avatarForwardUnit.angleTo(newForwardUnit);
  // let rotQuaternion = new THREE.Quaternion();
  // rotQuaternion.setFromAxisAngle(rotAxis.normalize(), rotAngle);
  // let newQuaternion = new THREE.Quaternion();
  // newQuaternion.multiplyQuaternions(camera.quaternion, rotQuaternion);
  // camera.quaternion.copy(newQuaternion);

  // let v1 = new THREE.Vector3(0, 0, -1);
  // v1.applyQuaternion(camera.quaternion);
  // let v2 = camera.position.clone().sub(ship.position);
  // let camCrossV = new THREE.Vector3();
  // camCrossV.crossVectors(v1, v2);
  // // let cameraW = Math.sqrt(Math.pow(v1.length(), 2) * Math.pow(v2.length(), 2)) + v1.dot(v2);
  // let cameraQuaternion = new THREE.Quaternion();
  // // cameraQuaternion.set(camV.x, camV.y, camV.z, v1.dot(v2)).normalize();
  // cameraQuaternion.setFromAxisAngle(camCrossV, -v1.angleTo(v2));
  // let cameraTarget = new THREE.Quaternion();
  // cameraTarget.copy(camera.quaternion);
  // cameraTarget.multiply(cameraQuaternion);
  // if (cameraTarget !== null) {
  //   if (v1.angleTo(v2) > 0.01 && v1.angleTo(v2) < 30) {
  //     camera.quaternion.slerp(cameraTarget, 0.01);
  //   }
  // }

  // let cameraTargetPosition = CAMERA_DIRECTION.clone();
  // cameraTargetPosition.applyQuaternion(ship.quaternion).setLength(CAMERA_DISTANCE);
  // let cameraPosition = camera.position.sub(ship.position);
  // cameraPosition.lerp(cameraTargetPosition, 4 * CAMERA_VELOCITY * delta);
  // camera.position.copy(ship.position.clone().add(cameraPosition));
  // camera.quaternion.slerp(ship.quaternion, 4 * CAMERA_VELOCITY * delta);

  // update spotlight position and direction
  let spotLightDirection = SPOTLIGHT_VECTOR.clone();
  spotLightDirection.applyQuaternion(ship.quaternion);
  spotlight.position.copy(ship.position);
  spotlight.target.quaternion.copy(ship.quaternion).inverse();
  spotlight.target.position.copy(ship.position.clone().add(spotLightDirection));
  spotlight.target.updateMatrixWorld();

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
  previousTime = new Date().getTime();
  render();
});
