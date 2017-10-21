import * as THREE from 'three';
import {COLLIDABLES} from './Game';

// Object pool
const MATRIX = new THREE.Matrix4();
const QUATERNION = new THREE.Quaternion();

const VECTOR3_A = new THREE.Vector3();
const VECTOR3_B = new THREE.Vector3();
const VECTOR3_C = new THREE.Vector3();
const VECTOR3_D = new THREE.Vector3();
const VECTOR3_E = new THREE.Vector3();

class GameObject extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    this.removed = false;
    this.hitRadius = 1;
    this.velocity = 0;
    this.turnSpeed = 0.25;
  }

  update() {}

  dealDamage() {}

  remove() {
    this.removed = true;
  }

  turnTowards(target, delta) {
    let matrix = MATRIX;
    let up = VECTOR3_A.set(0, 1, 0).applyQuaternion(this.quaternion);
    matrix.lookAt(target, this.position, up);

    let quaternion = QUATERNION;
    quaternion.setFromRotationMatrix(matrix);

    let direction = VECTOR3_B.set(0, 0, 1);
    direction.applyQuaternion(this.quaternion);
    direction.normalize();

    let targetDirection = VECTOR3_C.subVectors(target, this.position);
    targetDirection.normalize();

    let angle = direction.angleTo(targetDirection);
    this.quaternion.slerp(quaternion, this.turnSpeed * delta * 2 * Math.PI / angle);
  }

  getVelocityVec() {
    let velocityVec = VECTOR3_A;
    velocityVec.set(0, 0, 1).applyQuaternion(this.quaternion);
    return velocityVec.multiplyScalar(this.velocity);
  }

  checkCollision(quaternion, distance, extraHitRadius = 0) {
    let start = VECTOR3_A.copy(this.position);
    let end = VECTOR3_B.copy(start);
    let direction = VECTOR3_C.set(0, 0, 1);
    direction.applyQuaternion(quaternion);
    direction.multiplyScalar(distance);
    end.add(direction);

    let hitObject;
    let hitDistance = Infinity;
    let a1 = VECTOR3_D;
    let a2 = VECTOR3_E;
    for (let shootable of COLLIDABLES) {
      if (shootable === this || shootable === this.owner) continue;
      let shootableCenter = shootable.position;
      if (this.position.distanceTo(shootableCenter) > distance + shootable.hitRadius + this.hitRadius + extraHitRadius) continue;
      a1.subVectors(shootableCenter, start);
      a2.subVectors(shootableCenter, end);
      let radius = a1.cross(a2).length() / distance;
      if (radius > shootable.hitRadius + this.hitRadius + extraHitRadius) continue;
      let hitDistance2 = this.position.distanceTo(shootableCenter);
      if (hitDistance2 < hitDistance) {
        hitDistance = hitDistance2;
        hitObject = shootable;
      }
    }
    return hitObject;
  }
}
export default GameObject;
