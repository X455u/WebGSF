import * as THREE from 'three';
import SubdivisionModifier from './SubdivisionModifier';
import Shot from './Shot';
import {LOADER} from './GSFLoader';
import {SOUND_LISTENER} from './Game';

let shotGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 8, 1);
shotGeometry.rotateX(Math.PI / 2);
shotGeometry.translate(0, 0, -2.5);
let modifier = new SubdivisionModifier(1);
modifier.modify(shotGeometry);
shotGeometry.faceVertexUvs = [];
shotGeometry.uvsNeedUpdate = true;
let shotMaterial = new THREE.MeshPhongMaterial({
  color: 0x000000,
  specular: 0x666666,
  emissive: 0xff0000,
  shininess: 0,
  flatShading: false,
  opacity: 0.75,
  transparent: true
});

class LaserShot extends Shot {

  constructor() {
    super(shotGeometry, shotMaterial);
    this.lifetimeLeft = 5;
    this.velocity = 300;
    this.damage = 5;

    let sound = new THREE.PositionalAudio(SOUND_LISTENER);
    sound.setBuffer(LOADER.get('laserSoundBuffer'));
    sound.setRefDistance(10);
    this.add(sound);
    sound.play();
  }

}
export default LaserShot;
