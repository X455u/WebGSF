import * as THREE from 'three';
import GameObject from './GameObject';
import {GAME, SOUND_LISTENER} from './Game';
import {LOADER} from './GSFLoader';

class LandingPad extends GameObject {
  constructor() {
    super(LOADER.get('landingPadBufferGeometry'), LOADER.get('landingPadMaterial'));
    GAME.addStatic(this, false);

    this.sound = new THREE.PositionalAudio(SOUND_LISTENER);
    this.sound.setBuffer(LOADER.get('low_pulsating_hum'));
    this.sound.setLoop(true);
    this.sound.setRefDistance(10);
    this.sound.setDistanceModel('exponential');
    this.sound.setRolloffFactor(2);
    this.add(this.sound);
    this.sound.play();
  }

  update(delta) {
    super.update(delta);
  }

  destroy() {
    super.destroy();
    this.sound.stop();
  }

}
export default LandingPad;
