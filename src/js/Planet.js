import THREE from 'three';
import SubdivisionModifier from './SubdivisionModifier';

const PRE_SUBDIVISIONS = 2;
const POST_SUBDIVISIONS = 2;
const NOISE_FACTOR = 2e-7;
// const NOISE_FACTOR = 5e-7;

class Planet extends THREE.Mesh {
  constructor(radius) {
    let geometry = new THREE.IcosahedronGeometry(radius, PRE_SUBDIVISIONS);

    geometry.vertices.forEach(v => {
      let area = 4 * Math.PI * radius * radius / 3;
      let noiseFactor = area * NOISE_FACTOR;
      let s = 1 + (2 * Math.random() - 1) * noiseFactor;
      v.multiplyScalar(s);
    });

    let modifier = new SubdivisionModifier(POST_SUBDIVISIONS);
    modifier.modify(geometry);

    geometry.faceVertexUvs = [];
    geometry.uvsNeedUpdate = true;

    let material = new THREE.MeshPhongMaterial({
    // let material = new THREE.LineBasicMaterial({
      color: 0x5555aa
    });

    super(geometry, material);
  }
}

export default Planet;
