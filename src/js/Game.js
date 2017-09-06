import * as THREE from 'three';

export const SCENE = new THREE.Scene();

class Game {

  constructor() {
    this.objects = [];
    this.player = null;
  }

  update(delta) {
    this.player.update(delta);
    for (const object of this.objects) {
      object.update(delta);
    }
  }

  addObject(object) {
    this.objects.push(object);
  }

}
export default Game;
