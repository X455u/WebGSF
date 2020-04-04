import * as THREE from 'three'
import Shot from './Shot'
import SimpleParticleSystem from './SimpleParticleSystem'
import Explosion from './Explosion'
import { GAME } from './Game'
import Ship from './Ship'

let missileTop = new THREE.ConeGeometry(0.2, 0.5, 8, 1, true)
missileTop.translate(0, 1.25, 0)
let missileMiddle = new THREE.CylinderGeometry(0.2, 0.2, 2, 8, 1)
let missileWing1 = new THREE.PlaneGeometry(0.8, 0.5)
missileWing1.translate(0, -0.75, 0)
let missileWing2 = new THREE.PlaneGeometry(0.8, 0.5)
missileWing2.translate(0, -0.75, 0)
missileWing2.rotateY(Math.PI / 2)
let missileGeometry = new THREE.Geometry()
missileGeometry.merge(missileTop)
missileGeometry.merge(missileMiddle)
missileGeometry.merge(missileWing1)
missileGeometry.merge(missileWing2)
missileGeometry.rotateX(Math.PI / 2)

let missileMaterial = new THREE.MeshPhongMaterial({
  color: 0xaaaaaa,
  side: THREE.DoubleSide,
})

class Missile extends Shot {
  constructor() {
    super(missileGeometry, missileMaterial)
    this.velocity = 120
    this.lifetime = 10
    this.damage = 20

    this.target = null

    let thruster = new SimpleParticleSystem({
      particles: 200,
      destination: new THREE.Vector3(0, 0, -2),
      positionRandomness: 0.2,
      destinationRandomness: 0.5,
      color: new THREE.Color(0xff0000),
      size: 100,
      lifetime: 0.2,
    })
    this.add(thruster)
    thruster.translateZ(-1)
  }

  update(delta) {
    if (this.target && !this.target.removed) {
      this.turnTowards(this.target.position, delta)
    } else {
      let newTarget = this.checkCollision(this.quaternion, 50, 20)
      if (newTarget instanceof Ship) {
        this.target = newTarget
      }
    }
    super.update(delta)
  }

  destroy() {
    super.destroy()
    let explosion = new Explosion()
    explosion.position.copy(this.position)
    GAME.addObject(explosion)
  }
}
export default Missile
