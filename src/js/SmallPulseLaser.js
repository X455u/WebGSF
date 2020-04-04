import * as THREE from 'three'
import LaserShot from './LaserShot'

class SmallPulseLaser extends THREE.Object3D {
  constructor() {
    super()
    this.reload = 1.0
    this.reloadTime = 0.5
    this.muzzleVelocity = 300
    this.owner = null
  }

  shoot() {
    if (this.reload !== 0.0) return
    let shot = new LaserShot()
    shot.owner = this.owner
    this.getWorldPosition(shot.position)
    this.getWorldQuaternion(shot.quaternion)
    this.reload = this.reloadTime
    this.dispatchEvent({
      type: 'onShoot',
      shot: shot,
    })
  }

  update(delta) {
    this.reload = Math.max(0.0, this.reload - delta)
  }
}
export default SmallPulseLaser
