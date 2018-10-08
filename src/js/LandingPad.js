// import * as THREE from 'three';
import GameObject from './GameObject';
import {GAME} from './Game';
import {LOADER} from './GSFLoader';

class LandingPad extends GameObject {
  constructor() {
    super(LOADER.get('landingPadBufferGeometry'), LOADER.get('landingPadMaterial'));
    GAME.addStatic(this, false);

    // this.castShadow = true;
    // this.receiveShadow = true;
  }

}
export default LandingPad;
