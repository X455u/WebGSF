// import THREE from 'three';
// import CANNON from 'cannon';

const TURRET_RELOAD_TIME = 0.5;

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

    this.reload = 0;
  }

  update(delta) {
    this.visual.position.set(
      this.physical.position.x,
      this.physical.position.y,
      this.physical.position.z
    );
    // this.visual.quaternion.set(
    //   this.physical.quaternion.x,
    //   this.physical.quaternion.y,
    //   this.physical.quaternion.z,
    //   this.physical.quaternion.w
    // );
    this.reload = Math.max(0, this.reload - delta);
    if (this.reload === 0) {
      this.shots.shootTurretShot(this.visual);
      this.reload = TURRET_RELOAD_TIME;
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
