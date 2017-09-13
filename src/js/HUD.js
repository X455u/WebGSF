import * as THREE from 'three';

function fromBottom(HUD, y) {
  return -HUD.height / 2 + y;
}

function fromLeft(HUD, x) {
  return -HUD.width / 2 + x;
}

const HP_BAR_HEIGHT = 50;

class HUD {

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

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

    let scale = Math.min(this.width / 1200, this.height / 800);

    let hpBarGeometry = new THREE.CylinderGeometry(50, HP_BAR_HEIGHT, 200, 16);
    hpBarGeometry.scale(scale, scale, scale);
    let hpBarMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5
    });
    let hpBarMesh = new THREE.Mesh(hpBarGeometry, hpBarMaterial);
    this.scene.add(hpBarMesh);

    let hpContainerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });
    let hpContainerMesh = new THREE.Mesh(hpBarGeometry, hpContainerMaterial);
    this.scene.add(hpContainerMesh);

    // hpBarMesh.rotateX(0.2 * Math.PI);
    hpBarMesh.position.set(fromLeft(this, 0.1 * this.width), fromBottom(this, 0.15 * this.height), 0);
    // hpContainerMesh.rotateX(0.2 * Math.PI);
    hpContainerMesh.position.set(hpBarMesh.position.x, hpBarMesh.position.y, hpBarMesh.position.z);


    let ballGeometry = new THREE.SphereGeometry(75, 32, 32);
    ballGeometry.scale(scale, scale, scale);
    let ballMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5
    });
    let ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    this.scene.add(ballMesh);

    let ballShellMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });
    let ballShellMesh = new THREE.Mesh(ballGeometry, ballShellMaterial);
    this.scene.add(ballShellMesh);

    ballMesh.rotateX(0.2 * Math.PI);
    ballMesh.position.set(fromLeft(this, 0.25 * this.width), fromBottom(this, 0.15 * this.height), 0);
    ballShellMesh.rotateX(0.2 * Math.PI);
    ballShellMesh.position.set(ballMesh.position.x, ballMesh.position.y, ballMesh.position.z);

    this.hpMesh = hpBarMesh;
    this.shieldMesh = ballMesh;
    this.hpBarHeight = HP_BAR_HEIGHT * scale;

    this.hpBarPosition = this.hpMesh.position.y;
    this.hpBarPositionMin = this.hpBarPosition - 2 * 1 * this.hpBarHeight;
  }

  update(hpPercent, shieldPercent) {
    this.hpMesh.scale.y = Math.max(Number.EPSILON, hpPercent);
    this.hpMesh.position.y = Math.max(this.hpBarPositionMin, this.hpBarPosition - 2 * (1 - hpPercent) * this.hpBarHeight);
    let shieldScale = this.shieldMesh.scale;
    shieldScale.x = shieldScale.y = shieldScale.z = Math.max(Number.EPSILON, shieldPercent);
  }

}

export default HUD;
