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
    this.lifetimeLeft -= delta;
    if (this.lifetimeLeft < 0) {
      this.remove();
      return;
    }

    let x1 = this.position.clone();
    let x2 = x1.clone();
    let direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(this.quaternion);
    direction.multiplyScalar(this.velocity * delta);
    x2.add(direction);
    let denominator = x1.distanceTo(x2);

    let hitObject;
    let hitDistance = Infinity;
    for (let shootable of SHOOTABLES) {
      if (shootable === this.owner) continue;
      let x0 = shootable.position;
      if (this.position.distanceTo(x0) > denominator) continue;
      let a1 = new THREE.Vector3().subVectors(x0, x1);
      let a2 = new THREE.Vector3().subVectors(x0, x2);
      let radius = a1.cross(a2).length() / denominator;
      if (radius > shootable.hitRadius) continue;
      let hitDistance2 = this.position.distanceTo(x0);
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
