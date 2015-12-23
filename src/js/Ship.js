import _ from 'lodash';
import THREE from 'three';
import KeyboardState from './threex.keyboardstate';

const TURN_SPEED = 2 * Math.PI / 10;
const MAX_VELOCITY = 4;
const ACCELERATION = 0.5;

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const X_AXIS = new THREE.Vector3(1, 0, 0);

function isMobile() {
  return window.DeviceMotionEvent !== undefined && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

class Ship extends THREE.Object3D {
  constructor(ship) {
    super();
    let skip = ['position', 'rotation', 'quaternion', 'scale'];
    Object.keys(ship).forEach(key => {
      if (ship.hasOwnProperty(key) && skip.indexOf(key) === -1) {
        this[key] = ship[key];
      }
    });
    this.targetQuaternion = this.quaternion.clone();
    this.keyboard = new KeyboardState();
    this.acceleration = 0;
    this.velocity = 0;
    this.turnParameters = {
      x: 0,
      y: 0
    }
    this.motionControlled = false;
    if (isMobile()) {
      this._setMobileEventListeners();
    }
  }

  update(delta) {
    if (!this.motionControlled) {
      // Ship steering
      this.turnParameters = _({x: ['down', 'up'], z: ['left', 'right']}).map(
        (keys, k) => [k, _(keys).map(
          (key, index) => (this.keyboard.pressed(key) ? 1 : 0) * (index === 0 ? 1 : -1)
        ).sum()]
      ).object().value();
      // Ship acceleration
      this.acceleration = ACCELERATION * (this.keyboard.pressed('space') ? 1 : -1);
      }
    let turnQuaternion = new THREE.Quaternion();
    turnQuaternion.setFromAxisAngle(Z_AXIS, delta * TURN_SPEED * this.turnParameters['z']);
    this.targetQuaternion.multiply(turnQuaternion).normalize();
    turnQuaternion.setFromAxisAngle(X_AXIS, delta * TURN_SPEED * this.turnParameters['x']);
    this.targetQuaternion.multiply(turnQuaternion).normalize();

    this.velocity = Math.max(0, Math.min(MAX_VELOCITY, this.velocity + this.acceleration * delta));
    this.quaternion.slerp(this.targetQuaternion, delta * 10);
    this.translateZ(-this.velocity * delta);
  }

  _setMobileEventListeners() {
    this.motionControlled = true;
    // Accelerometer
    window.ondevicemotion = (event) => {
      this.turnParameters = {
        x: event.accelerationIncludingGravity.z / 6,
        z: -event.accelerationIncludingGravity.x / 6,
      }
    }
    // Touch events
    document.body.addEventListener('touchstart', event => {
      this.acceleration = ACCELERATION;
    }, false);
    document.body.addEventListener('touchend', event => {
      this.acceleration = -ACCELERATION;
    }, false);
  }
}

export default Ship;
