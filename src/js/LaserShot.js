import THREE from 'three';
import CANNON from 'cannon';
import SubdivisionModifier from './SubdivisionModifier';

const VELOCITY = 300; // units/s
const LIFETIME = 5.0; // seconds

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
  opacity: 0.9,
  transparent: true
});
let shotMesh = new THREE.Mesh(shotGeometry, shotMaterial);

class LaserShot extends THREE.Object3D {

  constructor(physicsWorld) {
    super();

    this.physicsWorld = physicsWorld;
    this.add(shotMesh.clone());
    this.lifetimeLeft = LIFETIME;
  }

  update(delta) {
    this.lifetimeLeft -= delta;

    let rayStart = new CANNON.Vec3(
      this.position.x,
      this.position.y,
      this.position.z
    );
    this.translateZ(-VELOCITY * delta);
    let rayEnd = new CANNON.Vec3(
      this.position.x,
      this.position.y,
      this.position.z
    );
    let ray = new CANNON.Ray(rayStart, rayEnd);
    if (ray.intersectWorld(this.physicsWorld, {mode: CANNON.Ray.CLOSEST, skipBackfaces: true})) {
      this.lifetimeLeft = 0;
    }
  }

}

export default LaserShot;
