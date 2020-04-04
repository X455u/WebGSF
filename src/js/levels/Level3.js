import * as THREE from 'three'
import Crosshair from '../Crosshair'
import Fighter from '../Fighter'
import { FIGHTER_AI } from '../FighterAI'
import { SCENE } from '../Game'
import { CAMERA } from '../GSFCamera'
import { LOADER } from '../GSFLoader'
import Level from '../Level'
import Mothership from '../Mothership'
import { PLAYER } from '../Player'
import SimpleEarth from '../SimpleEarth'
import Sun from '../Sun'
import { TURRET_AI } from '../TurretAI'

class Level3 extends Level {
  constructor() {
    super()

    this.assets = {
      sun: () => {
        let sun = new Sun()
        return sun
      },
      ambientLight: () => {
        let ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        SCENE.add(ambientLight)
        return ambientLight
      },
      background: () => {
        let material = new THREE.MeshBasicMaterial({
          map: LOADER.get('backgroundTexture'),
          side: THREE.BackSide,
          color: 0x555555,
        })
        let geometry = new THREE.SphereGeometry(100000, 32, 32)
        let stars = new THREE.Mesh(geometry, material)
        SCENE.add(stars)
        return stars
      },
      earth: () => {
        let earth = new SimpleEarth(10000, 5)
        earth.position.x = 15000
        return earth
      },
      playerShip: () => {
        let playerShip = new Fighter()
        playerShip.maxVelocity *= 1.0
        playerShip.turnSpeed *= 1.5
        playerShip.gun.reloadTime *= 0.2
        playerShip.maxHp = 100
        playerShip.maxShield = 50
        playerShip.shieldRegen = 2
        playerShip.team = 1
        PLAYER.crosshair = new Crosshair(CAMERA)
        PLAYER.setShip(playerShip)
        CAMERA.setTarget(playerShip)
        return playerShip
      },
      mothership: () => {
        let mothership = new Mothership()
        mothership.position.set(-1000, 300, -500)
        mothership.target = this.playerShip
        mothership.ai = TURRET_AI
        mothership.team = 1
        return mothership
      },
      mothership1: () => {
        let mothership = new Mothership()
        mothership.position.set(-1000, 300, -500)
        mothership.ai = TURRET_AI
        mothership.team = 1
        return mothership
      },
      fighterSpawner1: () => {
        let enemies = []
        let fighterSpawner = setInterval(() => {
          let enemyShip = new Fighter()
          enemyShip.position.copy(this.mothership1.position).sub(new THREE.Vector3(0, 0, -50))
          enemyShip.ai = FIGHTER_AI
          enemyShip.team = 1
          enemies.push(enemyShip)
        }, 5000)
        return fighterSpawner
      },
      mothership2: () => {
        let mothership = new Mothership()
        mothership.position.set(1000, 300, -500)
        mothership.ai = TURRET_AI
        mothership.team = 2
        return mothership
      },
      fighterSpawner2: () => {
        let enemies = []
        let fighterSpawner = setInterval(() => {
          let enemyShip = new Fighter()
          enemyShip.position.copy(this.mothership2.position).sub(new THREE.Vector3(0, 0, -50))
          enemyShip.ai = FIGHTER_AI
          enemyShip.team = 2
          enemies.push(enemyShip)
        }, 5000)
        return fighterSpawner
      },
    }
  }

  clear() {
    clearInterval(this.fighterSpawner1)
    clearInterval(this.fighterSpawner2)
  }

  update() {
    this.sun.target.position.copy(this.playerShip.position)
    this.sun.position.copy(this.playerShip.position)
    this.sun.position.x += 500
    this.sun.position.y += 500
    this.sun.position.z -= 1000
  }
}
export default Level3
