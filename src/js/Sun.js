import * as THREE from 'three';
import {LOADER} from './GSFLoader';
import {SCENE} from './Game';
import {Lensflare, LensflareElement} from 'three-full';

function LensflareUpdateCallback(object) {
  let f, fl = object.Lensflares.length;
  let flare;
  let vecX = -object.positionScreen.x * 2;
  let vecY = -object.positionScreen.y * 2;
  for (f = 0; f < fl; f++) {
    flare = object.Lensflares[ f ];
    flare.x = object.positionScreen.x + vecX * flare.distance;
    flare.y = object.positionScreen.y + vecY * flare.distance;
    flare.rotation = 0;
  }
  object.Lensflares[2].y += 0.025;
  object.Lensflares[3].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
}

class Sun extends THREE.DirectionalLight {

  constructor() {
    super(0xfffacd, 1.2);
    SCENE.add(this);
    SCENE.add(this.target);

    this.position.set(500, 500, -1000);
    this.castShadow = true;
    this.shadow.mapSize.width = this.shadow.mapSize.height = 512 * 4;
    this.shadow.camera.left = this.shadow.camera.bottom = -500;
    this.shadow.camera.right = this.shadow.camera.top = 500;
    this.shadow.camera.far = 10000;

    let texFlare0 = LOADER.get('texFlare0');
    let texFlare2 = LOADER.get('texFlare2');
    let texFlare3 = LOADER.get('texFlare3');
    let lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(texFlare0, 512, 0.0, new THREE.Color(0xffffff), THREE.AdditiveBlending));
    lensflare.addElement(new LensflareElement(texFlare2, 512, 0.0, new THREE.Color(0xffffff), THREE.AdditiveBlending));
    lensflare.addElement(new LensflareElement(texFlare2, 512, 0.0, new THREE.Color(0xffffff), THREE.AdditiveBlending));
    lensflare.addElement(new LensflareElement(texFlare2, 512, 0.0, new THREE.Color(0xffffff), THREE.AdditiveBlending));
    lensflare.addElement(new LensflareElement(texFlare3, 60, 0.6, new THREE.Color(0xffffff), THREE.AdditiveBlending));
    lensflare.addElement(new LensflareElement(texFlare3, 70, 0.7, new THREE.Color(0xffffff), THREE.AdditiveBlending));
    lensflare.addElement(new LensflareElement(texFlare3, 120, 0.9, new THREE.Color(0xffffff), THREE.AdditiveBlending));
    lensflare.addElement(new LensflareElement(texFlare3, 70, 1.0, new THREE.Color(0xffffff), THREE.AdditiveBlending));
    lensflare.customUpdateCallback = LensflareUpdateCallback;
    this.add(lensflare);
  }

}
export default Sun;
