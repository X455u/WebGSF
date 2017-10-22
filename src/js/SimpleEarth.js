import * as THREE from 'three';
import GameObject from './GameObject';
import {LOADER} from './GSFLoader';

const CLOUD_ROTATION_SPEED = 0.02;

class SimpleEarth extends GameObject {
  constructor(radius, detail) {
    let geometry = new THREE.IcosahedronGeometry(radius, detail);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    let normalMap = LOADER.get('earthNormalMap');
    let material = new THREE.MeshPhongMaterial({
      color: 0xAAAAAA,
      shininess: 0,
      map: LOADER.get('earthTexture'),
      normalMap: normalMap,
      normalScale: new THREE.Vector2(1, 1)
    });

    super(geometry, material);

    this.hitRadius = radius;

    // Clouds
    let cloudGeometry = new THREE.IcosahedronGeometry(radius * 1.05, detail);
    let cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      shininess: 0,
      map: LOADER.get('earthClouds'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.add(this.clouds);
  }

  update(delta) {
    this.clouds.rotateY(CLOUD_ROTATION_SPEED * delta);
  }
}
export default SimpleEarth;
