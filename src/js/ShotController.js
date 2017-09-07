import * as THREE from 'three';
import {SCENE} from './Game';
import Ship from './Ship';

const RAYCASTER = new THREE.Raycaster();
const NEAR = 0;
const FAR = 300;

class ShotController {

  constructor() {
    this.shots = [];
    this.shootables = [];

    RAYCASTER.near = NEAR;
    this.hitCounterPlayer = 0;
    this.hitCounterPlanet = 0;
  }

  update(delta) {
    RAYCASTER.far = FAR * delta;
    this.shots.forEach(shot => {
      shot.update(delta);
      if (shot.lifetimeLeft <= 0.0) {
        SCENE.remove(shot);
        this.shots.splice(this.shots.indexOf(shot), 1);
      }

      for (let shootable of this.shootables) {
        let direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(shot.quaternion);
        RAYCASTER.set(shot.position, direction);
        let intersections = RAYCASTER.intersectObject(shootable);
        if (intersections.length !== 0) {
          shot.isDead = true;
          let hitObject = intersections[0].object;
          if (hitObject instanceof Ship) hitObject.damage(shot.damage);
        }
      }
    });

    let i = 0;
    while (this.shots[i]) {
      let shot = this.shots[i];
      if (shot.isDead) {
        SCENE.remove(shot);
        this.shots.splice(this.shots.indexOf(shot), 1);
      } else {
        i++;
      }
    }
  }

  add(shot) {
    SCENE.add(shot);
    this.shots.push(shot);
  }

  addShootable(mesh) {
    this.shootables.push(mesh);
  }

}
export const shotController = new ShotController();
