import _ from 'lodash';
import THREE from 'three';
import LaserShot from './LaserShot'

class ShotController {

  constructor(scene) {
    this.shots = [];
    this.scene = scene;
  }

  update(delta) {
    this.shots.forEach(shot => {
      shot.update(delta);
      if (shot.lifetimeLeft <= 0.0) {
        this.scene.remove(shot);
        this.shots.splice(this.shots.indexOf(shot), 1);
      }
    })
  }

  shootLaserShot(ship) {
    let shot = new LaserShot();
    shot.position.copy(ship.position);
    shot.quaternion.copy(ship.quaternion);
    this.shots.push(shot);
    this.scene.add(shot);
  }

}

export default ShotController;
