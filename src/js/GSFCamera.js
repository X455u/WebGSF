import * as THREE from 'three';

class GSFCamera extends THREE.PerspectiveCamera {
  constructor() {
    let aspect = window.innerWidth / window.innerHeight;
    super(90, aspect, 1, 1000000);
    this.followOffset = new THREE.Vector3(0, 0.5, -1).normalize().multiplyScalar(5);
    this.followSpeed = 10;
    this.target = null;
  }

  update(delta) {
    if (this.target === null) return;
    let offset = this.followOffset.clone().applyQuaternion(this.target.quaternion);
    let cameraTargetPosition = this.target.position.clone().add(offset);
    this.position.lerp(cameraTargetPosition, this.followSpeed * delta);
    let quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    quat.multiplyQuaternions(this.target.quaternion, quat);
    this.quaternion.slerp(quat, this.followSpeed * delta);
  }

  setTarget(target) {
    this.target = target;
  }
}
export const CAMERA = new GSFCamera();
