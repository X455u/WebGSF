import _ from 'lodash';
import * as THREE from 'three';
import SubdivisionModifier from './SubdivisionModifier';
import {LOADER} from './GSFLoader';
import GameObject from './GameObject';

const DETAIL = 3;
const NOISE = 0.3;
const SMOOTHNESS = 2;

class Planet extends GameObject {
  constructor(radius) {
    let geometry = new THREE.IcosahedronGeometry(radius, 2);
    let modifier = new SubdivisionModifier(1);

    _.range(DETAIL).forEach(i => {
      geometry.vertices.forEach(v => {
        let noiseFactor = NOISE / Math.pow(SMOOTHNESS, i);
        let s = 1 + (2 * Math.random() - 1) * noiseFactor;
        v.multiplyScalar(s);
      });
      modifier.modify(geometry);
    });

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    // Dummy UV implementation
    geometry.faceVertexUvs = [geometry.faces.map(() => [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 1)
    ])];
    geometry.uvsNeedUpdate = true;

    let material = new THREE.MeshPhongMaterial({
      color: 0x111111,
      shininess: 1,
      normalMap: LOADER.get('planetNormalMap')
    });

    super(geometry, material);
  }
}

export default Planet;
