import * as THREE from 'three';
import {LOADER} from './GSFLoader';
import Ship from './Ship';
import SmallPulseLaser from './SmallPulseLaser';
import SimpleParticleSystem from './SimpleParticleSystem';
import {SOUND_LISTENER, SCENE} from './Game';

// Object pool
const VECTOR3_A = new THREE.Vector3();

const THRUSTER_POSITIONS = [
  new THREE.Vector3(-0.8, 0.25, 1), // Up-left
  new THREE.Vector3(0.8, 0.25, 1), // Up-right
  new THREE.Vector3(-0.8, -0.25, 1), // Down-left
  new THREE.Vector3(0.8, -0.25, 1) // Down-right
];

const COLLISION_HULL = [
  new THREE.Vector3(2.50, 1.50, 2.00),
  new THREE.Vector3(2.50, -1.50, 2.00),
  new THREE.Vector3(-2.50, 1.50, 2.00),
  new THREE.Vector3(-2.50, -1.50, 2.00),
  new THREE.Vector3(-2.50, -1.50, -1.75),
  new THREE.Vector3(2.50, -1.50, -1.75),
  new THREE.Vector3(2.50, 1.50, -1.75),
  new THREE.Vector3(-2.50, 1.50, -1.75),
  new THREE.Vector3(1.50, -0.25, -6.75),
  new THREE.Vector3(-1.50, -0.25, -6.75)
];
for (let vec of COLLISION_HULL) {
  vec.multiplyScalar(0.5);
}

class Fighter extends Ship {
  constructor() {
    super(LOADER.get('fighterGeometry'), LOADER.get('fighterMaterial'), {
      maxVelocity: 50,
      acceleration: 80,
      turnSpeed: 0.25,
      gun: new SmallPulseLaser(),
      maxHp: 100,
      maxShield: 50
    });
    this.weaponSide = 1;
    this.gun.translateX(0.7 * this.weaponSide);
    this.gun.translateZ(1);

    this.gun.addEventListener('onShoot', () => {
      this.weaponSide *= -1;
      this.gun.translateX(1.4 * this.weaponSide);
    });

    this.thrusters = [];
    for (let thrusterPosition of THRUSTER_POSITIONS) {
      let thruster = new SimpleParticleSystem({
        particles: 200,
        destination: new THREE.Vector3(0, 0, 2),
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

    this.sound = new THREE.PositionalAudio(SOUND_LISTENER);
    this.sound.setBuffer(LOADER.get('engine_ambient'));
    this.sound.setLoop(true);
    this.sound.setVolume(0.5);
    this.sound.setRefDistance(10);
    this.sound.setDistanceModel('exponential');
    this.sound.setRolloffFactor(2);
    this.add(this.sound);
    this.sound.play();

    this.collisionHulls = [COLLISION_HULL];
  }

  update(delta) {
    super.update(delta);
    for (let thruster of this.thrusters) {
      thruster.update(delta);
    }
    if (this.spotlight) this.spotlight.target.position.copy(VECTOR3_A.set(0, 0, -1).applyQuaternion(this.quaternion).add(this.position));
  }

  destroy() {
    super.destroy();
    if (this.spotlight) SCENE.remove(this.spotlight.target);
    this.sound.stop();
  }

  activateSpotlight() {
    this.spotlight = new THREE.SpotLight(0xffffff, 2, 300, 0.9, 0.75, 1.5);
    this.spotlight.position.set(0, 0, 0);
    this.spotlight.castShadow = true;
    this.spotlight.shadow.camera.near = 4;
    this.spotlight.shadow.camera.far = 300;
    this.add(this.spotlight);
    SCENE.add(this.spotlight.target);
  }
}
export default Fighter;
