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
    this.TEX_LOADER.load('./media/planet_nor.png', (normalMap) => {
      this.assets['planetNormalMap'] = normalMap;
    });
    /* eslint-enable dot-notation */
  }
}
export const loader = new GSFLoader();
