import * as THREE from 'three';
import GameObject from './GameObject';
import {loader} from './GSFLoader';

class SimpleMars extends GameObject {
  constructor(radius, detail) {
    let geometry = new THREE.IcosahedronGeometry(radius, detail);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    let material = new THREE.MeshPhongMaterial({
      color: 0xAAAAAA,
      shininess: 0.0,
      reflectivity: 0.0,
      map: loader.get('marsTexture')
    });

    super(geometry, material);

    this.hitRadius = radius;
  }
}
export default SimpleMars;
