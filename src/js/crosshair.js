import THREE from 'three';

let texLoader = new THREE.TextureLoader();
let crosshairMaterial;
texLoader.load('./media/crosshair.png', function(texture) {
  crosshairMaterial = new THREE.SpriteMaterial({
    color: 0x00ff00,
    map: texture,
    blending: THREE.NormalBlending,
    depthWrite: false,
    depthTest: false
  });
});

class Crosshair {

  constructor(scene, source) {
    this.source = source;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 20;

    this.sprite = new THREE.Sprite(crosshairMaterial);
    this.sprite.renderDepth = 0;
    scene.add(this.sprite);
  }

  update(objects) {
    let direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.source.quaternion);
    // direction.add(this.source.position);
    this.raycaster.set(this.source.position, direction);
    let intersections = this.raycaster.intersectObjects(objects);
    let point;
    if (intersections.length > 0) {
      point = intersections[0].point;
    } else {
      point = this.raycaster.ray.at(20);
    }
    this.sprite.position.copy(point);
    console.log(this.sprite.position);
  }

}

export default Crosshair;
