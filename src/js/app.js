import {Howl} from 'howler';
import * as THREE from 'three';
import mainTheme from '../assets/main_theme2.mp3';
import '../hud/menu.css';
import '../index.css';
import {GAME, SCENE} from './Game';
import {CAMERA} from './GSFCamera';
import {LOADER} from './GSFLoader';
import {HUD} from './HUD';
import Level2 from './levels/Level2';
import MenuLevel from './levels/MenuLevel';
import Missile from './Missile';
import {PLAYER} from './Player';

const menu = require('../hud/menu.html');

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

window.addEventListener(
  'resize',
  () => {
    CAMERA.aspect = window.innerWidth / window.innerHeight;
    CAMERA.updateProjectionMatrix();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

const main = document.createElement('div');
main.className = 'main';
main.innerHTML = menu;
document.body.appendChild(main);

const buttons = document.getElementsByClassName('button');
buttons.forEach(b => b.setAttribute('disabled', ''));
document.getElementById('menu').addEventListener(
  'transitionend',
  e => {
    e.srcElement.style.display = 'none';
  },
  {once: true}
);

// Loading
const loadingText = document.createElement('div');
loadingText.className = 'loading';
loadingText.innerHTML = 'Loading...';
document.body.appendChild(loadingText);
const loadingProgress = document.createElement('div');
loadingProgress.style.display = 'flex';
loadingText.appendChild(loadingProgress);
const loadingProgressCount = document.createElement('div');
loadingProgress.appendChild(loadingProgressCount);
const loadingProgressTotal = document.createElement('div');
loadingProgress.appendChild(loadingProgressTotal);

LOADER.manager.onStart = (url, itemsLoaded, itemsTotal) => {
  loadingProgressCount.innerHTML = itemsLoaded;
  loadingProgressTotal.innerHTML = '/' + itemsTotal;
};
LOADER.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  loadingProgressCount.innerHTML = itemsLoaded;
  loadingProgressTotal.innerHTML = '/' + itemsTotal;
};
LOADER.manager.onError = url => {
  console.error('Error loading: ' + url);
};

const music = new Howl({
  src: [mainTheme],
  loop: true,
  volume: 0.5
});
music.play();

let loop = true;

// Game Loop
let previousTime;
function render() {
  const time = new Date().getTime();
  const delta = Math.min(MAX_DELTA, (time - previousTime) / 1000);
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

  // let testLevel = new TestLevel();
  // testLevel.assetLoadedCallback = (assetsLoaded, assetKey) => {
  //   buttons.innerHTML = `Loaded: ${assetKey} ${assetsLoaded}/${Object.keys(testLevel.assets).length}`;
  // };
  // testLevel.enemySpawnedCallback = enemy => {
  //   enemy.addEventListener('onDamage', () => {
  //     if (enemy.hp === 0) {
  //       PLAYER.addPoints(100);
  //       // points.innerHTML = 'Points: ' + Math.floor(PLAYER.points);
  //     }
  //   });
  // };

  GAME.loadLevel(new Level2()).then(() => {
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

buttons.forEach(b => {
  b.addEventListener('click', () => {
    if (b.hasAttribute('disabled')) return;
    buttons.forEach(b2 => {
      b2.setAttribute('disabled', '');
    });
    b.setAttribute('selected', '');
    loop = false;
    initGame();
  });
});

LOADER.manager.onLoad = () => {
  GAME.loadLevel(new MenuLevel()).then(() => {
    previousTime = new Date().getTime();
    render();
    document.body.removeChild(loadingText);
    buttons.forEach(b => b.removeAttribute('disabled'));
  });
};
LOADER.load();

export const restartGame = ()=> {
  document.body.style.opacity = 0;
  document.body.addEventListener('transitionend', () => {
    GAME.loadLevel(new MenuLevel());
    setTimeout(() => {
      document.body.style.opacity = 1;
      const menuElement = document.getElementById('menu');
      menuElement.removeAttribute('hidden');
      menuElement.style.display = '';
      buttons.forEach(b => {
        b.removeAttribute('disabled');
        b.removeAttribute('selected');
      });
      HUD.updateHP(1);
      HUD.updateShield(1);
      menuElement.addEventListener('transitionend', (e) => {
        e.srcElement.style.display = 'none';
      }, {once: true});
    }, 500);
  }, {once: true});
}
;
