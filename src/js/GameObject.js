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
const VECTOR3_F = new THREE.Vector3();

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

  destroy() {
    this.removed = true;
  }

  turnTowards(target, delta) {
    let matrix = MATRIX;
    let up = VECTOR3_A.set(0, 1, 0).applyQuaternion(this.quaternion);
    matrix.lookAt(this.position, target, up);

    let quaternion = QUATERNION;
    quaternion.setFromRotationMatrix(matrix);

    let direction = VECTOR3_B.set(0, 0, -1);
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
    let direction = VECTOR3_C.set(0, 0, -1);
    direction.applyQuaternion(quaternion);
    direction.multiplyScalar(distance);
    end.add(direction);

    let hitObject;
    let hitDistance = Infinity;
    let a1 = VECTOR3_D;
    let a2 = VECTOR3_E;
    for (let collidable of COLLIDABLES) {
      if (collidable === this || collidable === this.owner) continue;
      let collidableCenter = collidable.position;
      if (this.position.distanceTo(collidableCenter) > distance + collidable.hitRadius + this.hitRadius + extraHitRadius) continue;
      if (direction.dot(VECTOR3_F.subVectors(collidableCenter, start)) < 0) continue;
      a1.subVectors(collidableCenter, start);
      a2.subVectors(collidableCenter, end);
      let radius = a1.cross(a2).length() / distance;
      if (radius > collidable.hitRadius + this.hitRadius + extraHitRadius) continue;
      let hitDistance2 = this.position.distanceTo(collidableCenter);
      if (hitDistance2 < hitDistance) {
        hitDistance = hitDistance2;
        hitObject = collidable;
      }
    }
    return hitObject;
  }
}
export default GameObject;
