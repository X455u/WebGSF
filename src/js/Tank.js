import * as THREE from 'three';

import {GAME} from './Game';

let geometry = new THREE.BoxGeometry(10, 5, 20);
geometry.translate(0, 2.5, 0);
let material = new THREE.MeshPhongMaterial({
  color: 0x444444
});

// Object pool
const VECTOR3_A = new THREE.Vector3();
const VECTOR3_B = new THREE.Vector3();
const VECTOR3_C = new THREE.Vector3();

class Tank extends THREE.Mesh {
  constructor() {
    super(geometry, material);
    this.removed = false;
    this.hitRadius = 1;
    this.velocity = 0;
    this.turnSpeed = 0.25;

    this.castShadow = true;
    this.receiveShadow = true;

    this.planet = null;
    GAME.addObject(this, true);
  }

  update(delta) {
    if (this.planet) {
      let surfaceNormal = VECTOR3_A.subVectors(this.position, this.planet.position).normalize();

      let position = VECTOR3_B.copy(surfaceNormal).multiplyScalar(this.planet.hitRadius).add(this.planet.position);
      this.position.copy(position);

      let direction = VECTOR3_B.set(0, 0, -1).applyQuaternion(this.quaternion);
      let turnAmount = VECTOR3_C.crossVectors(surfaceNormal, direction).length();
      this.rotateX(turnAmount);
    }
  }

  dealDamage() {}

  destroy() {
    this.removed = true;
  }

  turnTowards(target, delta) {

  }

}
export default Tank;
