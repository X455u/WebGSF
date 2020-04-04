import * as THREE from 'three'
import SubdivisionModifier from './SubdivisionModifier'
import Shot from './Shot'
import { LOADER } from './GSFLoader'
import { SOUND_LISTENER } from './Game'
import SimpleParticleSystem from './SimpleParticleSystem'

let shotGeometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 8, 3)
shotGeometry.rotateX(Math.PI / 2)
let modifier = new SubdivisionModifier(2)
modifier.modify(shotGeometry)
shotGeometry.faceVertexUvs = []
shotGeometry.uvsNeedUpdate = true
let shotMaterial = new THREE.MeshPhongMaterial({
  color: 0x000000,
  specular: 0x666666,
  emissive: 0x00ff00,
  shininess: 0,
  flatShading: false,
  opacity: 0.75,
  transparent: true,
})

class PlasmaShot extends Shot {
  constructor() {
    super(shotGeometry, shotMaterial)
    this.lifetimeLeft = 10
    this.velocity = 200
    this.collisionDamage = 50

    this.sound = new THREE.PositionalAudio(SOUND_LISTENER)
    this.sound.setBuffer(LOADER.get('plasmaSoundBuffer'))
    this.sound.setRefDistance(10)
    this.add(this.sound)
    this.sound.play()

    let trail = new SimpleParticleSystem({
      particles: 200,
      destination: new THREE.Vector3(0, 0, 20),
      positionRandomness: 0.5,
      destinationRandomness: 0.5,
      color: new THREE.Color(0x00ff00),
      size: 200,
      lifetime: 0.2,
    })
    this.add(trail)
  }

  destroy() {
    super.destroy()
    this.remove(this.sound)
  }
}
export default PlasmaShot
