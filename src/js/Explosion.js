import * as THREE from 'three';
import GPUParticleSystem from './GPUParticleSystem';
import {SCENE, CAMERA} from './Game';

class Explosion extends THREE.Object3D {
  constructor() {
    super();
    this.particleSystem = new GPUParticleSystem({maxParticles: 1000});
    SCENE.add(this.particleSystem);
    this.options = {
      position: new THREE.Vector3(),
      positionRandomness: 1,
      velocity: new THREE.Vector3(),
      velocityRandomness: 5,
      color: 0xaa0000,
      colorRandomness: 0.5,
      turbulence: 0.0,
      lifetime: 1,
      size: 1000,
      sizeRandomness: 500,
      distanceToCamera: 10
    };
    this.particleAmount = 200;
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
