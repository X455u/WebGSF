import * as THREE from 'three';
import LaserShot from './LaserShot';
import {shotController} from './ShotController';

class SmallPulseLaser extends THREE.Object3D {
  constructor() {
    super();
    this.reload = 0.0;
    this.reloadTime = 0.5;
    this.muzzleVelocity = 300;
    this.shotLifetime = 5.0;
  }

  shoot() {
    if (this.reload !== 0.0) return;
    let shot = new LaserShot(this.muzzleVelocity, this.shotLifetime);
    shotController.add(shot);
    this.getWorldPosition(shot.position);
    this.getWorldQuaternion(shot.quaternion);
    this.reload = this.reloadTime;
    this.dispatchEvent({
      type: 'onShoot',
      shot: shot
    });
  }

  update(delta) {
    this.reload = Math.max(0.0, this.reload - delta);
  }
}
export default SmallPulseLaser;
