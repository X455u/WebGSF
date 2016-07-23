import _ from 'lodash';
import THREE from 'three';
import CANNON from 'cannon';
import SubdivisionModifier from './SubdivisionModifier';

const DETAIL = 3;
const NOISE = 0.16;
const SMOOTHNESS = 2.3;

export const PLANET_MATERIAL = new CANNON.Material('planetMaterial');

class Planet extends THREE.Mesh {
  constructor(radius, physics) {

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
      color: 0x652a2a,
      shininess: 20
    });

    let texLoader = new THREE.TextureLoader();
    texLoader.load('./media/planet_nor.png', normalMap => {
      material.normalMap = normalMap;
    });

    // let sphereShape = new CANNON.Sphere(radius);
    let planetBody = new CANNON.Body({material: PLANET_MATERIAL});
    planetBody.position = new CANNON.Vec3(0, -500, 0);
    let vertices = [];
    geometry.vertices.forEach(v => {
      vertices.push(v.x);
      vertices.push(v.y);
      vertices.push(v.z);
    });
    let faces = [];
    geometry.faces.forEach(f => {
      faces.push(f.a);
      faces.push(f.b);
      faces.push(f.c);
    });
    let planetShape = new CANNON.Trimesh(vertices, faces);
    planetBody.addShape(planetShape);
    physics.add(planetBody);

    super(geometry, material);
  }
}

export default Planet;
