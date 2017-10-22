import * as THREE from 'three';

import GameObject from './GameObject';
import {GAME} from './Game';
import LargePlasmaCannon from './LargePlasmaCannon';

let baseGeometry = new THREE.CylinderGeometry(3, 5, 5, 16);
let headGeometry = new THREE.CylinderGeometry(2, 3, 3, 8);
let gunGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8, 1, true);
gunGeometry.rotateX(0.5 * Math.PI);
gunGeometry.translate(0, 0, 4);
let baseMaterial = new THREE.MeshPhongMaterial({
  color: 0x444444
});
let headMaterial = new THREE.MeshPhongMaterial({
  color: 0x222222
});
let gunMaterial = new THREE.MeshPhongMaterial({
  color: 0x111111,
  side: THREE.DoubleSide
});

// Object pool
const VECTOR3_A = new THREE.Vector3();
const VECTOR3_B = new THREE.Vector3();
const VECTOR3_C = new THREE.Vector3();
const VECTOR3_D = new THREE.Vector3();

// Configurations
const GUN_ROTATION_MAX = 0.1 * Math.PI;
const GUN_ROTATION_MIN = -0.5 * Math.PI;

class Turret extends GameObject {
  constructor() {
    super(baseGeometry, baseMaterial);
    GAME.addObject(this, true);
    this.headMesh = new THREE.Mesh(headGeometry, headMaterial);
    this.gunMesh = new THREE.Mesh(gunGeometry, gunMaterial);

    this.add(this.headMesh);
    this.headMesh.translateOnAxis(new THREE.Vector3(0, 1, 0), 4);
    this.headMesh.add(this.gunMesh);

    // AI
    this.ai = null;
    this.AItarget = null;

    // Stats
    this.gun = new LargePlasmaCannon();
    this.gun.owner = this;
    this.gunMesh.add(this.gun);
    this.hitRadius = 6;
  }

  update(delta) {
    if (this.ai) this.ai.update(this, delta);
    this.gunMesh.rotation.x = Math.max(GUN_ROTATION_MIN, Math.min(this.gunMesh.rotation.x, GUN_ROTATION_MAX));

    if (this.gun) {
      this.gun.update(delta);
      if (this.isShooting) {
        this.gun.shoot();
        this.isShooting = false;
      }
    }
  }

  shoot() {
    let wasFalse = !this.isShooting;
    this.isShooting = true;
    return wasFalse;
  }

  turnTowards(target, delta) {
    let direction = VECTOR3_A.subVectors(target, this.headMesh.getWorldPosition());

    // Turn head
    let headQuaternion = this.headMesh.getWorldQuaternion();
    let headUp = VECTOR3_B.set(0, 1, 0).applyQuaternion(headQuaternion);
    let headDirection = VECTOR3_C.set(0, 0, 1).applyQuaternion(headQuaternion);
    let headTargetDirection = VECTOR3_D.copy(direction).projectOnPlane(headUp).normalize();
    let headAngle = headDirection.angleTo(headTargetDirection) || Number.EPSILON; // Workaround for being NaN sometimes
    let headLeft = VECTOR3_B.set(1, 0, 0).applyQuaternion(headQuaternion);
    let headTurnCoef = Math.sign(headLeft.dot(headTargetDirection));
    this.headMesh.rotateY(headTurnCoef * Math.min(headAngle, this.turnSpeed * delta));

    // Turn gun
    let gunQuaternion = this.gunMesh.getWorldQuaternion();
    let gunLeft = VECTOR3_B.set(1, 0, 0).applyQuaternion(gunQuaternion);
    let gunDirection = VECTOR3_C.set(0, 0, 1).applyQuaternion(gunQuaternion);
    let gunTargetDirection = VECTOR3_D.copy(direction).projectOnPlane(gunLeft).normalize();
    let gunAngle = gunDirection.angleTo(gunTargetDirection) || Number.EPSILON; // Workaround for being NaN sometimes
    let gunUp = VECTOR3_B.set(0, 1, 0).applyQuaternion(gunQuaternion);
    let gunTurnCoef = -Math.sign(gunUp.dot(gunTargetDirection));
    this.gunMesh.rotateX(gunTurnCoef * Math.min(gunAngle, this.turnSpeed * delta));
  }
}
export default Turret;
