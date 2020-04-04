import * as THREE from 'three'
import GameObject from './GameObject'
import { SOUND_LISTENER, GAME } from './Game'
import { LOADER } from './GSFLoader'
import Turret from './Turret'
import LargePlasmaCannon from './LargePlasmaCannon'

class TwinTurret extends GameObject {
  constructor() {
    super(LOADER.get('twinTurretBaseGeometry'), LOADER.get('twinTurretTexture'))

    GAME.addObject(this)

    this.sound = new THREE.PositionalAudio(SOUND_LISTENER)
    this.sound.setBuffer(LOADER.get('low_pulsating_hum'))
    this.sound.setLoop(true)
    this.sound.setRefDistance(10)
    this.sound.setDistanceModel('exponential')
    this.sound.setRolloffFactor(2)
    this.add(this.sound)
    this.sound.play()

    this.isStatic = true
    this.ai = null
    this.AItarget = null

    this.collisionHulls = []
    for (let i = 0; i < 5; i++) {
      this.collisionHulls.push(LOADER.get('twinTurretBaseHull' + i))
    }

    let material = LOADER.get('railgunMaterial')

    this.turret1 = new Turret(
      LOADER.get('plasmaTurretHeadGeometry'),
      material,
      LOADER.get('plasmaTurretGunGeometry'),
      material
    )
    this.turret1.gun.translateOnAxis(new THREE.Vector3(0, 1, 0), 3.2)
    this.turret1.gun.translateOnAxis(new THREE.Vector3(0, 0, 1), 1.6)
    this.add(this.turret1)
    this.turret1.translateOnAxis(new THREE.Vector3(1, 0, 0), -0.3)
    this.turret1.translateOnAxis(new THREE.Vector3(0, 1, 0), 5.4)
    this.turret1.translateOnAxis(new THREE.Vector3(0, 0, 1), 21.5)
    this.turret1.weaponType = new LargePlasmaCannon()
    this.turret1.weaponType.owner = this
    this.turret1.gun.add(this.turret1.weaponType)
    this.turret1.weaponType.isShooting = false
    this.turret1.shoot = () => {
      this.turret1.weaponType.shoot()
    }

    this.turret2 = new Turret(
      LOADER.get('plasmaTurretHeadGeometry'),
      material,
      LOADER.get('plasmaTurretGunGeometry'),
      material
    )
    this.turret2.gun.translateOnAxis(new THREE.Vector3(0, 1, 0), 3.2)
    this.turret2.gun.translateOnAxis(new THREE.Vector3(0, 0, 1), 1.6)
    this.add(this.turret2)
    this.turret2.translateOnAxis(new THREE.Vector3(1, 0, 0), -0.3)
    this.turret2.translateOnAxis(new THREE.Vector3(0, 1, 0), 5.4)
    this.turret2.translateOnAxis(new THREE.Vector3(0, 0, 1), -21.5)
    this.turret2.weaponType = new LargePlasmaCannon()
    this.turret2.weaponType.owner = this
    this.turret2.gun.add(this.turret2.weaponType)
    this.turret2.weaponType.isShooting = false
    this.turret2.shoot = () => {
      this.turret2.weaponType.shoot()
    }
  }

  update(delta) {
    if (this.ai) {
      this.ai.update(this.turret1, delta)
      this.ai.update(this.turret2, delta)
    }

    this.turret1.weaponType.update(delta)
    this.turret2.weaponType.update(delta)
  }

  destroy() {
    super.destroy()
    this.sound.stop()
  }
}
export default TwinTurret
