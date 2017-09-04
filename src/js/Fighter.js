import THREE from 'three';
import GSFLoader from './GSFLoader';
import Ship from './Ship';
import SmallPulseLaser from './SmallPulseLaser';

const GEOMETRY = GSFLoader.get('fighterGeometry');
const MATERIAL = GSFLoader.get('fighterMaterial');

class Fighter extends Ship {
  constructor() {
    super(GEOMETRY, MATERIAL, {
      maxVelocity: 50,
      acceleration: 1,
      turnSpeed: 0.25,
      gun: new SmallPulseLaser()
    });
    this.gun.translateX(0.7);
    this.activeGun = 1;
  }

  shoot() {
    super.shoot();
    this.activeGun *= -1;
    let vector = new THREE.Vector3(1, 0, 0);
    vector.applyQuaternion(this.quaternion);
    this.gun.translate(vector, this.activeGun * 1.4);
  }
}
export default Fighter;
