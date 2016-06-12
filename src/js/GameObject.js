import THREE from 'three';

const RELOAD_TIME = 0.5;

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
    if (this.target !== null) {
      this.aimAdvance(this.target);
      this.shoot();
    }
    this.reload = Math.max(0, this.reload - delta);
  }

  aim(target) {
    this.mesh.lookAt(target.position);
  }

  // Acceleration or new distance to target after travel time not taken in account
  aimAdvance(target) { // target should be Ship for now
    let distance = this.physical.position.distanceTo(target.physicsBody.position);
    let shotVelocity = 300;
    let shotTravelTime = distance / shotVelocity;
    let targetNewPosition = target.physicsBody.position.clone();
    targetNewPosition.vadd(target.physicsBody.velocity.scale(shotTravelTime), targetNewPosition);
    this.visual.lookAt(new THREE.Vector3(
      targetNewPosition.x,
      targetNewPosition.y,
      targetNewPosition.z
    ));
  }

  shoot() {
    if (this.reload === 0) {
      this.reload = RELOAD_TIME;
      this.shots.shootTurretShot(this.visual);
    }
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
