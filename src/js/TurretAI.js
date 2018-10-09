import * as THREE from 'three';

const SHOOT_ANGLE = 0.05;

// Object pool
const VECTOR3_A = new THREE.Vector3();
const VECTOR3_B = new THREE.Vector3();
const VECTOR3_C = new THREE.Vector3();
const VECTOR3_D = new THREE.Vector3();

const QUATERNION_A = new THREE.Quaternion();

class TurretAI {

  constructor() {

  }

  update(turret, delta) {
    let worldPos = VECTOR3_D;
    turret.gun.getWorldPosition(worldPos);
    let aimTarget = this.getAimTarget(worldPos, turret.AItarget.position, turret.AItarget.getVelocityVec(), turret.gun.muzzleVelocity);
    turret.turnTowards(aimTarget, delta);

    let worldQuat = QUATERNION_A;
    turret.gun.getWorldQuaternion(worldQuat);
    let facing = VECTOR3_A.set(0, 0, -1).applyQuaternion(worldQuat);
    let angleToTarget = facing.angleTo(VECTOR3_B.subVectors(aimTarget, worldPos));
    if (angleToTarget < SHOOT_ANGLE) turret.shoot();
  }

  getAimTarget(gunPosition, targetPosition, targetVelocity, shotSpeed) {
    let thisToTarget = VECTOR3_A.copy(targetPosition).sub(gunPosition);
    let targetMoveAngle = thisToTarget.angleTo(targetVelocity); // 0 or PI when paralell to vector from this to target.
    let aimAdvanceAngle = Math.asin(Math.sin(targetMoveAngle) * targetVelocity.length() / shotSpeed);
    let aimAdvanceAxis = VECTOR3_B.crossVectors(thisToTarget, targetVelocity).normalize();
    let aimAdvanceVector = thisToTarget.applyAxisAngle(aimAdvanceAxis, aimAdvanceAngle);
    let aimTarget = VECTOR3_C.addVectors(gunPosition, aimAdvanceVector);
    if (!aimTarget.x || !aimTarget.y || !aimTarget.z) {
      return targetPosition;
    } else {
      return aimTarget;
    }
  }
}
export const TURRET_AI = new TurretAI();
