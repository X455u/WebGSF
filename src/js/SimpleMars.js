import * as THREE from 'three';
import GameObject from './GameObject';
import {LOADER} from './GSFLoader';

class SimpleMars extends GameObject {
  constructor(radius, detail) {
    let geometry = new THREE.IcosahedronGeometry(radius, detail);
    let normalMap = LOADER.get('marsNormalMap');
    let material = new THREE.MeshPhongMaterial({
      color: 0xAAAAAA,
      shininess: 0,
      map: LOADER.get('marsTexture'),
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.2, 0.2)
    });
    super(geometry, material);
    this.radius = radius;
    this.isStatic = true;
  }
}
export default SimpleMars;
