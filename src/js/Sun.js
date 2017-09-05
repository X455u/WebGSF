import * as THREE from 'three';

const TEX_LOADER = new THREE.TextureLoader();
const texFlare0 = TEX_LOADER.load('./media/lensflare/lensflare0.png');
const texFlare2 = TEX_LOADER.load('./media/lensflare/lensflare2.png');
const texFlare3 = TEX_LOADER.load('./media/lensflare/lensflare3.png');

function lensFlareUpdateCallback(object) {
  let f, fl = object.lensFlares.length;
  let flare;
  let vecX = -object.positionScreen.x * 2;
  let vecY = -object.positionScreen.y * 2;
  for (f = 0; f < fl; f++) {
    flare = object.lensFlares[ f ];
    flare.x = object.positionScreen.x + vecX * flare.distance;
    flare.y = object.positionScreen.y + vecY * flare.distance;
    flare.rotation = 0;
  }
  object.lensFlares[2].y += 0.025;
  object.lensFlares[3].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
}

class Sun extends THREE.PointLight {

  constructor() {
    super(0xffffff, 3);
    let lensFlare = new THREE.LensFlare(texFlare0, 700, 0.0, THREE.AdditiveBlending, new THREE.Color(0xffffff));
    lensFlare.add(texFlare2, 512, 0.0, THREE.AdditiveBlending);
    lensFlare.add(texFlare2, 512, 0.0, THREE.AdditiveBlending);
    lensFlare.add(texFlare2, 512, 0.0, THREE.AdditiveBlending);
    lensFlare.add(texFlare3, 60, 0.6, THREE.AdditiveBlending);
    lensFlare.add(texFlare3, 70, 0.7, THREE.AdditiveBlending);
    lensFlare.add(texFlare3, 120, 0.9, THREE.AdditiveBlending);
    lensFlare.add(texFlare3, 70, 1.0, THREE.AdditiveBlending);
    lensFlare.customUpdateCallback = lensFlareUpdateCallback;
    this.add(lensFlare);
  }

}
export default Sun;
