import * as THREE from 'three';

import Ship from './Ship';
import Planet from './Planet';
import ShotController from './ShotController';
import ParticleSystem from './ParticleSystem';
import Crosshair from './Crosshair';
import EnemyShip from './EnemyShip';
import HUD from './HUD';
import Sun from './Sun';
import {Howl} from 'howler';
import {loader} from './GSFLoader';

const DEBUG = false;

const CAMERA_DISTANCE = 5;
const CAMERA_VELOCITY = 5;
const CAMERA_DIRECTION = new THREE.Vector3(0, 0.5, -1).normalize();

const SPOTLIGHT_VECTOR = new THREE.Vector3(0, 0, 300);

const MAX_DELTA = 0.1; // s

// Loading
let loadingText = document.createElement('div');
loadingText.className = 'loading';
loadingText.innerHTML = 'Loading...';
document.body.appendChild(loadingText);
let loadingProgress = document.createElement('div');
loadingProgress.style.display = 'flex';
loadingText.appendChild(loadingProgress);
let loadingProgressCount = document.createElement('div');
loadingProgress.appendChild(loadingProgressCount);
let loadingProgressTotal = document.createElement('div');
loadingProgress.appendChild(loadingProgressTotal);

loader.manager.onStart = (url, itemsLoaded, itemsTotal) => {
  loadingProgressCount.innerHTML = itemsLoaded;
  loadingProgressTotal.innerHTML = '/' + itemsTotal;
};
loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  loadingProgressCount.innerHTML = itemsLoaded;
  loadingProgressTotal.innerHTML = '/' + itemsTotal;
};
loader.manager.onError = (url) => {
  console.error('Error loading: ' + url);
};

function initGame() {
  console.log('Loading complete!');
  let music = new Howl({
    src: ['./media/main_theme2.mp3'],
    loop: true,
    volume: 0.5
  });
  music.play();


  let scene = new THREE.Scene();
  let aspect = window.innerWidth / window.innerHeight;
  let camera = new THREE.PerspectiveCamera(75, aspect, 1, 1000000);
  let renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  document.body.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('tabIndex', '0');
  renderer.domElement.focus();

  let ambientLight = new THREE.AmbientLight(0x222222, 0.1);
  let spotlight = new THREE.SpotLight(0xffffff, 3, 1000);

  scene.add(ambientLight);
  scene.add(spotlight);
  camera.position.z = -CAMERA_DISTANCE;
  camera.rotateOnAxis(camera.up, Math.PI);

  let shotController = new ShotController(scene);
  let particleSystem = new ParticleSystem(scene);



// Load player ship
  let mesh = new THREE.Mesh(loader.get('fighterGeometry'), loader.get('fighterMaterial'));
  let ship = new Ship(mesh, shotController, particleSystem);
  ship.isPlayer = true;
  shotController.addHitbox(ship);
  scene.add(ship);
  let crosshair = new Crosshair(scene, camera, ship);
// Planet testing
  let planet = new Planet(500);
  planet.position.y = -800;
  scene.add(planet);
  shotController.addHitbox(planet);

// Sun
  let sun = new Sun();
  sun.position.z = 10000;
  scene.add(sun);

// Background
  let material = new THREE.MeshBasicMaterial({
    map: loader.get('backgroundTexture'),
    side: THREE.BackSide,
    color: 0x555555
  });
  let geometry = new THREE.SphereGeometry(100000, 32, 32);
  let stars = new THREE.Mesh(geometry, material);
  scene.add(stars);

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
  for (let i = 0; i < 5; i++) {
    let enemy = new EnemyShip(loader.get('fighterGeometry'), loader.get('fighterMaterial'), shotController, particleSystem);
    let offset = new THREE.Vector3(Math.random(), Math.random(), Math.random());
    offset.multiplyScalar(i * 5);
    enemy.position.add(offset);
    enemy.target = ship;
    scene.add(enemy);
    enemies.push(enemy);
    shotController.addHitbox(enemy);
  }

// HUD
  let hud = new HUD(window);
  hud.createBasicHUD();

// Game Loop
  let previousTime;
  function render() {
    let time = new Date().getTime();
    let delta = Math.min(MAX_DELTA, (time - previousTime) / 1000);
    previousTime = time;

    ship.update(delta);
    particleSystem.update(delta);
    crosshair.update([planet, ...enemies]);

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
    renderer.render(hud.scene, hud.camera);

  //Update debugging text
    if (DEBUG) {
      text.innerHTML = ['x', 'y', 'z'].map(x => x + ': ' + ship.position[x]).join('<br/>');
      fps = fps * 9.0 / 10.0;
      fps += (1.0 / (Math.max(delta, 0.01) * 10));
      text.innerHTML += '<br/>fps: ' + fps;
    }

    requestAnimationFrame(render);
  }

  previousTime = new Date().getTime();
  render();
}

loader.manager.onLoad = () => {
  initGame();
};
loader.load();
