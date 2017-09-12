import * as THREE from 'three';

export const SCENE = new THREE.Scene();
export const CAMERA = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000000);
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
