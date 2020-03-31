import * as THREE from 'three';
import {GAME, SOUND_LISTENER} from './Game';
import GameObject from './GameObject';
import {LOADER} from './GSFLoader';

class Powergen extends GameObject {
  constructor() {
    super(LOADER.get('powergenGeometry'), LOADER.get('powergenMaterial'));

    this.sound = new THREE.PositionalAudio(SOUND_LISTENER);
    this.sound.setBuffer(LOADER.get('low_pulsating_hum'));
    this.sound.setLoop(true);
    this.sound.setRefDistance(10);
    this.sound.setDistanceModel('exponential');
    this.sound.setRolloffFactor(2);
    this.add(this.sound);
    this.sound.play();

    GAME.addObject(this);

    this.hitRadius = 2;
    this.isStatic = true;

    this.collisionHulls = [new THREE.Geometry().fromBufferGeometry(this.geometry).vertices];

  }

  destroy() {
    super.destroy();
    this.sound.stop();
  }

}
export default Powergen;
