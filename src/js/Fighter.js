import * as THREE from 'three';
import {loader} from './GSFLoader';
import Ship from './Ship';
import SmallPulseLaser from './SmallPulseLaser';
import GPUParticleSystem from './GPUParticleSystem';
import {SCENE} from './Game';
import {CAMERA} from './GSFCamera';

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

    this.thrusters = [
      new THREE.Vector3(-0.8, 0.25, -1), // Up-left
      new THREE.Vector3(0.8, 0.25, -1), // Up-right
      new THREE.Vector3(-0.8, -0.25, -1), // Down-left
      new THREE.Vector3(0.8, -0.25, -1) // Down-right
    ];
    this.particleSystem = new GPUParticleSystem({maxParticles: 1800});
    SCENE.add(this.particleSystem);
    this.options = {
      position: new THREE.Vector3(),
      positionRandomness: 0.2,
      velocity: new THREE.Vector3(),
      velocityRandomness: 0.2,
      color: 0xffffaa,
      colorRandomness: 0.0,
      turbulence: 0.0,
      lifetime: 0.2,
      size: 800,
      sizeRandomness: 0,
      distanceToCamera: 10
    };
    this.spawnerOptions = {
      spawnRate: 200
    };
    this.tick = 0;
  }

  update(delta) {
    super.update(delta);

    let rotatedThrusters = [];
    for (let thruster of this.thrusters) {
      let rotatedThruster = thruster.clone();
      rotatedThruster.applyQuaternion(this.quaternion);
      rotatedThrusters.push(rotatedThruster);
    }
    let velocity = new THREE.Vector3(0, 0, -0.2);
    velocity.applyQuaternion(this.quaternion);
    this.options.velocity = velocity;
    this.options.distanceToCamera = CAMERA.position.distanceTo(this.position);
    let offsetSinceLastFrame = new THREE.Vector3(0, 0, -1);
    offsetSinceLastFrame.applyQuaternion(this.quaternion);
    offsetSinceLastFrame.multiplyScalar(this.velocity * delta);
    let particlesToSpawn = this.spawnerOptions.spawnRate * delta;
    for (let x = 0; x < particlesToSpawn; x++) {
      for (let rotatedThruster of rotatedThrusters) {
        this.options.position.addVectors(this.position, rotatedThruster);
        let offset = offsetSinceLastFrame.clone();
        offset.multiplyScalar(x / particlesToSpawn);
        this.options.position.add(offset);
        this.particleSystem.spawnParticle(this.options);
      }
    }

    if (this.tick < 0) this.tick = 0;
    this.tick += delta;
    this.particleSystem.update(this.tick);
  }
}
export default Fighter;
