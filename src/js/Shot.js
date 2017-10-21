import * as THREE from 'three';
import GameObject from './GameObject';
import {GAME, COLLIDABLES} from './Game';

class Shot extends GameObject {
  constructor(geometry, material) {
    super(geometry, material);
    this.velocity = 300;
    this.lifetime = 5;
    this.damage = 1;
    this.owner = null;
    GAME.addShot(this);
  }

  update(delta) {
    this.lifetime -= delta;
    if (this.lifetime < 0) {
      this.remove();
      return;
    }

    let hitObject = this.checkCollision(this.quaternion, this.velocity * delta);
    if (hitObject) {
      this.remove();
      hitObject.dealDamage(this.damage);
    }

    this.translateZ(this.velocity * delta);
  }
}
export default Shot;