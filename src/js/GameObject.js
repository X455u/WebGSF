import * as THREE from 'three';

class GameObject extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    this.removed = false;
    this.hitRadius = 1;
    this.velocity = 0;
    this.turnSpeed = 0.25;
  }

  update() {}

  damage() {}

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
}
export default GameObject;
