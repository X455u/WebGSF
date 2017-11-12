import * as THREE from 'three';

import {GAME, SCENE} from './Game';
import {LOADER} from './GSFLoader';
import Sun from './Sun';
import SimpleMars from './SimpleMars';
import SimpleEarth from './SimpleEarth';
import Fighter from './Fighter';
import {FIGHTER_AI} from './FighterAI';
import Turret from './Turret';
import {TURRET_AI} from './TurretAI';

/**
 * Calls this.enemySpawnedCallback when spawning enemy fighters.
 */
class TestLevel {
  constructor(playerShip) {
    // Sun
    let sun = new Sun();
    sun.position.z = 10000;
    SCENE.add(sun);

    // Background
    let material = new THREE.MeshBasicMaterial({
      map: LOADER.get('backgroundTexture'),
      side: THREE.BackSide,
      color: 0x555555
    });
    let geometry = new THREE.SphereGeometry(100000, 32, 32);
    let stars = new THREE.Mesh(geometry, material);
    SCENE.add(stars);

    // Planets
    let mars = new SimpleMars(550, 4);
    mars.position.y = -600;
    GAME.addStatic(mars, true);

    let earth = new SimpleEarth(1000, 5);
    earth.position.x = 2000;
    earth.position.z = 2000;
    GAME.addStatic(earth, true);

    // Enemies
    // Turrets
    for (let i = 0; i < 10; i++) {
      let turret = new Turret();
      let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      turret.position.copy(direction).setLength(mars.hitRadius);
      turret.position.add(mars.position);
      turret.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      turret.AItarget = playerShip;
      turret.ai = TURRET_AI;
    }

    // Fighters
    let enemies = [];
    this.enemySpawnFunctionId = setInterval(() => {
      let enemyShip = new Fighter();
      enemyShip.position.subVectors(mars.position, playerShip.position).setLength(mars.hitRadius + 30);
      enemyShip.position.add(mars.position);
      enemyShip.AItarget = playerShip;
      enemyShip.ai = FIGHTER_AI;
      enemies.push(enemyShip);
      if (this.enemySpawnedCallback) this.enemySpawnedCallback(enemyShip);
    }, 10000);
  }

  clear() {
    clearInterval(this.enemySpawnFunctionId);
  }
}
export default TestLevel;
