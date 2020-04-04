import * as THREE from 'three'

import {CAMERA} from './GSFCamera'
import gjk from './GJK'

export const SCENE = new THREE.Scene()
export const COLLIDABLES = []
export const SOUND_LISTENER = new THREE.AudioListener()
CAMERA.add(SOUND_LISTENER)

function remove(element, list) {
  let index = list.indexOf(element)
  if (index > -1) list.splice(index, 1)
}

// Object pool
const VECTOR3_A = new THREE.Vector3()
const VECTOR3_B = new THREE.Vector3()

class Game {

  constructor() {
    this.objects = []
    this.level = null
    this.i = 0
  }

  update(delta) {
    if (!this.level) return
    this.i++

    this.level.update(delta)

    let hitBoxes = {x: [], y: [], z: []}

    for (const object of this.objects) {
      object.update(delta)

      if (!object.geometry || !object.geometry.boundingSphere) continue

      if (object.isHighSpeed) {
        const [min, max] = object.getHighSpeedBroadPoints(delta)

        hitBoxes.x.push({object: object, coord: min.x})
        hitBoxes.y.push({object: object, coord: min.y})
        hitBoxes.z.push({object: object, coord: min.z})

        hitBoxes.x.push({object: object, coord: max.x})
        hitBoxes.y.push({object: object, coord: max.y})
        hitBoxes.z.push({object: object, coord: max.z})
      } else {
        let rotatedCenter = VECTOR3_A.copy(object.geometry.boundingSphere.center).applyQuaternion(object.quaternion)
        let boundingSpherePosition = VECTOR3_B.addVectors(object.position, rotatedCenter)
        let boundingSphereRadius = object.geometry.boundingSphere.radius

        hitBoxes.x.push({object: object, coord: boundingSpherePosition.x - boundingSphereRadius})
        hitBoxes.y.push({object: object, coord: boundingSpherePosition.y - boundingSphereRadius})
        hitBoxes.z.push({object: object, coord: boundingSpherePosition.z - boundingSphereRadius})

        hitBoxes.x.push({object: object, coord: boundingSpherePosition.x + boundingSphereRadius})
        hitBoxes.y.push({object: object, coord: boundingSpherePosition.y + boundingSphereRadius})
        hitBoxes.z.push({object: object, coord: boundingSpherePosition.z + boundingSphereRadius})
      }
    }

    hitBoxes.x.sort((a, b) => a.coord - b.coord)
    hitBoxes.y.sort((a, b) => a.coord - b.coord)
    hitBoxes.z.sort((a, b) => a.coord - b.coord)

    let possibleCollisions = []
    let withinX = new Set()
    let withinY = new Set()
    let withinZ = new Set()

    let checkCollision = (within, current) => {
      if (!within.delete(current)) {
        for (let object of within) {
          if (current.isStatic && object.isStatic) continue
          possibleCollisions.push({a: current, b: object})
        }
        within.add(current)
      }
    }

    for (let i = 0; i < hitBoxes.x.length; i++) {
      let x = hitBoxes.x[i]
      let y = hitBoxes.y[i]
      let z = hitBoxes.z[i]

      checkCollision(withinX, x.object)
      checkCollision(withinY, y.object)
      checkCollision(withinZ, z.object)
    }

    let collisionCounter = {}
    while (possibleCollisions.length > 0) {
      let collision = possibleCollisions.pop()
      if (collisionCounter[collision.a.uuid]) {

        if (collisionCounter[collision.a.uuid][collision.b.uuid]) {
          collisionCounter[collision.a.uuid][collision.b.uuid]++
        } else {
          collisionCounter[collision.a.uuid][collision.b.uuid] = 1
        }

      } else if (collisionCounter[collision.b.uuid]) {

        if (collisionCounter[collision.b.uuid][collision.a.uuid]) {
          collisionCounter[collision.b.uuid][collision.a.uuid]++
        } else {
          collisionCounter[collision.b.uuid][collision.a.uuid] = 1
        }

      } else {
        collisionCounter[collision.a.uuid] = {}
        collisionCounter[collision.a.uuid][collision.b.uuid] = 1
      }
    }

    let collisions = []
    for (let uuidA in collisionCounter) {
      for (let uuidB in collisionCounter[uuidA]) {
        if (collisionCounter[uuidA][uuidB] === 3) collisions.push({a: uuidA, b: uuidB})
      }
    }

    for (let collision of collisions) {
      let a = this.objects.find(obj => obj.uuid === collision.a)
      let b = this.objects.find(obj => obj.uuid === collision.b)
      let exit = false
      for (let hullA of a.collisionHulls) {
        for (let hullB of b.collisionHulls) {
          let hullAclone = a.isHighSpeed ? a.getHighSpeedNarrowPoints(delta) : hullA.map(vec => vec.clone().applyMatrix4(a.matrix))
          let hullBclone = b.isHighSpeed ? b.getHighSpeedNarrowPoints(delta) : hullB.map(vec => vec.clone().applyMatrix4(b.matrix))
          if (gjk(hullAclone, hullBclone)) {
            a.dealDamage(b.collisionDamage)
            b.dealDamage(a.collisionDamage)
            exit = true
            break
          }
        }
        if (exit) break
      }
    }

    SOUND_LISTENER.up.copy(VECTOR3_A.set(0, 1, 0).applyQuaternion(CAMERA.quaternion))

    // Remove objects
    let i = 0
    while (this.objects[i]) {
      let object = this.objects[i]
      if (object.removed) {
        SCENE.remove(object)
        remove(object, COLLIDABLES)
        remove(object, this.objects)
      } else {
        i++
      }
    }
  }

  addObject(object, collidable = true) {
    SCENE.add(object)
    this.objects.push(object)
    if (collidable) COLLIDABLES.push(object)
  }

  loadLevel(level) {
    let promise = new Promise((resolve) => {
      this.clear()
      level.load().then(() => {
        this.level = level
        resolve()
      })
    })
    return promise
  }

  clear() {
    CAMERA.position.set(0, 0, 0)
    CAMERA.quaternion.set(0, 0, 0, 1)
    CAMERA.target = null
    SCENE.children = []
    COLLIDABLES.length = 0
    for (let object of this.objects) {
      if (object.destroy) object.destroy()
    }
    this.objects = []
    if (this.level) {
      this.level.clear()
      this.level = null
    }
  }

}
export const GAME = new Game()
