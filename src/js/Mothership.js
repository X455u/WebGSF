import * as THREE from 'three'
import { GAME } from './Game'
import GameObject from './GameObject'
import { LOADER } from './GSFLoader'
import LargePlasmaCannon from './LargePlasmaCannon'
import Turret from './Turret'

const ROTATION_SPEED = 0.05

const COLLISION_HULL = [
  new THREE.Vector3(2.5, 1.5, 2.0),
  new THREE.Vector3(2.5, -1.5, 2.0),
  new THREE.Vector3(-2.5, 1.5, 2.0),
  new THREE.Vector3(-2.5, -1.5, 2.0),
  new THREE.Vector3(-2.5, -1.5, -1.75),
  new THREE.Vector3(2.5, -1.5, -1.75),
  new THREE.Vector3(2.5, 1.5, -1.75),
  new THREE.Vector3(-2.5, 1.5, -1.75),
  new THREE.Vector3(1.5, -0.25, -6.75),
  new THREE.Vector3(-1.5, -0.25, -6.75),
]

class Mothership extends GameObject {
  constructor() {
    super(LOADER.get('mothershipGeometry'), LOADER.get('mothershipMaterial'))
    GAME.addObject(this)
    this.isStatic = true
    this.turrets = []
    this.ai = null

    let material = LOADER.get('railgunMaterial')
    let angularOffset = ((1 / 12) * 2 * Math.PI) / 2
    let radius = 200
    for (let i = 0; i < 12; i++) {
      let turret = new Turret(
        LOADER.get('plasmaTurretHeadGeometry'),
        material,
        LOADER.get('plasmaTurretGunGeometry'),
        material
      )
      turret.gun.translateOnAxis(new THREE.Vector3(0, 1, 0), 3.2)
      turret.gun.translateOnAxis(new THREE.Vector3(0, 0, 1), 1.6)
      this.add(turret)
      turret.translateOnAxis(new THREE.Vector3(1, 0, 0), radius * Math.cos((i / 12) * 2 * Math.PI + angularOffset))
      turret.translateOnAxis(new THREE.Vector3(0, 1, 0), 60)
      turret.translateOnAxis(new THREE.Vector3(0, 0, 1), radius * Math.sin((i / 12) * 2 * Math.PI + angularOffset))
      turret.weaponType = new LargePlasmaCannon()
      turret.weaponType.owner = this
      turret.gun.add(turret.weaponType)
      turret.weaponType.isShooting = false
      turret.shoot = () => {
        turret.weaponType.shoot()
      }
      this.turrets.push(turret)
    }

    this.collisionHulls = [COLLISION_HULL]
  }

  update(delta) {
    super.update(delta)
    this.rotateY(ROTATION_SPEED * delta)

    if (this.ai) {
      for (let turret of this.turrets) {
        turret.team = this.team
        this.ai.update(null, delta, turret)
      }
    }

    for (let turret of this.turrets) {
      turret.weaponType.update(delta)
    }
  }
}
export default Mothership
