import * as THREE from 'three';

import Planet from './Planet';
import {shotController} from './ShotController';
import Crosshair from './Crosshair';
import HUD from './HUD';
import Sun from './Sun';
import Fighter from './Fighter';
import {FIGHTER_AI} from './FighterAI';
import {player} from './Player';
import {Howl} from 'howler';
import {loader} from './GSFLoader';
import {SCENE, PLANETS} from './Game';

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

  let aspect = window.innerWidth / window.innerHeight;
  let camera = new THREE.PerspectiveCamera(75, aspect, 1, 1000000);
  let renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  document.body.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('tabIndex', '0');
  renderer.domElement.focus();

  let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  let spotlight = new THREE.SpotLight(0xffffff, 3, 300, 0.9, 0.75, 1.5);

  SCENE.add(ambientLight);
  SCENE.add(spotlight);
  camera.position.z = -CAMERA_DISTANCE;
  camera.rotateOnAxis(camera.up, Math.PI);

  // Load player ship
  let playerShip = new Fighter();
  playerShip.isPlayer = true;
  playerShip.name = 'Player';
  player.setShip(playerShip);
  shotController.addShootable(playerShip);
  SCENE.add(playerShip);
  let crosshair = new Crosshair(camera, playerShip);

  // Planet testing
  let planet = new Planet(500);
  planet.isPlanet = true;
  planet.position.y = -800;
  SCENE.add(planet);
  shotController.addShootable(planet);
  PLANETS.push(planet);

  // Sun
  let sun = new Sun();
  sun.position.z = 10000;
  SCENE.add(sun);

  // Background
  let material = new THREE.MeshBasicMaterial({
    map: loader.get('backgroundTexture'),
    side: THREE.BackSide,
    color: 0x555555
  });
  let geometry = new THREE.SphereGeometry(100000, 32, 32);
  let stars = new THREE.Mesh(geometry, material);
  SCENE.add(stars);

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
    let enemyShip = new Fighter();
    let offset = new THREE.Vector3(Math.random(), Math.random(), Math.random());
    offset.multiplyScalar(i * 5);
    enemyShip.position.add(offset);
    enemyShip.target = playerShip;
    enemyShip.ai = FIGHTER_AI;
    SCENE.add(enemyShip);
    enemies.push(enemyShip);
    shotController.addShootable(enemyShip);
    enemyShip.name = 'Enemy ' + i;
  }

  // HUD
  let hud = new HUD();

  playerShip.addEventListener('onDamage', () => {
    hud.update(playerShip.hp / playerShip.maxHp, playerShip.shield / playerShip.maxShield);
  });

  // Game Loop
  let previousTime;
  function render() {
    let time = new Date().getTime();
    let delta = Math.min(MAX_DELTA, (time - previousTime) / 1000);
    previousTime = time;

    player.update();
    playerShip.update(delta, camera.position);
    crosshair.update([planet, ...enemies]);

    // Enemies
    for (let enemy of enemies) {
      enemy.update(delta, camera.position);
    }

    // Camera follow
    let direction = CAMERA_DIRECTION.clone();
    direction.applyQuaternion(playerShip.quaternion).setLength(CAMERA_DISTANCE);
    let cameraTargetPosition = playerShip.position.clone().add(direction);
    camera.position.lerp(cameraTargetPosition, CAMERA_VELOCITY * delta);
    let quaternion = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    quaternion.multiplyQuaternions(playerShip.quaternion, quaternion);
    camera.quaternion.slerp(quaternion, CAMERA_VELOCITY * delta);

    // update spotlight position and direction
    direction = SPOTLIGHT_VECTOR.clone();
    direction.applyQuaternion(playerShip.quaternion);
    spotlight.position.copy(playerShip.position);
    spotlight.target.position.copy(playerShip.position.clone().add(direction));
    spotlight.target.updateMatrixWorld();

    shotController.update(delta);

    renderer.render(SCENE, camera);
    renderer.render(hud.scene, hud.camera);

    //Update debugging text
    if (DEBUG) {
      text.innerHTML = ['x', 'y', 'z'].map(x => x + ': ' + playerShip.position[x]).join('<br/>');
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
  document.body.removeChild(loadingText);
  initGame();
};
loader.load();
