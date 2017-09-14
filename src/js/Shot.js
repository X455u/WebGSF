import * as THREE from 'three';
import GSFObject from './GSFObject';
import {GAME, RAYCASTER, SHOOTABLES} from './Game';

class Shot extends GSFObject {
  constructor(geometry, material) {
    super(geometry, material);
    this.velocity = 300;
    this.lifetime = 5;
    this.damage = 1;
    GAME.addShot(this);
  }

  update(delta) {
    this.lifetimeLeft -= delta;
    if (this.lifetimeLeft < 0) {
      this.remove();
      return;
    }

    RAYCASTER.far = this.velocity * delta;
    let direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(this.quaternion);
    RAYCASTER.set(this.position, direction);
    let intersections = RAYCASTER.intersectObjects(SHOOTABLES);
    if (intersections.length > 0) {
      this.remove();
      let hitObject = intersections[0].object;
      hitObject.damage(this.damage);
    }

    this.translateZ(this.velocity * delta);
  }
}
export default Shot;
