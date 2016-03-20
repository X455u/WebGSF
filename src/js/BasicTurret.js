import THREE from 'three';
import CANNON from 'cannon';
import GameObject from './GameObject';
import LaserShot from './LaserShot';

const RELOAD_TIME = 1; // seconds

class BasicTurret extends GameObject {

  constructor(physics) {
    super();

    this.mesh = new THREE.Mesh();
    this.body = new CANNON.Body();
    physics.add(this.body);

    this.target = null;
    this.reload = 0;

    // this.HP = 100;
    // this.side = 0;

  }

  update(delta) {
    super.update(delta);
    this.reload = Math.max(0, this.reload - delta);
    if (this.target !== null) {
      // this.aim();
      this.aimAdvance();
      this.shoot();
    }
  }

  aim() {
    this.mesh.lookAt(this.target.position);
  }

  aimAdvance() { // Acceleration or new distance to target after travel time not taken in account
    let distance = this.body.position.distanceTo(this.target.physicsBody.position);
    let shotVelocity = LaserShot.VELOCITY;
    let shotTravelTime = distance / shotVelocity;
    let targetNewPosition = this.target.physicsBody.position.clone();
    targetNewPosition.vadd(this.target.physicsBody.velocity.scale(shotTravelTime));
    this.mesh.lookAt(new THREE.Vector3(
      targetNewPosition.x,
      targetNewPosition.y,
      targetNewPosition.z
    ));
  }

  shoot() {
    if (this.reload === 0) {
      this.reload = RELOAD_TIME;
      super.shots.shootTurretShot(this.visual);
    }
  }

}

export default BasicTurret;
