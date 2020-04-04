import GameObject from './GameObject'
import {GAME} from './Game'
import {Vector3} from 'three'

const VECTOR3_A = new Vector3()
const VECTOR3_B = new Vector3()

class Shot extends GameObject {
  constructor(geometry, material) {
    super(geometry, material)
    GAME.addObject(this, false)
    this.velocity = 300
    this.lifetime = 5
    this.collisionDamage = 1
    this.owner = null
    this.isHighSpeed = true
  }

  update(delta) {
    this.lifetime -= delta
    if (this.lifetime < 0) {
      this.destroy()
    }

    this.translateZ(-this.velocity * delta)
  }

  dealDamage() {
    this.destroy()
  }

  /** Points for broadphase check */
  getHighSpeedBroadPoints(delta) {
    const direction = VECTOR3_A.set(0, 0, -1).applyQuaternion(this.quaternion)
    const movement = direction.multiplyScalar(300 * delta)
    const nextFramePos = VECTOR3_B.addVectors(this.position, movement)
    return [this.position, nextFramePos]
  }

  /** Points for dragged hull */
  getHighSpeedNarrowPoints(delta) {
    return this.getHighSpeedBroadPoints(delta)
  }
}
export default Shot
