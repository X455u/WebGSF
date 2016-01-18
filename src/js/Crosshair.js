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

const FARTHEST = 500;
const SCALING_FACTOR = 10;

class Crosshair {

  constructor(scene, camera, source) {
    this.camera = camera;
    this.source = source;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = FARTHEST;

    this.sprite = new THREE.Sprite(crosshairMaterial);
    this.sprite.renderDepth = 0;
    scene.add(this.sprite);
  }

  update(objects) {
    let direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.source.quaternion);
    this.raycaster.set(this.source.position, direction);
    let intersections = this.raycaster.intersectObjects(objects);
    let point = intersections.length > 0 ? intersections[0].point : this.raycaster.ray.at(FARTHEST);
    this.sprite.position.copy(point);
    let v = new THREE.Vector3();
    let scale = v.subVectors(this.sprite.position, this.camera.position).length() / SCALING_FACTOR;
    this.sprite.scale.x = scale;
    this.sprite.scale.y = scale;
  }

}

export default Crosshair;
