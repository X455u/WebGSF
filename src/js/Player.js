import _ from 'lodash';
import keymaster from 'keymaster';
import {HUD} from './HUD';

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
    this.ship = null;
    this.points = 0;

    this.crosshair = null;
    this.spotlight = null;
  }

  addPoints(points) {
    this.points += points;
  }

  setShip(ship) {
    this.ship = ship;
    this.crosshair.setSourceObject(ship);
    ship.maxVelocity *= 1.5;
    ship.turnSpeed *= 1.5;
    ship.shieldRegen = 5;
    ship.gun.reloadTime = 0.05;
    ship.addEventListener('onShieldRegen', () => {
      HUD.updateShield(ship.shield / ship.maxShield);
    });
    ship.activateSpotlight();
  }

  update() {
    if (!this.ship) return;

    if (!this.motionControlled) {
      // Ship steering
      this.turnParameters = _({x: ['down', 'up'], z: ['left', 'right']}).map(
        (keys, k) => [k, _(keys).map(
          (key, index) => (keymaster.isPressed(key) ? 1 : 0) * (index === 0 ? 1 : -1)
        ).sum()]
      ).object().value();
      // Ship acceleration
      if (keymaster.isPressed('space')) this.ship.thrust();
      if (keymaster.isPressed('x')) this.ship.shoot();
      if (keymaster.isPressed('c')) this.ship.shootMissile();
    } else {
      if (this.isThrusting) this.ship.thrust();
      if (this.isShooting) this.ship.shoot();
    }

    this.ship.turn(this.turnParameters.x, 0, this.turnParameters.z);

    this.crosshair.update();
  }

  setMobileEventListeners() {
    this.motionControlled = true;
    let invertCoefficient = 1;
    if (isAndroid()) {
      invertCoefficient = -1;
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
      this.isThrusting = _.range(touches.length).some(i => touches.item(i).pageX > halfWidth);
      this.isShooting = _.range(touches.length).some(i => touches.item(i).pageX < halfWidth);
    };
    document.body.addEventListener('touchstart', updateMobileState, false);
    document.body.addEventListener('touchend', updateMobileState, false);
    document.body.addEventListener('touchmove', event => event.preventDefault(), false);
  }
}
export const PLAYER = new Player();
