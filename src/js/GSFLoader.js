import * as THREE from 'three';

class GSFLoader {
  constructor() {
    this.manager = new THREE.LoadingManager();
    this.JSON_LOADER = new THREE.JSONLoader(this.manager);
    this.TEX_LOADER = new THREE.TextureLoader(this.manager);
    this.assets = {};
  }

  get(assetName) {
    return this.assets[assetName];
  }

  load() {
    /* eslint-disable dot-notation */
    this.JSON_LOADER.load('./media/nicce_fighter.json', (geometry) => {
      geometry.scale(0.5, 0.5, 0.5);
      geometry.rotateY(Math.PI);
      this.assets['fighterGeometry'] = geometry;
    });
    this.TEX_LOADER.load('./media/spaceship_comp.png', (texture) => {
      this.TEX_LOADER.load('./media/spaceship_nor.png', (normalMap) => {
        this.assets['fighterMaterial'] = new THREE.MeshPhongMaterial({
          map: texture,
          normalMap: normalMap
        });
      });
    });
    this.TEX_LOADER.load('./media/background.jpg', (texture) => {
      this.assets['backgroundTexture'] = texture;
    });
    // this.TEX_LOADER.load('./media/planet_nor.png', (normalMap) => {
    //   this.assets['planetNormalMap'] = normalMap;
    // });
    this.TEX_LOADER.load('./media/planet_nor_big.png', (normalMap) => {
      this.assets['planetNormalMapBig'] = normalMap;
    });
    this.TEX_LOADER.load('./media/mars.jpg', (texture) => {
      this.assets['marsTexture'] = texture;
    });
    this.TEX_LOADER.load('./media/lensflare/lensflare0.png', (texture) => {
      this.assets['texFlare0'] = texture;
    });
    this.TEX_LOADER.load('./media/lensflare/lensflare2.png', (texture) => {
      this.assets['texFlare2'] = texture;
    });
    this.TEX_LOADER.load('./media/lensflare/lensflare3.png', (texture) => {
      this.assets['texFlare3'] = texture;
    });
    this.TEX_LOADER.load('./media/crosshair.png', (texture) => {
      this.assets['crosshair'] = texture;
    });
    /* eslint-enable dot-notation */
  }
}
export const loader = new GSFLoader();
