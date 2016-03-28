import THREE from 'three';

function fromBottom(HUD, y) {
  return -HUD.height / 2 + y;
}

function fromLeft(HUD, x) {
  return -HUD.width / 2 + x;
}

class HUD {

  constructor(window) {

    this.window = window;

    this.width = this.window.innerWidth;
    this.height = this.window.innerHeight;

    this.camera = new THREE.OrthographicCamera(
      -this.width / 2,
      this.width / 2,
      this.height / 2,
      -this.height / 2,
      -10000,
      10000
    );
    this.camera.position.z = 10;

    this.scene = new THREE.Scene();

  }

  createBasicHUD() {

    let hpBarGeometry = new THREE.CylinderGeometry(50, 50, 200, 16);
    let hpBarMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5
    });
    let hpBarMesh = new THREE.Mesh(hpBarGeometry, hpBarMaterial);
    this.scene.add(hpBarMesh);

    let hpContainerGeometry = hpBarGeometry.clone();
    let hpContainerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });
    let hpContainerMesh = new THREE.Mesh(hpContainerGeometry, hpContainerMaterial);
    this.scene.add(hpContainerMesh);

    hpBarMesh.rotateX(0.2 * Math.PI);
    hpBarMesh.position.set(fromLeft(this, 100), fromBottom(this, 150), 0);
    hpContainerMesh.rotateX(0.2 * Math.PI);
    hpContainerMesh.position.set(hpBarMesh.position.x, hpBarMesh.position.y, hpBarMesh.position.z);


    let ballGeometry = new THREE.SphereGeometry(75, 32, 32);
    let ballMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5
    });
    let ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    this.scene.add(ballMesh);

    let ballShellGeometry = new THREE.SphereGeometry(75, 32, 32);
    let ballShellMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });
    let ballShellMesh = new THREE.Mesh(ballShellGeometry, ballShellMaterial);
    this.scene.add(ballShellMesh);

    ballMesh.rotateX(0.2 * Math.PI);
    ballMesh.position.set(fromLeft(this, 250), fromBottom(this, 150), 0);
    ballShellMesh.rotateX(0.2 * Math.PI);
    ballShellMesh.position.set(ballMesh.position.x, ballMesh.position.y, ballMesh.position.z);
  }

}

export default HUD;
