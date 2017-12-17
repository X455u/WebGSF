import * as THREE from 'three';

import Level from './Level';
import {SCENE} from './Game';
import {PLAYER} from './Player';
import {CAMERA} from './GSFCamera';
import {LOADER} from './GSFLoader';
import Sun from './Sun';
import SimpleMars from './SimpleMars';
import SimpleEarth from './SimpleEarth';
import Fighter from './Fighter';
import {FIGHTER_AI} from './FighterAI';
import Turret from './Turret';
import {TURRET_AI} from './TurretAI';
import Crosshair from './Crosshair';
import Tank from './Tank';

/**
 * Calls this.enemySpawnedCallback when spawning enemy fighters.
 */
class TestLevel extends Level {
  constructor() {
    super();

    this.assets = {
      sun: () => {
        let sun = new Sun();
        return sun;
      },
      background: () => {
        let material = new THREE.MeshBasicMaterial({
          map: LOADER.get('backgroundTexture'),
          side: THREE.BackSide,
          color: 0x555555
        });
        let geometry = new THREE.SphereGeometry(100000, 32, 32);
        let stars = new THREE.Mesh(geometry, material);
        SCENE.add(stars);
        return stars;
      },
      mars: () => {
        let mars = new SimpleMars(550, 4);
        mars.position.y = -600;
        return mars;
      },
      earth: () => {
        let earth = new SimpleEarth(1000, 5);
        earth.position.x = 2000;
        earth.position.z = 2000;
        return earth;
      },
      playerShip: () => {
        let playerShip = new Fighter();
        PLAYER.crosshair = new Crosshair(CAMERA);
        PLAYER.setShip(playerShip);
        CAMERA.setTarget(playerShip);
        return playerShip;
      },
      turrets: () => {
        let turrets = [];
        for (let i = 0; i < 10; i++) {
          let turret = new Turret();
          let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          turret.position.copy(direction).setLength(this.mars.hitRadius);
          turret.position.add(this.mars.position);
          turret.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
          turret.AItarget = this.playerShip;
          turret.ai = TURRET_AI;
          turrets.push(turret);
        }
      },
      fighterSpawner: () => {
        let enemies = [];
        let fighterSpawner = setInterval(() => {
          let enemyShip = new Fighter();
          enemyShip.position.subVectors(this.mars.position, this.playerShip.position).setLength(this.mars.hitRadius + 30);
          enemyShip.position.add(this.mars.position);
          enemyShip.AItarget = this.playerShip;
          enemyShip.ai = FIGHTER_AI;
          enemies.push(enemyShip);
          if (this.enemySpawnedCallback) this.enemySpawnedCallback(enemyShip);
        }, 10000);
        return fighterSpawner;
      },
      tanks: () => {
        let tanks = [];
        for (let i = 0; i < 100; i++) {
          let tank = new Tank();
          let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          tank.position.copy(direction).setLength(this.mars.hitRadius);
          tank.position.add(this.mars.position);
          tank.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
          tank.planet = this.mars;
          tank.target = this.playerShip;
          tanks.push(tank);
        }
      }
    };
  }

  clear() {
    clearInterval(this.fighterSpawner);
  }

  update() {
    this.sun.target.position.copy(this.playerShip.position);
    this.sun.position.copy(this.playerShip.position);
    this.sun.position.x += 500;
    this.sun.position.y += 500;
    this.sun.position.z -= 1000;
  }
}
export default TestLevel;
