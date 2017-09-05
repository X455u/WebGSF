import * as THREE from 'three';

const RAYCASTER = new THREE.Raycaster();
const NEAR = 0;
const FAR = 300;

class ShotController {

  constructor(scene) {
    this.shots = [];
    this.scene = scene;
    this.hitboxes = [];

    RAYCASTER.near = NEAR;
    this.hitCounter = 0;
  }

  update(delta) {
    RAYCASTER.far = FAR * delta;
    this.shots.forEach(shot => {
      shot.update(delta);
      if (shot.lifetimeLeft <= 0.0) {
        this.scene.remove(shot);
        this.shots.splice(this.shots.indexOf(shot), 1);
      }

      for (let hitbox of this.hitboxes) {
        if (shot.position.distanceTo(hitbox.position) < 10) {
          let direction = new THREE.Vector3(0, 0, 1);
          direction.applyQuaternion(shot.quaternion);
          RAYCASTER.set(shot.position, direction);
          let intersections = RAYCASTER.intersectObject(hitbox);
          if (intersections.length !== 0) {
            this.scene.remove(shot);
            this.shots.splice(this.shots.indexOf(shot), 1);
            if (intersections[0].object.isPlayer) {
              console.log('HIT: ' + ++this.hitCounter);
            }
          }
        }
      }

    });
  }

  addHitbox(mesh) {
    this.hitboxes.push(mesh);
  }

}

export default ShotController;
