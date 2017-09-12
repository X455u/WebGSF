import * as THREE from 'three';
import {PLANETS} from './Game';

const RAYCASTER = new THREE.Raycaster();

class Ship extends THREE.Mesh {

  constructor(geometry, material, stats) {
    super(geometry, material);

    // Stats
    this.maxVelocity = stats.maxVelocity;
    this.acceleration = stats.acceleration;
    this.turnSpeed = stats.turnSpeed;
    this.maxHp = stats.maxHp;
    this.maxShield = stats.maxShield;
    if (stats.gun) {
      this.gun = stats.gun;
      this.add(stats.gun);
    }

    // Controls
    this.isThrusting = false;
    this.isShooting = false;
    this.turnParameters = {
      x: 0,
      y: 0,
      z: 0
    };

    // State
    this.velocity = 0.0;
    this.hp = this.maxHp;
    this.shield = this.maxShield;

    // AI
    this.ai = null;
    this.attacking = true;
    this.target = null;
  }

  thrust() {
    this.isThrusting = true;
  }

  shoot() {
    let wasFalse = !this.isShooting;
    this.isShooting = true;
    return wasFalse;
  }

  turn(x_, y_, z_) {
    this.turnParameters.x = Math.min(Math.max(-1, x_), 1);
    this.turnParameters.y = Math.min(Math.max(-1, y_), 1);
    this.turnParameters.z = Math.min(Math.max(-1, z_), 1);
  }

  damage(damage) {
    this.shield -= damage;
    if (this.shield < 0) {
      this.hp += this.shield;
      this.shield = 0;
    }
    this.dispatchEvent({
      type: 'onDamage',
      damage: damage
    });
  }

  update(delta) {
    if (this.ai && this.target) this.ai.update(this, delta);

    this.rotateX(this.turnParameters.x * this.turnSpeed * 2 * Math.PI * delta);
    this.rotateY(this.turnParameters.y * this.turnSpeed * 2 * Math.PI * delta);
    this.rotateZ(this.turnParameters.z * this.turnSpeed * 2 * Math.PI * delta);

    if (this.isThrusting) {
      this.velocity += this.acceleration * delta;
      this.isThrusting = false;
    } else {
      this.velocity -= this.acceleration * delta;
    }
    this.velocity = Math.min(Math.max(0, this.velocity), this.maxVelocity);
    this.translateZ(this.velocity * delta);

    if (this.gun) {
      this.gun.update(delta);
      if (this.isShooting) {
        this.gun.shoot();
        this.isShooting = false;
      }
    }

    RAYCASTER.near = 0;
    RAYCASTER.far = this.velocity * delta;
    let direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(this.quaternion);
    RAYCASTER.set(this.position, direction);
    let intersections = RAYCASTER.intersectObjects(PLANETS);
    if (intersections.length !== 0) {
      this.damage(1000);
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
