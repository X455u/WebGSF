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
import PlasmaTurret from './PlasmaTurret';
import {TURRET_AI} from './TurretAI';
import Crosshair from './Crosshair';
import LandingPad from './LandingPad';
import TwinTurret from './TwinTurret';

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
      ambientLight: () => {
        let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        SCENE.add(ambientLight);
        return ambientLight;
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
        playerShip.team = 1;
        PLAYER.crosshair = new Crosshair(CAMERA);
        PLAYER.setShip(playerShip);
        CAMERA.setTarget(playerShip);
        return playerShip;
      },
      turrets: () => {
        let turrets = [];
        for (let i = 0; i < 10; i++) {
          let turret = new PlasmaTurret();
          let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          turret.position.copy(direction).setLength(this.mars.radius);
          turret.position.add(this.mars.position);
          turret.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
          turret.AItarget = this.playerShip;
          turret.ai = TURRET_AI;
          turrets.push(turret);
        }
        return turrets;
      },
      landingPads: () => {
        let landingPads = [];
        for (let i = 0; i < 10; i++) {
          let landingPad = new LandingPad();
          let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          landingPad.position.copy(direction).setLength(this.mars.radius);
          landingPad.position.add(this.mars.position);
          landingPad.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
          landingPads.push(landingPad);
        }
        return landingPads;
      },
      twinTurrets: () => {
        let twinTurrets = [];
        for (let i = 0; i < 10; i++) {
          let twinTurret = new TwinTurret();
          let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          twinTurret.position.copy(direction).setLength(this.mars.radius);
          twinTurret.position.add(this.mars.position);
          twinTurret.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
          twinTurrets.push(twinTurret);
        }
        return twinTurrets;
      },
      fighterSpawner: () => {
        let enemies = [];
        let fighterSpawner = setInterval(() => {
          let enemyShip = new Fighter();
          enemyShip.position.subVectors(this.mars.position, this.playerShip.position).setLength(this.mars.radius + 30);
          enemyShip.position.add(this.mars.position);
          enemyShip.ai = FIGHTER_AI;
          enemyShip.team = 2;
          enemies.push(enemyShip);
          if (this.enemySpawnedCallback) this.enemySpawnedCallback(enemyShip);
        }, 10000);
        return fighterSpawner;
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
