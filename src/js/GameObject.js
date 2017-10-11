import * as THREE from 'three';

class GameObject extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    this.removed = false;
    this.hitRadius = 1;
  }

  update() {}

  damage() {}

  remove() {
    this.removed = true;
  }
}
export default GameObject;
