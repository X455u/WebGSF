import THREE from 'three';

class Terrain extends THREE.Mesh {
  constructor() {
    let mapX = 200;
    let mapY = mapX; // Does not yet work with different x y dimensions
    let heightMap = new Array(mapX);
    for (let i = 0; i < mapX; i++) {
      heightMap[i] = new Array(mapY);
    }
    let map = new THREE.Geometry();

    for (let x = 0; x < mapX; x++) {
      for (let y = 0; y < mapY; y++) {
        heightMap[x][y] = Math.floor((Math.random() * 8));
        map.vertices.push(new THREE.Vector3(x, y, heightMap[x][y]));
      }
    }

    for (let x = 0; x < mapX - 1; x++) {
      for (let y = 0; y < mapY - 1; y++) {
        map.faces.push(new THREE.Face3(x * mapY + y + 1, x * mapY + y, (x + 1) * mapX + y));
        map.faces.push(new THREE.Face3((x + 1) * mapY + y + 1, x * mapY + y + 1, (x + 1) * mapX + y));
      }
    }
    map.computeFaceNormals();

    super(map, new THREE.MeshPhongMaterial({
      color: 0x5555aa
    }));
  }
}

export default Terrain;
