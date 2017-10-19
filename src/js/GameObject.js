import * as THREE from 'three';
import {COLLIDABLES} from './Game';

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
    let matrix = new THREE.Matrix4();
    let up = (new THREE.Vector3(0, 1, 0)).applyQuaternion(this.quaternion);
    matrix.lookAt(target, this.position, up);

    let quaternion = new THREE.Quaternion();
    quaternion.setFromRotationMatrix(matrix);

    let direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(this.quaternion);
    direction.normalize();

    let targetDirection = new THREE.Vector3();
    targetDirection.subVectors(target, this.position);
    targetDirection.normalize();

    let angle = direction.angleTo(targetDirection);
    this.quaternion.slerp(quaternion, this.turnSpeed * delta * 2 * Math.PI / angle);
  }

  getVelocityVec() {
    let direction = (new THREE.Vector3(0, 0, 1)).applyQuaternion(this.quaternion);
    let velocityVec = direction.clone().multiplyScalar(this.velocity);
    return velocityVec;
  }

  checkCollision(quaternion, distance) {
    let start = this.position.clone();
    let end = start.clone();
    let direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(quaternion);
    direction.multiplyScalar(distance);
    end.add(direction);

    let hitObject;
    let hitDistance = Infinity;
    let a1 = new THREE.Vector3();
    let a2 = new THREE.Vector3();
    for (let shootable of COLLIDABLES) {
      if (shootable === this || shootable === this.owner) continue;
      let shootableCenter = shootable.position;
      if (this.position.distanceTo(shootableCenter) > distance + shootable.hitRadius + this.hitRadius) continue;
      a1.subVectors(shootableCenter, start);
      a2.subVectors(shootableCenter, end);
      let radius = a1.cross(a2).length() / distance;
      if (radius > shootable.hitRadius + this.hitRadius) continue;
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
