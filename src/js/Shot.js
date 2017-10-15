import * as THREE from 'three';
import GameObject from './GameObject';
import {GAME, SHOOTABLES} from './Game';

class Shot extends GameObject {
  constructor(geometry, material) {
    super(geometry, material);
    this.velocity = 300;
    this.lifetime = 5;
    this.damage = 1;
    this.owner = null;
    GAME.addShot(this);
  }

  update(delta) {
    this.lifetime -= delta;
    if (this.lifetime < 0) {
      this.remove();
      return;
    }

    let shotStart = this.position.clone();
    let shotEnd = shotStart.clone();
    let direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(this.quaternion);
    direction.multiplyScalar(this.velocity * delta);
    shotEnd.add(direction);
    let denominator = shotStart.distanceTo(shotEnd);

    let hitObject;
    let hitDistance = Infinity;
    for (let shootable of SHOOTABLES) {
      if (shootable === this.owner) continue;
      let shootableCenter = shootable.position;
      if (this.position.distanceTo(shootableCenter) > denominator + shootable.hitRadius) continue;
      let a1 = new THREE.Vector3().subVectors(shootableCenter, shotStart);
      let a2 = new THREE.Vector3().subVectors(shootableCenter, shotEnd);
      let radius = a1.cross(a2).length() / denominator;
      if (radius > shootable.hitRadius) continue;
      let hitDistance2 = this.position.distanceTo(shootableCenter);
      if (hitDistance2 < hitDistance) {
        hitDistance = hitDistance2;
        hitObject = shootable;
      }
    }
    if (hitObject) {
      this.remove();
      hitObject.damage(this.damage);
    }

    this.translateZ(this.velocity * delta);
  }
}
export default Shot;
