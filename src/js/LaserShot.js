import _ from 'lodash';
import THREE from 'three';

const VELOCITY = 50; // units/s
const LIFETIME = 5.0; // seconds

class LaserShot extends THREE.Object3D {

  constructor() {
    super();
    let shotGeometry = new THREE.CylinderGeometry( 1, 1, 10, 8, 1 );
    shotGeometry.scale(0.05,0.05,0.05);
    shotGeometry.rotateX(Math.PI / 2);
    let shotMaterial = new THREE.MeshPhongMaterial( {
      color: 0x000000,
      specular: 0x666666,
      emissive: 0xff0000,
      shininess: 10,
      shading: THREE.SmoothShading,
      opacity: 0.9,
      transparent: true
    } );
    let shotMesh = new THREE.Mesh(shotGeometry, shotMaterial);

    this.add(shotMesh);
    this.lifetimeLeft = LIFETIME;
  }

  update(delta) {
    this.lifetimeLeft -= delta;
    this.translateZ(-VELOCITY * delta);
  }

}

export default LaserShot;
