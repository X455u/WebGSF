import * as THREE from 'three';

export const SCENE = new THREE.Scene();
export const COLLIDABLES = [];
export const SOUND_LISTENER = new THREE.AudioListener();

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
        remove(object, COLLIDABLES);
        remove(object, this.objects);
      } else {
        i++;
      }
    }
  }

  addObject(object, isShootable) {
    SCENE.add(object);
    this.objects.push(object);
    if (isShootable) COLLIDABLES.push(object);
  }

  addStatic(object, isShootable) {
    SCENE.add(object);
    if (isShootable) COLLIDABLES.push(object);
  }

  addShot(object, isShootable) {
    SCENE.add(object);
    this.objects.push(object);
    if (isShootable) COLLIDABLES.push(object);
  }

}
export const GAME = new Game();
