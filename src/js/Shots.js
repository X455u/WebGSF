import LaserShot from './LaserShot';

class Shots {

  constructor(scene, physicsWorld) {
    this.shots = [];
    this.scene = scene;
    this.physicsWorld = physicsWorld;
  }

  update(delta) {
    this.shots.forEach(shot => {
      shot.update(delta);
      if (shot.lifetimeLeft <= 0.0) {
        this.scene.remove(shot);
        this.shots.splice(this.shots.indexOf(shot), 1);
      }
    });
  }

  shootTurretShot(turret) {
    let shot = new LaserShot(this.physicsWorld);
    shot.position.copy(turret.position);
    shot.quaternion.copy(turret.quaternion);
    shot.rotateX(Math.PI);
    shot.translateZ(-2);
    this.shots.push(shot);
    this.scene.add(shot);
  }

  shootLaserShot(ship) {
    let shot = new LaserShot(this.physicsWorld);
    shot.position.copy(ship.position);
    shot.quaternion.copy(ship.quaternion);
    shot.translateX(0.7 * ship.activeGun); // Bad initial solution
    ship.activeGun *= -1; // Bad initial solution
    this.shots.push(shot);
    this.scene.add(shot);
  }

  addShot(shot) {
    this.shots.push(shot);
    this.scene.add(shot);
  }

}

export default Shots;
