import {loader} from './GSFLoader';
import Ship from './Ship';
import SmallPulseLaser from './SmallPulseLaser';

class Fighter extends Ship {
  constructor() {
    super(loader.get('fighterGeometry'), loader.get('fighterMaterial'), {
      maxVelocity: 50,
      acceleration: 80,
      turnSpeed: 0.25,
      gun: new SmallPulseLaser(),
      maxHp: 100,
      maxShield: 50
    });
    this.weaponSide = 1;
    this.gun.translateX(0.7 * this.weaponSide);

    this.gun.addEventListener('onShoot', () => {
      this.weaponSide *= -1;
      this.gun.translateX(1.4 * this.weaponSide);
    });
  }
}
export default Fighter;
