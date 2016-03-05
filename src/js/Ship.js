import _ from 'lodash';
import THREE from 'three';
import CANNON from 'cannon';
import keymaster from 'keymaster';

const TURN_SPEED = Math.PI; // rad/s
const MAX_VELOCITY = 50; // units/s
const ACCELERATION = 40; // units/s^2

const RELOAD_TIME = 0.25; // seconds

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const X_AXIS = new THREE.Vector3(1, 0, 0);

function isMobile() {
  return window.DeviceMotionEvent !== undefined && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}


class Ship extends THREE.Mesh {

  constructor(ship, shotController, physics) {
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
    this.shotController = shotController;
    this.reload = 0.0;
    this.activeGun = 1; // Bad initial solution
    let sphereShape = new CANNON.Sphere(1);
    let sphereBody = new CANNON.Body({
      mass: 1,
      shape: sphereShape,
      material: physics.shipMaterial});
    physics.add(sphereBody);
    this.physicsBody = sphereBody;
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
      this.acceleration = ACCELERATION * (keymaster.isPressed('space') ? 1 : -1);
    }
    let turnQuaternion = new THREE.Quaternion();
    turnQuaternion.setFromAxisAngle(Z_AXIS, delta * TURN_SPEED * this.turnParameters.z);
    this.targetQuaternion.multiply(turnQuaternion).normalize();
    turnQuaternion.setFromAxisAngle(X_AXIS, delta * TURN_SPEED * this.turnParameters.x);
    this.targetQuaternion.multiply(turnQuaternion).normalize();

    this.velocity = Math.max(0, Math.min(MAX_VELOCITY, this.velocity + this.acceleration * delta));
    this.quaternion.slerp(this.targetQuaternion, delta * 10);
    // this.translateZ(-this.velocity * delta);
    let vector = new THREE.Vector3(0, 0, -1);
    vector.applyQuaternion(this.quaternion);
    let forceVector = new CANNON.Vec3(vector.x, vector.y, vector.z);
    let forcePoint = forceVector.clone().negate();
    forcePoint.vadd(new CANNON.Vec3(this.position.x, this.position.y, this.position.z));
    this.physicsBody.applyForce(forceVector.scale((keymaster.isPressed('space') ? 100 : 0)), forcePoint);
    // this.physicsBody.applyLocalForce(forceVector.scale(5), this.physicsBody.pointToLocalFrame(forcePoint));

    this.position.set(this.physicsBody.position.x, this.physicsBody.position.y, this.physicsBody.position.z);

    // Ship reloading and shooting
    this.reload = Math.max(0.0, this.reload - delta);
    if ((keymaster.isPressed('x') || this.shooting) && this.reload === 0.0) {
      this.reload = RELOAD_TIME;
      this.shotController.shootLaserShot(this);
    }
    this.shotController.update(delta);
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
        this.acceleration = ACCELERATION;
      } else {
        this.acceleration = -ACCELERATION;
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
