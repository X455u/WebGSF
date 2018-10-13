import * as THREE from 'three';

import {LOADER} from './GSFLoader';
import {SCENE} from './Game';
import {CAMERA} from './GSFCamera';

const FAR = 500;
const SCALING_FACTOR = 10;

// Object pool
const VECTOR3_A = new THREE.Vector3();

class Crosshair {

  constructor() {
    this.source = null;
    let crosshairMaterial = new THREE.SpriteMaterial({
      color: 0x00ff00,
      map: LOADER.get('crosshair'),
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: false
    });
    this.sprite = new THREE.Sprite(crosshairMaterial);
    this.sprite.renderDepth = 0;
    SCENE.add(this.sprite);
  }

  setSourceObject(source) {
    this.source = source;
  }

  update() {
    if (!this.source) return;
    // let hitObject = this.source.checkCollision(this.source.quaternion, FAR);
    let hitObject;
    let distance = FAR;
    if (hitObject) {
      distance = VECTOR3_A.subVectors(hitObject.position, this.source.position).length();
    }
    this.sprite.position.copy(VECTOR3_A.set(0, 0, -1).applyQuaternion(this.source.quaternion).multiplyScalar(distance).add(this.source.position));
    let scale = VECTOR3_A.subVectors(this.sprite.position, CAMERA.position).length() / SCALING_FACTOR;
    this.sprite.scale.x = scale;
    this.sprite.scale.y = scale;
  }

}

export default Crosshair;
