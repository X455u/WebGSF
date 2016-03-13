import THREE from 'three';
import CANNON from 'cannon';

import GameObject from './GameObject';

function turretBasicVisual() {
  let object = new THREE.Object3D();
  let middle = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshBasicMaterial({color: 0xff1111})
  );
  let gun = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 4.5),
    new THREE.MeshBasicMaterial({color: 0xaa1111})
  );
  gun.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  gun.translateY(4.5);

  object.add(middle);
  object.add(gun);

  return object;
}

function turretBasicPhysical(material) {
  let body = new CANNON.Body({
    material: material
  });
  body.addShape(new CANNON.Sphere(3));
  return body;
}

class GameObjects {

  constructor(scene, physics) {

    // this.game = game;

    this.scene = scene;
    this.physics = physics;

    this.objects = [];

  }

  update(delta) {
    this.objects.forEach(object => {
      object.update(delta);
      if (object.removed) {
        this.objects.splice(this.objects.indexOf(object), 1);
      }
    });
  }

  createObject(visual, physical) {
    let newObject = new GameObject(visual, physical);
    this.objects.push(newObject);
    this.scene.add(visual);
    this.physics.add(physical);
    return newObject;
  }

  create(name) {
    let newObject = null;
    if (name === 'turretBasic') {
      let turretContactMaterial = this.physics.planetMaterial;
      newObject = this.createObject(turretBasicVisual(), turretBasicPhysical(turretContactMaterial));
    }
    return newObject;
  }

}

export default GameObjects;
