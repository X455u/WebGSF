import * as THREE from 'three';

import {HUD} from './HUD';
import Missile from './Missile';
import {PLAYER} from './Player';
import {Howl} from 'howler';
import {LOADER} from './GSFLoader';
import {GAME, SCENE} from './Game';
import {CAMERA} from './GSFCamera';
import TestLevel from './levels/TestLevel';
import MenuLevel from './levels/MenuLevel';

import '../hud/menu.css';
import '../index.css';
const menu = require('../hud/menu.html');

import mainTheme from '../assets/main_theme2.mp3';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}

const DEBUG = false;

const MAX_DELTA = 0.1; // s

const RENDERER = new THREE.WebGLRenderer({antialias: true, alpha: true});
RENDERER.setSize(window.innerWidth, window.innerHeight);
RENDERER.autoClear = false;
document.body.appendChild(RENDERER.domElement);
RENDERER.domElement.setAttribute('tabIndex', '0');
RENDERER.domElement.focus();
RENDERER.shadowMap.enabled = true;
RENDERER.shadowMap.type = THREE.PCFSoftShadowMap;

window.addEventListener('resize', () => {
  CAMERA.aspect = window.innerWidth / window.innerHeight;
  CAMERA.updateProjectionMatrix();
  RENDERER.setSize(window.innerWidth, window.innerHeight);
}, false);

let main = document.createElement('div');
main.className = 'main';
main.innerHTML = menu;
document.body.appendChild(main);
let newGameButton = document.getElementById('newGame');
newGameButton.setAttribute('disabled', '');
document.getElementById('menu').addEventListener('transitionend', (e) => {
  e.srcElement.style.display = 'none';
}, {once: true});

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

let music = new Howl({
  src: [mainTheme],
  loop: true,
  volume: 0.5
});
music.play();

let loop = true;

// Game Loop
let previousTime;
function render() {
  let time = new Date().getTime();
  let delta = Math.min(MAX_DELTA, (time - previousTime) / 1000);
  previousTime = time;

  PLAYER.update();
  // PLAYER.addPoints(delta);
  // if (!playerShip.removed) points.innerHTML = 'Points: ' + Math.floor(PLAYER.points);

  GAME.update(delta);

  CAMERA.update(delta);

  RENDERER.render(SCENE, CAMERA);

  // Update debugging text
  // if (DEBUG) {
  //   text.innerHTML = ['x', 'y', 'z'].map(x => x + ': ' + playerShip.position[x]).join('<br/>');
  //   fps = fps * 9.0 / 10.0;
  //   fps += (1.0 / (Math.max(delta, 0.01) * 10));
  //   text.innerHTML += '<br/>fps: ' + fps;
  // }

  if (loop) requestAnimationFrame(render);
}

function initGame() {
  // let points = document.createElement('div');
  // points.className = 'debug';
  // points.innerHTML = 'Points: ' + PLAYER.points;
  // document.body.appendChild(points);

  // Format debugging text
  let text;
  // let fps = 60.0;
  if (DEBUG) {
    text = document.createElement('div');
    text.className = 'debug';
    text.innerHTML = 'Loading...';
    document.body.appendChild(text);
  }

  let testLevel = new TestLevel();
  testLevel.assetLoadedCallback = (assetsLoaded, assetKey) => {
    newGameButton.innerHTML = `Loaded: ${assetKey} ${assetsLoaded}/${Object.keys(testLevel.assets).length}`;
  };
  testLevel.enemySpawnedCallback = (enemy) => {
    enemy.addEventListener('onDamage', () => {
      if (enemy.hp === 0) {
        PLAYER.addPoints(100);
        // points.innerHTML = 'Points: ' + Math.floor(PLAYER.points);
      }
    });
  };

  GAME.loadLevel(testLevel).then(() => {
    music.fade(music.volume(), 0, 2000);
    let playerShip = GAME.level.playerShip;

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
    document.getElementById('menu').setAttribute('hidden', '');

    loop = true;
    render();
  });
}

newGameButton.addEventListener('click', () => {
  if (newGameButton.hasAttribute('disabled')) return;
  newGameButton.setAttribute('disabled', '');
  loop = false;
  initGame();
});

LOADER.manager.onLoad = () => {
  GAME.loadLevel(new MenuLevel()).then(() => {
    previousTime = new Date().getTime();
    render();
    document.body.removeChild(loadingText);
    newGameButton.removeAttribute('disabled');
  });
};
LOADER.load();
