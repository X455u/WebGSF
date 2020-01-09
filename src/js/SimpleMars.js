import * as THREE from 'three';
import GameObject from './GameObject';
import {LOADER} from './GSFLoader';
import {GAME} from './Game';

class SimpleMars extends GameObject {
  constructor(radius, detail) {
    let geometry = new THREE.IcosahedronGeometry(radius, detail);
    let material = new THREE.MeshPhongMaterial({
      map: LOADER.get('marsTexture')
    });
    super(geometry, material);
    GAME.addObject(this);

    this.hitRadius = radius;
    this.isStatic = true;
  }
}
export default SimpleMars;
