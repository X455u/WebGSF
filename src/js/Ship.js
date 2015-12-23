import _ from 'lodash';
import THREE from 'three';
import KeyboardState from './threex.keyboardstate';

const TURN_SPEED = 2 * Math.PI / 10;
const MAX_VELOCITY = 4;
const ACCELERATION = 0.5;

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
    this.motionControlled = false;
    if (window.DeviceMotionEvent !== undefined && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      this.motionControlled = true;
      // Accelerometer
      let defaultDirection = new THREE.Vector3(0, 0, 1);
      window.ondevicemotion = (event) => {
        let directionArray = ['x', 'y', 'z'].map(x => event.accelerationIncludingGravity[x]);
        let direction = new THREE.Vector3();
        direction.fromArray(directionArray).normalize();
        this.targetQuaternion.setFromUnitVectors(defaultDirection, direction);
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

  update(delta) {
    if (!this.motionControlled) {
      // Ship steering
      let axisArray = [['down', 'up'], [], ['left', 'right']].map(
        keys => _(keys).map(
          (key, index) => (this.keyboard.pressed(key) ? 1 : 0) * (index === 0 ? 1 : -1)
        ).sum()
      );
      let axis = new THREE.Vector3();
      axis.fromArray(axisArray);
      let turnDelta = new THREE.Quaternion();
      turnDelta.setFromAxisAngle(axis, delta * TURN_SPEED);
      this.targetQuaternion.multiply(turnDelta).normalize();
      // Ship acceleration
      this.acceleration = ACCELERATION * (this.keyboard.pressed('space') ? 1 : -1);
      }
    this.velocity = Math.max(0, Math.min(MAX_VELOCITY, this.velocity + this.acceleration * delta));
    this.quaternion.slerp(this.targetQuaternion, delta * 10);
    this.translateZ(-this.velocity * delta);
  }
}

export default Ship;
