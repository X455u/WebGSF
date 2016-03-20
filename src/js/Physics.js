import CANNON from 'cannon';

const PHYSICS_DELTA = 1 / 60;
const SUBSTEPS = 2;

class Physics extends CANNON.World {

  constructor() {
    super();
    this.broadphase = new CANNON.NaiveBroadphase();

// World setup
    this.gravity = new CANNON.Vec3(0, 0, 0);
    this.allowSleep = false;
    this.solver = new CANNON.SplitSolver(new CANNON.GSSolver());
    this.solver.iterations = 20;
    this.solver.tolerance = 0.0001;

// Materials
    this.shipMaterial = new CANNON.Material('shipMaterial');
    this.planetMaterial = new CANNON.Material('planetMaterial');

// Contacts
    this.contact = {};
    this.contact.ship = {};
    this.contact.planet = {};
    this.contact.ship.planet =
    this.contact.planet.ship =
    new CANNON.ContactMaterial(this.shipMaterial, this.planetMaterial);
    this.contact.ship.planet.contactEquationStiffness = 1e10;
    this.contact.ship.planet.contactEquationRegularizationTime = 1;
    this.addContactMaterial(this.contact.ship.planet);
  }

  update(delta) {
    this.step(PHYSICS_DELTA, delta, SUBSTEPS);
  }

}

export default Physics;
