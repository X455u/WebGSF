import {loader} from './GSFLoader';
import Ship from './Ship';
import SmallPulseLaser from './SmallPulseLaser';

class Fighter extends Ship {
  constructor() {
    super(loader.get('fighterGeometry'), loader.get('fighterMaterial'), {
      maxVelocity: 50,
      acceleration: 80,
      turnSpeed: 0.25,
      gun: new SmallPulseLaser()
    });
  }
}
export default Fighter;
