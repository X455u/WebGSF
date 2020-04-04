import * as THREE from 'three'

import GameObject from './GameObject'
import LargePlasmaCannon from './LargePlasmaCannon'
import { LOADER } from './GSFLoader'
import Turret from './Turret'
import { GAME } from './Game'

class PlasmaTurret extends GameObject {
  constructor() {
    let material = LOADER.get('railgunMaterial')
    super(LOADER.get('railgunBaseGeometry'), material)
    GAME.addObject(this)

    this.turret = new Turret(
      LOADER.get('plasmaTurretHeadGeometry'),
      material,
      LOADER.get('plasmaTurretGunGeometry'),
      material
    )
    this.turret.gun.translateOnAxis(new THREE.Vector3(0, 1, 0), 3.2)
    this.turret.gun.translateOnAxis(new THREE.Vector3(0, 0, 1), 1.6)
    this.add(this.turret)

    this.turret.translateOnAxis(new THREE.Vector3(0, 1, 0), 6)

    this.gun = new LargePlasmaCannon()
    this.gun.owner = this
    this.turret.gun.add(this.gun)
    this.turret.shoot = () => {
      this.gun.shoot()
    }

    // AI
    this.ai = null
    this.AItarget = null

    this.isStatic = true
  }

  update(delta) {
    if (this.ai) this.ai.update(this, delta)
    this.gun.update(delta)
  }
}
export default PlasmaTurret
