import * as THREE from 'three';

class GSFObject extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    this.removed = false;
  }

  update() {}

  damage() {}

  remove() {
    this.removed = true;
  }
}
export default GSFObject;
