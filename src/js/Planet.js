import _ from 'lodash';
import THREE from 'three';
import SubdivisionModifier from './SubdivisionModifier';

const DETAIL = 4;
const NOISE = 0.16;
const SMOOTHNESS = 2.3;

class Planet extends THREE.Mesh {
  constructor(radius) {
    let geometry = new THREE.IcosahedronGeometry(radius, 1);
    let modifier = new SubdivisionModifier(1);

    _.range(DETAIL).forEach(i => {
      modifier.modify(geometry);
      geometry.vertices.forEach(v => {
        let noiseFactor = NOISE / Math.pow(SMOOTHNESS, i);
        let s = 1 + (2 * Math.random() - 1) * noiseFactor;
        v.multiplyScalar(s);
      });
    });

    geometry.faceVertexUvs = [];
    geometry.uvsNeedUpdate = true;

    let material = new THREE.MeshPhongMaterial({
      color: 0x903d3d,
      shininess: 10
    });

    super(geometry, material);
  }
}

export default Planet;
