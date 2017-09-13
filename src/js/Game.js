import * as THREE from 'three';

import {SHOT_CONTROLLER} from './ShotController';

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

    // Remove objects
    let i = 0;
    while (this.objects[i]) {
      let object = this.objects[i];
      if (object.removed) {
        SCENE.remove(object);
        SHOT_CONTROLLER.removeShootable(object);
        this.objects.splice(this.objects.indexOf(object), 1);
      } else {
        i++;
      }
    }
  }

  addObject(object) {
    this.objects.push(object);
    SCENE.add(object);
    SHOT_CONTROLLER.addShootable(object);
  }

  addStatic(object) {
    SCENE.add(object);
    SHOT_CONTROLLER.addShootable(object);
  }

}
export const GAME = new Game();
