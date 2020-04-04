import * as THREE from 'three'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js'
import background from '../assets/background.jpg'
import crosshair from '../assets/crosshair.png'
import earthClouds from '../assets/earthClouds.jpg'
import earthNormalMap from '../assets/earthNormalMap.png'
import earthSpecularMap from '../assets/earthSpecularMap.png'
import earthTexture from '../assets/earthTexture.jpg'
import explosion from '../assets/explosion.png'
import landingpad from '../assets/landingpad.json'
import landingpadComp from '../assets/landingpad_comp.png'
import landingpadNor from '../assets/landingpad_nor.png'
import laser from '../assets/laser.mp3'
import lensflare0 from '../assets/lensflare/lensflare0.png'
import lensflare2 from '../assets/lensflare/lensflare2.png'
import lensflare3 from '../assets/lensflare/lensflare3.png'
import mars from '../assets/mars.jpg'
import nicceFighter from '../assets/nicce_fighter_buf.json'
import mothershipGeometry from '../assets/objects/mothership/mothershipGeometry.json'
import mothershipCol from '../assets/objects/mothership/mothership_col.png'
import mothershipNor from '../assets/objects/mothership/mothership_nor.png'
import hull0 from '../assets/objects/twin_turret/hull0.json'
import hull1 from '../assets/objects/twin_turret/hull1.json'
import hull2 from '../assets/objects/twin_turret/hull2.json'
import hull3 from '../assets/objects/twin_turret/hull3.json'
import hull4 from '../assets/objects/twin_turret/hull4.json'
import twinTurretBase from '../assets/objects/twin_turret/twinTurretBase.json'
import twinTurretTexture from '../assets/objects/twin_turret/twinTurretTexture.png'
import plasma from '../assets/plasma.mp3'
import plasmaTurretGunGeometry from '../assets/plasmaTurretGunGeometry.json'
import plasmaTurretHeadGeometry from '../assets/plasmaTurretHeadGeometry.json'
import powergenObj from '../assets/powergen/powergen.obj'
import powergenDiff from '../assets/powergen/powergen_diff.png'
import powergenNor from '../assets/powergen/powergen_nor.png'
import railgunBase from '../assets/railgun_base_buf.json'
import railgunComp from '../assets/railgun_comp.png'
import railgunNor from '../assets/railgun_nor.png'
import railgunSpec from '../assets/railgun_spec.png'
import engineAmbient from '../assets/sounds/engine_ambient.mp3'
import explosion0 from '../assets/sounds/explosion0.mp3'
import explosion1 from '../assets/sounds/explosion1.mp3'
import explosion2 from '../assets/sounds/explosion2.mp3'
import lowPulsatingHum from '../assets/sounds/low_pulsating_hum.mp3'
import spaceshipComp from '../assets/spaceship_comp.png'
import spaceshipNor from '../assets/spaceship_nor.png'

class GSFLoader {
  constructor() {
    this.manager = new THREE.LoadingManager()
    this.BUFFER_GEOMETRY_LOADER = new THREE.BufferGeometryLoader(this.manager)
    this.TEX_LOADER = new THREE.TextureLoader(this.manager)
    this.AUDIO_LOADER = new THREE.AudioLoader(this.manager)
    this.OBJ_LOADER = new OBJLoader(this.manager)
    this.assets = {}
  }

  get(assetName) {
    return this.assets[assetName]
  }

