import THREE from 'three';
import CANNON from 'cannon';

import GameObject from './GameObject';
import LaserShot from './LaserShot';

const RELOAD_TIME = 1; // seconds

class GroundTurret extends GameObject {

  constructor(game) {
    // Visual
    let base = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 4, 3, 32),
      new THREE.MeshPhongMaterial({color: 0x333333})
    );
    base.translateY(-2);
    let head = new THREE.Mesh(
      new THREE.SphereGeometry(3, 32, 32),
      new THREE.MeshPhongMaterial({color: 0x303030})
    );
    let gun = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 4, 16),
      new THREE.MeshPhongMaterial({color: 0x111111})
    );
    gun.geometry.translate(0, 4.5, 0);
    gun.geometry.rotateX(Math.PI / 2);

    let visual = new THREE.Group();
    visual.add(base);
    visual.add(head);
    visual.add(gun);

    let physical = new CANNON.Body();
    physical.addShape(new CANNON.Sphere(3));

    super(game, visual, physical);

    this.head = head;
    this.gun = gun;
    this.target = null;
    this.reload = 0;
  }

  aim(target) {
    let aimDir = super.getAimVec(target, 300);
    this.gun.lookAt(aimDir);
  }

  shoot() {
    if (this.reload === 0) {
      this.reload = RELOAD_TIME;

      let shot = new LaserShot(this.game.physics);
      shot.position.copy(this.visual.position);
      shot.quaternion.copy(this.gun.quaternion);
      shot.rotateX(Math.PI);
      shot.translateZ(-2);

      this.shots.addShot(shot);
    }
  }

  update(delta) {
    super.update(delta);
    this.aim(this.target);
    this.shoot();
  }

}

export default GroundTurret;
