import * as THREE from 'three';

import gjk from './GJK';

// Object pool
const VECTOR3_A = new THREE.Vector3();
const VECTOR3_B = new THREE.Vector3();

export class Collidable {
  constructor() {
    this.hull = null;
    this.capsule = null;
    this.dragHull = null; // TODO: Implement draggable hull for high speeds
  }

  setHull(points) {
    this.hull = points;
  }

  setCapsule(start, end, radius) {
    this.capsule = {start: start, end: end, radius: radius};
  }
}

export function checkCollisions(collidables) {

  let hitBoxes = {x: [], y: [], z: []};

  for (const object of collidables) {
    if (!object.geometry || !object.geometry.boundingSphere) continue;

    let rotatedCenter = VECTOR3_A.copy(object.geometry.boundingSphere.center).applyQuaternion(object.quaternion);
    let boundingSpherePosition = VECTOR3_B.addVectors(object.position, rotatedCenter);
    let boundingSphereRadius = object.geometry.boundingSphere.radius;

    hitBoxes.x.push({object: object, coord: boundingSpherePosition.x - boundingSphereRadius});
    hitBoxes.y.push({object: object, coord: boundingSpherePosition.y - boundingSphereRadius});
    hitBoxes.z.push({object: object, coord: boundingSpherePosition.z - boundingSphereRadius});

    hitBoxes.x.push({object: object, coord: boundingSpherePosition.x + boundingSphereRadius});
    hitBoxes.y.push({object: object, coord: boundingSpherePosition.y + boundingSphereRadius});
    hitBoxes.z.push({object: object, coord: boundingSpherePosition.z + boundingSphereRadius});
  }

  hitBoxes.x.sort((a, b) => a.coord - b.coord);
  hitBoxes.y.sort((a, b) => a.coord - b.coord);
  hitBoxes.z.sort((a, b) => a.coord - b.coord);

  let possibleCollisions = [];
  let withinX = new Set();
  let withinY = new Set();
  let withinZ = new Set();

  let checkCollision = (within, current) => {
    if (!within.delete(current)) {
      for (let object of within) {
        if (current.isStatic && object.isStatic) continue;
        possibleCollisions.push({a: current, b: object});
      }
      within.add(current);
    }
  };

  for (let i = 0; i < hitBoxes.x.length; i++) {
    let x = hitBoxes.x[i];
    let y = hitBoxes.y[i];
    let z = hitBoxes.z[i];

    checkCollision(withinX, x.object);
    checkCollision(withinY, y.object);
    checkCollision(withinZ, z.object);
  }

  let collisionCounter = {};
  while (possibleCollisions.length > 0) {
    let collision = possibleCollisions.pop();
    if (collisionCounter[collision.a.uuid]) {

      if (collisionCounter[collision.a.uuid][collision.b.uuid]) {
        collisionCounter[collision.a.uuid][collision.b.uuid]++;
      } else {
        collisionCounter[collision.a.uuid][collision.b.uuid] = 1;
      }

    } else if (collisionCounter[collision.b.uuid]) {

      if (collisionCounter[collision.b.uuid][collision.a.uuid]) {
        collisionCounter[collision.b.uuid][collision.a.uuid]++;
      } else {
        collisionCounter[collision.b.uuid][collision.a.uuid] = 1;
      }

    } else {
      collisionCounter[collision.a.uuid] = {};
      collisionCounter[collision.a.uuid][collision.b.uuid] = 1;
    }
  }

  let collisions = [];
  for (let uuidA in collisionCounter) {
    for (let uuidB in collisionCounter[uuidA]) {
      if (collisionCounter[uuidA][uuidB] === 3) collisions.push({a: uuidA, b: uuidB});
    }
  }

  for (let collision of collisions) {
    let a = this.objects.find(obj => obj.uuid === collision.a);
    let b = this.objects.find(obj => obj.uuid === collision.b);
    let exit = false;
    for (let hullA of a.collisionHulls) {
      for (let hullB of b.collisionHulls) {
        let hullAclone = hullA.map(vec => vec.clone().applyMatrix4(a.matrix));
        let hullBclone = hullB.map(vec => vec.clone().applyMatrix4(b.matrix));
        if (gjk(hullAclone, hullBclone)) {
          a.dealDamage(b.collisionDamage);
          b.dealDamage(a.collisionDamage);
          exit = true;
          break;
        }
      }
      if (exit) break;
    }
  }

}