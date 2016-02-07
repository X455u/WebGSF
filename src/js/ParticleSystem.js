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

function newParticle(oldPosition, newPosition, lerpFactor, offset, pointRandomness) {
  let result = new THREE.Vector3();
  result.copy(oldPosition);
  result.lerp(newPosition.clone().add(offset), lerpFactor);
  result.add(applyPointRandomness(pointRandomness));
  return result;
}

class ParticleSystem {

  constructor(scene) {
    this.emitters = [];
    this.scene = scene;
  }

  update(delta) {
    this.emitters.forEach(emit => {
      this.updateEmitter(emit, delta);
    });
  }

  createEmitter(options) {
    let emitter = new THREE.Points();

    emitter.offset = options.offset;
    emitter.oldPosition = emitter.offset.clone();
    emitter.bindTo = options.bindTo;
    emitter.spawnRate = options.spawnRate;
    emitter.lifetime = options.lifetime;
    emitter.velocity = options.velocity;
    emitter.velocityRandomness = options.velocityRandomness;
    emitter.pointRandomness = options.pointRandomness;

    emitter.geometry = new THREE.Geometry();
    let toSpawn = Math.ceil(emitter.spawnRate * emitter.lifetime);
    for (let i = 0; i < toSpawn; i++) {
      let point = newParticle(
        emitter.oldPosition,
        emitter.bindTo.position,
        1,
        emitter.offset.clone().applyQuaternion(emitter.bindTo.quaternion),
        emitter.pointRandomness
      );
      emitter.geometry.vertices[i] = point;
      point.velocity = emitter.velocity.clone();
      point.velocity.multiplyScalar(1 - emitter.velocityRandomness * (2 * Math.random() - 1));
    }

    emitter.material = new THREE.PointsMaterial({
      color: options.color,
      blending: THREE.AdditiveBlending,
      transparent: true,
      map: options.map,
      size: options.size
    });

    emitter.iterator = 0;
    emitter.geometry.computeBoundingSphere();

    this.emitters.push(emitter);
    this.scene.add(emitter);
    return emitter;
  }

  updateEmitter(emit, delta) {
    // Helpers for lerping between frames
    let n = 0;
    let toSpawn = Math.ceil(emit.spawnRate * delta + 1);
    // Index of last particle (minus one) to update
    let max = (emit.iterator + toSpawn) % emit.geometry.vertices.length;
    // Reposition ("respawn") particles
    while (emit.iterator !== max) {
      n++;
      // New position
      let point = newParticle(
        emit.oldPosition,
        emit.bindTo.position,
        n / toSpawn,
        emit.offset.clone().applyQuaternion(emit.bindTo.quaternion),
        emit.pointRandomness
      );
      emit.geometry.vertices[emit.iterator].copy(point);

      // New velocity
      point.velocity = emit.velocity.clone();
      point.velocity.multiplyScalar(1 - emit.velocityRandomness * (2 * Math.random() - 1));
      // Iterate to next particle
      emit.iterator = (emit.iterator + 1) % emit.geometry.vertices.length;
    }
    // Put position of last particle (without randomness) to oldPosition
    emit.oldPosition = newParticle(
      emit.oldPosition,
      emit.bindTo.position,
      1,
      emit.offset.clone().applyQuaternion(emit.bindTo.quaternion),
      0
    );
    // Update particles
    emit.geometry.vertices.forEach(particle => {
      // Update velocity
      let velocity = particle.velocity.clone();
      velocity.applyQuaternion(emit.bindTo.quaternion);
      particle.addScaledVector(velocity, delta);
    });
    emit.geometry.verticesNeedUpdate = true;
    emit.geometry.computeBoundingSphere();
  }

}

export default ParticleSystem;
