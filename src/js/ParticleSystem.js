import ParticleEmitter from './ParticleEmitter';

class ParticleSystem {

  constructor(scene) {
    this.emitters = [];
    this.scene = scene;
  }

  update(delta) {
    this.emitters.forEach(emit => {
      emit.update(delta);
    });
  }

  createEmitter(options) {
    let newEmitter = new ParticleEmitter(options);
    this.emitters.push(newEmitter);
    this.scene.add(newEmitter);
  }

}

export default ParticleSystem;
