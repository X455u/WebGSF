import GameObject from './GameObject';

class Shot extends GameObject {
  constructor(geometry, material) {
    super(geometry, material);
    this.velocity = 300;
    this.lifetime = 5;
    this.collisionDamage = 1;
    this.owner = null;
  }

  update(delta) {
    this.lifetime -= delta;
    if (this.lifetime < 0) {
      this.destroy();
    }

    this.translateZ(-this.velocity * delta);
  }

  dealDamage() {
    this.destroy();
  }
}
export default Shot;
