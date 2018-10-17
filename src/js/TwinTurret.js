import * as THREE from 'three';
import GameObject from './GameObject';
import {SOUND_LISTENER} from './Game';
import {LOADER} from './GSFLoader';

class TwinTurret extends GameObject {
  constructor() {
    super(LOADER.get('twinTurretBaseGeometry'), new THREE.MeshPhongMaterial({color: 0x666666}));

    this.sound = new THREE.PositionalAudio(SOUND_LISTENER);
    this.sound.setBuffer(LOADER.get('low_pulsating_hum'));
    this.sound.setLoop(true);
    this.sound.setRefDistance(10);
    this.sound.setDistanceModel('exponential');
    this.sound.setRolloffFactor(2);
    this.add(this.sound);
    this.sound.play();

    this.isStatic = true;

    this.collisionHulls = [];
    for (let i = 0; i < 5; i++) {
      this.collisionHulls.push(LOADER.get('twinTurretBaseHull' + i));
    }
  }

  destroy() {
    super.destroy();
    this.sound.stop();
  }

}
export default TwinTurret;
