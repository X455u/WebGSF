import * as THREE from 'three';

// Object pool
const VECTOR3_A = new THREE.Vector3();
const VECTOR3_B = new THREE.Vector3();
const VECTOR3_C = new THREE.Vector3();
const VECTOR3_D = new THREE.Vector3();
const VECTOR3_E = new THREE.Vector3();
const VECTOR3_F = new THREE.Vector3();

const QUATERNION_A = new THREE.Quaternion();

// Defaults
const GUN_ROTATION_MAX = 0.5 * Math.PI;
const GUN_ROTATION_MIN = 0.0 * Math.PI;
const TURN_SPEED = 0.25;

class Turret extends THREE.Mesh {
  constructor(headGeometry, headMaterial, gunGeometry, gunMaterial) {
    super(headGeometry, headMaterial);

    this.gun = new THREE.Mesh(gunGeometry, gunMaterial);
    this.add(this.gun);

    this.gunRotationMax = GUN_ROTATION_MAX;
    this.gunRotationMin = GUN_ROTATION_MIN;
    this.turnSpeed = TURN_SPEED;
  }

  turnTowards(targetPosition, delta) {
    let headWorldPos = VECTOR3_F;
    this.getWorldPosition(headWorldPos);
    let directionFromHead = VECTOR3_A.subVectors(targetPosition, headWorldPos);
    let gunWorldPos = VECTOR3_F;
    this.gun.getWorldPosition(gunWorldPos);
    let directionFromGun = VECTOR3_E.subVectors(targetPosition, gunWorldPos);

    // Turn head
    let headQuaternion = QUATERNION_A;
    this.getWorldQuaternion(headQuaternion);
    let headUp = VECTOR3_B.set(0, 1, 0).applyQuaternion(headQuaternion);
    let headDirection = VECTOR3_C.set(0, 0, -1).applyQuaternion(headQuaternion);
    let headTargetDirection = VECTOR3_D.copy(directionFromHead).projectOnPlane(headUp).normalize();
    let headAngle = headDirection.angleTo(headTargetDirection) || Number.EPSILON; // Workaround for being NaN sometimes
    let headLeft = VECTOR3_B.set(1, 0, 0).applyQuaternion(headQuaternion);
    let headTurnCoef = -Math.sign(headLeft.dot(headTargetDirection));
    this.rotateY(headTurnCoef * Math.min(headAngle, this.turnSpeed * delta));

    // Turn gun
    let gunQuaternion = QUATERNION_A;
    this.gun.getWorldQuaternion(gunQuaternion);
    let gunLeft = VECTOR3_B.set(1, 0, 0).applyQuaternion(gunQuaternion);
    let gunDirection = VECTOR3_C.set(0, 0, -1).applyQuaternion(gunQuaternion);
    let gunTargetDirection = VECTOR3_D.copy(directionFromGun).projectOnPlane(gunLeft).normalize();
    let gunAngle = gunDirection.angleTo(gunTargetDirection) || Number.EPSILON; // Workaround for being NaN sometimes
    let gunUp = VECTOR3_B.set(0, 1, 0).applyQuaternion(gunQuaternion);
    let gunTurnCoef = Math.sign(gunUp.dot(gunTargetDirection));
    this.gun.rotateX(gunTurnCoef * Math.min(gunAngle, this.turnSpeed * delta));

    this.gun.rotation.x = Math.max(GUN_ROTATION_MIN, Math.min(this.gun.rotation.x, GUN_ROTATION_MAX));
  }
}
export default Turret;
