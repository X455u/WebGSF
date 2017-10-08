import * as THREE from 'three';
import {loader} from './GSFLoader';
import Ship from './Ship';
import SmallPulseLaser from './SmallPulseLaser';
import SimpleParticleSystem from './SimpleParticleSystem';

class Fighter extends Ship {
  constructor() {
    super(loader.get('fighterGeometry'), loader.get('fighterMaterial'), {
      maxVelocity: 50,
      acceleration: 80,
      turnSpeed: 0.25,
      gun: new SmallPulseLaser(),
      maxHp: 100,
      maxShield: 50
    });
    this.weaponSide = 1;
    this.gun.translateX(0.7 * this.weaponSide);
    this.gun.translateZ(2.8);

    this.gun.addEventListener('onShoot', () => {
      this.weaponSide *= -1;
      this.gun.translateX(1.4 * this.weaponSide);
    });

    this.thrusterPositions = [
      new THREE.Vector3(-0.8, 0.25, -1), // Up-left
      new THREE.Vector3(0.8, 0.25, -1), // Up-right
      new THREE.Vector3(-0.8, -0.25, -1), // Down-left
      new THREE.Vector3(0.8, -0.25, -1) // Down-right
    ];

    this.thrusters = [];
    for (let thrusterPosition of this.thrusterPositions) {
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
      thruster.translateX(thrusterPosition.x);
      thruster.translateY(thrusterPosition.y);
      thruster.translateZ(thrusterPosition.z);
      this.thrusters.push(thruster);
    }
  }

  update(delta) {
    super.update(delta);
    for (let thruster of this.thrusters) {
      thruster.update(delta);
    }
  }
}
export default Fighter;
