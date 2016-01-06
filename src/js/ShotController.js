import _ from 'lodash';
import THREE from 'three';
import LaserShot from './LaserShot'

class ShotController {

  constructor(scene) {
    this.shots = [];
    this.scene = scene;
  }

  update(delta) {
    // this.shots.forEach(function(shot, delta) {
    //   shot.update(delta);
    // })
    for(var i=0; i<this.shots.length; i++) {
      this.shots[i].update(delta);
    }
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
