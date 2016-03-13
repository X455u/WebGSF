import THREE from 'three';
import CANNON from 'cannon';
import Enemy from './Enemy';

const RELOAD_TIME = 1; // seconds

class BasicTurret extends Enemy {

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
    this.reload = Math.max(0, this.reload - delta);
    if (this.target !== null) {
      this.shoot();
      this.aim();
    }
  }

  aim() {
    this.mesh.lookAt(this.target.position);
  }

  shoot() {
    if (this.reload === 0) {
      this.reload = RELOAD_TIME;
      // pewpew
    }
  }

}

export default BasicTurret;
