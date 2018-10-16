import * as THREE from 'three';
import GameObject from './GameObject';
import {LOADER} from './GSFLoader';

class SimpleMars extends GameObject {
  constructor(radius, detail) {
    let geometry = new THREE.IcosahedronGeometry(radius, detail);
    let material = new THREE.MeshPhongMaterial({
      color: 0x666666,
      shininess: 0,
      map: LOADER.get('marsTexture')
    });
    super(geometry, material);
    this.radius = radius;
    this.isStatic = true;
  }
}
export default SimpleMars;
