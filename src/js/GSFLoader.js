import THREE from 'three';

const JSON_LOADER = new THREE.JSONLoader();
const TEX_LOADER = new THREE.TextureLoader();

class GSFLoader {
  constructor(onStart, onProgress, onError, onLoad) {
    this.manager = new THREE.LoadingManager(onStart, onProgress, onError);
    this.manager.onLoad = onLoad;
    this.assets = {};
  }

  get(assetName) {
    return this.assets[assetName];
  }

  load() {
    /* eslint-disable dot-notation */
    JSON_LOADER.load('./media/nicce_fighter.json', (geometry) => {
      geometry.scale(0.5, 0.5, 0.5);
      geometry.rotateY(Math.PI);
      this.assets['fighterGeometry'] = geometry;
    });
    TEX_LOADER.load('./media/spaceship_comp.png', (texture) => {
      TEX_LOADER.load('./media/spaceship_nor.png', (normalMap) => {
        this.assets['fighterMaterial'] = new THREE.MeshPhongMaterial({
          map: texture,
          normalMap: normalMap
        });
      });
    });
    TEX_LOADER.load('./media/background.jpg', (texture) => {
      this.assets['backgroundTexture'] = texture;
    });
    /* eslint-enable dot-notation */
  }
}
export default GSFLoader;
