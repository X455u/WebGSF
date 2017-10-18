import * as THREE from 'three';
import GameObject from './GameObject';
import Explosion from './Explosion';
import {GAME, COLLIDABLES} from './Game';

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

    this.rotateX(this.turnParameters.x * this.turnSpeed * 2 * Math.PI * delta);
    this.rotateY(this.turnParameters.y * this.turnSpeed * 2 * Math.PI * delta);
    this.rotateZ(this.turnParameters.z * this.turnSpeed * 2 * Math.PI * delta);

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

    let start = this.position.clone();
    let end = start.clone();
    let direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(this.quaternion);
    direction.multiplyScalar(this.velocity * delta);
    end.add(direction);
    let denominator = start.distanceTo(end);

    let hitObject;
    let hitDistance = Infinity;
    for (let shootable of COLLIDABLES) {
      if (shootable === this) continue;
      let shootableCenter = shootable.position;
      if (this.position.distanceTo(shootableCenter) > denominator + shootable.hitRadius) continue;
      let a1 = new THREE.Vector3().subVectors(shootableCenter, start);
      let a2 = new THREE.Vector3().subVectors(shootableCenter, end);
      let radius = a1.cross(a2).length() / denominator;
      if (radius > shootable.hitRadius) continue;
      let hitDistance2 = this.position.distanceTo(shootableCenter);
      if (hitDistance2 < hitDistance) {
        hitDistance = hitDistance2;
        hitObject = shootable;
      }
    }
    if (hitObject) {
      this.dealDamage(Infinity);
      hitObject.dealDamage(Infinity);
    }
  }
}

export default Ship;