  load() {
    /* eslint-disable dot-notation */
    this.OBJ_LOADER.load(powergenObj, obj => {
      this.assets['powergenGeometry'] = obj.children[0].geometry
    })
    this.TEX_LOADER.load(powergenDiff, (diff) => {
      this.TEX_LOADER.load(powergenNor, (nor) => {
        this.assets['powergenMaterial'] = new THREE.MeshPhongMaterial({
          map: diff,
          normalMap: nor,
        })
      })
    })
    this.BUFFER_GEOMETRY_LOADER.load(nicceFighter, (geometry) => {
      this.assets['fighterGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry)
    })
    this.TEX_LOADER.load(spaceshipComp, (texture) => {
      this.TEX_LOADER.load(spaceshipNor, (normalMap) => {
        this.assets['fighterMaterial'] = new THREE.MeshPhongMaterial({
          map: texture,
          normalMap: normalMap,
        })
      })
    })
    this.BUFFER_GEOMETRY_LOADER.load(railgunBase, (geometry) => {
      this.assets['railgunBaseGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry)
    })
    this.BUFFER_GEOMETRY_LOADER.load(plasmaTurretHeadGeometry, (geometry) => {
      geometry.scale(2, 2, 2)
      this.assets['plasmaTurretHeadGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry)
    })
    this.BUFFER_GEOMETRY_LOADER.load(plasmaTurretGunGeometry, (geometry) => {
      geometry.scale(2, 2, 2)
      this.assets['plasmaTurretGunGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry)
    })
    this.TEX_LOADER.load(railgunNor, (normalMap) => {
      this.TEX_LOADER.load(railgunComp, (texture) => {
        this.TEX_LOADER.load(railgunSpec, (specular) => {
          this.assets['railgunMaterial'] = new THREE.MeshPhongMaterial({
            map: texture,
            normalMap: normalMap,
            specularMap: specular,
            color: 0x808080,
          })
        })
      })
    })
    this.BUFFER_GEOMETRY_LOADER.load(landingpad, (geometry) => {
      this.assets['landingPadGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry)
    })
    this.TEX_LOADER.load(landingpadNor, (normalMap) => {
      this.TEX_LOADER.load(landingpadComp, (texture) => {
        this.assets['landingPadMaterial'] = new THREE.MeshPhongMaterial({
          map: texture,
          normalMap: normalMap,
          normalMapType: THREE.ObjectSpaceNormalMap,
        })
      })
    })
    this.BUFFER_GEOMETRY_LOADER.load(twinTurretBase, (geometry) => {
      geometry.scale(2, 2, 2)
      this.assets['twinTurretBaseGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry)
    })
    this.BUFFER_GEOMETRY_LOADER.load(hull0, (geometry) => {
      geometry.scale(2, 2, 2)
      this.assets['twinTurretBaseHull0'] = new THREE.Geometry().fromBufferGeometry(geometry).vertices
    })
    this.BUFFER_GEOMETRY_LOADER.load(hull1, (geometry) => {
      geometry.scale(2, 2, 2)
      this.assets['twinTurretBaseHull1'] = new THREE.Geometry().fromBufferGeometry(geometry).vertices
    })
    this.BUFFER_GEOMETRY_LOADER.load(hull2, (geometry) => {
      geometry.scale(2, 2, 2)
      this.assets['twinTurretBaseHull2'] = new THREE.Geometry().fromBufferGeometry(geometry).vertices
    })
    this.BUFFER_GEOMETRY_LOADER.load(hull3, (geometry) => {
      geometry.scale(2, 2, 2)
      this.assets['twinTurretBaseHull3'] = new THREE.Geometry().fromBufferGeometry(geometry).vertices
    })
    this.BUFFER_GEOMETRY_LOADER.load(hull4, (geometry) => {
      geometry.scale(2, 2, 2)
      this.assets['twinTurretBaseHull4'] = new THREE.Geometry().fromBufferGeometry(geometry).vertices
    })
    this.TEX_LOADER.load(twinTurretTexture, (texture) => {
      this.assets['twinTurretTexture'] = new THREE.MeshPhongMaterial({
        map: texture,
      })
    })
    this.BUFFER_GEOMETRY_LOADER.load(mothershipGeometry, (geometry) => {
      geometry.scale(40, 40, 40)
      this.assets['mothershipGeometry'] = new THREE.Geometry().fromBufferGeometry(geometry)
    })
    this.TEX_LOADER.load(mothershipNor, (normalMap) => {
      this.TEX_LOADER.load(mothershipCol, (texture) => {
        this.assets['mothershipMaterial'] = new THREE.MeshPhongMaterial({
          map: texture,
          normalMap: normalMap,
        })
      })
    })
    this.TEX_LOADER.load(background, (texture) => {
      this.assets['backgroundTexture'] = texture
    })
    this.TEX_LOADER.load(mars, (texture) => {
      this.assets['marsTexture'] = texture
    })
    this.TEX_LOADER.load(earthTexture, (texture) => {
      this.assets['earthTexture'] = texture
    })
    this.TEX_LOADER.load(earthNormalMap, (normalMap) => {
      this.assets['earthNormalMap'] = normalMap
    })
    this.TEX_LOADER.load(earthSpecularMap, (specularMap) => {
      this.assets['earthSpecularMap'] = specularMap
    })
    this.TEX_LOADER.load(earthClouds, (texture) => {
      this.assets['earthClouds'] = texture
    })
    this.TEX_LOADER.load(lensflare0, (texture) => {
      this.assets['texFlare0'] = texture
    })
    this.TEX_LOADER.load(lensflare2, (texture) => {
      this.assets['texFlare2'] = texture
    })
    this.TEX_LOADER.load(lensflare3, (texture) => {
      this.assets['texFlare3'] = texture
    })
    this.TEX_LOADER.load(crosshair, (texture) => {
      this.assets['crosshair'] = texture
    })
    this.TEX_LOADER.load(explosion, (texture) => {
      this.assets['explosionTexture'] = texture
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(1 / 25, 1)
    })
    this.AUDIO_LOADER.load(laser, (buffer) => {
      this.assets['laserSoundBuffer'] = buffer
    })
    this.AUDIO_LOADER.load(plasma, (buffer) => {
      this.assets['plasmaSoundBuffer'] = buffer
    })
    this.AUDIO_LOADER.load(explosion0, (buffer) => {
      this.assets['explosion0'] = buffer
    })
    this.AUDIO_LOADER.load(explosion1, (buffer) => {
      this.assets['explosion1'] = buffer
    })
    this.AUDIO_LOADER.load(explosion2, (buffer) => {
      this.assets['explosion2'] = buffer
    })
    this.AUDIO_LOADER.load(engineAmbient, (buffer) => {
      this.assets['engine_ambient'] = buffer
    })
    this.AUDIO_LOADER.load(lowPulsatingHum, (buffer) => {
      this.assets['low_pulsating_hum'] = buffer
    })
    /* eslint-enable dot-notation */
  }
}
export const LOADER = new GSFLoader()
