import * as THREE from 'three'
import GameObject from './GameObject'
import { SOUND_LISTENER, GAME } from './Game'
import { LOADER } from './GSFLoader'

const HULL_HEAD = [
  new THREE.Vector3(3.4, 23.2, -9.6),
  new THREE.Vector3(-3.4, 23.2, -9.6),
  new THREE.Vector3(-12, 23.2, -1),
  new THREE.Vector3(-12, 23.2, 1),
  new THREE.Vector3(3.4, 23.2, 9.6),
  new THREE.Vector3(-3.4, 23.2, 9.6),
  new THREE.Vector3(12, 23.2, -1),
  new THREE.Vector3(12, 23.2, 1),

  new THREE.Vector3(3.4, 16, -9.6),
  new THREE.Vector3(-3.4, 16, -9.6),
  new THREE.Vector3(-12, 16, -1),
  new THREE.Vector3(-12, 16, 1),
  new THREE.Vector3(3.4, 16, 9.6),
  new THREE.Vector3(-3.4, 16, 9.6),
  new THREE.Vector3(12, 16, -1),
  new THREE.Vector3(12, 16, 1),
]

const HULL_LEG = [
  new THREE.Vector3(5, 10.4, 0),
  new THREE.Vector3(0, 10.4, -5),
  new THREE.Vector3(-5, 10.4, 0),
  new THREE.Vector3(0, 10.4, 5),

  new THREE.Vector3(5, 16, 0),
  new THREE.Vector3(0, 16, -5),
  new THREE.Vector3(-5, 16, 0),
  new THREE.Vector3(0, 16, 5),
]

const HULL_FOOT = [
  new THREE.Vector3(9, 0, 0),
  new THREE.Vector3(0, 0, -9),
  new THREE.Vector3(-9, 0, 0),
  new THREE.Vector3(0, 0, 9),

  new THREE.Vector3(9, 6, 0),
  new THREE.Vector3(0, 6, -9),
  new THREE.Vector3(-9, 6, 0),
  new THREE.Vector3(0, 6, 9),

  new THREE.Vector3(5, 10.4, 0),
  new THREE.Vector3(0, 10.4, -5),
  new THREE.Vector3(-5, 10.4, 0),
  new THREE.Vector3(0, 10.4, 5),
]

const HULL_BEACON_1 = [
  new THREE.Vector3(3.2, 23.2, -9.0),
  new THREE.Vector3(2, 23.2, -7.8),
  new THREE.Vector3(3.2, 23.2, -6.6),
  new THREE.Vector3(4.4, 23.2, -7.8),

  new THREE.Vector3(3.2, 27.4, -9.0),
  new THREE.Vector3(2, 27.4, -7.8),
  new THREE.Vector3(3.2, 27.4, -6.6),
  new THREE.Vector3(4.4, 27.4, -7.8),

  new THREE.Vector3(3.2, 28.6, -7.8),
]

const HULL_BEACON_2 = [
  new THREE.Vector3(-3.2, 23.2, -9.0),
  new THREE.Vector3(-4.4, 23.2, -7.8),
  new THREE.Vector3(-3.2, 23.2, -6.6),
  new THREE.Vector3(-2.0, 23.2, -7.8),

  new THREE.Vector3(-3.2, 27.4, -9.0),
  new THREE.Vector3(-4.4, 27.4, -7.8),
  new THREE.Vector3(-3.2, 27.4, -6.6),
  new THREE.Vector3(-2.0, 27.4, -7.8),

  new THREE.Vector3(-3.2, 28.6, -7.8),
]

const HULL_BEACON_3 = [
  new THREE.Vector3(3.2, 23.2, 6.6),
  new THREE.Vector3(2, 23.2, 7.8),
  new THREE.Vector3(3.2, 23.2, 9.0),
  new THREE.Vector3(4.4, 23.2, 7.8),

  new THREE.Vector3(3.2, 27.4, 6.6),
  new THREE.Vector3(2, 27.4, 7.8),
  new THREE.Vector3(3.2, 27.4, 9.0),
  new THREE.Vector3(4.4, 27.4, 7.8),

  new THREE.Vector3(-3.2, 28.6, 7.8),
]

const HULL_BEACON_4 = [
  new THREE.Vector3(-3.2, 23.2, 6.6),
  new THREE.Vector3(-4.4, 23.2, 7.8),
  new THREE.Vector3(-3.2, 23.2, 9.0),
  new THREE.Vector3(-2.0, 23.2, 7.8),

  new THREE.Vector3(-3.2, 27.4, 6.6),
  new THREE.Vector3(-4.4, 27.4, 7.8),
  new THREE.Vector3(-3.2, 27.4, 9.0),
  new THREE.Vector3(-2.0, 27.4, 7.8),

  new THREE.Vector3(-3.2, 28.6, 7.8),
]

class LandingPad extends GameObject {
  constructor() {
    super(LOADER.get('landingPadGeometry'), LOADER.get('landingPadMaterial'))

    this.sound = new THREE.PositionalAudio(SOUND_LISTENER)
    this.sound.setBuffer(LOADER.get('low_pulsating_hum'))
    this.sound.setLoop(true)
    this.sound.setRefDistance(10)
    this.sound.setDistanceModel('exponential')
    this.sound.setRolloffFactor(2)
    this.add(this.sound)
    this.sound.play()

    GAME.addObject(this)

    this.hitRadius = 5
    this.isStatic = true

    this.collisionHulls = [HULL_HEAD, HULL_LEG, HULL_FOOT, HULL_BEACON_1, HULL_BEACON_2, HULL_BEACON_3, HULL_BEACON_4]
  }

  destroy() {
    super.destroy()
    this.sound.stop()
  }
}
export default LandingPad
