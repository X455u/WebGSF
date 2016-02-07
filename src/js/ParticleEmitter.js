import _ from 'lodash';
import THREE from 'three';

function applyPointRandomness(r) {
  let p = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    )
    .normalize()
    .multiplyScalar(r);
  return p;
}

function newParticle(emitter, emitterPosition, lerpFactor = 1) {
  let result = emitter.oldPosition.clone();
  result.lerp(emitterPosition, lerpFactor);
  result.add(applyPointRandomness(emitter.pointRandomness));
  return result;
}

class ParticleEmitter extends THREE.Points {

  constructor(options) {
    super();

    let emitterOptions = _.pick(options, [
      'offset',
      'bindTo',
      'spawnRate',
      'lifetime',
      'velocity',
      'velocityRandomness',
      'pointRandomness'
    ]);
    Object.assign(this, emitterOptions);
    this.oldPosition = this.offset.clone();

    this.geometry = new THREE.Geometry();
    let toSpawn = Math.ceil(this.spawnRate * this.lifetime);
    for (let i = 0; i < toSpawn; i++) {
      let point = newParticle(this, this.bindTo.position);
      this.geometry.vertices[i] = point;
      point.velocity = this.velocity.clone();
      point.velocity.multiplyScalar(1 - this.velocityRandomness * (2 * Math.random() - 1));
    }

    this.material = new THREE.PointsMaterial({
      color: options.color,
      blending: THREE.AdditiveBlending,
      transparent: true,
      map: options.map,
      size: options.size
    });

    this.iterator = 0;
    this.geometry.computeBoundingSphere();
  }

  update(delta) {
    let rotatedOffset = this.offset.clone().applyQuaternion(this.bindTo.quaternion);
    let emitterPosition = this.bindTo.position.clone().add(rotatedOffset);

    // Spawn new particles
    let toSpawn = Math.min(Math.ceil(this.spawnRate * delta + 1), this.geometry.vertices.length);
    let spawned = _.range(toSpawn).map(n => {
      let point = newParticle(this, emitterPosition, n / toSpawn);
      point.velocity = this.velocity.clone();
      point.velocity.multiplyScalar(1 - this.velocityRandomness * (2 * Math.random() - 1));
      point.velocity.applyQuaternion(this.bindTo.quaternion);
      return point;
    });

    // Update particles
    this.geometry.vertices.splice(0, toSpawn);
    this.geometry.vertices = this.geometry.vertices.concat(spawned);

    // Move particles
    this.geometry.vertices.forEach((particle) => {
      particle.addScaledVector(particle.velocity, delta);
    });

    // Set oldPosition as current emitter position
    this.oldPosition = emitterPosition;

    this.geometry.verticesNeedUpdate = true;
    this.geometry.computeBoundingSphere();
  }

}

export default ParticleEmitter;
