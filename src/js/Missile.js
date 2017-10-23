import * as THREE from 'three';
import Shot from './Shot';
import SimpleParticleSystem from './SimpleParticleSystem';
import Explosion from './Explosion';
import {GAME} from './Game';

let missileTop = new THREE.ConeGeometry(0.2, 0.5, 8, 1, true);
missileTop.translate(0, 1.25, 0);
let missileMiddle = new THREE.CylinderGeometry(0.2, 0.2, 2, 8, 1);
let missileWing1 = new THREE.PlaneGeometry(0.8, 0.5);
missileWing1.translate(0, -0.75, 0);
let missileWing2 = new THREE.PlaneGeometry(0.8, 0.5);
missileWing2.translate(0, -0.75, 0);
missileWing2.rotateY(Math.PI / 2);
let missileGeometry = new THREE.Geometry();
missileGeometry.merge(missileTop);
missileGeometry.merge(missileMiddle);
missileGeometry.merge(missileWing1);
missileGeometry.merge(missileWing2);
missileGeometry.rotateX(Math.PI / 2);

let missileMaterial = new THREE.MeshPhongMaterial({
  color: 0xAAAAAA,
  side: THREE.DoubleSide
});

class Missile extends Shot {
  constructor() {
    super(missileGeometry, missileMaterial);
    this.velocity = 120;
    this.lifetime = 10;
    this.damage = 20;

    this.target = null;

    let thruster = new SimpleParticleSystem({
      particles: 200,
      destination: new THREE.Vector3(0, 0, -2),
      positionRandomness: 0.2,
      destinationRandomness: 0.5,
      color: new THREE.Color(0xFFFFAA),
      size: 100,
      lifetime: 0.2
    });
    this.add(thruster);
    thruster.translateZ(-1);
  }

  update(delta) {
    if (this.target) {
      this.turnTowards(this.target.position, delta);
    }
    super.update(delta);
  }

  remove() {
    super.remove();
    // let explosion = new Explosion({position: this.position});
    // GAME.addObject(explosion);
  }
}
export default Missile;
