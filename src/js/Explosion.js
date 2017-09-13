import * as THREE from 'three';
import GPUParticleSystem from './GPUParticleSystem';
import {SCENE} from './Game';
import {CAMERA} from './GSFCamera';

class Explosion extends THREE.Object3D {
  constructor(options) {
    super();
    this.position.copy(options.position);
    this.particleSystem = new GPUParticleSystem({maxParticles: 1000});
    SCENE.add(this.particleSystem);
    this.options = {
      position: options.position || new THREE.Vector3(),
      positionRandomness: options.positionRandomness || 1,
      velocity: options.velocity || new THREE.Vector3(),
      velocityRandomness: options.velocityRandomness || 5,
      color: options.color || 0xaa0000,
      colorRandomness: options.colorRandomness || 0.5,
      turbulence: options.turbulence || 0.0,
      lifetime: options.lifetime || 1,
      size: options.size || 1500,
      sizeRandomness: options.sizeRandomness || 500,
      distanceToCamera: 10
    };
    this.particleAmount = 400;
    this.options.distanceToCamera = CAMERA.position.distanceTo(this.position);
    for (let x = 0; x < this.particleAmount; x++) {
      this.particleSystem.spawnParticle(this.options);
    }
    this.tick = 0;
    this.particleSystem.update(0);
  }

  update(delta) {
    this.tick += delta;
    this.particleSystem.update(this.tick);
  }
}
export default Explosion;
