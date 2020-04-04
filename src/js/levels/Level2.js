import * as THREE from 'three'
import Crosshair from '../Crosshair'
import Fighter from '../Fighter'
import {SCENE} from '../Game'
import {CAMERA} from '../GSFCamera'
import {LOADER} from '../GSFLoader'
import Level from '../Level'
import PlasmaTurret from '../PlasmaTurret'
import {PLAYER} from '../Player'
import Powergen from '../Powergen'
import SimpleMars from '../SimpleMars'
import Sun from '../Sun'
import {TURRET_AI} from '../TurretAI'

class Level2 extends Level {
  constructor() {
    super()

    this.assets = {
      sun: () => {
        const sun = new Sun()
        return sun
      },
      ambientLight: () => {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        SCENE.add(ambientLight)
        return ambientLight
      },
      background: () => {
        const material = new THREE.MeshBasicMaterial({
          map: LOADER.get('backgroundTexture'),
          side: THREE.BackSide,
          color: 0x555555,
        })
        const geometry = new THREE.SphereGeometry(100000, 32, 32)
        const stars = new THREE.Mesh(geometry, material)
        SCENE.add(stars)
        return stars
      },
      mars: () => {
        const mars = new SimpleMars(550, 5)
        mars.position.y = -600
        mars.rotateX(1.5)
        return mars
      },
      playerShip: () => {
        const playerShip = new Fighter()
        playerShip.maxVelocity *= 1.0
        playerShip.turnSpeed *= 1.5
        playerShip.gun.reloadTime *= 0.2
        playerShip.maxHp = 75
        playerShip.maxShield = 50
        playerShip.shieldRegen = 2
        playerShip.team = 1
        PLAYER.crosshair = new Crosshair(CAMERA)
        PLAYER.setShip(playerShip)
        CAMERA.setTarget(playerShip)
        return playerShip
      },
      turrets: () => {
        const turrets = []
        for (let i = 0; i < 50; i++) {
          const turret = new PlasmaTurret()
          const direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
          turret.position.copy(direction).setLength(this.mars.hitRadius)
          turret.position.add(this.mars.position)
          turret.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
          turret.team = 2
          turret.ai = TURRET_AI
          turrets.push(turret)
        }
        return turrets
      },
      powergens: () => {
        let powergens = []
        for (let i = 0; i < 100; i++) {
          let powergen = new Powergen()
          let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
          powergen.position.copy(direction).setLength(this.mars.hitRadius)
          powergen.position.add(this.mars.position)
          powergen.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
          powergens.push(powergen)
        }
        return powergens
      },
    }
  }

  clear() {}

  update() {
    this.sun.target.position.copy(this.playerShip.position)
    this.sun.position.copy(this.playerShip.position)
    this.sun.position.x += 500
    this.sun.position.y += 500
    this.sun.position.z -= 1000
  }
}
export default Level2
