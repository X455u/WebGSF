import * as THREE from 'three';

import Crosshair from './Crosshair';
import {HUD} from './HUD';
import Fighter from './Fighter';
import Missile from './Missile';
import {player} from './Player';
import {Howl} from 'howler';
import {LOADER} from './GSFLoader';
import {GAME, SCENE, SOUND_LISTENER} from './Game';
import {CAMERA} from './GSFCamera';
import TestLevel from './TestLevel';

import '../hud/menu.css';
const menu = require('../hud/menu.html');

const DEBUG = false;

const SPOTLIGHT_VECTOR = new THREE.Vector3(0, 0, 300);

const MAX_DELTA = 0.1; // s

let main = document.createElement('div');
main.className = 'main';
main.innerHTML = menu;
document.body.appendChild(main);
let newGameButton = document.getElementById('newGame');
newGameButton.setAttribute('disabled', '');

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

LOADER.manager.onStart = (url, itemsLoaded, itemsTotal) => {
  loadingProgressCount.innerHTML = itemsLoaded;
  loadingProgressTotal.innerHTML = '/' + itemsTotal;
};
LOADER.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  loadingProgressCount.innerHTML = itemsLoaded;
  loadingProgressTotal.innerHTML = '/' + itemsTotal;
};
LOADER.manager.onError = (url) => {
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

  let points = document.createElement('div');
  points.className = 'debug';
  points.innerHTML = 'Points: ' + player.points;
  document.body.appendChild(points);

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

  // Load player ship
  let playerShip = new Fighter();
  player.setShip(playerShip);
  CAMERA.setTarget(playerShip);

  let crosshair = new Crosshair(CAMERA, playerShip);

  // Format debugging text
  let text;
  let fps = 60.0;
  if (DEBUG) {
    text = document.createElement('div');
    text.className = 'debug';
    text.innerHTML = 'Loading...';
    document.body.appendChild(text);
  }

  playerShip.addEventListener('onDamage', () => {
    HUD.updateHP(playerShip.hp / playerShip.maxHp);
    HUD.updateShield(playerShip.shield / playerShip.maxShield);
  });

  // Missiles
  playerShip.shootMissile = () => {
    let missile = new Missile();
    missile.position.copy(playerShip.position);
    missile.quaternion.copy(playerShip.quaternion);
    missile.translateY(-1);
    missile.owner = playerShip;
  };

  // Sounds
  CAMERA.add(SOUND_LISTENER);

  let enemies = [];
  for (let gameObject of GAME.objects) {
    if (gameObject instanceof Fighter && gameObject !== playerShip) {
      enemies.push(gameObject);
    }
  }
  let testLevel = new TestLevel(playerShip);
  testLevel.enemySpawnedCallback = (enemy) => {
    enemy.addEventListener('onDamage', () => {
      if (enemy.hp === 0 && enemies.indexOf(enemy) > -1) {
        let index = enemies.indexOf(enemy);
        if (index > -1) enemies.splice(index, 1);
        player.addPoints(100);
        points.innerHTML = 'Points: ' + Math.floor(player.points);
      }
    });
  };

  // Game Loop
  let previousTime;
  function render() {
    let time = new Date().getTime();
    let delta = Math.min(MAX_DELTA, (time - previousTime) / 1000);
    previousTime = time;

    player.update();
    player.addPoints(delta);
    if (!playerShip.removed) points.innerHTML = 'Points: ' + Math.floor(player.points);
    crosshair.update(enemies);

    GAME.update(delta);

    CAMERA.update(delta);

    // update spotlight position and direction
    let direction = SPOTLIGHT_VECTOR.clone();
    direction.applyQuaternion(playerShip.quaternion);
    spotlight.position.copy(playerShip.position);
    spotlight.target.position.copy(playerShip.position.clone().add(direction));
    spotlight.target.updateMatrixWorld();

    renderer.render(SCENE, CAMERA);

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

newGameButton.addEventListener('click', () => {
  if (newGameButton.hasAttribute('disabled')) return;
  newGameButton.setAttribute('disabled', '');
  document.getElementById('menu').setAttribute('hidden', '');
  setTimeout(initGame, 1); // Allows css animations to start
});

LOADER.manager.onLoad = () => {
  document.body.removeChild(loadingText);
  newGameButton.removeAttribute('disabled');
};
LOADER.load();
