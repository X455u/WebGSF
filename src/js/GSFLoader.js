import * as THREE from 'three';

class GSFLoader {
  constructor() {
    this.manager = new THREE.LoadingManager();
    this.JSON_LOADER = new THREE.JSONLoader(this.manager);
    this.BUFFER_GEOMETRY_LOADER = new THREE.BufferGeometryLoader(this.manager);
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
      geometry.scale(2, 2, 2);
      this.assets['railgunBaseGeometry'] = geometry;
    });
    this.BUFFER_GEOMETRY_LOADER.load('./media/plasmaTurretHeadGeometry.json', (geometry) => {
      geometry.scale(2, 2, 2);
      this.assets['plasmaTurretHeadGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry);
    });
    this.BUFFER_GEOMETRY_LOADER.load('./media/plasmaTurretGunGeometry.json', (geometry) => {
      geometry.scale(2, 2, 2);
      this.assets['plasmaTurretGunGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry);
    });
    this.TEX_LOADER.load('./media/railgun_ao.png', (aoMap) => {
      this.TEX_LOADER.load('./media/railgun_nor.png', (normalMap) => {
        this.TEX_LOADER.load('./media/railgun_comp.png', (texture) => {
          this.TEX_LOADER.load('./media/railgun_spec.png', (specular) => {
            this.assets['railgunMaterial'] = new THREE.MeshPhongMaterial({
              map: texture,
              aoMap: aoMap,
              normalMap: normalMap,
              specularMap: specular,
              color: 0x444444
            });
          });
        });
      });
    });
    this.BUFFER_GEOMETRY_LOADER.load('./media/landingpad.json', (geometry) => {
      this.assets['landingPadGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry);
    });
    this.TEX_LOADER.load('./media/landingpad_nor.png', (normalMap) => {
      this.TEX_LOADER.load('./media/landingpad_comp.png', (texture) => {
        this.assets['landingPadMaterial'] = new THREE.MeshPhongMaterial({
          map: texture,
          normalMap: normalMap,
          normalMapType: THREE.ObjectSpaceNormalMap,
          color: 0x444444
        });
      });
    });
    this.BUFFER_GEOMETRY_LOADER.load('./media/objects/twin_turret/twinTurretBase.json', (geometry) => {
      geometry.scale(2, 2, 2);
      this.assets['twinTurretBaseGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry);
    });
    for (let i = 0; i < 5; i++) {
      this.BUFFER_GEOMETRY_LOADER.load('./media/objects/twin_turret/hull' + i + '.json', (geometry) => {
        geometry.scale(2, 2, 2);
        this.assets['twinTurretBaseHull' + i] = new THREE.Geometry().fromBufferGeometry(geometry).vertices;
      });
    }
    this.TEX_LOADER.load('./media/background.jpg', (texture) => {
      this.assets['backgroundTexture'] = texture;
    });
    this.TEX_LOADER.load('./media/mars.jpg', (texture) => {
      this.assets['marsTexture'] = texture;
    });
    this.TEX_LOADER.load('./media/earthTexture.jpg', (texture) => {
      this.assets['earthTexture'] = texture;
    });
    this.TEX_LOADER.load('./media/earthNormalMap.png', (normalMap) => {
      this.assets['earthNormalMap'] = normalMap;
    });
    this.TEX_LOADER.load('./media/earthSpecularMap.png', (specularMap) => {
      this.assets['earthSpecularMap'] = specularMap;
    });
    this.TEX_LOADER.load('./media/earthClouds.jpg', (texture) => {
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
    this.TEX_LOADER.load('./media/explosion.png', (texture) => {
      this.assets['explosionTexture'] = texture;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1 / 25, 1);
    });
    this.AUDIO_LOADER.load('./media/laser.mp3', (buffer) => {
      this.assets['laserSoundBuffer'] = buffer;
    });
    this.AUDIO_LOADER.load('./media/plasma.mp3', (buffer) => {
      this.assets['plasmaSoundBuffer'] = buffer;
    });
    this.AUDIO_LOADER.load('./media/sounds/explosion0.mp3', (buffer) => {
      this.assets['explosion0'] = buffer;
    });
    this.AUDIO_LOADER.load('./media/sounds/explosion1.mp3', (buffer) => {
      this.assets['explosion1'] = buffer;
    });
    this.AUDIO_LOADER.load('./media/sounds/explosion2.mp3', (buffer) => {
      this.assets['explosion2'] = buffer;
    });
    this.AUDIO_LOADER.load('./media/sounds/engine_ambient.mp3', (buffer) => {
      this.assets['engine_ambient'] = buffer;
    });
    this.AUDIO_LOADER.load('./media/sounds/low_pulsating_hum.mp3', (buffer) => {
      this.assets['low_pulsating_hum'] = buffer;
    });
    /* eslint-enable dot-notation */
  }
}
export const LOADER = new GSFLoader();
