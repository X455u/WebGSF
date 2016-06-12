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

  }

  update(delta) {
    super.update(delta);
    this.reload = Math.max(0, this.reload - delta);
    if (this.target !== null) {
      this.aimAdvance();
      this.shoot();
    }
  }

}

export default BasicTurret;
