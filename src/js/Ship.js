import _ from 'lodash';
import THREE from 'three';
import KeyboardState from './threex.keyboardstate';

const TURN_SPEED = 2 * Math.PI / 10;
const MAX_VELOCITY = 4;
const ACCELERATION = 0.5;

class Ship extends THREE.Object3D {
  constructor(ship) {
    super();
    Object.assign(this, ship);
    this.targetQuaternion = this.quaternion.clone();
    this.keyboard = new KeyboardState();
    this.velocity = 0;
  }

  update(delta) {
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
    this.quaternion.slerp(this.targetQuaternion, delta * 10);

    // Ship acceleration
    if (this.keyboard.pressed('space')) {
      this.velocity = Math.min(MAX_VELOCITY, this.velocity + ACCELERATION * delta);
    } else {
      this.velocity = Math.max(0, this.velocity - ACCELERATION * delta);
    }
    this.translateZ(-this.velocity * delta);
  }
}

export default Ship;
