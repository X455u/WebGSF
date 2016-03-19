import ParticleEmitter from './ParticleEmitter';

class ParticleSystem {

  constructor(scene) {
    this.emitters = [];
    this.scene = scene;
  }

  update(delta, power) {
    this.emitters.forEach(emit => {
      emit.update(delta, power);
    });
  }

  createEmitter(options) {
    let newEmitter = new ParticleEmitter(options);
    this.emitters.push(newEmitter);
    this.scene.add(newEmitter);
  }

}

export default ParticleSystem;
