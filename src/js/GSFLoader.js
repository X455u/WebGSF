import * as THREE from 'three';

class GSFLoader {
  constructor() {
    this.manager = new THREE.LoadingManager();
    this.JSON_LOADER = new THREE.JSONLoader(this.manager);
    this.TEX_LOADER = new THREE.TextureLoader(this.manager);
    this.AUDIO_LOADER = new THREE.AudioLoader(this.manager);
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
    this.JSON_LOADER.load('./media/railgun_base.json', (geometry) => {
      this.assets['railgunBaseGeometry'] = geometry;
      geometry.scale(2, 2, 2);
    });
    this.JSON_LOADER.load('./media/railgun_head.json', (geometry) => {
      this.assets['railgunHeadGeometry'] = geometry;
      geometry.scale(2, 2, 2);
      geometry.translate(0, -4, 0);
      geometry.rotateY(Math.PI);
    });
    this.JSON_LOADER.load('./media/railgun_gun.json', (geometry) => {
      this.assets['railgunGunGeometry'] = geometry;
      geometry.scale(2, 2, 2);
      geometry.translate(0, -10, 0);
      geometry.rotateY(Math.PI);
      geometry.rotateX(0.155 * Math.PI);
      geometry.translate(0, 0, 2);
    });
    this.TEX_LOADER.load('./media/railgun_ao.png', (aoMap) => {
      this.TEX_LOADER.load('./media/railgun_nor.png', (normalMap) => {
        this.assets['railgunMaterial'] = new THREE.MeshPhongMaterial({
          aoMap: aoMap,
          normalMap: normalMap,
          color: 0x444444
        });
      });
    });
    this.TEX_LOADER.load('./media/background.jpg', (texture) => {
      this.assets['backgroundTexture'] = texture;
    });
    // this.TEX_LOADER.load('./media/planet_nor.png', (normalMap) => {
    //   this.assets['planetNormalMap'] = normalMap;
    // });
    this.TEX_LOADER.load('./media/mars.jpg', (texture) => {
      this.assets['marsTexture'] = texture;
    });
    this.TEX_LOADER.load('./media/planet_nor_big.png', (normalMap) => {
      this.assets['marsNormalMap'] = normalMap;
    });
    this.TEX_LOADER.load('./media/earthTexture.jpg', (texture) => {
      this.assets['earthTexture'] = texture;
    });
    this.TEX_LOADER.load('./media/earthNormalMap.jpg', (normalMap) => {
      this.assets['earthNormalMap'] = normalMap;
    });
    this.TEX_LOADER.load('./media/earthClouds.png', (texture) => {
      this.assets['earthClouds'] = texture;
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
    this.AUDIO_LOADER.load('./media/laser.mp3', (buffer) => {
      this.assets['laserSoundBuffer'] = buffer;
    });
    this.AUDIO_LOADER.load('./media/plasma.mp3', (buffer) => {
      this.assets['plasmaSoundBuffer'] = buffer;
    });
    /* eslint-enable dot-notation */
  }
}
export const LOADER = new GSFLoader();
