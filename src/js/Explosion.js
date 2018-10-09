import * as THREE from 'three';
import {LOADER} from './GSFLoader';

class Explosion extends THREE.Sprite {
  constructor() {
    let texture = LOADER.get('explosionTexture').clone();
    texture.needsUpdate = true;
    let material = new THREE.SpriteMaterial({map: texture, color: 0xffffff});
    super(material);
    this.scale.set(10, 10, 1);
    this.now = 0;
    this.updateTime = 0.03;
    this.nextUpdate = this.now + this.updateTime;
    this.frames = 25;
  }

  update(delta) {
    this.now += delta;
    if (this.now > this.nextUpdate) {
      this.nextUpdate += this.updateTime;
      this.material.map.offset.x += 1 / this.frames;
      if (this.material.map.offset.x >= 1) this.removed = true;
    }
  }
}
export default Explosion;
