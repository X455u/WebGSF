import * as THREE from 'three';
import _ from 'lodash';

const WIDTH = 200;
const HEIGHT = 200;
const DEPTH = 3;
const SIN_DEPTH = 8;

class Terrain extends THREE.Mesh {
  constructor() {
    let map = new THREE.Geometry();
    let idx = (x, y) => x * HEIGHT + y;

    _.range(WIDTH).forEach(x => _.range(HEIGHT).forEach(y => {
      let height = Math.sin(x / 6) * SIN_DEPTH + Math.sin(y / 6) * SIN_DEPTH + Math.random() * DEPTH;
      map.vertices.push(new THREE.Vector3(x, y, height));
      if (x > 0 && y > 0) {
        map.faces.push(new THREE.Face3(idx(x, y - 1), idx(x, y), idx(x - 1, y)));
        map.faces.push(new THREE.Face3(idx(x - 1, y - 1), idx(x, y - 1), idx(x - 1, y)));
      }
    }));

    map.computeFaceNormals();

    super(map, new THREE.MeshPhongMaterial({
      color: 0x5555aa
    }));
  }
}

export default Terrain;
