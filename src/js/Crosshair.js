import * as THREE from 'three';

import {LOADER} from './GSFLoader';
import {SCENE} from './Game';

const FAR = 500;

class Crosshair extends THREE.Sprite {

  constructor() {
    let crosshairMaterial = new THREE.SpriteMaterial({
      color: 0x00ff00,
      map: LOADER.get('crosshair'),
      transparent: true,
      opacity: 0.5,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: false,
      lights: false,
      sizeAttenuation: false
    });
    super(crosshairMaterial);
    this.scale.set(0.1, 0.1, 1);
    SCENE.add(this);

    this.source = null;
  }

  setSourceObject(source) {
    this.source = source;
  }

  update() {
    if (!this.source) return;
    this.position.set(0, 0, -1).applyQuaternion(this.source.quaternion).multiplyScalar(FAR).add(this.source.position);
  }

}

export default Crosshair;
