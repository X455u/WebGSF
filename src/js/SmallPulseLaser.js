import THREE from 'three';
import LaserShot from './LaserShot';

class SmallPulseLaser extends THREE.Object3D {
  constructor() {
    super();
    this.reloadTime = 0.5;
  }

  shoot() {
    if (this.reload !== 0.0) return;
    let shot = new LaserShot();
    shot.position.copy(this.position);
    shot.quaternion.copy(this.quaternion);
    this.reload = this.reloadTime;
    // this.shots.push(shot);
    // this.scene.add(shot);
  }

  update(delta) {
    this.reload = Math.max(0.0, this.reload - delta);
  }
}
export default SmallPulseLaser;
