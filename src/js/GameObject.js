import * as THREE from 'three';
import {GAME} from './Game';

// Object pool
const MATRIX = new THREE.Matrix4();
const QUATERNION = new THREE.Quaternion();

const VECTOR3_A = new THREE.Vector3();
const VECTOR3_B = new THREE.Vector3();
const VECTOR3_C = new THREE.Vector3();

class GameObject extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    geometry.computeBoundingSphere();

    this.removed = false;
    this.velocity = 0;
    this.turnSpeed = 0.25;

    this.team = null;
    this.collisionDamage = Infinity;

    this.castShadow = true;
    this.receiveShadow = true;

    this.isStatic = false; // Static objects don't check collision with eachother

    GAME.addObject(this);

    this.collisionHull = this.geometry.vertices;
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
    velocityVec.set(0, 0, -1).applyQuaternion(this.quaternion);
    return velocityVec.multiplyScalar(this.velocity);
  }

}
export default GameObject;
