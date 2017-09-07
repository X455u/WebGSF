import * as THREE from 'three';
import SubdivisionModifier from './SubdivisionModifier';

let shotGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 8, 1);
shotGeometry.rotateX(Math.PI / 2);
let modifier = new SubdivisionModifier(1);
modifier.modify(shotGeometry);
shotGeometry.faceVertexUvs = [];
shotGeometry.uvsNeedUpdate = true;
let shotMaterial = new THREE.MeshPhongMaterial({
  color: 0x000000,
  specular: 0x666666,
  emissive: 0xff0000,
  shininess: 0,
  shading: THREE.SmoothShading,
  opacity: 0.5,
  transparent: true
});
let shotMesh = new THREE.Mesh(shotGeometry, shotMaterial);

class LaserShot extends THREE.Object3D {

  constructor(velocity, lifetime) {
    super();
    this.add(shotMesh.clone());
    this.lifetimeLeft = lifetime;
    this.velocity = velocity;
    this.damage = 5;
  }

  update(delta) {
    this.lifetimeLeft -= delta;
    this.translateZ(this.velocity * delta);
  }

}

export default LaserShot;
