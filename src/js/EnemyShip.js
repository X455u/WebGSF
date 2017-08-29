import THREE from 'three';
import {VELOCITY as SHOTSPEED} from './LaserShot';

const VELOCITY = 50; // units/s
const TURN_SPEED = 0.25; // radians/s

const RELOAD_TIME = 0.25; // seconds

const CLOSE_DISTANCE = 50;
const FAR_DISTANCE = 200;

let texLoader = new THREE.TextureLoader();
let thrusterParticleMap;
texLoader.load('./media/particle2.png', function(map) {
  thrusterParticleMap = map;
});

class EnemyShip extends THREE.Mesh {

  constructor(shipGeometry, shipMaterial, shotController, particleSystem) {
    super(shipGeometry, shipMaterial);
    this.shotController = shotController;
    this.reload = 0.0;
    this.activeGun = 1; // Bad initial solution
    this.attacking = true;
    // Thruster particles
    let thrusters = [
      new THREE.Vector3(0.8, 0.25, -0.9), // Up-left
      new THREE.Vector3(-0.8, 0.25, -0.9), // Up-right
      new THREE.Vector3(0.8, -0.25, -0.9), // Down-left
      new THREE.Vector3(-0.8, -0.25, -0.9) // Down-right
    ];
    thrusters.forEach(t => {
      particleSystem.createEmitter({
        color: 0x0000ff,
        map: thrusterParticleMap,
        spawnRate: 500,
        lifetime: 0.04,
        size: 0.15,
        bindTo: this,
        offset: t,
        pointRandomness: 0.15,
        velocity: new THREE.Vector3(0, 0, 3),
        velocityRandomness: 0.8
      });
    });
  }

  update(delta) {
    if (this.attacking) {
      let aimTarget = this.getAimTarget(this.target.position, this.target.getVelocityVec(), SHOTSPEED);
      this.turnTowards(aimTarget, delta);
      if (this.position.distanceTo(this.target.position) < CLOSE_DISTANCE) {
        this.attacking = false;
      }
    } else {
      let away = (new THREE.Vector3()).subVectors(this.position, this.target.position);
      away.add(this.position);
      this.turnTowards(away, delta);
      if (this.position.distanceTo(this.target.position) > FAR_DISTANCE) {
        this.attacking = true;
      }
    }
    this.translateZ(VELOCITY * delta);

    // Ship reloading and shooting
    this.reload = Math.max(0.0, this.reload - delta);
    if (this.attacking && this.reload === 0.0) {
      this.reload = RELOAD_TIME;
      this.shotController.shootLaserShot(this);
    }
  }

  turnTowards(target, delta) {
    let matrix = new THREE.Matrix4();
    let up = (new THREE.Vector3(0, 1, 0)).applyQuaternion(this.quaternion);
    matrix.lookAt(target, this.position, up);

    let quaternion = new THREE.Quaternion();
    quaternion.setFromRotationMatrix(matrix);

    let direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(this.quaternion);
    direction.normalize();

    let targetDirection = new THREE.Vector3();
    targetDirection.subVectors(target, this.position);
    targetDirection.normalize();

    let angle = direction.angleTo(targetDirection);

    this.quaternion.slerp(quaternion, TURN_SPEED * delta * 2 * Math.PI / angle);
  }

  getAimTarget(targetPosition, targetVelocity, shotSpeed) {
    let thisToTarget = targetPosition.clone().sub(this.position);
    let targetMoveAngle = thisToTarget.angleTo(targetVelocity); // 0 or PI when paralell to vector from this to target.
    let aimAdvanceAngle = Math.asin(Math.sin(targetMoveAngle) * targetVelocity.length() / shotSpeed);
    let aimAdvanceAxis = (new THREE.Vector3()).crossVectors(thisToTarget, targetVelocity).normalize();
    let aimAdvanceVector = thisToTarget.applyAxisAngle(aimAdvanceAxis, aimAdvanceAngle);
    let aimTarget = (new THREE.Vector3()).addVectors(this.position, aimAdvanceVector);
    if (!aimTarget.x || !aimTarget.y || !aimTarget.z) {
      return targetPosition;
    } else {
      return aimTarget;
    }
  }

}

export default EnemyShip;
