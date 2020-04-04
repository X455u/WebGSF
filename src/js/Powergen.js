import * as THREE from 'three'
import Explosion from './Explosion'
import { GAME, SOUND_LISTENER } from './Game'
import GameObject from './GameObject'
import { LOADER } from './GSFLoader'

class Powergen extends GameObject {
  constructor() {
    super(LOADER.get('powergenGeometry'), LOADER.get('powergenMaterial'))

    this.hp = 30

    this.sound = new THREE.PositionalAudio(SOUND_LISTENER)
    this.sound.setBuffer(LOADER.get('low_pulsating_hum'))
    this.sound.setLoop(true)
    this.sound.setRefDistance(10)
    this.sound.setDistanceModel('exponential')
    this.sound.setRolloffFactor(2)
    this.add(this.sound)
    this.sound.play()

    GAME.addObject(this)

    this.hitRadius = 2
    this.isStatic = true

    this.collisionHulls = [new THREE.Geometry().fromBufferGeometry(this.geometry).vertices]
  }

  dealDamage(damage) {
    this.hp -= damage
    if (this.hp <= 0) {
      const explosion = new Explosion()
      explosion.position
        .copy(this.position)
        .addScaledVector(new THREE.Vector3().copy(this.up).applyQuaternion(this.quaternion), 2.5)
      GAME.addObject(explosion)
      this.destroy()
      this.dispatchEvent({
        type: 'onDeath',
      })
    }
  }

  destroy() {
    super.destroy()
    this.sound.stop()
  }
}
export default Powergen
