import GameObject from './GameObject';
import Explosion from './Explosion';
import {GAME} from './Game';

class Ship extends GameObject {

  constructor(geometry, material, stats) {
    super(geometry, material);
    GAME.addObject(this, true);

    // Stats
    this.maxVelocity = stats.maxVelocity;
    this.acceleration = stats.acceleration;
    this.turnSpeed = stats.turnSpeed;
    this.maxHp = stats.maxHp;
    this.maxShield = stats.maxShield;
    this.shieldRegen = 0;
    if (stats.gun) {
      this.gun = stats.gun;
      this.gun.owner = this;
      this.add(stats.gun);
    }

    // Controls
    this.isThrusting = false;
    this.isShooting = false;
    this.turnParameters = {
      x: 0,
      y: 0,
      z: 0
    };

    // State
    this.velocity = 0.0;
    this.hp = this.maxHp;
    this.shield = this.maxShield;

    // AI
    this.ai = null;
    this.AIattacking = true;
    this.AItarget = null;

    // Events
    this.addEventListener('onDamage', () => {
      if (this.hp === 0) {
        let explosion = new Explosion({position: this.position});
        GAME.addObject(explosion);
        this.remove();
      }
    });
  }

  thrust() {
    this.isThrusting = true;
  }

  shoot() {
    let wasFalse = !this.isShooting;
    this.isShooting = true;
    return wasFalse;
  }

  turn(x_, y_, z_) {
    this.turnParameters.x = Math.min(Math.max(-1, x_), 1);
    this.turnParameters.y = Math.min(Math.max(-1, y_), 1);
    this.turnParameters.z = Math.min(Math.max(-1, z_), 1);
  }

  dealDamage(damage) {
    this.shield -= damage;
    if (this.shield < 0) {
      this.hp += this.shield;
      this.shield = 0;
    }
    if (this.hp < 0) this.hp = 0;
    this.dispatchEvent({
      type: 'onDamage',
      damage: damage
    });
  }

  update(delta) {
    if (this.ai && this.AItarget) this.ai.update(this, delta);

    let turnAmount = this.turnSpeed * 2 * Math.PI * delta;
    this.rotateX(this.turnParameters.x * turnAmount);
    this.rotateY(this.turnParameters.y * turnAmount);
    this.rotateZ(this.turnParameters.z * turnAmount);

    if (this.isThrusting) {
      this.velocity += this.acceleration * delta;
      this.isThrusting = false;
    } else {
      this.velocity -= this.acceleration * delta;
    }
    this.velocity = Math.min(Math.max(0, this.velocity), this.maxVelocity);
    this.translateZ(this.velocity * delta);

    if (this.gun) {
      this.gun.update(delta);
      if (this.isShooting) {
        this.gun.shoot();
        this.isShooting = false;
      }
    }

    let hitObject = this.checkCollision(this.quaternion, this.velocity * delta);
    if (hitObject) {
      this.dealDamage(Infinity);
      hitObject.dealDamage(Infinity);
    }

    if (this.shield !== this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRegen * delta);
      this.dispatchEvent({
        type: 'onShieldRegen'
      });
    }
  }
}

export default Ship;
