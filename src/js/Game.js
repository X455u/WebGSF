import * as THREE from 'three';

export const SCENE = new THREE.Scene();
export const RAYCASTER = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0);
export const PLANETS = [];
export const SHOOTABLES = [];

function remove(element, list) {
  let index = list.indexOf(element);
  if (index > -1) list.splice(index, 1);
}

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
        remove(object, SHOOTABLES);
        remove(object, this.objects);
      } else {
        i++;
      }
    }
  }

  addObject(object) {
    SCENE.add(object);
    SHOOTABLES.push(object);
    this.objects.push(object);
  }

  addStatic(object) {
    SCENE.add(object);
    SHOOTABLES.push(object);
  }

  addShot(object) {
    SCENE.add(object);
    this.objects.push(object);
  }

}
export const GAME = new Game();
