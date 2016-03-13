// import THREE from 'three';
// import CANNON from 'cannon';

class GameObject {

  constructor(visual, physical) {

    // this.game = game;
    this.visual = visual;
    this.physical = physical;

    this.HP = 100;
    this.side = 0;
    this.isDead = false;
    this.removed = false;

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
