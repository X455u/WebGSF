import * as THREE from 'three';
import GameObject from './GameObject';
import {GAME} from './Game';
import LargePlasmaCannon from './LargePlasmaCannon';
import {LOADER} from './GSFLoader';

// Object pool
const VECTOR3_A = new THREE.Vector3();
const VECTOR3_B = new THREE.Vector3();
const VECTOR3_C = new THREE.Vector3();
const VECTOR3_D = new THREE.Vector3();
const VECTOR3_E = new THREE.Vector3();
const VECTOR3_F = new THREE.Vector3();

const QUATERNION_A = new THREE.Quaternion();

// Configurations
const GUN_ROTATION_MAX = 0.5 * Math.PI;
const GUN_ROTATION_MIN = -0.1 * Math.PI;

class Turret extends GameObject {
  constructor() {
    let material = LOADER.get('railgunMaterial');
    super(LOADER.get('railgunBaseGeometry'), material);
    GAME.addObject(this, true);
    this.headMesh = new THREE.Mesh(LOADER.get('railgunHeadGeometry'), material);
    this.gunMesh = new THREE.Mesh(LOADER.get('railgunGunGeometry'), material);

    this.add(this.headMesh);
    this.headMesh.translateOnAxis(new THREE.Vector3(0, 1, 0), 3.1);

    this.headMesh.add(this.gunMesh);
    this.gunMesh.translateOnAxis(new THREE.Vector3(0, 0, 1), 2 * 0.9);
    this.gunMesh.translateOnAxis(new THREE.Vector3(0, 1, 0), 4 * 1.6);

    this.headMesh.castShadow = true;
    this.headMesh.receiveShadow = true;
    this.gunMesh.castShadow = true;
    this.gunMesh.receiveShadow = true;

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
    let headWorldPos = VECTOR3_F;
    this.headMesh.getWorldPosition(headWorldPos);
    let directionFromHead = VECTOR3_A.subVectors(target, headWorldPos);
    let gunWorldPos = VECTOR3_F;
    this.gunMesh.getWorldPosition(gunWorldPos);
    let directionFromGun = VECTOR3_E.subVectors(target, gunWorldPos);

    // Turn head
    let headQuaternion = QUATERNION_A;
    this.headMesh.getWorldQuaternion(headQuaternion);
    let headUp = VECTOR3_B.set(0, 1, 0).applyQuaternion(headQuaternion);
    let headDirection = VECTOR3_C.set(0, 0, -1).applyQuaternion(headQuaternion);
    let headTargetDirection = VECTOR3_D.copy(directionFromHead).projectOnPlane(headUp).normalize();
    let headAngle = headDirection.angleTo(headTargetDirection) || Number.EPSILON; // Workaround for being NaN sometimes
    let headLeft = VECTOR3_B.set(1, 0, 0).applyQuaternion(headQuaternion);
    let headTurnCoef = -Math.sign(headLeft.dot(headTargetDirection));
    this.headMesh.rotateY(headTurnCoef * Math.min(headAngle, this.turnSpeed * delta));

    // Turn gun
    let gunQuaternion = QUATERNION_A;
    this.gunMesh.getWorldQuaternion(gunQuaternion);
    let gunLeft = VECTOR3_B.set(1, 0, 0).applyQuaternion(gunQuaternion);
    let gunDirection = VECTOR3_C.set(0, 0, -1).applyQuaternion(gunQuaternion);
    let gunTargetDirection = VECTOR3_D.copy(directionFromGun).projectOnPlane(gunLeft).normalize();
    let gunAngle = gunDirection.angleTo(gunTargetDirection) || Number.EPSILON; // Workaround for being NaN sometimes
    let gunUp = VECTOR3_B.set(0, 1, 0).applyQuaternion(gunQuaternion);
    let gunTurnCoef = Math.sign(gunUp.dot(gunTargetDirection));
    this.gunMesh.rotateX(gunTurnCoef * Math.min(gunAngle, this.turnSpeed * delta));
  }
}
export default Turret;
