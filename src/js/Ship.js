import _ from 'lodash';
import THREE from 'three';
import CANNON from 'cannon';
import keymaster from 'keymaster';

const TURN_SPEED = Math.PI; // rad/s
// const MAX_VELOCITY = 50; // units/s
const ENGINEPOWER = 100; // Newton?

const RELOAD_TIME = 0.25; // seconds

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const X_AXIS = new THREE.Vector3(1, 0, 0);

let texLoader = new THREE.TextureLoader();
let thrusterParticleMap;
texLoader.load('./media/particle2.png', function(map) {
  thrusterParticleMap = map;
});

function isMobile() {
  return window.DeviceMotionEvent !== undefined && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}


class Ship extends THREE.Mesh {

  constructor(ship, shots, particleSystem, physics) {
    super();
    let skip = ['position', 'rotation', 'quaternion', 'scale'];
    Object.keys(ship).forEach(key => {
      if (ship.hasOwnProperty(key) && skip.indexOf(key) === -1) {
        this[key] = ship[key];
      }
    });
    this.targetQuaternion = this.quaternion.clone();
    this.acceleration = 0;
    this.velocity = 0;
    this.turnParameters = {
      x: 0,
      z: 0
    };
    this.motionControlled = false;
    if (isMobile()) {
      this.setMobileEventListeners();
    }
    this.shots = shots;
    this.reload = 0.0;
    this.activeGun = 1; // Bad initial solution

    let sphereShape = new CANNON.Sphere(2);
    let sphereBody = new CANNON.Body({
      mass: 1,
      shape: sphereShape,
      material: physics.shipMaterial,
      linearDamping: 0.5
    });
    physics.add(sphereBody);
    this.physicsBody = sphereBody;

    // Thruster particles
    let thrusters = [
      new THREE.Vector3(-0.8, 0.3, 0.9), // Up-left
      new THREE.Vector3(0.8, 0.3, 0.9), // Up-right
      new THREE.Vector3(-0.8, -0.3, 0.9), // Down-left
      new THREE.Vector3(0.8, -0.3, 0.9) // Down-right
    ];
    // texLoader.load('./media/particle2.png', function(map) {
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
    // });
    this.enginesOn = false;

  }

  update(delta) {
    if (!this.motionControlled) {
      // Ship steering
      this.turnParameters = _({x: ['down', 'up'], z: ['left', 'right']}).map(
        (keys, k) => [k, _(keys).map(
          (key, index) => (keymaster.isPressed(key) ? 1 : 0) * (index === 0 ? 1 : -1)
        ).sum()]
      ).object().value();
      // Ship acceleration
      this.enginesOn = keymaster.isPressed('space');
    }
    let turnQuaternion = new THREE.Quaternion();
    turnQuaternion.setFromAxisAngle(Z_AXIS, delta * TURN_SPEED * this.turnParameters.z);
    this.targetQuaternion.multiply(turnQuaternion).normalize();
    turnQuaternion.setFromAxisAngle(X_AXIS, delta * TURN_SPEED * this.turnParameters.x);
    this.targetQuaternion.multiply(turnQuaternion).normalize();
    this.quaternion.slerp(this.targetQuaternion, delta * 10);

    if (this.enginesOn) {
      let vector = new THREE.Vector3(0, 0, -1);
      vector.applyQuaternion(this.quaternion);
      let forceVector = new CANNON.Vec3(vector.x, vector.y, vector.z);
      let forcePoint = forceVector.clone().negate();
      forcePoint.vadd(new CANNON.Vec3(this.position.x, this.position.y, this.position.z));
      this.physicsBody.applyImpulse(forceVector.scale(ENGINEPOWER * delta), forcePoint);
    }

    let physicalPosition = new THREE.Vector3(this.physicsBody.position.x, this.physicsBody.position.y, this.physicsBody.position.z);
    this.position.copy(physicalPosition);

    // Ship reloading and shooting
    this.reload = Math.max(0.0, this.reload - delta);
    if ((keymaster.isPressed('x') || this.shooting) && this.reload === 0.0) {
      this.reload = RELOAD_TIME;
      this.shots.shootLaserShot(this);
    }
    this.shots.update(delta);
  }

  setMobileEventListeners() {
    this.motionControlled = true;
    let invertCoefficient = -1;
    if (isAndroid()) {
      invertCoefficient = 1;
    }
    // Accelerometer
    window.ondevicemotion = (event) => {
      this.turnParameters = {
        x: -invertCoefficient * event.accelerationIncludingGravity.z / 6,
        z: invertCoefficient * event.accelerationIncludingGravity.x / 6
      };
    };
    // Touch events
    let updateMobileState = event => {
      let halfWidth = window.innerWidth / 2;
      let touches = event.touches;
      if (_.range(touches.length).some(i => touches.item(i).pageX > halfWidth)) {
        this.enginesOn = true;
      } else {
        this.enginesOn = false;
      }
      if (_.range(touches.length).some(i => touches.item(i).pageX < halfWidth)) {
        this.shooting = true;
      } else {
        this.shooting = false;
      }
    };
    document.body.addEventListener('touchstart', updateMobileState, false);
    document.body.addEventListener('touchend', updateMobileState, false);
    document.body.addEventListener('touchmove', event => event.preventDefault(), false);
  }
}

export default Ship;
