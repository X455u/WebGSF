import * as THREE from 'three';

import {CAMERA} from './GSFCamera';

export const SCENE = new THREE.Scene();
export const COLLIDABLES = [];
export const SOUND_LISTENER = new THREE.AudioListener();
CAMERA.add(SOUND_LISTENER);

function remove(element, list) {
  let index = list.indexOf(element);
  if (index > -1) list.splice(index, 1);
}

// Object pool
const VECTOR3_A = new THREE.Vector3();

class Game {

  constructor() {
    this.objects = [];
    this.level = null;
  }

  update(delta) {
    if (!this.level) return;

    this.level.update(delta);

    for (const object of this.objects) {
      object.update(delta);
    }

    SOUND_LISTENER.up.copy(VECTOR3_A.set(0, 1, 0).applyQuaternion(CAMERA.quaternion));

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
    this.objects.push(object);
    if (isShootable) COLLIDABLES.push(object);
  }

  addShot(object, isShootable) {
    SCENE.add(object);
    this.objects.push(object);
    if (isShootable) COLLIDABLES.push(object);
  }

  loadLevel(level) {
    let promise = new Promise((resolve) => {
      this.clear();
      level.load().then(() => {
        this.level = level;
        resolve();
      });
    });
    return promise;
  }

  clear() {
    CAMERA.position.set(0, 0, 0);
    CAMERA.quaternion.set(0, 0, 0, 1);
    CAMERA.target = null;
    SCENE.children = [];
    COLLIDABLES.length = 0;
    for (let object of this.objects) {
      if (object.destroy) object.destroy();
    }
    this.objects = [];
    if (this.level) {
      this.level.clear();
      this.level = null;
    }
  }

}
export const GAME = new Game();
