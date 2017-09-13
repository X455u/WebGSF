import * as THREE from 'three';

const CLOSE_DISTANCE = 50;
const FAR_DISTANCE = 200;

class FighterAI {

  constructor() {

  }

  update(ship, delta) {
    if (ship.attacking) {
      let aimTarget = this.getAimTarget(ship.position, ship.target.position, ship.target.getVelocityVec(), ship.gun.muzzleVelocity);
      ship.turnTowards(aimTarget, delta);
      ship.shoot();
      if (ship.position.distanceTo(ship.target.position) < CLOSE_DISTANCE) {
        ship.attacking = false;
      }
    } else {
      let away = (new THREE.Vector3()).subVectors(ship.position, ship.target.position);
      away.add(ship.position);
      ship.turnTowards(away, delta);
      if (ship.position.distanceTo(ship.target.position) > FAR_DISTANCE) {
        ship.attacking = true;
      }
    }
    ship.thrust();
  }

  getAimTarget(shipPosition, targetPosition, targetVelocity, shotSpeed) {
    let thisToTarget = targetPosition.clone().sub(shipPosition);
    let targetMoveAngle = thisToTarget.angleTo(targetVelocity); // 0 or PI when paralell to vector from this to target.
    let aimAdvanceAngle = Math.asin(Math.sin(targetMoveAngle) * targetVelocity.length() / shotSpeed);
    let aimAdvanceAxis = (new THREE.Vector3()).crossVectors(thisToTarget, targetVelocity).normalize();
    let aimAdvanceVector = thisToTarget.applyAxisAngle(aimAdvanceAxis, aimAdvanceAngle);
    let aimTarget = (new THREE.Vector3()).addVectors(shipPosition, aimAdvanceVector);
    if (!aimTarget.x || !aimTarget.y || !aimTarget.z) {
      return targetPosition;
    } else {
      return aimTarget;
    }
  }

}

export const FIGHTER_AI = new FighterAI();
