import * as THREE from 'three';

export const SCENE = new THREE.Scene();
export const PLANETS = [];

class Game {

  constructor() {
    this.objects = [];
  }

  update(delta) {
    for (const object of this.objects) {
      object.update(delta);
    }
  }

  addObject(object) {
    this.objects.push(object);
  }

}
export const GAME = new Game();
