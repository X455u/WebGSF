import * as THREE from 'three';

class Ship extends THREE.Mesh {

  constructor(geometry, material, stats) {
    super(geometry, material);

    // Stats
    this.maxVelocity = stats.maxVelocity;
    this.acceleration = stats.acceleration;
    this.turnSpeed = stats.turnSpeed;
    this.gun = stats.gun;
    this.add(this.gun);

    // Controllables
    this.isShooting = false;
    this.isThrusting = false;
    this.turn = {
      x: 0.0,
      y: 0.0,
      z: 0.0
    };

    // State
    this.velocity = 0.0;
  }

  thrust() {
    this.isThrusting = true;
  }

  shoot() {
    this.isShooting = true;
  }

  update(delta) {
    if (this.isThrusting) {
      this.velocity += this.acceleration * delta;
      this.isThrusting = false;
    } else {
      this.velocity -= this.acceleration * delta;
    }
    Math.max(0, Math.min(this.maxVelocity, this.velocity));
    this.translateZ(this.velocity * delta);

    this.gun.update(delta);
    if (this.isShooting) {
      this.gun.shoot();
      this.isShooting = false;
    }
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

export default Ship;
