import * as THREE from 'three';

import Level from './Level';
import {SCENE} from './Game';
import {LOADER} from './GSFLoader';
import Sun from './Sun';
import SimpleEarth from './SimpleEarth';
import Fighter from './Fighter';
import {FIGHTER_AI} from './FighterAI';
// import {CAMERA} from './GSFCamera';

class MenuLevel extends Level {
  constructor(playerShip) {
    super();
    this.playerShip = playerShip;

    this.assets = {
      sun: () => {
        let sun = new Sun();
        sun.position.x = -6000;
        sun.position.y = 4000;
        sun.position.z = -6000;
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
      earth: () => {
        let earth = new SimpleEarth(1000, 5);
        earth.position.y = -1100;
        earth.position.z = -500;
        earth.rotateX(Math.random() * 2 * Math.PI);
        earth.rotateY(Math.random() * 2 * Math.PI);
        earth.rotateZ(Math.random() * 2 * Math.PI);
        return earth;
      },
      fighters: () => {
        let fighters = [];
        for (let i = 0; i < 10; i++) {
          let ship1 = new Fighter();
          ship1.position.set(-75 + 10 * (Math.random() - 0.5), 0 + 10 * (Math.random() - 0.5), -20 + 10 * (Math.random() - 0.5));
          ship1.ai = FIGHTER_AI;
          let ship2 = new Fighter();
          ship2.position.set(75 + 10 * (Math.random() - 0.5), 0 + 10 * (Math.random() - 0.5), -20 + 10 * (Math.random() - 0.5));
          ship2.ai = FIGHTER_AI;
          ship1.AItarget = ship2;
          ship2.AItarget = ship1;
        }
        return fighters;
      }
    };
  }

  update(delta) {
    this.earth.rotateY(0.02 * delta);
  }

  clear() {

  }
}
export default MenuLevel;
