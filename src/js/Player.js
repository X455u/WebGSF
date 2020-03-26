import _ from 'lodash';
import keymaster from 'keymaster';
import {HUD} from './HUD';
import {restartGame} from './app';

const ACCELEROMETER_SMOOTHING = 0.01;

function isMobile() {
  return window.DeviceMotionEvent !== undefined && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

class Player {
  constructor() {
    this.deviceOrientation = {};
    this.smoothOrientation = {};
    this.turnParameters = {
      x: 0,
      z: 0
    };
    this.motionControlled = false;
    if (isMobile()) {
      this.setMobileEventListeners();
    }
    this.ship = null;
    // this.points = 0;

    this.crosshair = null;
    this.spotlight = null;
  }

  addPoints(points) {
    this.points += points;
  }

  setShip(ship) {
    this.ship = ship;
    this.crosshair.setSourceObject(ship);
    ship.addEventListener('onShieldRegen', () => {
      HUD.updateShield(ship.shield / ship.maxShield);
    });
    ship.activateSpotlight();

    ship.addEventListener('onDeath', () => restartGame());

    ship.sound.stop();
  }

  update() {
    if (!this.ship) return;

    if (!this.motionControlled) {
      // Ship steering
      this.turnParameters = {
        x:
          Number(keymaster.isPressed('down')) -
          Number(keymaster.isPressed('up')),
        z:
          Number(keymaster.isPressed('left')) -
          Number(keymaster.isPressed('right'))
      };
      // Ship acceleration
      if (keymaster.isPressed('space')) this.ship.thrust();
      if (keymaster.isPressed('x')) this.ship.shoot();
      if (keymaster.isPressed('c')) this.ship.shootMissile();
    } else {
      if (this.isThrusting) this.ship.thrust();
      if (this.isShooting) this.ship.shoot();
      this.updateMobileTurning();
    }

    this.ship.turn(this.turnParameters.x, 0, this.turnParameters.z);

    this.crosshair.update();
  }

  updateMobileTurning() {
    if (!this.smoothOrientation.x || !this.smoothOrientation.z) {
      this.smoothOrientation = this.deviceOrientation;
    }
    this.smoothOrientation.x *= (1 - ACCELEROMETER_SMOOTHING);
    this.smoothOrientation.x += ACCELEROMETER_SMOOTHING * this.deviceOrientation.x;
    this.smoothOrientation.z *= (1 - ACCELEROMETER_SMOOTHING);
    this.smoothOrientation.z += ACCELEROMETER_SMOOTHING * this.deviceOrientation.z;
    this.turnParameters.x = this.deviceOrientation.x - this.smoothOrientation.x;
    this.turnParameters.z = this.deviceOrientation.z;
  }

  setMobileEventListeners() {
    this.motionControlled = true;
    let invertCoefficient = 1;
    if (isAndroid()) {
      invertCoefficient = -1;
    }
    // Accelerometer
    window.ondevicemotion = (event) => {
      this.deviceOrientation = {
        x: invertCoefficient * event.accelerationIncludingGravity.z / 6,
        z: invertCoefficient * event.accelerationIncludingGravity.y / 6
      };
    };
    // Touch events
    let updateMobileState = event => {
      let halfWidth = window.innerWidth / 2;
      let touches = event.touches;
      this.isThrusting = _.range(touches.length).some(i => touches.item(i).pageX > halfWidth);
      this.isShooting = _.range(touches.length).some(i => touches.item(i).pageX < halfWidth);
    };
    document.body.addEventListener('touchstart', updateMobileState, false);
    document.body.addEventListener('touchend', updateMobileState, false);
    document.body.addEventListener('touchmove', event => event.preventDefault(), false);
  }
}
export const PLAYER = new Player();
