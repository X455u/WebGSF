import _ from 'lodash';
import keymaster from 'keymaster';

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const X_AXIS = new THREE.Vector3(1, 0, 0);

function isMobile() {
  return window.DeviceMotionEvent !== undefined && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

class Player {
  constructor() {
    this.turnParameters = {
      x: 0,
      z: 0
    };
    this.motionControlled = false;
    if (isMobile()) {
      this.setMobileEventListeners();
    }
  }

  update() {
    if (!this.motionControlled) {
      // Ship steering
      this.turnParameters = _({x: ['down', 'up'], z: ['left', 'right']}).map(
        (keys, k) => [k, _(keys).map(
          (key, index) => (keymaster.isPressed(key) ? 1 : 0) * (index === 0 ? -1 : 1)
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
    this.translateZ(this.velocity * delta);

    // Ship reloading and shooting
    this.reload = Math.max(0.0, this.reload - delta);
    if ((keymaster.isPressed('x') || this.shooting) && this.reload === 0.0) {
      this.reload = RELOAD_TIME;
      this.shotController.shootLaserShot(this);
    }
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
        x: invertCoefficient * event.accelerationIncludingGravity.z / 6,
        z: invertCoefficient * event.accelerationIncludingGravity.y / 6
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
