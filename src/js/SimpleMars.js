import * as THREE from 'three';
import GameObject from './GameObject';
import {LOADER} from './GSFLoader';
import {GAME} from './Game';

class SimpleMars extends GameObject {
  constructor(radius, detail) {
    let geometry = new THREE.IcosahedronGeometry(radius, detail);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    let normalMap = LOADER.get('marsNormalMap');
    let material = new THREE.MeshPhongMaterial({
      color: 0xAAAAAA,
      shininess: 0,
      map: LOADER.get('marsTexture'),
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.2, 0.2)
    });

    super(geometry, material);

    GAME.addStatic(this, true);
    this.hitRadius = radius;
  }
}
export default SimpleMars;
