import THREE from 'three';

function applyPointRandomness(r) {
  let p = new THREE.Vector3(
    (Math.random() - 0.5),
    (Math.random() - 0.5),
    (Math.random() - 0.5))
    .normalize()
    .multiplyScalar(r);
  return p;
}

function newParticle(emitter, lerpFactor) {
  let result = new THREE.Vector3();
  result.copy(emitter.oldPosition);
  let rotatedOffset = emitter.offset.clone().applyQuaternion(emitter.bindTo.quaternion);
  result.lerp(emitter.bindTo.position.clone().add(rotatedOffset), lerpFactor);
  result.add(applyPointRandomness(emitter.pointRandomness));
  return result;
}

function calculateOldPosition(oldPosition, newPosition, offset) {
  let result = new THREE.Vector3();
  result.copy(oldPosition);
  result.lerp(newPosition.clone().add(offset), 1);
  return result;
}

class ParticleEmitter extends THREE.Points {

  constructor(options) {
    super();

    this.offset = options.offset;
    this.oldPosition = this.offset.clone();
    this.bindTo = options.bindTo;
    this.spawnRate = options.spawnRate;
    this.lifetime = options.lifetime;
    this.velocity = options.velocity;
    this.velocityRandomness = options.velocityRandomness;
    this.pointRandomness = options.pointRandomness;

    this.geometry = new THREE.Geometry();
    let toSpawn = Math.ceil(this.spawnRate * this.lifetime);
    for (let i = 0; i < toSpawn; i++) {
      let point = newParticle(this, 1);
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
    // Helpers for lerping between frames
    let n = 0;
    let toSpawn = Math.ceil(this.spawnRate * delta + 1);
    // Index of last particle (minus one) to update
    let max = (this.iterator + toSpawn) % this.geometry.vertices.length;
    // Reposition ("respawn") particles
    while (this.iterator !== max) {
      n++;
      // New position
      let point = newParticle(this, n / toSpawn);
      this.geometry.vertices[this.iterator].copy(point);

      // New velocity
      point.velocity = this.velocity.clone();
      point.velocity.multiplyScalar(1 - this.velocityRandomness * (2 * Math.random() - 1));
      // Iterate to next particle
      this.iterator = (this.iterator + 1) % this.geometry.vertices.length;
    }
    // Put position of last particle (without randomness) to oldPosition
    this.oldPosition = calculateOldPosition(
      this.oldPosition,
      this.bindTo.position,
      this.offset.clone().applyQuaternion(this.bindTo.quaternion)
    );
    // Update particles
    this.geometry.vertices.forEach(particle => {
      // Update velocity
      let velocity = particle.velocity.clone();
      velocity.applyQuaternion(this.bindTo.quaternion);
      particle.addScaledVector(velocity, delta);
    });
    this.geometry.verticesNeedUpdate = true;
    this.geometry.computeBoundingSphere();
  }

}

export default ParticleEmitter;
