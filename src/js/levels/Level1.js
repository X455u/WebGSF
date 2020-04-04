import * as THREE from 'three'
import Crosshair from '../Crosshair'
import Fighter from '../Fighter'
import {FIGHTER_AI} from '../FighterAI'
import {SCENE} from '../Game'
import {CAMERA} from '../GSFCamera'
import {LOADER} from '../GSFLoader'
import Level from '../Level'
import {PLAYER} from '../Player'
import SimpleMars from '../SimpleMars'
import Sun from '../Sun'

class Level1 extends Level {
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
        const mars = new SimpleMars(5500, 5)
        mars.position.y = -6000
        return mars
      },
      playerShip: () => {
        const playerShip = new Fighter()
        playerShip.maxVelocity *= 0.9
        playerShip.turnSpeed *= 1.5
        playerShip.gun.reloadTime *= 0.2
        playerShip.maxShield = 1
        playerShip.team = 1
        PLAYER.crosshair = new Crosshair(CAMERA)
        PLAYER.setShip(playerShip)
        CAMERA.setTarget(playerShip)
        return playerShip
      },
      enemyFighter: () => {
        const enemyFighter = new Fighter()
        enemyFighter.position.copy(this.playerShip.position)
        enemyFighter.position.add(new THREE.Vector3(20, 20, -200))
        enemyFighter.ai = FIGHTER_AI
        enemyFighter.team = 2
        return enemyFighter
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
    this.isFinished = this.enemyFighter.removed
  }
}
export default Level1
