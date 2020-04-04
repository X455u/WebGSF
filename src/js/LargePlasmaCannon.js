import * as THREE from 'three'
import PlasmaShot from './PlasmaShot'

class LargePlasmaCannon extends THREE.Object3D {

  constructor() {
    super()
    this.reloadTime = 4
    this.reload = this.reloadTime
    this.muzzleVelocity = 200
    this.owner = null
  }

  shoot() {
    if (this.reload !== 0.0) return
    let shot = new PlasmaShot()
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
export default LargePlasmaCannon
