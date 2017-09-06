import ParticleEmitter from './ParticleEmitter';
import {SCENE} from './Game';

class ParticleSystem {

  constructor() {
    this.emitters = [];
  }

  update(delta) {
    this.emitters.forEach(emit => {
      emit.update(delta);
    });
  }

  createEmitter(options) {
    let newEmitter = new ParticleEmitter(options);
    this.emitters.push(newEmitter);
    SCENE.add(newEmitter);
  }

}

export default ParticleSystem;
