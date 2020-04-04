import * as THREE from 'three'
import {SCENE} from './Game'
import {LOADER} from './GSFLoader'
import {Lensflare, LensflareElement} from 'three-full'

class Sun extends THREE.DirectionalLight {

  constructor() {
    super(0xfffacd, 1.2)
    SCENE.add(this)
    SCENE.add(this.target)

    this.position.set(500, 500, -1000)
    this.castShadow = true
    this.shadow.mapSize.width = this.shadow.mapSize.height = 512 * 4
    this.shadow.camera.left = this.shadow.camera.bottom = -500
    this.shadow.camera.right = this.shadow.camera.top = 500
    this.shadow.camera.far = 10000

    let texFlare0 = LOADER.get('texFlare0')
    let texFlare2 = LOADER.get('texFlare2')
    let texFlare3 = LOADER.get('texFlare3')

    let lensflare = new Lensflare()
    lensflare.addElement(new LensflareElement(texFlare0, 512, 0.0))
    lensflare.addElement(new LensflareElement(texFlare2, 512, 0.0))
    lensflare.addElement(new LensflareElement(texFlare3, 60, 0.6))
    lensflare.addElement(new LensflareElement(texFlare3, 70, 0.7))
    lensflare.addElement(new LensflareElement(texFlare3, 120, 0.9))
    lensflare.addElement(new LensflareElement(texFlare3, 70, 1.0))
    this.add(lensflare)
  }

}
export default Sun
