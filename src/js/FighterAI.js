import * as THREE from 'three'

import {GAME} from './Game'

const CLOSE_DISTANCE = 50
const FAR_DISTANCE = 200
const COLLISION_CHECK_DISTANCE = 30
const SAFETY_DISTANCE = 10
const SHOOT_ANGLE = 0.05

// Object pool
const VECTOR3_A = new THREE.Vector3()
const VECTOR3_B = new THREE.Vector3()
const VECTOR3_C = new THREE.Vector3()

class FighterAI {

  constructor() {

  }


  update(ship, delta) {
    if (!ship.AItarget || ship.AItarget.removed === true) ship.AItarget = this.getNewAITarget(ship)

    if (!ship.AItarget) return // Idle if no target found

    const hitObject = ship.checkCollision(ship.quaternion, COLLISION_CHECK_DISTANCE, SAFETY_DISTANCE)
    if (hitObject) {
      let away = VECTOR3_A.subVectors(ship.position, hitObject.position)
      away.add(ship.position)
      ship.turnTowards(away, delta)
    } else {
      if (ship.AIattacking) {
        let aimTarget = this.getAimTarget(ship.position, ship.AItarget.position, ship.AItarget.getVelocityVec(), ship.gun.muzzleVelocity)
        ship.turnTowards(aimTarget, delta)

        let facing = VECTOR3_A.set(0, 0, -1).applyQuaternion(ship.quaternion)
        let angleToTarget = facing.angleTo(VECTOR3_B.subVectors(aimTarget, ship.position))
        if (angleToTarget < SHOOT_ANGLE) ship.shoot()
        if (ship.position.distanceTo(ship.AItarget.position) < CLOSE_DISTANCE) {
          ship.AIattacking = false
        }
      } else {
        let away = VECTOR3_A.subVectors(ship.position, ship.AItarget.position)
        away.add(ship.position)
        ship.turnTowards(away, delta)
        if (ship.position.distanceTo(ship.AItarget.position) > FAR_DISTANCE) {
          ship.AIattacking = true
        }
      }
    }
    ship.thrust()
  }

  getAimTarget(shipPosition, targetPosition, targetVelocity, shotSpeed) {
    let thisToTarget = VECTOR3_A.copy(targetPosition).sub(shipPosition)
    if (thisToTarget.length() === 0 || targetVelocity.length() === 0) return targetPosition
    let targetMoveAngle = thisToTarget.angleTo(targetVelocity) // 0 or PI when paralell to vector from this to target.
    let aimAdvanceAngle = Math.asin(Math.sin(targetMoveAngle) * targetVelocity.length() / shotSpeed)
    let aimAdvanceAxis = VECTOR3_B.crossVectors(thisToTarget, targetVelocity).normalize()
    let aimAdvanceVector = thisToTarget.applyAxisAngle(aimAdvanceAxis, aimAdvanceAngle)
    let aimTarget = VECTOR3_C.addVectors(shipPosition, aimAdvanceVector)
    if (!aimTarget.x || !aimTarget.y || !aimTarget.z) {
      return targetPosition
    } else {
      return aimTarget
    }
  }

  getNewAITarget(ship) {
    let enemies = GAME.objects.filter(object => object.team && object.team !== ship.team)
    let target = enemies[0]

    if (!target) return null

    for (const enemy of enemies) {
      if (ship.position.distanceTo(enemy.position) < ship.position.distanceTo(target.position)) target = enemy
    }
    return target
  }

}

export const FIGHTER_AI = new FighterAI()
