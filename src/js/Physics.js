import CANNON from 'cannon';
import {SHIP_MATERIAL as shipMaterial} from './Ship';
import {PLANET_MATERIAL as planetMaterial} from './Planet';

const PHYSICS_DELTA = 1 / 60;
const SUBSTEPS = 1;

class Physics extends CANNON.World {

  constructor() {
    super();
    this.broadphase = new CANNON.NaiveBroadphase();

// World setup
    this.gravity = new CANNON.Vec3(0, 0, 0);
    this.allowSleep = false;
    this.solver = new CANNON.SplitSolver(new CANNON.GSSolver());
    this.solver.iterations = 10;
    this.solver.tolerance = 0.001;

// Contacts
    const shipPlaneContact = new CANNON.ContactMaterial(shipMaterial, planetMaterial);
    shipPlaneContact.contactEquationStiffness = 1e10;
    shipPlaneContact.contactEquationRegularizationTime = 1;
    this.addContactMaterial(shipPlaneContact);
  }

  update(delta) {
    this.step(PHYSICS_DELTA, delta, SUBSTEPS);
  }

}

export default Physics;
