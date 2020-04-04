import * as THREE from 'three'
import { GAME } from './Game'

const SHOOT_ANGLE = 0.05
const FAR_DISTANCE = 1800

// Object pool
const VECTOR3_A = new THREE.Vector3()
const VECTOR3_B = new THREE.Vector3()
const VECTOR3_C = new THREE.Vector3()
const VECTOR3_D = new THREE.Vector3()
const VECTOR3_E = new THREE.Vector3()

const QUATERNION_A = new THREE.Quaternion()
const QUATERNION_B = new THREE.Quaternion()

class TurretAI {
  constructor() {}

  update(turretParent, delta, turretChild) {
    let turret
    if (turretChild) {
      turretParent = turretChild
      turret = turretChild
    } else {
      turret = turretParent.turret
    }

    let worldPos = VECTOR3_D
    turret.gun.getWorldPosition(worldPos)

    if (
      !turretParent.AItarget ||
      turretParent.AItarget.removed === true ||
      worldPos.distanceTo(turretParent.AItarget.getWorldPosition()) > FAR_DISTANCE
    ) {
      turretParent.AItarget = this.getNewAITarget(turretParent, turretChild)
    }

    if (!turretParent.AItarget) return // Idle if no target found

    // let aimTarget = this.getAimTarget(worldPos, targetObject.position, targetObject.getVelocityVec(), turret.gun.muzzleVelocity);
    let aimTarget = this.getAimTarget(
      worldPos,
      turretParent.AItarget.position,
      turretParent.AItarget.getVelocityVec(),
      200
    )
    turret.turnTowards(aimTarget, delta)

    let worldQuat = QUATERNION_A
    turret.gun.getWorldQuaternion(worldQuat)
    let facing = VECTOR3_A.set(0, 0, -1).applyQuaternion(worldQuat)
    let angleToTarget = facing.angleTo(VECTOR3_B.subVectors(aimTarget, worldPos))
    if (angleToTarget < SHOOT_ANGLE) turret.shoot()
  }

  getAimTarget(gunPosition, targetPosition, targetVelocity, shotSpeed) {
    let thisToTarget = VECTOR3_A.copy(targetPosition).sub(gunPosition)
    if (thisToTarget.length() === 0 || targetVelocity.length() === 0) return targetPosition
    let targetMoveAngle = thisToTarget.angleTo(targetVelocity) // 0 or PI when paralell to vector from this to target.
    let aimAdvanceAngle = Math.asin((Math.sin(targetMoveAngle) * targetVelocity.length()) / shotSpeed)
    let aimAdvanceAxis = VECTOR3_B.crossVectors(thisToTarget, targetVelocity).normalize()
    let aimAdvanceVector = thisToTarget.applyAxisAngle(aimAdvanceAxis, aimAdvanceAngle)
    let aimTarget = VECTOR3_C.addVectors(gunPosition, aimAdvanceVector)
    if (!aimTarget.x || !aimTarget.y || !aimTarget.z) {
      return targetPosition
    } else {
      return aimTarget
    }
  }

  getNewAITarget(turretParent, turretChild) {
    let turret
    if (turretChild) {
      turretParent = turretChild
      turret = turretChild
    } else {
      turret = turretParent.turret
    }

    const gunPosition = VECTOR3_D
    turret.gun.getWorldPosition(gunPosition)

    const enemies = GAME.objects.filter(
      (object) =>
        object.team &&
        object.team !== turretParent.team &&
        gunPosition.distanceTo(object.getWorldPosition()) < FAR_DISTANCE
    )
    let target = enemies[0]

    if (!target) return null

    const gunQuat = QUATERNION_B
    turret.gun.getWorldQuaternion(gunQuat)
    const gunDirection = VECTOR3_E.set(0, 0, -1).applyQuaternion(gunQuat)

    let currentAngle = Infinity

    for (const enemy of enemies) {
      const aimAdvance = this.getAimTarget(gunPosition, enemy.position, enemy.getVelocityVec(), 200)
      if (aimAdvance.length() === 0) continue
      const newAngle = gunDirection.angleTo(aimAdvance)
      if (newAngle >= currentAngle) continue

      target = enemy
      currentAngle = newAngle
    }
    return target
  }
}
export const TURRET_AI = new TurretAI()
