import * as THREE from 'three';

import GameObject from './GameObject';
import LargePlasmaCannon from './LargePlasmaCannon';
import {LOADER} from './GSFLoader';
import Turret from './Turret';

class PlasmaTurret extends GameObject {
  constructor() {
    let material = LOADER.get('railgunMaterial');
    super(LOADER.get('railgunBaseGeometry'), material);

    this.turret = new Turret(LOADER.get('plasmaTurretHeadGeometry'), material, LOADER.get('plasmaTurretGunGeometry'), material);
    this.turret.gunMesh.translateOnAxis(new THREE.Vector3(0, 1, 0), 3.2);
    this.turret.gunMesh.translateOnAxis(new THREE.Vector3(0, 0, 1), 1.6);
    this.add(this.turret);

    this.turret.translateOnAxis(new THREE.Vector3(0, 1, 0), 6);

    // AI
    this.ai = null;
    this.AItarget = null;

    // Stats
    this.gun = new LargePlasmaCannon();
    this.gun.owner = this;
    this.turret.gunMesh.add(this.gun);

    this.isStatic = true;
  }

  update(delta) {
    if (this.ai) this.ai.update(this, delta);

    this.gun.update(delta);
    if (this.isShooting) {
      this.gun.shoot();
      this.isShooting = false;
    }
  }

  shoot() {
    let wasFalse = !this.isShooting;
    this.isShooting = true;
    return wasFalse;
  }

  turnTowards(target, delta) {
    this.turret.turnTowards(target, delta);
  }
}
export default PlasmaTurret;
