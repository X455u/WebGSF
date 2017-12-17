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
    this.velocity = 10;
    this.turnSpeed = Math.random() - 0.5;

    this.castShadow = true;
    this.receiveShadow = true;

    this.planet = null;
    GAME.addObject(this);
  }

  update(delta) {
    if (this.planet) {
      this.translateZ(-this.velocity * delta);
      this.rotateY(this.turnSpeed * delta);

      let surfaceNormal = VECTOR3_A.subVectors(this.position, this.planet.position).normalize();

      let position = VECTOR3_B.copy(surfaceNormal).multiplyScalar(this.planet.hitRadius).add(this.planet.position);
      this.position.copy(position);

      let directionFront = VECTOR3_B.set(0, 0, -1).applyQuaternion(this.quaternion);
      let turnAxisX = VECTOR3_C.crossVectors(surfaceNormal, directionFront);
      let turnAmountX = 1 - turnAxisX.length();
      if (surfaceNormal.dot(directionFront) < 0) turnAmountX = -turnAmountX;
      if (turnAmountX) this.rotateOnWorldAxis(turnAxisX, turnAmountX);

      let directionSide = VECTOR3_B.set(1, 0, 0).applyQuaternion(this.quaternion);
      let turnAxisZ = VECTOR3_C.crossVectors(surfaceNormal, directionSide);
      let turnAmountZ = 1 - turnAxisZ.length();
      if (surfaceNormal.dot(directionSide) < 0) turnAmountZ = -turnAmountZ;
      if (turnAmountZ) this.rotateOnWorldAxis(turnAxisZ, turnAmountZ);
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
