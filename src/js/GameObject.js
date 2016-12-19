import THREE from 'three';

const RELOAD_TIME = 0.5;

function toThreeVector3(cannonVector) {
  return new THREE.Vector3(
    cannonVector.x,
    cannonVector.y,
    cannonVector.z
  );
}

class GameObject {

  constructor(game, visual, physical) {

    this.game = game;
    this.shots = game.shots;

    this.visual = visual;
    this.physical = physical;

    this.HP = 100;
    this.side = 0;
    this.isDead = false;
    this.removed = false;
    this.target = null;

    this.reload = 0;
  }

  update(delta) {
    this.visual.position.set(
      this.physical.position.x,
      this.physical.position.y,
      this.physical.position.z
    );
    this.reload = Math.max(0, this.reload - delta);
  }

  getAimVec(target, shotSpeed) { // target should be Ship for now
    let thisToTarget = toThreeVector3(target.physicsBody.position.vsub(this.physical.position));
    let targetVelocity = toThreeVector3(target.physicsBody.velocity);
    let targetMoveAngle = thisToTarget.angleTo(targetVelocity); // 0 or PI when paralell to vector from this to target.
    // let shotSpeed = 300;
    let aimAdvanceAngle = Math.asin(Math.sin(targetMoveAngle) * targetVelocity.length() / shotSpeed);
    let aimAdvanceAxis = (new THREE.Vector3()).crossVectors(thisToTarget, targetVelocity).normalize();
    let aimAdvanceVector = thisToTarget.applyAxisAngle(aimAdvanceAxis, aimAdvanceAngle);
    return aimAdvanceVector;
    // this.visual.lookAt((new THREE.Vector3()).addVectors(this.visual.position, aimAdvanceVector));
  }

  damage(damage) {
    this.HP -= damage;
    if (this.HP < 0) {
      this.isDead = true;
    }
    return this.isDead;
  }

}

export default GameObject;
